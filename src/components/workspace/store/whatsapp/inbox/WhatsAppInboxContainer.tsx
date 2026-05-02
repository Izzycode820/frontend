'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { WhatsAppInbox, InboxInsights, SidebarConversation } from './WhatsAppInbox';
import { GetInboxConversationsDocument } from '@/services/graphql/admin-store/queries/inbox/__generated__/GetInboxConversations.generated';
import { GetConversationMessagesDocument } from '@/services/graphql/admin-store/queries/inbox/__generated__/GetConversationMessages.generated';
import { GetStrategicInsightsDocument } from '@/services/graphql/admin-store/queries/inbox/__generated__/GetStrategicInsights.generated';
import { SendManualMessageDocument } from '@/services/graphql/admin-store/mutations/inbox/__generated__/SendManualMessage.generated';
import { ToggleAiHandlingDocument } from '@/services/graphql/admin-store/mutations/inbox/__generated__/ToggleAiHandling.generated';
import { WorkmanUpdateSettingsDocument } from '@/services/graphql/admin-store/mutations/workman/__generated__/WorkmanUpdateSettings.generated';
import { GetCustomerAdvisoryProfileDocument } from '@/services/graphql/admin-store/queries/workman/__generated__/GetCustomerAdvisoryProfile.generated';
import { ResumeWorkmanDocument } from '@/services/graphql/admin-store/mutations/workman/__generated__/ResumeWorkman.generated';
import { RecordMerchantFeedbackDocument, RecordMerchantFeedbackMutation, RecordMerchantFeedbackMutationVariables } from '../../../../../services/graphql/admin-store/mutations/workman/__generated__/RecordMerchantFeedback.generated';
import { StopWorkmanLoopDocument } from '@/services/graphql/admin-store/mutations/workman/__generated__/StopWorkmanLoop.generated';
import { WorkmanQuickSettingsModal } from '../workman_ai/WorkmanQuickSettingsModal';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
// Removed generic layout import
import { ChatMessageData, ChatUser } from '@/components/shadcn-ui/chat/types';
import { WorkspaceInboxInboxMessageSenderTypeChoices, AiAutonomyModeEnum } from '@/types/workspace/store/graphql-base';
import { toast } from 'sonner';
import { useInboxWebSocket } from './useInboxWebSocket';

