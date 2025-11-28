import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Separator } from '@/components/shadcn-ui/separator';
import { Textarea } from '@/components/shadcn-ui/textarea';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';

interface CustomerTimelineProps {
  createdAt: string;
}

export function CustomerTimeline({ createdAt }: CustomerTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Comment Input */}
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded bg-pink-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              AS
            </div>
            <div className="flex-1">
              <Textarea
                placeholder="Leave a comment..."
                className="min-h-[80px] resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
                <Button size="sm" variant="ghost">
                  Post
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Only you and other staff can see comments
              </p>
            </div>
          </div>

          <Separator />

          {/* Timeline Events */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="h-2 w-2 rounded-full bg-gray-400 mt-2"></div>
                <div className="w-px h-full bg-gray-200 mt-1"></div>
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm text-muted-foreground mb-1">
                  {format(new Date(createdAt), 'MMMM d')}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm">You created this customer.</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(createdAt), 'h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
