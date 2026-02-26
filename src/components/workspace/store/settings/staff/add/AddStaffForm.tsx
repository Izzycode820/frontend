'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { GetWorkspaceRolesDocument } from '@/services/graphql/admin-store/queries/staffs/__generated__/GetWorkspaceRoles.generated';
import { InviteStaffDocument } from '@/services/graphql/admin-store/mutations/staffs/__generated__/InviteStaff.generated';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn-ui/popover';
import { Badge } from '@/components/shadcn-ui/badge';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft, Plus, Search, X, Check, Users, Loader2
} from 'lucide-react';

interface AddStaffFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddStaffForm({ onSuccess, onCancel }: AddStaffFormProps) {
  const router = useRouter();
  const t = useTranslations('Staff');
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);

  const [email, setEmail] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const [isRolePopoverOpen, setIsRolePopoverOpen] = useState(false);

  // Fetch workspace roles
  const { data: rolesData, loading: rolesLoading } = useQuery(GetWorkspaceRolesDocument, {
    variables: {
      first: 50,
      isSystem: false,
    },
    skip: !currentWorkspace,
  });

  const [inviteStaff, { loading: inviting }] = useMutation(InviteStaffDocument);

  const roles = rolesData?.workspaceRoles?.edges?.map(edge => edge?.node).filter(Boolean) || [];
  const selectedRoles = roles.filter(role => selectedRoleIds.includes(role?.id || ''));

  const filteredRoles = roles.filter(role =>
    role?.name.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
    role?.description.toLowerCase().includes(roleSearchQuery.toLowerCase())
  );

  const handleBack = () => {
    router.back();
  };

  const handleCancel = () => {
    router.push(`/workspace/${currentWorkspace?.id}/store/settings/staff`);
  };

  const handleSelectRole = (roleId: string) => {
    if (!selectedRoleIds.includes(roleId)) {
      setSelectedRoleIds([...selectedRoleIds, roleId]);
    }
    setRoleSearchQuery('');
  };

  const handleRemoveRole = (roleId: string) => {
    setSelectedRoleIds(selectedRoleIds.filter(id => id !== roleId));
  };

  const handleInvite = async () => {
    if (!email) {
      toast.error(t('enterEmail'));
      return;
    }

    if (selectedRoles.length === 0) {
      toast.error(t('selectRole'));
      return;
    }

    try {
      const { data } = await inviteStaff({
        variables: {
          input: {
            email,
            roleIds: selectedRoleIds,
          },
        },
      });

      if (data?.inviteStaff?.success) {
        toast.success(t('inviteSuccess'));
        onSuccess?.();
      } else {
        toast.error(data?.inviteStaff?.error || t('inviteFailed'));
      }
    } catch (err: any) {
      toast.error(err.message || t('inviteFailed'));
    }
  };

  const formatRoleName = (name: string) => {
    // Add space before capital letters and trim
    return name.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div className="space-y-8 pb-10 max-w-[1000px] mx-auto min-w-0 px-4 md:px-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{t('addUsers')}</h1>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Emails Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('addUsers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="email"
              placeholder={t('enterEmailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Roles Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('roles')}</CardTitle>
            <CardDescription>{t('rolesDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Selected Roles (supports multiple like Shopify) */}
            {selectedRoles.map((role) => (
              <div key={role?.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-medium">{formatRoleName(role?.name || '')}</p>
                  <p className="text-sm text-muted-foreground">{role?.description}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveRole(role?.id || '')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Assign Button with Popover */}
            <Popover open={isRolePopoverOpen} onOpenChange={setIsRolePopoverOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('assign')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('search')}
                      value={roleSearchQuery}
                      onChange={(e) => setRoleSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {rolesLoading ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      {t('loadingRoles')}
                    </div>
                  ) : filteredRoles.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      {t('noRolesFound')}
                    </div>
                  ) : (
                    <div className="py-2">
                      {filteredRoles.map((role) => {
                        const isSelected = selectedRoleIds.includes(role?.id || '');
                        return (
                          <button
                            key={role?.id}
                            type="button"
                            onClick={() => handleSelectRole(role?.id || '')}
                            className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-start gap-3"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{formatRoleName(role?.name || '')}</p>
                              <p className="text-sm text-muted-foreground">{role?.description}</p>
                            </div>
                            {isSelected && (
                              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}

                      {/* Create new role button (disabled for now) */}
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full justify-start text-primary h-auto py-3 px-4 border-t rounded-none"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('createNewRole')}
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </CardContent>
          <CardFooter className="justify-between border-t pt-6">
            <Button variant="ghost" onClick={onCancel}>
              {t('cancel')}
            </Button>
            <Button onClick={handleInvite} disabled={inviting}>
              {inviting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('sending')}
                </>
              ) : (
                t('sendInvite')
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
