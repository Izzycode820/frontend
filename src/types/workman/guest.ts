export interface GuestChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GuestChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}
