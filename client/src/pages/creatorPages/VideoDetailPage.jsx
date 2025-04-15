import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { 
  Edit, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  VideoIcon,
  ArrowLeft,
  Share2,
  ExternalLink,
  YoutubeIcon,
  Copy
} from "lucide-react";
import { getVideoById } from "../../api/videoService";
import { uploadVideoToYouTube } from "../../components/creatorComponents/youtubeService";
import EditorAssignmentModal from "../../components/creatorComponents/EditorAssignmentModal";
import { Progress } from "@/components/ui/progress";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

// Status configuration with icons and colors
const STATUS_CONFIG = {
  uploaded: {
    icon: Clock,
    color: "text-amber-500",
    bgColor: "bg-amber-500/20",
    badgeClass: "bg-amber-500/20 text-amber-500 border-amber-500/30",
  },
  assigned: {
    icon: Edit,
    color: "text-blue-500",
    bgColor: "bg-blue-500/20",
    badgeClass: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  },
  edited: {
    icon: VideoIcon,
    color: "text-purple-500",
    bgColor: "bg-purple-500/20",
    badgeClass: "bg-purple-500/20 text-purple-500 border-purple-500/30",
  },
  approved: {
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-500/20",
    badgeClass: "bg-green-500/20 text-green-500 border-green-500/30",
  },
  published: {
    icon: YoutubeIcon,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/20",
    badgeClass: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  },
  default: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/20",
    badgeClass: "bg-red-500/20 text-red-500 border-red-500/30",
  },
};

