import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Play,
  Upload,
  Edit,
  VideoIcon,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

const STATUS_CONFIG = {
  uploaded: {
    icon: Clock,
    color: "text-yellow-500",
    badgeVariant: "secondary",
  },
  assigned: {
    icon: Edit,
    color: "text-blue-500",
    badgeVariant: "outline",
  },
  edited: {
    icon: VideoIcon,
    color: "text-green-500",
    badgeVariant: "default",
  },
  approved: {
    icon: CheckCircle,
    color: "text-green-700",
    badgeVariant: "success",
  },
  published: {
    icon: CheckCircle,
    color: "text-green-700",
    badgeVariant: "success",
  },
  default: {
    icon: XCircle,
    color: "text-red-500",
    badgeVariant: "destructive",
  },
};

const CreatorVideoList = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewingVideo, setReviewingVideo] = useState(null);
  const [showEditorAssignmentModal, setShowEditorAssignmentModal] =
    useState(false);
  const [selectedVideoForEditor, setSelectedVideoForEditor] = useState(null);

  const { googleToken } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/videos/creator-get-videos",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch videos");
        }

        const data = await response.json();
        setVideos(data.videos);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleVideoAction = async (action, videoId, additionalData = {}) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/videos/${videoId}/${action}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(additionalData)
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} video`);
      }

      const updatedVideos = videos.map(video => 
        video._id === videoId 
          ? { ...video, status: additionalData.status || video.status }
          : video
      );

      setVideos(updatedVideos);
      
      setReviewingVideo(null);

      toast({
        title: "Success",
        description: `Video ${action} successfully`,
        variant: "default"
      });
    } catch (err) {
      console.error(`Error ${action} video:`, err);
      
      toast({
        title: "Error",
        description: `Failed to ${action} video`,
        variant: "destructive"
      });
    }
  };

  const assignEditorToVideo = async (videoId, editorId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/videos/assign-editor`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoId,
            editorId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to assign editor');
      }

      setVideos(videos.map(video =>
        video._id === videoId
          ? { ...video, status: 'assigned', editorId }
          : video
      ));
    } catch (error) {
      throw error;
    }
  };

  const VideoPreviewDialog = ({ video, videoUrl }) => (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-primary/10 transition-colors"
              >
                <Play className="h-6 w-6 text-primary" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Preview Video</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-4xl w-full max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{video.title}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center">
          <video
            controls
            className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );

  const EditorVideoReviewDialog = ({ video }) => {
    if (!video.editorUploadedVideo) return null;

    return (
      <Dialog
        open={reviewingVideo === video._id}
        onOpenChange={() => setReviewingVideo(null)}
      >
        <DialogContent className="sm:max-w-4xl w-full max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Review Edited Video</DialogTitle>
            <DialogDescription>
              Please review the edited version of "{video.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center items-center">
            <video
              controls
              className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
            >
              <source src={video.editorUploadedVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={() => handleVideoAction("reject", video._id)}
            >
              <ThumbsDown className="mr-2 h-4 w-4" /> Reject and Request Re-edit
            </Button>
            <Button
              variant="success"
              onClick={() => handleVideoAction("approve", video._id)}
            >
              <ThumbsUp className="mr-2 h-4 w-4" /> Approve Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const VideoActionsMenu = ({ video }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-accent">
          <MoreVertical className="h-5 w-5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {video.editorUploadedVideo && (
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => setReviewingVideo(video._id)}
          >
            <VideoIcon className="mr-2 h-4 w-4" /> Review Edited Video
          </DropdownMenuItem>
        )}
        {video.status === "uploaded" && (
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => {
              setSelectedVideoForEditor(video._id);
              setShowEditorAssignmentModal(true);
            }}
          >
            <Edit className="mr-2 h-4 w-4" /> Assign Editor
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const StatusComponent = ({ status }) => {
    const {
      icon: Icon,
      color,
      badgeVariant,
    } = STATUS_CONFIG[status] || STATUS_CONFIG.default;
    return (
      <div className="flex items-center space-x-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <Badge variant={badgeVariant} className="capitalize">
          {status}
        </Badge>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {videos.map((video) => (
          <React.Fragment key={video._id}>
            <Card className="w-full hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
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
                    <h3 className="text-lg font-semibold line-clamp-1">
                      {video.title}
                    </h3>
                    <StatusComponent status={video.status} />
                  </div>
                  <VideoActionsMenu video={video} />
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {video.description || "No description provided"}
                </p>
              </CardContent>
            </Card>

            <EditorVideoReviewDialog video={video} />
          </React.Fragment>
        ))}
      </div>

      {showEditorAssignmentModal && (
        <EditorAssignmentModal
          videoId={selectedVideoForEditor}
          open={showEditorAssignmentModal}
          onClose={() => {
            setShowEditorAssignmentModal(false);
            setSelectedVideoForEditor(null);
          }}
        />
      )}
    </div>
  );
};

export default CreatorVideoList;
