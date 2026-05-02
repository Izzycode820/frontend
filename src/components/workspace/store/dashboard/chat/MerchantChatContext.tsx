'use client';

import React, { createContext, useContext, useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { useLocalRuntime, AssistantRuntime, AssistantRuntimeProvider } from '@assistant-ui/react';

import { useQuery, useMutation } from '@apollo/client/react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { useChatWebSocket } from './useChatWebSocket';
import { GetMerchantChatSessionsDocument } from '@/services/graphql/admin-store/queries/workman-merchant/__generated__/GetMerchantChatSessions.generated';
import { GetMerchantChatHistoryDocument } from '@/services/graphql/admin-store/queries/workman-merchant/__generated__/GetMerchantChatHistory.generated';
import { CreateMerchantSessionDocument } from '@/services/graphql/admin-store/mutations/workman-merchant/__generated__/CreateMerchantSession.generated';
import { SendMerchantMessageDocument } from '@/services/graphql/admin-store/mutations/workman-merchant/__generated__/SendMerchantMessage.generated';
import { DeleteMerchantSessionDocument } from '@/services/graphql/admin-store/mutations/workman-merchant/__generated__/DeleteMerchantSession.generated';
import { GetMerchantOnboardingStatusDocument } from '@/services/graphql/admin-store/queries/workman-merchant/__generated__/GetMerchantOnboardingStatus.generated';
import { adminStoreClient } from '@/services/graphql/clients';

import { toast } from 'sonner';

interface MerchantChatContextValue {
  runtime: AssistantRuntime;
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  isAiThinking: boolean;
  thinkingStatus: string;

  onboarding: any;
  messages: any[];
  onSend: (text: string) => Promise<void>;


  sessions: any[];
  sessionsLoading: boolean;
  refetchSessions: () => void;
  deleteSession: (sid: string) => Promise<void>;
  ghostSessionIdRef: React.MutableRefObject<string | null>;
  
  sidePanel: {
    isOpen: boolean;
    type: 'PRODUCT' | 'SHIPPING' | null;
    data: any;
  };
  openSidePanel: (type: 'PRODUCT' | 'SHIPPING', data: any) => void;
  closeSidePanel: () => void;
}

const MerchantChatContext = createContext<MerchantChatContextValue | null>(null);

export function MerchantChatProvider({ children }: { children: React.ReactNode }) {
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [thinkingStatus, setThinkingStatus] = useState('');
  const ghostSessionIdRef = useRef<string | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);

  // Side Panel (Sandbox) State
  const [sidePanel, setSidePanel] = useState<{
    isOpen: boolean;
    type: 'PRODUCT' | 'SHIPPING' | null;
    data: any;
  }>({
    isOpen: false,
    type: null,
    data: null,
  });

  const openSidePanel = useCallback((type: 'PRODUCT' | 'SHIPPING', data: any) => {
    setSidePanel({ isOpen: true, type, data });
  }, []);

  const closeSidePanel = useCallback(() => {
    setSidePanel(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Sync with URL
  const urlSessionId = params?.session_id as string | undefined;
  useEffect(() => {
    if (urlSessionId !== activeSessionId) {
       setActiveSessionId(urlSessionId || null);
    }
  }, [urlSessionId]);

  // 1. Data Layer
  const { data: sessionData, loading: sessionsLoading, refetch: refetchSessions } = useQuery(
    GetMerchantChatSessionsDocument,
    { 
      skip: !currentWorkspace,
      client: adminStoreClient
    }
  );

  const { data: historyData, loading: historyLoading, refetch: refetchHistory } = useQuery(
    GetMerchantChatHistoryDocument,
    { 
      variables: { sessionId: activeSessionId || '' },
      skip: !activeSessionId,
      client: adminStoreClient
    }
  );

  const { data: onboardingData } = useQuery(
    GetMerchantOnboardingStatusDocument,
    { 
      skip: !currentWorkspace,
      client: adminStoreClient
    }
  );

  const messages = useMemo(() => {
    return (historyData?.merchantChatHistory || []).flatMap((h: any) => {
      // 1. Safe Parse: In some DB versions, response might be a JSON string.
      let resData = h.response || {};
      if (typeof resData === 'string') {
        try { resData = JSON.parse(resData); } catch { resData = {}; }
      }

      // 2. Data Normalization: CamelCase is now the standard from backend
      const action = resData?.action === 'null' ? null : (resData?.action || null);
      const uiType = resData?.uiType || null; 
      const uiData = resData?.uiData || {};

      const aiText = resData?.response || resData?.message || "";

      return [
        {
          id: `q-${h.id}`,
          role: 'user' as const,
          content: [{ type: 'text' as const, text: h.prompt || "" }],
          createdAt: h.createdAt ? new Date(h.createdAt) : new Date(),
        },
        {
          id: `r-${h.id}`,
          role: 'assistant' as const,
          content: [{ type: 'text' as const, text: aiText }],
          createdAt: h.createdAt ? new Date(h.createdAt) : new Date(),
          metadata: {
            unstable_state: { domain: h.domain, intent: h.intent, action, uiType, uiData }
          }
        }
      ];
    });
  }, [historyData]);

  const onboarding = useMemo(() => {
    const raw = onboardingData?.merchantOnboardingStatus;
    if (!raw) return undefined;
    return {
      steps: (raw.steps || []).map((s: any) => ({
        id: s?.id || '',
        status: s?.status || 'LOCKED',
      })),
      currentStepId: raw.currentStepId || 'STRATEGY_MODE',
    };
  }, [onboardingData]);

  // 2. Mutations
  const [sendMessageMutation] = useMutation(SendMerchantMessageDocument, { client: adminStoreClient });
  const [deleteSessionMutation] = useMutation(DeleteMerchantSessionDocument, { client: adminStoreClient });


  const sendMessage = useCallback(async (text: string) => {
    try {
      let currentSid = activeSessionIdRef.current;
      const isNewSession = !currentSid;

      if (isNewSession) {
        if (!ghostSessionIdRef.current) ghostSessionIdRef.current = crypto.randomUUID();
        currentSid = ghostSessionIdRef.current;
      }

      if (isNewSession && currentSid) {
        const workspaceId = params?.workspace_id;
        if (workspaceId) router.push(`/workspace/${workspaceId}/store/chat/${currentSid}`);
        setActiveSessionId(currentSid);
      }
      
      const { data } = await sendMessageMutation({
        variables: { sessionId: currentSid, message: text }
      });

      if (!data?.sendMerchantMessage?.success) {
        toast.error(data?.sendMerchantMessage?.responseMessage || 'Failed');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [params, router, sendMessageMutation]);

  const deleteSession = useCallback(async (sid: string) => {
    try {
      const { data } = await deleteSessionMutation({
        variables: { sessionId: sid },
        // Manual Cache Eviction for immediate UI response
        update: (cache) => {
          cache.evict({
            fieldName: 'merchantChatHistory',
            args: { sessionId: sid }
          });
          cache.gc();
        },
        refetchQueries: [{ query: GetMerchantChatSessionsDocument }]
      });

      if (data?.deleteMerchantSession?.success) {
        toast.success('Session deleted');

        // Synchronous Ref and ID cleanup
        if (activeSessionIdRef.current === sid) {
          activeSessionIdRef.current = null;
          ghostSessionIdRef.current = null;
          setActiveSessionId(null);

          const workspaceId = params?.workspace_id;
          if (workspaceId) {
             router.replace(`/workspace/${workspaceId}/store/chat`);
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [deleteSessionMutation, params, router]);


  // 3. WebSocket
  const tokenListeners = useRef<Set<(token: string) => void>>(new Set());
  const subscribeToTokens = useCallback((callback: (token: string) => void) => {
    tokenListeners.current.add(callback);
    return () => { tokenListeners.current.delete(callback); };
  }, []);


  const handleStatusPush = useCallback((message: string, turn?: number) => {
    setIsAiThinking(true);
    setThinkingStatus(message);
  }, []);

  const handleTokenChunk = useCallback((token: string) => {
    // We don't toggle isAiThinking here; we let the explicit status/complete signals handle it
    tokenListeners.current.forEach(listener => listener({ type: 'token', value: token } as any));
  }, []);

  const handleTurnComplete = useCallback((response: string, action: string | null, uiType: string | null, data: any) => {
    setIsAiThinking(false);
    setThinkingStatus('');
    tokenListeners.current.forEach(listener => listener({ type: 'complete', response, action, uiType, data } as any));
  }, []);

  const { status: wsStatus } = useChatWebSocket({
    workspaceId: currentWorkspace?.id || null,
    sessionId: activeSessionId,
    onStatusPush: handleStatusPush,
    onTokenChunk: handleTokenChunk,
    onTurnComplete: handleTurnComplete,
  });

  // 4. Runtime
  const adapter = useMemo(() => ({
    async *run({ messages: threadMessages }: any) {
       const threadMsgs = threadMessages || [];
       const lastMessage = threadMsgs[threadMsgs.length - 1];
       const text = lastMessage?.content?.filter((c: any) => c.type === 'text').map((c: any) => c.text).join(" ") || "";
       
       await sendMessage(text);

       const queue: ({ type: 'token' | 'complete', value?: string, response?: string, action?: string | null, uiType?: string | null, data?: any } | null)[] = [];
       let resolveQueue: (() => void) | null = null;

       const unsubscribe = subscribeToTokens((event: any) => {
          queue.push(event);
          if (resolveQueue) { resolveQueue(); resolveQueue = null; }
       });


       let accumulatedText = "";
        try {
          while (true) {
             if (queue.length === 0) await new Promise<void>(resolve => { resolveQueue = resolve; });
             const chunk = queue.shift();
             if (chunk === null || chunk === undefined) break; 
             
             if (chunk.type === 'token') {
                accumulatedText += chunk.value;
                yield { content: [{ type: 'text', text: accumulatedText }] };
             } else if (chunk.type === 'complete') {
                console.log(`[RuntimeGenerator] 🎯 FINAL TURN: uiType=${chunk.uiType}, action=${chunk.action}`);
                
                // metadata.unstable_state is assistant-ui's JSON escape hatch — it IS persisted
                yield { 
                  content: [{ type: 'text', text: chunk.response || accumulatedText }],
                  metadata: {
                    unstable_state: { action: chunk.action, uiType: chunk.uiType, uiData: chunk.data }
                  }
                };

                // Allow 100ms for UI to settle before closing the generator
                console.log("[RuntimeGenerator] ⏳ Settling UI...");
                await new Promise(r => setTimeout(r, 100));
                
                break; 
             }
          }
        } finally {
         unsubscribe();
       }
    },
  }) as any, [sendMessage, subscribeToTokens]);

  const runtime = useLocalRuntime(adapter, { initialMessages: messages });

  // Sync Runtime when history arrives or session changes
  const lastSyncSessionIdRef = useRef<string | null>(undefined as any); 
  useEffect(() => {
    // 1. New Chat Guard: If no session ID, ensure runtime is wiped
    // 1. New Chat Guard: If no session ID, ensure runtime is wiped ONLY if we are at the root
    if (!activeSessionId) {
       const isChatRoot = pathname.endsWith('/chat') || pathname.endsWith('/chat/');
       if (isChatRoot && lastSyncSessionIdRef.current !== null) {
          console.log("[MerchantChatContext] New Chat Root: Wiping runtime.");
          (runtime as any).reset?.({ initialMessages: [] });
          lastSyncSessionIdRef.current = null;
          ghostSessionIdRef.current = null;
       }
       return;
    }

    // 2. Ghost Guard: Don't wipe the runtime if we are in the middle of a "Ghost Handoff"
    if (activeSessionId === ghostSessionIdRef.current && (messages?.length || 0) <= 1) {
       lastSyncSessionIdRef.current = activeSessionId;
       return;
    }

    // 3. Stable Sync: Wait for history data to settle before marking as synced.
    const isHistoryReady = !historyLoading && historyData !== undefined;
    const isNewSession = activeSessionId !== lastSyncSessionIdRef.current;
    
    // We allow a sync if:
    // a) It's a brand new session being selected
    // b) The session is the same, but the runtime is empty (Repair Sync - e.g. after a wipe race or refresh)
    const isRuntimeEmpty = (runtime as any).messages?.length === 0;
    const hasMessagesToSync = (messages?.length || 0) > 0;

    if (isHistoryReady && !isAiThinking && (isNewSession || (isRuntimeEmpty && hasMessagesToSync))) {
      try {
        console.log(`[MerchantChatContext] 🔄 Hydrating Runtime: Session ${activeSessionId}, Messages: ${messages?.length}`);
        const targetMessages = messages || [];
        
        // Prevent wiping if we are in the middle of a reconnection but history is temporarily empty
        if (targetMessages.length === 0 && !isNewSession) {
          console.log("[MerchantChatContext] ⚠️ Skipping empty sync to prevent UI wipe.");
        } else {
           (runtime as any).reset?.({ initialMessages: targetMessages });
           lastSyncSessionIdRef.current = activeSessionId;
           
           // Clear ghost guard once we've successfully synced a real session with real history
           if (targetMessages.length > 0) {
              ghostSessionIdRef.current = null;
           }
        }
      } catch (err) {
        console.warn("[MerchantChatContext] Sync Warning:", err);
      }
    }
  }, [activeSessionId, messages, historyLoading, runtime, isAiThinking]);






  return (
    <MerchantChatContext.Provider value={{
      runtime,
      activeSessionId,
      setActiveSessionId,
      isAiThinking,
      thinkingStatus,
      onboarding,
      messages,
      onSend: sendMessage,
      deleteSession,
      refetchSessions,
      ghostSessionIdRef,
      sessions: sessionData?.merchantChatSessions || [],
      sessionsLoading,
      sidePanel,
      openSidePanel,
      closeSidePanel,
    }}>

      <AssistantRuntimeProvider runtime={runtime}>
        {children}
      </AssistantRuntimeProvider>
    </MerchantChatContext.Provider>
  );
}



export const useMerchantChat = () => {
  const context = useContext(MerchantChatContext);
  if (!context) throw new Error('useMerchantChat must be used within a MerchantChatProvider');
  return context;
};
