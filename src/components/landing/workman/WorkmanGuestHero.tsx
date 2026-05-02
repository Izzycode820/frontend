"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { AssistantRuntimeProvider, useLocalRuntime, ThreadMessage } from "@assistant-ui/react";
import { guestChatService } from '@/services/workman/guest';
import { WorkmanGuestChatUI } from './WorkmanGuestChatUI';

export const WorkmanGuestHero = () => {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('workman_guest_device_id');
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('workman_guest_device_id', id);
      }
      setDeviceId(id);
    }
  }, []);

  const adapter = useMemo(() => ({
    async *run({ messages }: { messages: readonly ThreadMessage[] }) {
      if (!deviceId) throw new Error("Device ID missing");
      
      const lastMessage = messages[messages.length - 1];
      const textContent = lastMessage?.content?.filter((c: any) => c.type === 'text').map((c: any) => c.text).join(" ") || "";
      
      try {
        let accumulatedText = "";
        let tool_calls: any[] = [];
        
        // Loop over the AsyncGenerator directly!
        const stream = guestChatService.streamMessage(textContent, deviceId);
        for await (const delta of stream) {
          if (delta.content) {
            accumulatedText += delta.content;
          }

          if (delta.tool_calls) {
            for (const call of delta.tool_calls) {
              const index = call.index || 0;
              if (!tool_calls[index]) {
                tool_calls[index] = { 
                  id: call.id,
                  name: call.function?.name,
                  arguments: call.function?.arguments || "" 
                };
              } else {
                if (call.function?.arguments) {
                  tool_calls[index].arguments += call.function.arguments;
                }
              }
            }
          }

          const content: any[] = [{ type: "text", text: accumulatedText }];
          
          // Map to Assistant UI part format
          for (const tc of tool_calls) {
             let parsedArgs = {};
             try {
                parsedArgs = JSON.parse(tc.arguments);
             } catch (e) {
                // Ignore incomplete JSON during streaming
             }

             content.push({
                type: "tool-call",
                toolCallId: tc.id,
                toolName: tc.name,
                args: parsedArgs
             });
          }

          yield { content };
        }
      } catch (error: any) {
        let errorData;
        try {
          errorData = JSON.parse(error.message);
        } catch (e) {
          errorData = { message: "Internal connection error. Please try again." };
        }
        
        if (errorData?.error === 'CHAT_LIMIT') {
          yield { 
            content: [{ type: "text" as const, text: errorData.message || "Preview limit reached. Please register to deploy your store." }] 
          } as any;
        } else {
          yield { 
            content: [{ type: "text" as const, text: errorData.message || "An error occurred fetching the response." }] 
          } as any;
        }
      }
    }
  }), [deviceId]);

  const runtime = useLocalRuntime(adapter);

  if (!deviceId) return null; // Avoid hydration mismatch

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <WorkmanGuestChatUI />
    </AssistantRuntimeProvider>
  );
};
