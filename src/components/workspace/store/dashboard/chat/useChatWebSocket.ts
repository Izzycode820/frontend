'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthStore, authSelectors } from '@/stores/authentication/authStore';

export type ChatWsStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseChatWebSocketOptions {
  workspaceId: string | null;
  sessionId?: string | null;
  /** Called when a tool status update arrives */
  onStatusPush?: (message: string, turn?: number) => void;
  /** Called when a final turn completion is delivered via WebSocket */
  onTurnComplete?: (response: string, action: string | null, uiType: string | null, data: any) => void;
  /** Called for each streamed token chunk during LLM generation */
  onTokenChunk?: (token: string) => void;
}

interface UseChatWebSocketReturn {
  status: ChatWsStatus;
  sendMessage: (message: any) => void;
}

/**
 * useChatWebSocket
 * 
 * Manages the real-time connection to the Merchant AI FSM.
 * Pattern modeled after WhatsAppInbox production standards.
 */
export function useChatWebSocket({
  workspaceId,
  sessionId,
  onStatusPush,
  onTurnComplete,
  onTokenChunk,
}: UseChatWebSocketOptions): UseChatWebSocketReturn {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const token = useAuthStore(state => (state as any).token);
  const [status, setStatus] = useState<ChatWsStatus>('disconnected');

  const wsRef = useRef<WebSocket | null>(null);
  const lastSeqIdRef = useRef<number>(-1);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep callbacks in refs
  const onStatusPushRef = useRef(onStatusPush);
  const onTurnCompleteRef = useRef(onTurnComplete);
  const onTokenChunkRef = useRef(onTokenChunk);
  useEffect(() => { onStatusPushRef.current = onStatusPush; }, [onStatusPush]);
  useEffect(() => { onTurnCompleteRef.current = onTurnComplete; }, [onTurnComplete]);
  useEffect(() => { onTokenChunkRef.current = onTokenChunk; }, [onTokenChunk]);

  // Reset sequence when workspace or session changes
  useEffect(() => {
    lastSeqIdRef.current = -1;
  }, [workspaceId, sessionId]);

  const connect = useCallback(async () => {
    if (!workspaceId || !isAuthenticated) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    // Reset sequence on fresh connect to allow replay if needed


    // Token safety

    const authStore = useAuthStore.getState() as any;
    if (authStore.isTokenExpired?.()) {
      try {
        await authStore.refreshTokenSafe();
      } catch {
        setStatus('error');
        return;
      }
    }

    const token = (useAuthStore.getState() as any).token;
    if (!token) { 
      console.warn('[MerchantChatWS] ⚠️ Cannot connect: No token available');
      setStatus('disconnected'); 
      return; 
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.NEXT_PUBLIC_WS_HOST || 'localhost:8000';
    const url = `${protocol}//${wsHost}/ws/workman/merchant/${workspaceId}/?token=${token}`;


    console.log(`[MerchantChatWS] 🔌 Connecting → ${url}`);
    setStatus('connecting');

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[MerchantChatWS] ✅ Connected');
      setStatus('connected');
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // 1. Protocol-Level Deduplication (Sequence Watermark)
        // If the message has a seq_id, ensure it's strictly increasing.
        if (data.seq_id !== undefined) {
          // Master Reset: If we receive seq 1 but are at a high watermark, it's a new turn
          if (data.seq_id === 1 && lastSeqIdRef.current > 1) {
             console.log(`[MerchantChatWS] 🔄 Sequence Reset Detected (Turn Change). Old Last: ${lastSeqIdRef.current}`);
             lastSeqIdRef.current = 0; 
          }

          if (data.seq_id <= lastSeqIdRef.current) {
            console.warn(`[MerchantChatWS] 🛡️ Discarded duplicate seq_id: ${data.seq_id} (Last: ${lastSeqIdRef.current})`);
            return; 
          }
          lastSeqIdRef.current = data.seq_id;
        }

        // Real-time token streaming from LLM
        if (data.type === 'stream') {
          const token = data.token ?? '';
          console.log(`[MerchantChatWS] 💬 Token Chunk: "${token}"`);
          onTokenChunkRef.current?.(token);
          return;
        }

        // Handle Status Push (Skeleton UI / Thinking)
        if (data.type === 'status') {
          console.log(`[MerchantChatWS] 🧠 Status: ${data.message} (turn: ${data.turn || 1})`);
          onStatusPushRef.current?.(data.message, data.turn);
          return;
        }

        // Handle Turn Complete (Full text swap + UI payload injection)
        if (data.type === 'turn_complete') {
          console.log(`[MerchantChatWS] 🎯 Turn Complete: action=${data.action}, uiType=${data.uiType}`);
          if (data.uiType) {
             console.log(`[MerchantChatWS] 📦 UI DATA PAYLOAD:`, data.uiData);
          }
          onTurnCompleteRef.current?.(
            data.response || '',
            data.action || null,
            data.uiType || null,
            data.uiData || {}
          );
          return;
        }

        // Fallback for older ai_status_push format if backend sends it
        if (data.type === 'ai_status_push') {
          if (data.status === 'streaming') {
            onTokenChunkRef.current?.(data.data?.token ?? '');
          } else if (data.status === 'Completed' && data.data?.message) {
             onTurnCompleteRef.current?.(data.data.message, null, null, {});
          } else {
             onStatusPushRef.current?.(data.status);
          }
        }
      } catch (err) {

        console.error('[MerchantChatWS] ⚠️ Parse error:', err);
      }
    };

    ws.onclose = (event) => {
      console.log(`[MerchantChatWS] ❌ Closed: code=${event.code}`);
      wsRef.current = null;
      setStatus('disconnected');

      // 4003 is a fatal Auth error. Stop reconnecting to prevent loops.
      if (event.code === 4003) {
        console.error('[MerchantChatWS] 🛑 Authentication failed (4003). Check token validity.');
        setStatus('error');
        return;
      }

      // Exponential backoff for non-fatal errors
      if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30_000);
        reconnectAttempts.current++;
        console.log(`[MerchantChatWS] 🔄 Reconnecting in ${delay}ms (Attempt ${reconnectAttempts.current})`);
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      }
    };


    ws.onerror = (err) => {
      console.error('[MerchantChatWS] 🛑 Error:', err);
      setStatus('error');
    };
  }, [workspaceId, isAuthenticated, token]);




  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[MerchantChatWS] ⚠️ Cannot send: Socket not open');
    }
  }, []);

  // Heartbeat & Lifecycle
  useEffect(() => {
    console.log(`[MerchantChatWS] 🔄 Lifecycle restart. workspaceId: ${workspaceId}, authenticated: ${isAuthenticated}`);
    connect();
    return () => {
       console.log('[MerchantChatWS] 🔻 Lifecycle cleanup. Closing socket.');
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000);
        wsRef.current = null;
      }
    };
  }, [connect]);


  useEffect(() => {
    const id = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        sendMessage({ action: 'ping' });
      }
    }, 30_000);
    return () => clearInterval(id);
  }, [sendMessage]);

  return { status, sendMessage };
}
