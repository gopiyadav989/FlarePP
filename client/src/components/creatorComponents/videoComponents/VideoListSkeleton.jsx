import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const VideoCardSkeleton = () => (
  <Card className="w-full bg-black/40 backdrop-blur-xl border border-white/10">
    <div className="h-48 bg-white/5 rounded-t-lg" />
    <CardContent className="p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <Skeleton className="h-6 w-48 bg-white/5" />
          <Skeleton className="h-4 w-24 bg-white/5" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full bg-white/5" />
      </div>
      <Skeleton className="h-4 w-full bg-white/5" />
      <Skeleton className="h-4 w-3/4 bg-white/5" />
    </CardContent>
  </Card>
);

const VideoListSkeleton = ({ count = 6 }) => (
  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: count }).map((_, index) => (
      <VideoCardSkeleton key={index} />
    ))}
  </div>
);

export default VideoListSkeleton; 