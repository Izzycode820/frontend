import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { format } from 'date-fns';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { useMutation } from '@apollo/client/react';
import { AddOrderCommentDocument } from '@/services/graphql/admin-store/mutations/orders/__generated__/AddOrderComment.generated';
import { GetOrderDocument } from '@/services/graphql/admin-store/queries/orders/__generated__/getOrder.generated';
import { toast } from 'sonner';

export interface TimelineEvent {
  id: string;
  type: 'COMMENT' | 'STATUS_CHANGE' | 'NOTIFICATION' | 'ORDER_CREATED';
  message: string;
  createdAt: string;
  author?: {
    name: string;
    avatarUrl?: string;
    initials: string;
  };
  metadata?: Record<string, any>;
  isInternal?: boolean;
}

interface TimelineSectionProps {
  orderId: string;
  events: TimelineEvent[];
  onCommentAdded?: () => void;
}

export function TimelineSection({
  orderId,
  events = [],
  onCommentAdded,
}: TimelineSectionProps) {
  const t = useTranslations('Orders.details.timeline');
  const commonT = useTranslations('Orders.details.toasts');
  const [comment, setComment] = useState('');

  // Sorting events: Newest first
  const sortedEvents = [...events].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Mutation
  const [addComment, { loading: postingComment }] = useMutation(AddOrderCommentDocument);

  const handlePostComment = async () => {
    if (!comment.trim()) return;

    const optimisticId = `temp-${Date.now()}`;
    const newComment = {
      __typename: 'OrderCommentType',
      id: optimisticId,
      message: comment,
      createdAt: new Date().toISOString(),
      isInternal: true,
      author: {
        __typename: 'UserType',
        id: 'me', // Ideally get actual user ID, but 'me' works for optimistic display
        email: '',
        firstName: 'Me',
        lastName: '',
      }
    };

    try {
      const result = await addComment({
        variables: {
          orderId,
          message: comment,
          isInternal: true
        },
        optimisticResponse: {
          addOrderComment: {
            __typename: 'AddOrderComment',
            success: true,
            message: commonT('commentPosted'),
            error: null,
            comment: newComment as any
          }
        },
        update: (cache, { data }) => {
          if (!data?.addOrderComment?.comment) return;

          const newCommentData = data.addOrderComment.comment;

          // Transform OrderCommentType to TimelineEventType for the cache
          const timelineEvent = {
            ...(newCommentData as any),
            __typename: 'TimelineEventType',
            type: 'COMMENT',
            metadata: {},
          };

          // Read existing order data from cache
          const existingOrderData = cache.readQuery({
            query: GetOrderDocument,
            variables: { id: orderId }
          });

          if (!existingOrderData?.order?.timeline) return;

          // Write updated data back to cache
          cache.writeQuery({
            query: GetOrderDocument,
            variables: { id: orderId },
            data: {
              ...existingOrderData,
              order: {
                ...existingOrderData.order,
                timeline: [timelineEvent as any, ...existingOrderData.order.timeline]
              }
            }
          });
        }
      });

      if (result.data?.addOrderComment?.success) {
        toast.success(commonT('commentPosted'));
        setComment('');
        // No need to call onCommentAdded() if we are updating cache directly, 
        // but keeping it if parent needs to do other things
        onCommentAdded?.();
      } else {
        toast.error(result.data?.addOrderComment?.error || commonT('unexpectedError'));
      }
    } catch (error) {
      toast.error(commonT('unexpectedError'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Input */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('leaveComment')}
                className="pr-16"
                disabled={postingComment}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePostComment();
                  }
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 text-muted-foreground hover:text-foreground"
                onClick={handlePostComment}
                disabled={postingComment || !comment.trim()}
              >
                {t('post')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-right">
              {t('staffOnly')}
            </p>
          </div>
        </div>

        {/* Timeline Feed */}
        <div className="relative pl-4 border-l-2 border-muted space-y-8">
          {sortedEvents.map((event, index) => {
            const date = new Date(event.createdAt);

            return (
              <div key={event.id} className="relative">
                <div className="flex items-start gap-4">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-background ${event.type === 'COMMENT' ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />

                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">
                        {event.author ? (
                          <span className="font-medium mr-1">{event.author.name}</span>
                        ) : (
                          <span className="font-medium mr-1 text-muted-foreground">{t('system')}</span>
                        )}
                        {event.message}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {format(date, 'MMM d, h:mm a')}
                      </span>
                    </div>

                    {/* Metadata / Specifics */}
                    {event.type === 'ORDER_CREATED' && event.metadata?.order_source && (
                      <p className="text-xs text-muted-foreground">
                        {t('orderReceivedFrom')} {event.metadata.order_source === 'whatsapp' ? t('sources.whatsapp') : event.metadata.order_source === 'payment' ? t('sources.payment') : t('sources.manual')}
                      </p>
                    )}
                    {event.type === 'STATUS_CHANGE' && event.metadata && (
                      <p className="text-xs text-muted-foreground">
                        {event.metadata.old_status && event.metadata.new_status ?
                          t('changedFromTo', { old: event.metadata.old_status, new: event.metadata.new_status }) :
                          event.metadata.tracking_number ?
                            t('tracking', { number: event.metadata.tracking_number }) :
                            ''
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
