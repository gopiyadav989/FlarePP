import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, VideoIcon, Play, Clock, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import VideoPreviewDialog from "./VideoPreviewDialog";
import VideoActionsMenu from "./VideoActionsMenu";
import { Progress } from "@/components/ui/progress";

// Status configuration with icons and colors
const STATUS_CONFIG = {
  uploaded: {
    icon: Clock,
    color: "text-amber-500",
    bgColor: "bg-amber-500/20",
    badgeVariant: "secondary",
    badgeClass: "bg-amber-500/20 text-amber-500 border-amber-500/30",
  },
  assigned: {
    icon: Edit,
    color: "text-blue-500",
    bgColor: "bg-blue-500/20",
    badgeVariant: "outline",
    badgeClass: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  },
  edited: {
    icon: VideoIcon,
    color: "text-purple-500",
    bgColor: "bg-purple-500/20",
    badgeVariant: "default",
    badgeClass: "bg-purple-500/20 text-purple-500 border-purple-500/30",
  },
  approved: {
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-500/20",
    badgeVariant: "success",
    badgeClass: "bg-green-500/20 text-green-500 border-green-500/30",
  },
  published: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/20",
    badgeVariant: "success",
    badgeClass: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  },
  default: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/20",
    badgeVariant: "destructive",
    badgeClass: "bg-red-500/20 text-red-500 border-red-500/30",
  },
};

const VideoCard = ({ video, onReview, onAssign }) => {
  const config = STATUS_CONFIG[video.status] || STATUS_CONFIG.default;
  const Icon = config.icon;
  const navigate = useNavigate();
  
  const handleCardClick = (e) => {
    // Check if the click was on a button or in the actions menu
    if (e.target.closest('button') || e.target.closest('[role="menuitem"]')) {
      // Don't navigate if we clicked a button or menu item
      return;
    }
    
    navigate(`/videos/${video._id}`);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="w-full bg-black/40 backdrop-blur-xl border border-white/10 overflow-hidden group transition-all duration-300 hover:border-white/20 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <Badge className={config.badgeClass}>
              <Icon className={`h-3.5 w-3.5 mr-1 ${config.color}`} />
              {video.status}
            </Badge>
          </div>
          <div className="absolute top-3 right-3 flex space-x-2">
            <VideoPreviewDialog
              video={video}
              videoUrl={video.creatorUploadedVideo}
            />
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold line-clamp-1 text-white">
                {video.title}
              </h3>
              <p className="text-xs text-gray-400">
                {new Date(video.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <VideoActionsMenu 
              video={video} 
              onReview={onReview} 
              onAssign={onAssign} 
            />
          </div>

          <p className="text-sm text-gray-400 line-clamp-2">
            {video.description || "No description provided"}
          </p>

          {/* Editor information if assigned */}
          {video.editor && (
            <div className="flex items-center mt-2 bg-blue-900/20 rounded-md p-2">
              <div className="flex-shrink-0 mr-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-500/20 flex items-center justify-center">
                  <Edit className="h-4 w-4 text-blue-400" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {video.editor.name}
                </p>
                <p className="text-xs text-gray-400">
                  {video.editor.email}
                </p>
              </div>
            </div>
          )}

          {/* YouTube Upload Progress */}
          {video.youtubeUploadStatus === "uploading" && (
            <div className="w-full mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">
                  Uploading to YouTube
                </span>
                <span className="text-sm font-medium">
                  {video.uploadProgress || 0}%
                </span>
              </div>
              <Progress
                value={video.uploadProgress || 0}
                className="w-full"
              />
            </div>
          )}
          
          {/* Actions based on video status */}
          {video.status === "edited" && (
            <Button
              className="w-full mt-2 bg-gradient-to-r from-blue-600/70 to-purple-600/70 hover:from-blue-600/90 hover:to-purple-600/90 text-white"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                onReview(video._id);
              }}
            >
              <VideoIcon className="mr-2 h-4 w-4" /> Review Edited Video
            </Button>
          )}
          
          {video.status === "uploaded" && (
            <Button
              className="w-full mt-2 bg-gradient-to-r from-blue-600/70 to-purple-600/70 hover:from-blue-600/90 hover:to-purple-600/90 text-white"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                onAssign(video._id);
              }}
            >
              <Edit className="mr-2 h-4 w-4" /> Assign Editor
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VideoCard;