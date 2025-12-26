'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/shadcn-ui/card';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Textarea } from '@/components/shadcn-ui/textarea';
import { Switch } from '@/components/shadcn-ui/switch';
import { Button } from '@/components/shadcn-ui/button';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';
import { SetStorefrontPasswordDocument } from '@/services/graphql/hosting/mutations/storefront/__generated__/setStorefrontPassword.generated';
import { IconInfoCircle, IconLock } from '@tabler/icons-react';

interface StoreAccessCardProps {
  initialPassword: string | null;
  assignedDomain: string;
}

export function StoreAccessCard({ initialPassword, assignedDomain }: StoreAccessCardProps) {
  const params = useParams();
  const workspaceId = params?.workspace_id as string;

  const [password, setPassword] = useState(initialPassword || '');
  const [message, setMessage] = useState('');

  const [setStorefrontPassword, { loading }] = useMutation(SetStorefrontPasswordDocument);

  const handleSave = async () => {
    try {
      await setStorefrontPassword({
        variables: {
          input: {
            workspaceId,
            password: password || null,
          },
        },
      });
    } catch (error) {
      console.error('Failed to save password:', error);
    }
  };

  const passwordLength = password.length;
  const messageLength = message.length;

  return (
    <div className="w-full max-w-[1000px] mx-auto px-6">
      <Card className="p-6">
        <h2 className="text-base font-semibold mb-6">Store access</h2>

        <div className="space-y-5">
          {/* Password Protection Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <IconLock className="w-5 h-5 mt-0.5 text-muted-foreground" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">Password protection</h3>
                  <IconInfoCircle className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Restrict access to visitors with the password
                </p>
              </div>
            </div>
            <Switch
              disabled
              checked={false}
              className="opacity-50 cursor-not-allowed"
            />
          </div>

          {/* Info Alert */}
          <Alert className="bg-blue-500/10 dark:bg-blue-500/10 border-blue-500/20 dark:border-blue-500/20">
            <IconInfoCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="ml-2 text-sm text-blue-900 dark:text-blue-300">
              To let anyone access your online store,{' '}
              <a href="#" className="underline font-medium hover:text-blue-700 dark:hover:text-blue-200">
                add your store address
              </a>{' '}
              and then remove your password.
            </AlertDescription>
          </Alert>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={100}
              placeholder="Enter password"
            />
            <p className="text-xs text-muted-foreground">
              {passwordLength} of 100 characters used
            </p>
          </div>

          {/* Message to Visitors */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">Message to your visitors</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={5000}
              rows={3}
              placeholder="Enter a message for your visitors"
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {messageLength} of 5,000 characters used
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
