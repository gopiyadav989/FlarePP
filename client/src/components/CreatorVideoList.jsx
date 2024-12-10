import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  Loader2
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
import { uploadVideoToYouTube } from './creatorComponents/youtubeService';

// Status color and icon mapping
const STATUS_CONFIG = {
  uploaded: { 
    icon: Clock, 
    color: 'text-yellow-500', 
    badgeVariant: 'secondary' 
  },
  assigned: { 
    icon: Edit, 
    color: 'text-blue-500', 
    badgeVariant: 'outline' 
  },
  edited: { 
    icon: VideoIcon, 
    color: 'text-green-500', 
    badgeVariant: 'default' 
  },
  approved: { 
    icon: CheckCircle, 
    color: 'text-green-700', 
    badgeVariant: 'success' 
  },
  published: { 
    icon: CheckCircle, 
    color: 'text-green-700', 
    badgeVariant: 'success' 
  },
  default: { 
    icon: XCircle, 
    color: 'text-red-500', 
    badgeVariant: 'destructive' 
  }
};

const EditorAssignmentModal = ({ 
  videoId, 
  open, 
  onClose, 
  onAssign 
}) => {
  const [editors, setEditors] = useState([]);
  const [selectedEditor, setSelectedEditor] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEditors = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/videos/getEditors');
        if (!response.ok) {
          throw new Error('Failed to fetch editors');
        }
        const data = await response.json();
        setEditors(data.editors);
        setLoading(false);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch editors. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    if (open) {
      fetchEditors();
    }
  }, [open]);

  const handleAssign = async () => {
    if (!selectedEditor) {
      toast({
        title: "Error",
        description: "Please select an editor first",
        variant: "destructive",
      });
      return;
    }

    try {
      await onAssign(videoId, selectedEditor);
      toast({
        title: "Success",
        description: "Editor assigned successfully",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign editor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Editor</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="py-4">
            <Select
              value={selectedEditor}
              onValueChange={setSelectedEditor}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an editor" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="max-h-[300px]">
                  {editors.map((editor) => (
                    <SelectItem 
                      key={editor._id} 
                      value={editor._id}
                      className="py-3"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={editor.avatar} />
                          <AvatarFallback>
                            {getInitials(editor.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{editor.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {editor.email}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={loading || !selectedEditor}
          >
            Assign Editor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CreatorVideoList = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewingVideo, setReviewingVideo] = useState(null);
  const [showEditorAssignmentModal, setShowEditorAssignmentModal] = useState(false);
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
          throw new Error('Failed to fetch videos');
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

  const handleUploadToYouTube = async (videoId) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/videos/creator-upload-to-youtube`,
        {
          method: "POST",
          credentials: "include", // Add credentials to match other fetch calls
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoId,
            googleToken,
          }),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to upload to YouTube');
      }

      const data = await res.json();
      
      // Update videos list to reflect YouTube upload status
      setVideos(videos.map(video => 
        video._id === videoId 
          ? { ...video, youtubeUploadStatus: 'uploaded', youtubeVideoId: data.youtubeVideoId }
          : video
      ));

      toast({
        title: "Success",
        description: "Video uploaded to YouTube successfully",
        variant: "default"
      });

      return data;
    } catch (error) {
      console.error("YouTube Upload Error:", error);
      
      toast({
        title: "YouTube Upload Failed",
        description: error.message || "Failed to upload video to YouTube",
        variant: "destructive"
      });

      throw error;
    }
  };


  const handleVideoAction = async (action, videoId, additionalData = {}) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/videos/creator-upload-to-youtube`,
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
      
      // If approving video, attempt YouTube upload
      if (action === 'approve' && googleToken) {
        try {
          const uploadResult = await uploadVideoToYouTube(videoId, googleToken);
          
          // Update videos list to reflect YouTube upload status
          setVideos(prevVideos => prevVideos.map(video => 
            video._id === videoId 
              ? { 
                  ...video, 
                  youtubeUploadStatus: 'uploaded', 
                  youtubeVideoId: uploadResult.videoId,
                  youtubeLink: uploadResult.link
                }
              : video
          ));

          toast({
            title: "Success",
            description: "Video uploaded to YouTube successfully",
            variant: "default"
          });
        } catch (uploadError) {
          toast({
            title: "YouTube Upload Failed",
            description: uploadError.message || "Failed to upload video to YouTube",
            variant: "destructive"
          });
        }
      }

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
              onClick={() => handleVideoAction('reject', video._id, { status: 'assigned' })}
            >
              <ThumbsDown className="mr-2 h-4 w-4" /> Reject and Request Re-edit
            </Button>
            <Button 
              variant="success" 
              onClick={() => handleVideoAction('approve', video._id, { status: 'approved' })}
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
        {video.status === 'uploaded' && (
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
    const { icon: Icon, color, badgeVariant } = STATUS_CONFIG[status] || STATUS_CONFIG.default;
    return (
      <div className="flex items-center space-x-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <Badge variant={badgeVariant} className="capitalize">{status}</Badge>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {videos.map((video) => (
          <React.Fragment key={video._id}>
            <Card 
              className="w-full hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30"
            >
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
                    <h3 className="text-lg font-semibold line-clamp-1">{video.title}</h3>
                    <StatusComponent status={video.status} />
                  </div>
                  <VideoActionsMenu video={video} />
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {video.description || 'No description provided'}
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
          onAssign={assignEditorToVideo}
        />
      )}
    </div>
  )
}

export default CreatorVideoList