const VideoDetailPage = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditorAssignmentModal, setShowEditorAssignmentModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { googleToken } = useSelector((state) => state.user);

  // Fetch video data
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const response = await getVideoById(videoId);
        setVideo(response.video);
      } catch (err) {
        console.error("Error fetching video:", err);
        setError(err.message || "Failed to load video");
        toast({
          title: "Error",
          description: "Failed to load video details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  // Handle video actions (approve, reject)
  const handleVideoAction = async (action) => {
    if (action === "approve" && googleToken) {
      try {
        setIsUploading(true);
        setUploadProgress(0);
        
        // Update local state to show uploading
        setVideo({
          ...video,
          youtubeUploadStatus: "uploading",
          uploadProgress: 0,
        });

        // Call the YouTube upload function
        const uploadResult = await uploadVideoToYouTube(video._id, googleToken, (progress) => {
          setUploadProgress(progress);
          setVideo(prev => ({
            ...prev,
            uploadProgress: progress,
          }));
        });

        // Update the video state with the YouTube upload status
        setVideo({
          ...video,
          status: "published",
          youtubeUploadStatus: "uploaded",
          youtubeVideoId: uploadResult.videoId,
          youtubeLink: uploadResult.link,
        });

        toast({
          title: "Success",
          description: "Video uploaded to YouTube successfully",
          variant: "default",
        });
      } catch (error) {
        console.error("YouTube Upload Failed:", error);
        setVideo({
          ...video,
          youtubeUploadStatus: "error",
        });

        toast({
          title: "Upload Failed",
          description: error.message || "Failed to upload video to YouTube",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    } else if (action === "reject") {
      // Handle rejection logic
      toast({
        title: "Video Rejected",
        description: "The video has been sent for re-editing.",
        variant: "default",
      });
    }
  };

  // Copy video link
  const copyVideoLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link Copied",
        description: "Video link copied to clipboard",
        variant: "default",
      });
    });
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="space-y-4 max-w-5xl mx-auto">
          <div className="h-6 w-48 bg-white/5 rounded animate-pulse"></div>
          <div className="h-96 w-full bg-white/5 rounded animate-pulse"></div>
          <div className="h-8 w-64 bg-white/5 rounded animate-pulse"></div>
          <div className="h-4 w-full bg-white/5 rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="max-w-5xl mx-auto bg-red-900/20 border-red-800">
          <CardContent className="pt-6">
            <h2 className="text-xl text-red-100 font-medium mb-2">Error Loading Video</h2>
            <p className="text-red-200">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4 border-red-700 text-red-100"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container py-8">
        <Card className="max-w-5xl mx-auto">
          <CardContent className="pt-6">
            <h2 className="text-xl font-medium mb-2">Video Not Found</h2>
            <p className="text-muted-foreground">The video you're looking for doesn't exist or has been removed.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get status configuration
  const statusConfig = STATUS_CONFIG[video.status] || STATUS_CONFIG.default;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="container py-8">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <Button 
          variant="outline" 
          className="mb-6 bg-black/40 border-white/10 hover:bg-white/10"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Videos
        </Button>

        {/* Video details */}
        <Card className="bg-black/40 backdrop-blur-xl border border-white/10 mb-8">
          <div className="aspect-video w-full relative">
            <video
              controls
              className="w-full h-full object-contain bg-black/80"
              src={video.status === "edited" ? video.editorUploadedVideo : video.creatorUploadedVideo}
              poster={video.thumbnail}
            ></video>
          </div>
          
          <CardContent className="py-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{video.title}</h1>
                <div className="flex items-center gap-2">
                  <Badge className={statusConfig.badgeClass}>
                    <StatusIcon className={`h-3.5 w-3.5 mr-1 ${statusConfig.color}`} />
                    {video.status}
                  </Badge>
                  <span className="text-sm text-gray-400">
                    Uploaded on {new Date(video.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/10" onClick={copyVideoLink}>
                  <Copy className="h-4 w-4 mr-1.5" /> Copy Link
                </Button>
                <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/10">
                  <Share2 className="h-4 w-4 mr-1.5" /> Share
                </Button>
              </div>
            </div>
            
            <Separator className="my-4 bg-white/10" />
            
            <div className="text-gray-300 mb-6">
              <p>{video.description || "No description provided."}</p>
            </div>
            
            {/* Editor Information */}
            {video.editor && (
              <Card className="mb-6 bg-black/40 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Editor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Edit className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">{video.editor.name}</h3>
                      <p className="text-sm text-gray-400">{video.editor.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* YouTube Information */}
            {video.status === "published" && video.youtubeVideoId && (
              <Card className="mb-6 bg-black/40 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Published to YouTube</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-red-500/20 rounded-full flex items-center justify-center">
                      <YoutubeIcon className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">YouTube Link</h3>
                      <div className="flex gap-2 items-center">
                        <p className="text-sm text-gray-400 truncate max-w-xs">{video.youtubeLink}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-white/10 hover:bg-white/10"
                          onClick={() => window.open(video.youtubeLink, '_blank')}
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Open
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* YouTube Upload Progress */}
            {video.youtubeUploadStatus === "uploading" && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Uploading to YouTube</span>
                  <span className="text-sm font-medium">{video.uploadProgress || 0}%</span>
                </div>
                <Progress value={video.uploadProgress || 0} className="w-full" />
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              {video.status === "uploaded" && !video.editor && (
                <Button 
                  onClick={() => setShowEditorAssignmentModal(true)}
                  className="bg-gradient-to-r from-blue-600/70 to-purple-600/70 hover:from-blue-600/90 hover:to-purple-600/90"
                >
                  <Edit className="mr-2 h-4 w-4" /> Assign Editor
                </Button>
              )}
              
              {video.status === "edited" && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    onClick={() => handleVideoAction("reject")}
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" /> Reject and Request Re-edit
                  </Button>
                  
                  {isUploading ? (
                    <Button disabled className="bg-blue-500/10 text-blue-400">
                      <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                      Uploading {uploadProgress}%
                    </Button>
                  ) : (
                    <HoverBorderGradient
                      containerClassName="rounded-md"
                      className="px-4 py-2 text-white"
                      gradient="linear-gradient(90deg, rgba(59,130,246,0.8) 0%, rgba(147,51,234,0.8) 100%)"
                      as={Button}
                      onClick={() => handleVideoAction("approve")}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" /> Approve and Publish
                    </HoverBorderGradient>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Editor Assignment Modal */}
      {showEditorAssignmentModal && (
        <EditorAssignmentModal
          videoId={video._id}
          open={showEditorAssignmentModal}
          onClose={() => {
            setShowEditorAssignmentModal(false);
            // Refresh video data
            getVideoById(videoId).then(response => {
              setVideo(response.video);
            });
          }}
        />
      )}
    </div>
  );
};

export default VideoDetailPage; 