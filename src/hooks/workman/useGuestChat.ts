import { useState, useEffect, useCallback } from 'react';
import { guestChatService } from '@/services/workman/guest';
import { GuestChatMessage } from '@/types/workman/guest';

export const useGuestChat = () => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [messages, setMessages] = useState<GuestChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);

  // Initialize Device ID safely in the browser
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

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !deviceId || isThinking || isLimitReached) return;

    const trimmedContent = content.trim();

    // Optimistic UI update
    const newUserMsg: GuestChatMessage = { role: 'user', content: trimmedContent };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsThinking(true);

    const response = await guestChatService.sendMessage(trimmedContent, deviceId);
    
    setIsThinking(false);

    if (response.success && response.message) {
      const newAssistantMsg: GuestChatMessage = { role: 'assistant', content: response.message };
      setMessages((prev) => [...prev, newAssistantMsg]);
    } else {
      // Rate Limit Reached
      if (response.error === 'CHAT_LIMIT') {
        setIsLimitReached(true);
      }
      const systemMessage: GuestChatMessage = { 
        role: 'system', 
        content: response.message || 'We encountered an error processing your message.' 
      };
      setMessages((prev) => [...prev, systemMessage]);
    }
  }, [deviceId, isThinking, isLimitReached]);

  return {
    messages,
    isThinking,
    isLimitReached,
    sendMessage,
    deviceId,
  };
};
