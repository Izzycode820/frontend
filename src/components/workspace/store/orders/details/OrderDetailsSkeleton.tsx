import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/shadcn-ui/card';

export function OrderDetailsSkeleton() {
    return (
        <div>
            {/* Header Skeleton */}
            <div className="border-b bg-background">
                <div className="px-4 lg:px-6 py-4">
                    <div className="flex items-center gap-4 mb-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <Skeleton className="h-4 w-48 ml-12" />
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-10" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="px-4 lg:px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Unfulfillment Card Skeleton */}
                        <Card>
                            <CardHeader className="border-b pb-4">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-8 w-8 rounded" />
                                    <Skeleton className="h-6 w-32" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-4 space-y-4">
                                    <div className="flex gap-4">
                                        <Skeleton className="h-12 w-12 rounded" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-1/2" />
                                            <Skeleton className="h-3 w-1/4" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Card Skeleton */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-px w-full" />
                                <div className="flex justify-between">
                                    <Skeleton className="h-6 w-24" />
                                    <Skeleton className="h-6 w-32" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Sidebar Skeleton */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-24 w-full" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <Skeleton className="h-6 w-32" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
