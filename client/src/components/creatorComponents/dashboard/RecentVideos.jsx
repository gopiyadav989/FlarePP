import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, BarChart2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';

// Helper functions
const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toString();
  }
};

const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

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

const RecentVideos = ({ loading, videos }) => {
  const navigate = useNavigate();

  // Handle video click to navigate to video details
  const handleVideoClick = (videoId) => {
    console.log('Opening video:', videoId);
    navigate(`/creator-dashboard/video/${videoId}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="md:col-span-2 space-y-6"
    >
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="mb-4 bg-black/30 border border-white/10">
          <TabsTrigger value="recent" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/50 data-[state=active]:to-purple-600/50">Recent Videos</TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/50 data-[state=active]:to-purple-600/50">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="space-y-4">
          <Card className="bg-black/40 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle>Recent Videos</CardTitle>
              <CardDescription>Your recently uploaded content</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                Array(3).fill().map((_, i) => (
                  <div key={i} className="flex gap-4 mb-4">
                    <div className="h-20 w-36 rounded-md bg-white/5" />
                    <div className="flex-1">
                      <div className="h-4 w-3/4 mb-2 bg-white/5 rounded" />
                      <div className="h-4 w-1/2 mb-2 bg-white/5 rounded" />
                      <div className="h-4 w-1/4 bg-white/5 rounded" />
                    </div>
                  </div>
                ))
              ) : videos && videos.length > 0 ? (
                <ScrollArea className="h-[350px] pr-4">
                  {videos.map((video) => (
                    <div 
                      key={video._id} 
                      className="flex gap-4 mb-4 group hover:bg-white/5 p-2 rounded-lg transition-all cursor-pointer"
                      onClick={() => handleVideoClick(video._id)}
                    >
                      <div className="relative h-20 w-36 rounded-md overflow-hidden">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="object-cover h-full w-full"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                          {formatDuration(video.duration)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm line-clamp-2">{video.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <span>{formatNumber(video.views)} views</span>
                          <span>•</span>
                          <span>{timeAgo(video.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={video.visibility === 'public' ? 'default' : 'outline'} className="bg-gradient-to-r from-blue-600/50 to-purple-600/50 text-white border-0">
                            {video.visibility || 'private'}
                          </Badge>
                          {video.status && (
                            <Badge 
                              variant={video.status === 'published' ? 'success' : 'outline'} 
                              className={video.status === 'published' ? "bg-green-600/50 text-white border-0" : "border-white/20 text-white"}
                            >
                              {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <Video className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                  <p className="text-gray-500">No videos uploaded yet.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-white/10 px-6 py-4">
              <Button 
                variant="outline"
                onClick={() => navigate('/creator-dashboard/videos')}
                className="w-full bg-transparent border-white/10 text-white hover:bg-white/10"
              >
                View All Videos
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <Card className="bg-black/40 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Views and engagement over the past 30 days</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              {loading ? (
                <div className="h-full w-full bg-white/5 rounded" />
              ) : (
                <div className="text-center">
                  <BarChart2 className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                  <p className="text-gray-500">Performance charts coming soon</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default RecentVideos; 