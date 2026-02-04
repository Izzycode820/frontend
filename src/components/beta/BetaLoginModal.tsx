'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/shadcn-ui/dialog';
import { verifyBetaPassword } from '@/app/actions/beta-auth';

interface BetaLoginModalProps {
    children?: React.ReactNode;
}

export function BetaLoginModal({ children }: BetaLoginModalProps) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await verifyBetaPassword(password);

            if (result.success) {
                setOpen(false);
                router.push('/camp');
                router.refresh(); // Ensure middleware picks up the new cookie
            } else {
                setError(result.message || 'Invalid password');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" className="text-sm font-medium">
                        <Lock className="w-4 h-4 mr-2" />
                        Member Login
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Founding Member Access</DialogTitle>
                    <DialogDescription>
                        Enter your private access code to enter the beta workspace.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleLogin} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="Enter Access Code"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={error ? 'border-red-500' : ''}
                            autoFocus
                        />
                        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            'Enter Workspace'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
