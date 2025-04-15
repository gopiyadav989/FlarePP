import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquareIcon, UserPlusIcon, ThumbsUpIcon, Video, ActivityIcon } from "lucide-react";

// Helper function for formatting time ago
const timeAgo = (date) => {
  if (!date) return "";
  const now = new Date();
  const past = new Date(date);
  const diff = Math.floor((now - past) / 1000);
  
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
  return `${Math.floor(diff / 31536000)} years ago`;
};

// Helper function for activity text
const getActivityText = (type) => {
  switch (type) {
    case 'comment':
      return 'left a comment';
    case 'subscription':
      return 'subscribed to your channel';
    case 'like':
      return 'liked your video';
    case 'view':
      return 'viewed your video';
    default:
      return 'interacted with your content';
  }
};

const ActivityFeed = ({ loading, videos }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-6"
    >
      <Card className="bg-black/40 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest interactions on your channel</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            Array(5).fill().map((_, i) => (
              <div key={i} className="flex items-start gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-white/5" />
                <div className="flex-1">
                  <div className="h-4 w-full mb-2 bg-white/5 rounded" />
                  <div className="h-3 w-2/3 bg-white/5 rounded" />
                </div>
              </div>
            ))
          ) : videos && videos.length > 0 ? (
            <ScrollArea className="h-[300px] pr-4">
              {videos.map((video) => (
                <div key={video._id} className="flex items-start gap-3 mb-4 pb-4 border-b border-white/10 last:border-0">
                  <div className="bg-blue-500/20 h-8 w-8 rounded-full flex items-center justify-center">
                    {video.type === 'comment' && <MessageSquareIcon className="h-4 w-4 text-blue-400" />}
                    {video.type === 'subscription' && <UserPlusIcon className="h-4 w-4 text-green-400" />}
                    {video.type === 'like' && <ThumbsUpIcon className="h-4 w-4 text-purple-400" />}
                    {!video.type && <Video className="h-4 w-4 text-blue-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{video.user || 'User'} {getActivityText(video.type || 'view')}</p>
                    {video.title && (
                      <p className="text-xs text-gray-400 line-clamp-1">{video.title}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(video.createdAt || video.timestamp)}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          ) : (
            <div className="text-center py-6">
              <ActivityIcon className="h-10 w-10 mx-auto text-gray-500 mb-2" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ActivityFeed; 