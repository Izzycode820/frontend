/**
 * Notification Sound Module
 * 
 * Plays notification sounds when new notifications arrive.
 * Uses the browser Notification API for system sounds, with
 * audio fallback for browsers that don't support it.
 * 
 * Behavior:
 * - When tab is FOCUSED: Play in-app audio only (no browser notification)
 * - When tab is NOT FOCUSED: Show browser notification with system sound
 */

// Throttle state (module-level to persist across calls)
let isPlaying = false;
let throttleTimeout: NodeJS.Timeout | null = null;
const THROTTLE_MS = 1000;

interface NotificationData {
    id: string;
    title: string;
    body: string;
}

/**
 * Check if browser notification permission is granted
 */
export function isNotificationPermissionGranted(): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return false;
    }
    return Notification.permission === 'granted';
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return 'unsupported';
    }

    if (Notification.permission !== 'default') {
        return Notification.permission;
    }

    try {
        return await Notification.requestPermission();
    } catch (error) {
        console.error('[NotificationSound] Permission request failed:', error);
        return 'denied';
    }
}

/**
 * Check if the document/tab is currently visible
 */
function isTabVisible(): boolean {
    if (typeof document === 'undefined') return true;
    return document.visibilityState === 'visible';
}

/**
 * Play notification sound for an incoming notification
 * 
 * - Tab FOCUSED: Plays in-app audio only
 * - Tab NOT FOCUSED: Shows browser notification with system sound
 * 
 * @param notification - The notification data
 * @param options - Optional configuration
 */
export function playNotificationSound(
    notification: NotificationData,
    options: { forceBrowserNotification?: boolean } = {}
): void {
    const { forceBrowserNotification = false } = options;

    // Throttle to prevent sound spam
    if (isPlaying) return;

    isPlaying = true;

    // Clear throttle after delay
    if (throttleTimeout) {
        clearTimeout(throttleTimeout);
    }
    throttleTimeout = setTimeout(() => {
        isPlaying = false;
    }, THROTTLE_MS);

    const tabIsVisible = isTabVisible();

    // When tab is NOT visible (or forced), use browser notification with system sound
    if ((!tabIsVisible || forceBrowserNotification) && isNotificationPermissionGranted()) {
        try {
            const browserNotification = new Notification(notification.title, {
                body: notification.body,
                icon: '/icons/icon-192x192.png',
                tag: notification.id, // Prevents duplicate notifications
                silent: false, // This triggers the system sound!
                requireInteraction: false,
            });

            // Auto-close after 5 seconds
            setTimeout(() => {
                browserNotification.close();
            }, 5000);

            // Handle click - focus the window
            browserNotification.onclick = () => {
                window.focus();
                browserNotification.close();
            };

            return;
        } catch (error) {
            console.warn('[NotificationSound] Browser notification failed:', error);
            // Fall through to audio fallback
        }
    }

    // When tab IS visible (or browser notification failed), play in-app audio
    playInAppAudio();
}

/**
 * Play in-app notification audio
 * Uses the custom notification sound (Windows 11 style)
 */
function playInAppAudio(): void {
    try {
        // Add timestamp to prevent caching old versions
        // In production, this should ideally be versioned by build, but this works for hot-swapping
        const audio = new Audio(`/sounds/notification.mp3?v=${new Date().getTime()}`);
        audio.volume = 1.0; // Max volume

        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.catch((error) => {
                console.warn('[NotificationSound] Audio play failed (likely autoplay policy or missing file):', error);

                // Fallback 1: Try System Notification (if visible but audio blocked)
                // We don't want to spam system notifs if tab is focused, but if audio fails, it's a good backup
                if (isNotificationPermissionGranted()) {
                    new Notification('New Notification', {
                        body: 'Audio playback was blocked. Click to enable sounds.',
                        silent: true
                    });
                }

                // Fallback 2: Beep
                playBeepFallback();
            });
        }
    } catch (error) {
        playBeepFallback();
    }
}

/**
 * Ultimate fallback: Generate a "Windows-like" chord using Web Audio API
 */
function playBeepFallback(): void {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const audioContext = new AudioContext();
        const now = audioContext.currentTime;

        // Create two oscillators for a chord effect (Major third)
        // C5 (523.25 Hz) and E5 (659.25 Hz)
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';

        osc1.frequency.setValueAtTime(523.25, now);
        osc2.frequency.setValueAtTime(659.25, now);

        // Connect
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Env
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        // Play
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);

    } catch (error) {
        // Web Audio not supported - silent fail
        console.debug('[NotificationSound] All audio methods failed');
    }
}