export function WhatsAppInboxContainer() {
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [isAiSettingsModalOpen, setIsAiSettingsModalOpen] = useState(false);
  const [realTimeStrategy, setRealTimeStrategy] = useState<any>(null);

  // ─── GraphQL (Initial) ──────────────────────────────────────────────────────
  const { data: listData, loading: listLoading, refetch: refetchConversations } = useQuery(
    GetInboxConversationsDocument,
    { skip: !currentWorkspace },
  );

  // ─── Data Transforms (Initial) ───────────────────────────────────────────────
  const conversations: SidebarConversation[] = useMemo(
    () =>
      (listData?.inboxConversations?.edges || []).map((edge) => {
        const node = edge?.node;
        const rawCart = (node as any)?.cartValue || 0;
        const formattedCart =
          rawCart > 0
            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(rawCart)
            : undefined;

        return {
          id: node?.id || '',
          title: node?.customerPhone || 'Unknown',
          lastMessage: node?.lastMessage?.body || '',
          lastMessageTime: node?.updatedAt
            ? new Date(node.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
          presence: 'online' as const,
          unreadCount: (node as any)?.unreadCount || 0,
          cartValue: formattedCart,
          aiScore: (node as any)?.aiScore || 85,
          isStateTransitionPaused: (node as any)?.isStateTransitionPaused || false,
          aiAutonomyMode: (node as any)?.aiAutonomyMode || AiAutonomyModeEnum.Shadow,
        };
      }),
    [listData],
  );

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConvoId) || null,
    [conversations, selectedConvoId]
  );

  // ─── GraphQL (Dependent) ────────────────────────────────────────────────────
  const { data: msgData, refetch: refetchMessages } = useQuery(
    GetConversationMessagesDocument,
    { variables: { conversationId: selectedConvoId || '' }, skip: !selectedConvoId },
  );

  const { data: insightData, refetch: refetchInsights } = useQuery(
    GetStrategicInsightsDocument,
    { variables: { conversationId: selectedConvoId || '' }, skip: !selectedConvoId },
  );

  const { data: profileData, refetch: refetchProfile } = useQuery(
    GetCustomerAdvisoryProfileDocument,
    { 
      variables: { customerPhone: selectedConversation?.title || '' }, 
      skip: !selectedConversation 
    },
  );

  const [sendMsg] = useMutation(SendManualMessageDocument);
  const [toggleAi] = useMutation(ToggleAiHandlingDocument);
  const [stopWorkman] = useMutation(StopWorkmanLoopDocument);
  const [resumeAi] = useMutation(ResumeWorkmanDocument);
  const [updateWorkmanSettings, { loading: isUpdatingSettings }] = useMutation(WorkmanUpdateSettingsDocument);
  const [recordFeedback] = useMutation<RecordMerchantFeedbackMutation, RecordMerchantFeedbackMutationVariables>(RecordMerchantFeedbackDocument);

  // ─── WebSocket (real-time) ───────────────────────────────────────────────────
  const handleNewMessage = useCallback(async () => {
    // We don't clear realTimeStrategy immediately anymore to avoid flickers.
    // We let the refetch happen and the state will eventually settle.
    await Promise.all([
      refetchConversations(),
      refetchMessages(),
      refetchInsights(),
      refetchProfile(),
    ]);
  }, [refetchConversations, refetchMessages, refetchInsights, refetchProfile]);

  const handleStatusPing = useCallback((newStatus: string) => {
    setRealTimeStrategy((prev: any) => ({
      ...prev,
      status: newStatus,
    }));
  }, []);

  const { status: wsStatus, optimisticMessages, clearOptimistic } = useInboxWebSocket({
    conversationId: selectedConvoId,
    workspaceId: currentWorkspace?.id ?? null,
    onNewMessage: handleNewMessage,
    onStrategyUpdate: setRealTimeStrategy,
    onStatusPing: handleStatusPing,
  });


  // Apollo-sourced messages
  const apolloMessages: ChatMessageData[] = useMemo(
    () =>
      (msgData?.inboxMessages?.edges || []).map((edge) => {
        const node = edge?.node;
        let senderId = 'customer';
        let senderType: 'customer' | 'merchant' | 'workman' = 'customer';

        if (node?.senderType === WorkspaceInboxInboxMessageSenderTypeChoices.Merchant) {
          senderId = 'merchant-1';
          senderType = 'merchant';
        }
        if (node?.senderType === WorkspaceInboxInboxMessageSenderTypeChoices.Workman) {
          senderId = 'ai';
          senderType = 'workman';
        }

        return {
          id: node?.id || '',
          senderId,
          senderType,
          senderName: node?.senderType || 'Unknown',
          text: node?.body || '',
          interactiveData: (node as any)?.interactiveData
            ? JSON.parse((node as any).interactiveData)
            : undefined,
          location: (node as any)?.latitude ? {
            latitude: (node as any).latitude,
            longitude: (node as any).longitude,
            name: (node as any).locationName,
            address: (node as any).locationAddress,
          } : undefined,
          voice: (node as any)?.voiceUrl ? {
            url: (node as any).voiceUrl,
            duration: (node as any).voiceDuration || 0,
            waveform: (node as any).voiceWaveform || undefined,
          } : undefined,
          images: (node as any)?.mediaType === 'image' && (node as any)?.mediaUrl ? [{
            url: (node as any).mediaUrl,
            width: 800,
            height: 600,
          }] : undefined,
          timestamp: node?.createdAt ? new Date(node.createdAt).getTime() : Date.now(),
        };
      }),
    [msgData],
  );

  // Merge Apollo + optimistic, deduplicate by id
  const messages: ChatMessageData[] = useMemo(() => {
    if (optimisticMessages.length === 0) return apolloMessages;
    const knownIds = new Set(apolloMessages.map((m) => m.id));
    const newOnly = optimisticMessages.filter((m) => !knownIds.has(m.id));
    // Once Apollo catches up, clear the queue
    if (newOnly.length === 0) {
      clearOptimistic();
      return apolloMessages;
    }
    return [...apolloMessages, ...newOnly];
  }, [apolloMessages, optimisticMessages, clearOptimistic]);

  // ─── Insights ────────────────────────────────────────────────────────────────

  const strategyContext = insightData?.inboxConversation?.aiStrategyContext;
  const rawCartValue = (insightData?.inboxConversation as any)?.cartValue || 0;
  const formattedCartValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'XAF' }).format(rawCartValue);

  const handleRecordFeedback = useCallback(async (accepted: boolean, text: string) => {
    if (!selectedConvoId || !selectedConversation) return;
    try {
      await recordFeedback({
        variables: {
          conversationId: selectedConvoId,
          customerPhone: selectedConversation.id.split('@')[0], // Extract phone from JID if needed, or use as is
          actionLabel: accepted ? 'ACCEPT' : 'DISMISS',
          actionMessage: text,
          outcome: accepted ? 'Merchant accepted and might use this' : 'Merchant dismissed suggestion',
        }
      });
    } catch (e) {
      console.error('[Inbox] Failed to record feedback', e);
    }
  }, [selectedConvoId, selectedConversation, recordFeedback]);


  const insights = useMemo(() => {
    let base: InboxInsights = {
      intent: 'Exploring',
      strategy: '',
      cartValue: formattedCartValue,
      status: 'idle',
      suggestedDraft: '',
      suggestedReplies: [],
      confidence: 85,
      blueprintSteps: [],
    };

    const getString = (val: any) => {
      if (typeof val === 'string') return val;
      if (!val) return '';
      return (val as any).action || (val as any).text || (val as any).label || (val as any).body || JSON.stringify(val);
    };

    if (strategyContext) {
      try {
        const parsed = typeof strategyContext === 'string' ? JSON.parse(strategyContext) : strategyContext;

        base = {
          ...base,
          intent: getString(parsed.intent || parsed.current_intent) || 'Exploring',
          strategy: parsed.strategy || parsed.live_strategy || '',
          status: parsed.status || 'idle',
          suggestedDraft: getString(parsed.suggested_draft || ''),
          suggestedReplies: (parsed.suggested_replies || []).map(getString),
          smartActions: (parsed.smart_actions || []).map((sa: any) => ({
            label: sa.label || '',
            priority: sa.priority || 0,
            message_suggestion: sa.message_suggestion || '',
          })),
          confidence: Math.round((parsed.confidence_score || 0.85) * 100),
          blueprintSteps: (parsed.blueprint_steps || parsed.blueprint || []).map(getString),
          // Deep Data Mapping
          domain: parsed.current_domain || (parsed as any).domain,
          currentState: parsed.current_state || (parsed as any).state,
          previousState: (parsed as any).previous_state,
          sentimentHistory: (parsed as any).sentiment_history || [],
          conversionProbability: parsed.conversion_probability || (parsed as any).conversion_probability,
          dropRisk: parsed.drop_risk || (parsed as any).drop_risk,
          priceSensitivity: parsed.price_sensitivity || (parsed as any).price_sensitivity,
          decisiveness: parsed.decisiveness || (parsed as any).decisiveness,
          trustLevel: parsed.trust_level || (parsed as any).trust_level,
          activeIntervention: (parsed as any).intervention?.type || (parsed as any).activeIntervention || 'NONE',
          isStateTransitionPaused: (parsed as any).is_state_transition_paused || (parsed as any).isStateTransitionPaused || false,
          pauseReason: (parsed as any).pause_reason || (parsed as any).pauseReason || null,
          aiAutonomyMode: parsed.autonomy_mode || (parsed as any).aiAutonomyMode,
        };
      } catch (e) {
        console.error('[Inbox] Failed to parse aiStrategyContext', e);
      }
    }

    // Real-time WebSocket overrides
    if (realTimeStrategy) {
      base = {
        ...base,
        status: (realTimeStrategy.status as any) || base.status,
        intent: getString(realTimeStrategy.current_intent || base.intent),
        strategy: realTimeStrategy.live_strategy || base.strategy,
        suggestedDraft: getString(realTimeStrategy.suggested_draft || base.suggestedDraft),
        suggestedReplies: (realTimeStrategy.suggested_replies || []).map(getString).length > 0 
          ? (realTimeStrategy.suggested_replies || []).map(getString) 
          : base.suggestedReplies,
        smartActions: (realTimeStrategy.smart_actions || []).map((sa: any) => ({
          label: sa.label || '',
          priority: sa.priority || 0,
          message_suggestion: sa.message_suggestion || '',
        })).length > 0 ? (realTimeStrategy.smart_actions || []).map((sa: any) => ({
          label: sa.label || '',
          priority: sa.priority || 0,
          message_suggestion: sa.message_suggestion || '',
        })) : base.smartActions,
        confidence: realTimeStrategy.confidence_score
          ? Math.round(realTimeStrategy.confidence_score * 100)
          : base.confidence,
        blueprintSteps: realTimeStrategy.blueprint_steps || base.blueprintSteps,
        domain: realTimeStrategy.current_domain || base.domain,
        currentState: realTimeStrategy.current_state || base.currentState,
        sentimentHistory: realTimeStrategy.sentiment_history || base.sentimentHistory,
        conversionProbability: realTimeStrategy.conversion_probability || base.conversionProbability,
        dropRisk: realTimeStrategy.drop_risk || base.dropRisk,
        priceSensitivity: realTimeStrategy.price_sensitivity || base.priceSensitivity,
        decisiveness: realTimeStrategy.decisiveness || base.decisiveness,
        trustLevel: realTimeStrategy.trust_level || base.trustLevel,
        activeIntervention: realTimeStrategy.intervention?.type || base.activeIntervention,
        isStateTransitionPaused: realTimeStrategy.is_state_transition_paused ?? base.isStateTransitionPaused,
        pauseReason: realTimeStrategy.pause_reason ?? base.pauseReason,
        aiAutonomyMode: realTimeStrategy.autonomy_mode || base.aiAutonomyMode,
        currentThought: realTimeStrategy.current_thought || realTimeStrategy.current_intent || base.currentThought,
      };
    }

    return base;
  }, [strategyContext, realTimeStrategy, formattedCartValue]);

  const handleStopAi = useCallback(async () => {
    if (!selectedConvoId) return;
    try {
      const { data } = await stopWorkman({ variables: { conversationId: selectedConvoId } });
      if (data?.stopWorkmanLoop?.success) {
        toast.success(data.stopWorkmanLoop.message || 'Workman loop stopped successfully');
        // The WebSocket pulse will eventually set status to 'idle', 
        // but we can optimistically clear it if needed.
      } else {
        toast.error(data?.stopWorkmanLoop?.message || 'Failed to stop Workman loop');
      }
    } catch (err: any) {
      toast.error(`Error stopping Workman: ${err.message}`);
    }
  }, [selectedConvoId, stopWorkman]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(
    async (text: string, interactiveData?: any) => {
      if (!selectedConvoId) return;
      try {
        setRealTimeStrategy(null);
        const variables: any = { conversationId: selectedConvoId, body: text };
        if (interactiveData) variables.interactiveData = JSON.stringify(interactiveData);

        await sendMsg({
          variables,
          refetchQueries: ['GetConversationMessages', 'GetInboxConversations'],
        });
      } catch {
        toast.error('Failed to send message');
      }
    },
    [selectedConvoId, sendMsg],
  );

  const handleToggleAi = useCallback(
    async (mode: string) => {
      if (!selectedConvoId) return;
      try {
        await toggleAi({
          variables: { conversationId: selectedConvoId, mode: mode as AiAutonomyModeEnum },
          refetchQueries: ['GetInboxConversations'],
        });
        const labels: Record<string, string> = {
          'AUTO': 'AI is now handling this thread',
          'SHADOW': 'AI is now in Shadow Mode (Drafts only)',
          'OFF': 'AI is now completely disabled for this thread'
        };
        toast.success(labels[mode] || 'AI status updated');
      } catch {
        toast.error('Failed to update AI status');
      }
    },
    [selectedConvoId, toggleAi],
  );

  const handleUpdateWorkmanSettings = useCallback(
    async (values: any) => {
      try {
        await updateWorkmanSettings({
          variables: values,
          refetchQueries: ['GetInboxConversations'],
        });
        toast.success('AI Settings updated');
      } catch {
        toast.error('Failed to update AI Settings');
      }
    },
    [updateWorkmanSettings],
  );

  const handleResumeAi = useCallback(async () => {
    if (!selectedConversation) return;
    try {
      await resumeAi({
        variables: { customerPhone: selectedConversation.title },
        refetchQueries: ['GetCustomerAdvisoryProfile', 'GetInboxConversations'],
      });
      toast.success('Workman AI resumed');
    } catch (e) {
      toast.error('Failed to resume AI');
    }
  }, [selectedConversation, resumeAi]);

  // ─── Derived ─────────────────────────────────────────────────────────────────
  const selectedNode = (listData?.inboxConversations?.edges || []).find((e) => e?.node?.id === selectedConvoId)?.node;
  const isAiActive = selectedNode?.isAiActive || false;
  const aiAutonomyMode = (selectedNode as any)?.aiAutonomyMode || AiAutonomyModeEnum.Shadow;

  const currentUser: ChatUser = { id: 'merchant-1', name: 'Me', status: 'online' };

  return (
    <>
      <WhatsAppInbox
        conversations={conversations}
        loading={listLoading}
        selectedConversation={selectedConversation}
        messages={messages}
        insights={insights}
        wsStatus={wsStatus}
        onSelectConversation={setSelectedConvoId}
        onSendMessage={handleSendMessage}
        onToggleAi={handleToggleAi}
        onStopAi={handleStopAi}
        isAiActive={isAiActive}
        aiAutonomyMode={insights?.aiAutonomyMode || selectedConversation?.aiAutonomyMode}
        onOpenAiSettings={() => setIsAiSettingsModalOpen(true)}
        aiSettings={
          selectedNode?.workmanSettings
        }
        currentUser={currentUser}
        onRecordFeedback={handleRecordFeedback}
        onResumeAi={handleResumeAi}
      />

      <WorkmanQuickSettingsModal
        isOpen={isAiSettingsModalOpen}
        onClose={() => setIsAiSettingsModalOpen(false)}
        isUpdating={isUpdatingSettings}
        onUpdate={handleUpdateWorkmanSettings}
        settings={
          (listData?.inboxConversations?.edges || []).find((e) => e?.node?.id === selectedConvoId)?.node?.workmanSettings as any
        }
      />
    </>
  );
}
