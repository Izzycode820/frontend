'use client';

import React from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';

import { ChatThread } from './ChatThread';
import { ChatSessionSheet } from './ChatSessionSheet';
import { ChatSandbox } from './ChatSandbox';
import { useMerchantChat } from './MerchantChatContext';

/**
 * ChatContainer
 * 
 * PERSISTENT LAYOUT SHELL.
 * This component stays mounted in StoreLayoutClient 100% of the time.
 * It now supports a split-view Sandbox.
 */
export function ChatContainer() {
  const params = useParams();
  const router = useRouter();
  
  const {
    runtime,
    activeSessionId,
    isAiThinking,
    thinkingStatus,
    onSend,
    messages,
    sessions,
    sessionsLoading,
    refetchSessions,
    deleteSession,
    sidePanel,
  } = useMerchantChat();

  const handleBackToDashboard = () => {
    const workspaceId = params?.workspace_id;
    if (workspaceId) {
      router.push(`/workspace/${workspaceId}/store`);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#090909] relative">
      <div className="flex-1 flex flex-row h-full overflow-hidden relative">
        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-[300px]">
          <ChatThread 
            runtime={runtime}
            sessionId={activeSessionId}
            messages={messages}
            isThinking={isAiThinking}
            thinkingStatus={thinkingStatus}
            onSend={onSend}
            onBackToDashboard={handleBackToDashboard}
          />
        </div>

        <ChatSandbox />
      </div>

      <ChatSessionSheet 
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={(id) => {
           const workspaceId = params?.workspace_id;
           if (workspaceId) {
             router.push(`/workspace/${workspaceId}/store/chat/${id}`);
           }
        }}
        onCreate={() => {
           const workspaceId = params?.workspace_id;
           if (workspaceId) {
             router.push(`/workspace/${workspaceId}/store/chat`);
           }
        }}
        onDelete={deleteSession}
        onRefetch={refetchSessions}
        isLoading={sessionsLoading}
      />
    </div>
  );
}

