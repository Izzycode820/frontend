'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/shadcn-ui/card';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Button } from '@/components/shadcn-ui/button';
import { Alert } from '@/components/shadcn-ui/alert';
import { UpdateGoogleVerificationDocument } from '@/services/graphql/hosting/mutations/storefront/__generated__/updateGoogleVerification.generated';
import { IconInfoCircle, IconExternalLink, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/shadcn-ui/dialog';

interface GoogleVerificationCardProps {
    initialVerificationCode?: string | null;
    assignedDomain: string;
}

export function GoogleVerificationCard({
    initialVerificationCode,
    assignedDomain
}: GoogleVerificationCardProps) {
    const params = useParams();
    const workspaceId = params?.workspace_id as string;

    const [verificationCode, setVerificationCode] = useState(initialVerificationCode || '');
    const [hasChanges, setHasChanges] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showInstructions, setShowInstructions] = useState(false);

    const [updateVerification, { loading }] = useMutation(UpdateGoogleVerificationDocument);

    const handleCodeChange = (val: string) => {
        setVerificationCode(val.trim());
        setHasChanges(val.trim() !== (initialVerificationCode || ''));
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleSave = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const result = await updateVerification({
                variables: {
                    verificationCode: verificationCode || ''
                }
            });

            if (result.data?.updateGoogleVerification?.success) {
                setSuccessMessage(result.data.updateGoogleVerification.message || 'Verification code saved successfully');
                setHasChanges(false);
            } else {
                setErrorMessage(result.data?.updateGoogleVerification?.error || 'Failed to save verification code');
            }
        } catch (error) {
            setErrorMessage('An error occurred while saving the verification code');
            console.error('Google verification error:', error);
        }
    };

    return (
        <div className="w-full max-w-[1000px] mx-auto px-6">
            <Card className="p-6">
                <h2 className="text-base font-semibold mb-6">Google Search Console</h2>

                <div className="space-y-5">
                    {/* Info Section */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">
                                Verify ownership to track your store's performance in Google search results
                            </p>
                        </div>
                        <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <IconInfoCircle className="w-4 h-4 mr-2" />
                                    How to verify
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Verify Your Store in Google Search Console</DialogTitle>
                                    <DialogDescription>
                                        Follow these steps to verify your store ownership (takes ~2 minutes)
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                                        <div>
                                            <p className="font-medium">Open Google Search Console</p>
                                            <a
                                                href="https://search.google.com/search-console"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                            >
                                                search.google.com/search-console
                                                <IconExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
                                        <div>
                                            <p className="font-medium">Add your store as a property</p>
                                            <p className="text-muted-foreground mt-1">
                                                Click "+ Add Property" and enter: <code className="bg-muted px-2 py-0.5 rounded text-xs">https://{assignedDomain}</code>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
                                        <div>
                                            <p className="font-medium">Choose "HTML tag" verification</p>
                                            <p className="text-muted-foreground mt-1">Copy only the content value:</p>
                                            <pre className="bg-muted p-2 rounded text-xs mt-2">
                                                {`<meta name="google-site-verification" content="abc123..." />`}
                                            </pre>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</div>
                                        <div>
                                            <p className="font-medium">Paste code below and save</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">5</div>
                                        <div>
                                            <p className="font-medium">Click "Verify" in Google Console</p>
                                            <p className="text-muted-foreground mt-1">Google confirms ownership instantly</p>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Success/Error Messages */}
                    {successMessage && (
                        <Alert className="bg-green-50 border-green-200 text-green-800">
                            <IconCheck className="w-4 h-4" />
                            <div className="text-sm">{successMessage}</div>
                        </Alert>
                    )}

                    {errorMessage && (
                        <Alert variant="destructive">
                            <IconAlertCircle className="w-4 h-4" />
                            <div className="text-sm">{errorMessage}</div>
                        </Alert>
                    )}

                    {/* Input */}
                    <div className="space-y-2">
                        <Label htmlFor="google-verification">Verification Code</Label>
                        <p className="text-xs text-muted-foreground">
                            Paste the content value from Google (e.g., "abc123xyz...")
                        </p>
                        <Input
                            id="google-verification"
                            placeholder="Paste verification code"
                            value={verificationCode}
                            onChange={(e) => handleCodeChange(e.target.value)}
                            className="font-mono text-sm"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                        <a
                            href="https://search.google.com/search-console"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                            <IconExternalLink className="w-3.5 h-3.5" />
                            Open Search Console
                        </a>
                        <Button
                            onClick={handleSave}
                            disabled={!hasChanges || loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? 'Saving...' : 'Save changes'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
