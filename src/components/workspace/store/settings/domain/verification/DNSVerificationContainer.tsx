'use client';

import React, { useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CustomDomainDocument } from '@/services/graphql/domains/queries/custom-domains/__generated__/customDomain.generated';
import { VerifyCustomDomainDocument } from '@/services/graphql/domains/mutations/custom-domains/__generated__/verifyCustomDomain.generated';
// import { WorkspaceHostingCustomDomainStatusChoices } from '@/types/hosting/graphql-base';

// Define enum locally since it's missing in generated types
enum WorkspaceHostingCustomDomainStatusChoices {
  Verified = 'VERIFIED',
  Active = 'ACTIVE',
  Pending = 'PENDING',
  Failed = 'FAILED'
}
import { Card, CardContent, CardHeader } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn-ui/table';
import { AlertCircle, ArrowRight, CheckCircle2, Info, Loader2, Globe, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface DNSRecord {
  type: string;
  name: string;
  currentValue?: string;
  updateTo?: string;
  action: 'remove' | 'add' | 'update';
}

export function DNSVerificationContainer() {
  const params = useParams();
  const t = useTranslations('Domains');
  const tGen = useTranslations('General');
  const router = useRouter();
  const domainId = params.customdomainid as string;

  const { data, loading, error, startPolling, stopPolling } = useQuery(CustomDomainDocument, {
    variables: { domainId: domainId },
    skip: !domainId,
    pollInterval: 12000, // Poll every 12 seconds
  });

  const [verifyDomain, { loading: verifying }] = useMutation(VerifyCustomDomainDocument);

  useEffect(() => {
    // Stop polling when component unmounts
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const handleVerify = async () => {
    try {
      const { data: verifyData } = await verifyDomain({
        variables: { domainId: domainId },
      });

      if (verifyData?.verifyCustomDomain?.success) {
        toast.success(t('dnsVerifiedToast'));
      } else {
        toast.error(verifyData?.verifyCustomDomain?.error || t('verificationFailed'));
      }
    } catch (err: any) {
      toast.error(err.message || t('verificationFailed'));
      console.error('Verify domain error:', err);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{t('failedToLoad')}: {error.message}</AlertDescription>
      </Alert>
    );
  }

  const domain = data?.customDomain;
  if (!domain) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{t('domainNotFound')}</AlertDescription>
      </Alert>
    );
  }

  // Use structured DNS records from GraphQL (filter nulls with type narrowing)
  const recordsToRemove = (domain.dnsRecordsToRemove || []).filter((r): r is NonNullable<typeof r> => r !== null);
  const recordsToAdd = (domain.dnsRecordsToAdd || []).filter((r): r is NonNullable<typeof r> => r !== null);
  const recordsToUpdate = (domain.dnsRecordsToUpdate || []).filter((r): r is NonNullable<typeof r> => r !== null);

  const isVerified = !!domain.verifiedAt;
  const isDNSValid = domain.status === WorkspaceHostingCustomDomainStatusChoices.Verified ||
    domain.status === WorkspaceHostingCustomDomainStatusChoices.Active;
  const isSSLProvisioned = domain.sslEnabled;

  return (
    <div className="space-y-8 pb-10 max-w-[1000px] mx-auto min-w-0 px-4 md:px-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/workspace/${params.workspace_id}/store/settings/domains`)}
              className="-ml-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Globe className="h-6 w-6 text-muted-foreground" />
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{domain.domain}</h1>
              {!isVerified && (
                <Badge variant="destructive" className="text-xs">{t('invalidDns')}</Badge>
              )}
              {isVerified && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">{t('connected')}</Badge>
              )}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              {tGen('back')}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('externalProvider')} • {t('addedOn', {
            date: (domain.createdAt ? new Date(domain.createdAt) : new Date()).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          })}
        </p>
      </div>

      {/* Help Banner */}
      {!isVerified && (
        <Alert className="bg-purple-50 border-purple-200">
          <Info className="h-4 w-4 text-purple-600" />
          <div className="flex items-center justify-between w-full">
            <AlertDescription className="text-purple-900">
              {t('needHelp')}
            </AlertDescription>
            <Button variant="outline" size="sm" className="ml-4">
              {t('helpSetup')}
            </Button>
          </div>
        </Alert>
      )}

      {/* DNS Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {!isDNSValid && (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <h3 className="text-lg font-semibold">{t('dnsNotPointing')}</h3>
              </>
            )}
            {isDNSValid && (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">{t('dnsCorrect')}</h3>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isDNSValid && (
            <>
              <p className="text-sm">
                {t('dnsStep1', { domain: domain.domain })}
              </p>

              {/* Remove Records */}
              {recordsToRemove.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('dnsStep2')}</p>
                  <div className="border rounded-lg overflow-x-auto">
                    <div className="min-w-[400px]">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="w-24">{t('type')}</TableHead>
                            <TableHead className="w-32">{t('name')}</TableHead>
                            <TableHead>{t('currentValues')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recordsToRemove.map((record, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{record.type}</TableCell>
                              <TableCell>{record.name}</TableCell>
                              <TableCell className="text-muted-foreground">{record.currentValue}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Records */}
              {recordsToAdd.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('dnsStep3')}</p>
                  <div className="border rounded-lg overflow-x-auto">
                    <div className="min-w-[500px]">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="w-24">{t('type')}</TableHead>
                            <TableHead className="w-32">{t('name')}</TableHead>
                            <TableHead>{t('currentValue')}</TableHead>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>{t('updateTo')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recordsToAdd.map((record, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{record.type}</TableCell>
                              <TableCell>{record.name}</TableCell>
                              <TableCell className="text-muted-foreground">{t('empty')}</TableCell>
                              <TableCell>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              </TableCell>
                              <TableCell className="font-medium">{record.updateTo}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}

              {/* Update Records */}
              {recordsToUpdate.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('dnsStep4')}</p>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-24">{t('type')}</TableHead>
                          <TableHead className="w-32">{t('name')}</TableHead>
                          <TableHead>{t('currentValue')}</TableHead>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>{t('updateTo')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recordsToUpdate.map((record, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{record.type}</TableCell>
                            <TableCell>{record.name}</TableCell>
                            <TableCell className="text-destructive">{record.currentValue}</TableCell>
                            <TableCell>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </TableCell>
                            <TableCell className="font-medium">{record.updateTo}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="bg-black hover:bg-black/90 text-white"
                >
                  {verifying ? t('verifying') : t('iUpdatedDns')}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Status Indicators */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          {isDNSValid ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-green-600">{t('dnsPropagationComplete')}</span>
            </>
          ) : (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">{t('dnsPropagation')}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          {isSSLProvisioned ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-green-600">{t('tlsProvisioned')}</span>
            </>
          ) : (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">{t('tlsNotProvisioned')}</span>
            </>
          )}
        </div>
      </div>

      {/* Warning Alerts */}
      {!isVerified && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('domainNotLive')}</strong>
            <br />
            {t('ensureDnsPointing')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
