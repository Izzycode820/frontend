'use client'

console.log('[LOAD] Providers module');

import { ThemeProvider } from '@/utils/ThemeContext';
import { AuthInitializer } from '@/components/authentication/shared/AuthInitializer';
import { TokenManager } from '@/components/authentication/shared/TokenManager';
import { useEmailVerificationGuard } from '@/hooks/authentication/useEmailVerificationGuard';

// Thin wrapper so the hook has access to the router context provided by Next.js
function EmailVerificationGuard() {
    useEmailVerificationGuard()
    return null
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthInitializer>
                <TokenManager>
                    <EmailVerificationGuard />
                    {children}
                </TokenManager>
            </AuthInitializer>
        </ThemeProvider>
    );
}
