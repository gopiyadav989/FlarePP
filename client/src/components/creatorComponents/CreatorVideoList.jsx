import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import EditorAssignmentModal from "./EditorAssignmentModal";
import { uploadVideoToYouTube } from "./youtubeService";
import { getCreatorVideos } from "../../api/videoService";

// Import new component modules
import VideoCard from "./videoComponents/VideoCard";
import VideoListHeader from "./videoComponents/VideoListHeader";
import VideoListSkeleton from "./videoComponents/VideoListSkeleton";
import ErrorDisplay from "./videoComponents/ErrorDisplay";
import EmptyVideoState from "./videoComponents/EmptyVideoState";
import EditorVideoReviewDialog from "./videoComponents/EditorVideoReviewDialog";

/**
 * Main CreatorVideoList Component
 */
const CreatorVideoList = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewingVideo, setReviewingVideo] = useState(null);
  const [showEditorAssignmentModal, setShowEditorAssignmentModal] = useState(false);
  const [selectedVideoForEditor, setSelectedVideoForEditor] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filterOption, setFilterOption] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  const { googleToken } = useSelector((state) => state.user);

  // Fetch videos from API
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await getCreatorVideos();
      setVideos(data.videos || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError(err.message || "Failed to load videos");
      toast({
        title: "Error",
        description: "Failed to load videos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Handle video actions (approve, reject)
  const handleVideoAction = async (action, videoId) => {
    if (action === "approve" && googleToken) {
      try {
        setIsUploading(true);
        setUploadProgress(0);
        
        // Update local state to show uploading
        setVideos((prevVideos) =>
          prevVideos.map((video) =>
            video._id === videoId
              ? {
                ...video,
                youtubeUploadStatus: "uploading",
                uploadProgress: 0,
              }
              : video
          )
        );

        // Call the YouTube upload function
        const uploadResult = await uploadVideoToYouTube(videoId, googleToken, (progress) => {
          setUploadProgress(progress);
          
          // Update progress in the videos array
          setVideos((prevVideos) =>
            prevVideos.map((video) =>
              video._id === videoId
                ? {
                  ...video,
                  uploadProgress: progress,
                }
                : video
            )
          );
        });

        // Update the video state with the YouTube upload status
        setVideos((prevVideos) =>
          prevVideos.map((video) =>
            video._id === videoId
              ? {
                ...video,
                status: "published",
                youtubeUploadStatus: "uploaded",
                youtubeVideoId: uploadResult.videoId,
                youtubeLink: uploadResult.link,
              }
              : video
          )
        );

        toast({
          title: "Success",
          description: "Video uploaded to YouTube successfully",
          variant: "default",
        });
        
        // Close review dialog
        setReviewingVideo(null);
      } catch (error) {
        console.error("YouTube Upload Failed:", error);

        // Update video state to show error
        setVideos((prevVideos) =>
          prevVideos.map((video) =>
            video._id === videoId
              ? {
                ...video,
                youtubeUploadStatus: "error",
              }
              : video
          )
        );

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
      
      // Close review dialog
      setReviewingVideo(null);
    }
  };

  // Filter and sort videos based on selected options
  const getFilteredAndSortedVideos = () => {
    // First filter
    let filteredVideos = videos;
    
    // Filter by status if not "all"
    if (filterOption !== "all") {
      filteredVideos = videos.filter((video) => video.status === filterOption);
    }
    
    // Then sort
    switch (sortOption) {
      case "newest":
        return [...filteredVideos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "oldest":
        return [...filteredVideos].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "status":
        const statusOrder = { published: 5, approved: 4, edited: 3, assigned: 2, uploaded: 1 };
        return [...filteredVideos].sort((a, b) => 
          (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0)
        );
      case "title":
        return [...filteredVideos].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return filteredVideos;
    }
  };

  // Get the video object being reviewed
  const getReviewVideo = () => {
    if (!reviewingVideo) return null;
    return videos.find(video => video._id === reviewingVideo);
  };

  // Main renderer
  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <VideoListHeader 
        sortOption={sortOption} 
        setSortOption={setSortOption} 
        onRefresh={fetchVideos} 
      />

      {/* Content Section */}
      {loading ? (
        <VideoListSkeleton />
      ) : error ? (
        <ErrorDisplay error={error} onRetry={fetchVideos} />
      ) : getFilteredAndSortedVideos().length > 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {getFilteredAndSortedVideos().map((video) => (
            <React.Fragment key={video._id}>
              <VideoCard 
                video={video} 
                onReview={(id) => setReviewingVideo(id)}
                onAssign={(id) => {
                  setSelectedVideoForEditor(id);
                  setShowEditorAssignmentModal(true);
                }}
              />
            </React.Fragment>
          ))}
        </div>
      ) : (
        <EmptyVideoState 
          filterOption={filterOption} 
          onReset={() => setFilterOption("all")} 
        />
      )}

      {/* Review Dialog */}
      {reviewingVideo && (
        <EditorVideoReviewDialog 
          video={getReviewVideo()}
          isOpen={!!reviewingVideo}
          onClose={() => setReviewingVideo(null)}
          handleVideoAction={handleVideoAction}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />
      )}

      {/* Editor Assignment Modal */}
      {showEditorAssignmentModal && (
        <EditorAssignmentModal
          videoId={selectedVideoForEditor}
          open={showEditorAssignmentModal}
          onClose={() => {
            setShowEditorAssignmentModal(false);
            setSelectedVideoForEditor(null);
            fetchVideos(); // Refresh videos after assignment
          }}
        />
      )}
    </div>
  );
};

export default CreatorVideoList;