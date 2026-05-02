'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthStore, authSelectors } from '@/stores/authentication/authStore';
import type { ChatMessageData } from '@/components/shadcn-ui/chat/types';
import { WorkspaceInboxInboxMessageSenderTypeChoices } from '@/types/workspace/store/graphql-base';

export type InboxWsStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseInboxWebSocketOptions {
  conversationId: string | null;
  workspaceId: string | null;
  /** Called when a verified new_message arrives — refetch your queries here */
  onNewMessage?: () => void;
  /** Called when AI strategy update arrives */
  onStrategyUpdate?: (strategy: any) => void;
  /** Called when a lightweight status ping arrives */
  onStatusPing?: (status: string) => void;
}

interface UseInboxWebSocketReturn {
  status: InboxWsStatus;
  /** Optimistic messages received via WebSocket, not yet in Apollo cache */
  optimisticMessages: ChatMessageData[];
  /** Call after your apollo refetch finishes to drain the optimistic queue */
  clearOptimistic: () => void;
}

/**
 * useInboxWebSocket
 *
 * Manages a single WebSocket connection to the Django Channels InboxConsumer
 * for a given conversationId.
 *
 * Design decisions:
 * - Stable deps: refetch callbacks are held in refs so they never appear in
 *   useCallback/useEffect dep arrays — preventing a reconnect storm.
 * - Optimistic messages: new_message events carry the full payload so we can
 *   render instantly without waiting for the Apollo refetch round-trip.
 * - Exponential back-off reconnect with a max of 5 attempts, capped at 30s.
 * - Heartbeat ping every 30s to keep the socket alive through proxies.
 */
export function useInboxWebSocket({
  conversationId,
  workspaceId,
  onNewMessage,
  onStrategyUpdate,
  onStatusPing,
}: UseInboxWebSocketOptions): UseInboxWebSocketReturn {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);

  const [status, setStatus] = useState<InboxWsStatus>('disconnected');
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessageData[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep callbacks in refs so the socket handler never goes stale,
  // and we never need them in useCallback/useEffect dep arrays.
  const onNewMessageRef = useRef(onNewMessage);
  const onStrategyUpdateRef = useRef(onStrategyUpdate);
  const onStatusPingRef = useRef(onStatusPing);
  useEffect(() => { onNewMessageRef.current = onNewMessage; }, [onNewMessage]);
  useEffect(() => { onStrategyUpdateRef.current = onStrategyUpdate; }, [onStrategyUpdate]);
  useEffect(() => { onStatusPingRef.current = onStatusPing; }, [onStatusPing]);

  // ─── clearOptimistic ────────────────────────────────────────────────────────
  const clearOptimistic = useCallback(() => {
    setOptimisticMessages([]);
  }, []);

  // ─── mapRawMessage ──────────────────────────────────────────────────────────
  const mapRawMessage = useCallback((raw: any): ChatMessageData => {
    let senderId = 'customer';
    let senderType: 'customer' | 'merchant' | 'workman' = 'customer';

    if (raw.sender_type === WorkspaceInboxInboxMessageSenderTypeChoices.Merchant) {
      senderId = 'merchant-1';
      senderType = 'merchant';
    } else if (raw.sender_type === WorkspaceInboxInboxMessageSenderTypeChoices.Workman) {
      senderId = 'ai';
      senderType = 'workman';
    }

    return {
      id: raw.id || `optimistic-${Date.now()}`,
      senderId,
      senderType,
      senderName: raw.sender_type || 'Unknown',
      text: raw.body || '',
      interactiveData: raw.interactive_data
        ? (typeof raw.interactive_data === 'string'
          ? JSON.parse(raw.interactive_data)
          : raw.interactive_data)
        : undefined,
      location: raw.latitude ? {
        latitude: raw.latitude,
        longitude: raw.longitude,
        name: raw.location_name,
        address: raw.location_address,
      } : undefined,
      voice: raw.voice_url ? {
        url: raw.voice_url,
        duration: raw.voice_duration || 0,
        waveform: raw.voice_waveform || undefined,
      } : undefined,
      images: raw.media_type === 'image' && raw.media_url ? [{
        url: raw.media_url,
        width: 800,
        height: 600,
      }] : undefined,
      timestamp: raw.created_at ? new Date(raw.created_at).getTime() : Date.now(),
    };
  }, []);

  // ─── connect ────────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    if (!conversationId || !workspaceId || !isAuthenticated) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Refresh token if expired before opening the socket
    const authStore = useAuthStore.getState() as any;
    if (authStore.isTokenExpired?.()) {
      try {
        await authStore.refreshTokenSafe();
      } catch {
        setStatus('error');
        return;
      }
    }

    const currentToken = (useAuthStore.getState() as any).token;
    if (!currentToken) { setStatus('error'); return; }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.NEXT_PUBLIC_WS_HOST || 'localhost:8000';
    const url = `${protocol}//${wsHost}/ws/inbox/${conversationId}/?token=${currentToken}`;

    console.log(`[InboxWS] 🔌 Connecting → ${url}`);
    setStatus('connecting');

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[InboxWS] ✅ Connected');
      setStatus('connected');
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'new_message') {
          console.log('[InboxWS] 📩 new_message received');

          // 1. Optimistically render the message immediately
          if (data.message) {
            setOptimisticMessages((prev) => {
              const incoming = mapRawMessage(data.message);
              // Deduplicate: skip if id already present
              if (prev.some((m) => m.id === incoming.id)) return prev;
              return [...prev, incoming];
            });
          }

          // 2. Also fire the Apollo refetch so the cache catches up
          onNewMessageRef.current?.();

        } else if (data.type === 'ai_strategy_update') {
          console.log('[InboxWS] 🧠 ai_strategy_update received');
          onStrategyUpdateRef.current?.(data.strategy);
        } else if (data.type === 'ai_status_ping') {
          console.log('[InboxWS] 🛰️ ai_status_ping received:', data.status);
          onStatusPingRef.current?.(data.status);
        }
      } catch (err) {
        console.error('[InboxWS] ⚠️ Parse error:', err);
      }
    };

    ws.onclose = (event) => {
      console.log(`[InboxWS] ❌ Closed: code=${event.code}`);
      wsRef.current = null;
      setStatus('disconnected');

      if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30_000);
        reconnectAttempts.current++;
        console.log(`[InboxWS] 🔄 Reconnect in ${delay}ms (${reconnectAttempts.current}/${maxReconnectAttempts})`);
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = (err) => {
      console.error('[InboxWS] 🛑 Error:', err);
      setStatus('error');
    };
  // Stable deps only — refetch fns are in refs
  }, [conversationId, workspaceId, isAuthenticated, mapRawMessage]);

  // ─── Lifecycle: open/close per conversation ──────────────────────────────────
  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000);
        wsRef.current = null;
      }
      // Clear optimistic queue when conversation changes
      setOptimisticMessages([]);
    };
  }, [connect]);

  // ─── Heartbeat (30s ping) ────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'ping' }));
      }
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  return { status, optimisticMessages, clearOptimistic };
}
