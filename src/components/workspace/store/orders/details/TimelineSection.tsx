import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { formatDistanceToNow, format } from 'date-fns';

interface TimelineEvent {
  type: 'created' | 'confirmed' | 'shipped' | 'delivered' | 'paid';
  message: string;
  timestamp: string;
}

interface TimelineSectionProps {
  createdAt: string;
  confirmedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  orderNumber: string;
}

export function TimelineSection({
  createdAt,
  confirmedAt,
  shippedAt,
  deliveredAt,
  orderNumber,
}: TimelineSectionProps) {
  const events: TimelineEvent[] = [];

  // Add events in reverse chronological order
  if (deliveredAt) {
    events.push({
      type: 'delivered',
      message: `Order #${orderNumber} was delivered`,
      timestamp: deliveredAt,
    });
  }

  if (shippedAt) {
    events.push({
      type: 'shipped',
      message: `Order #${orderNumber} was shipped`,
      timestamp: shippedAt,
    });
  }

  if (confirmedAt) {
    events.push({
      type: 'confirmed',
      message: `Confirmation #${orderNumber} was generated for this order`,
      timestamp: confirmedAt,
    });
  }

  // Always have creation event
  events.push({
    type: 'created',
    message: `You created this order`,
    timestamp: createdAt,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment Input Placeholder */}
        <div className="border rounded-lg p-3">
          <p className="text-sm text-muted-foreground">Leave a comment...</p>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Only you and other staff can see comments
        </p>

        {/* Timeline Events */}
        <div className="space-y-4">
          {events.map((event, index) => {
            const date = new Date(event.timestamp);
            const dateStr = format(date, 'MMMM d');

            return (
              <div key={index}>
                {index === 0 || format(new Date(events[index - 1].timestamp), 'MMMM d') !== dateStr ? (
                  <p className="text-sm font-medium text-muted-foreground mb-2">{dateStr}</p>
                ) : null}

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-foreground mt-2" />
                  <div className="flex-1">
                    <p className="text-sm">{event.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(date, 'h:mm a')}
                    </p>
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
