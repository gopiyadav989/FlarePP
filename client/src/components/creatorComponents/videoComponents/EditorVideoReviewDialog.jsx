import React from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const EditorVideoReviewDialog = ({ 
  video, 
  isOpen, 
  onClose, 
  handleVideoAction, 
  isUploading, 
  uploadProgress 
}) => {
  if (!video || !video.editorUploadedVideo) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] bg-black/90 backdrop-blur-xl border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">Review Edited Video</DialogTitle>
          <DialogDescription className="text-gray-400">
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
            variant="outline"
            className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
            onClick={() => handleVideoAction("reject", video._id)}
          >
            <ThumbsDown className="mr-2 h-4 w-4" /> Reject and Request Re-edit
          </Button>
          {isUploading ? (
            <div className="flex items-center text-blue-400 bg-blue-500/10 px-4 py-2 rounded-md">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Uploading {uploadProgress}%</span>
            </div>
          ) : (
            <HoverBorderGradient
              containerClassName="rounded-full"
              className="px-4 py-2 text-white"
              gradient="linear-gradient(90deg, rgba(59,130,246,0.8) 0%, rgba(147,51,234,0.8) 100%)"
              as={Button}
              onClick={() => handleVideoAction("approve", video._id)}
            >
              <ThumbsUp className="mr-2 h-4 w-4" /> Approve and Publish
            </HoverBorderGradient>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditorVideoReviewDialog; 