import { GuestChatResponse } from '@/types/workman/guest';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const guestChatService = {
  // Original Synchronous Method (Optional fallback)
  async sendMessage(message: string, deviceId: string): Promise<GuestChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/workman/guest-chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Workman-Device-ID': deviceId,
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'API_ERROR',
          message: data.message || 'An error occurred connecting to the assistant.',
        };
      }

      return data as GuestChatResponse;
    } catch (error) {
      console.error('Guest Chat Network Error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Could not connect to the network. Please check your connection.',
      };
    }
  },

  // SSE Stream Parser exactly following the required payload
  async *streamMessage(message: string, deviceId: string) {
    const response = await fetch(`${API_BASE_URL}/api/workman/guest-chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Workman-Device-ID': deviceId,
      },
      body: JSON.stringify({ message }),
    });

    // Handle initial handshake errors (like 429 Ratelimit)
    if (!response.ok) {
      const data = await response.json();
      throw new Error(JSON.stringify({
        error: data.error || 'API_ERROR',
        message: data.message || 'An error occurred connecting to the assistant.',
      }));
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      
      // Keep the last chunk in buffer in case it was split exactly over a network chunk boundary
      buffer = parts.pop() || "";

      for (const chunk of parts) {
        if (!chunk.startsWith('data: ')) continue;
        
        const dataStr = chunk.slice(6).trim();
        if (dataStr === '[DONE]') return;
        
        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed.choices?.[0]?.delta;
          
          if (delta) {
            yield delta; // Yield the entire delta (content or tool_calls)
          }
        } catch (e) {
          // Ignore incomplete parsing issues seamlessly
        }
      }
    }
  }
};
