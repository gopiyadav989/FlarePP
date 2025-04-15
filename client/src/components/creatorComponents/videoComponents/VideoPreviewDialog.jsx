import React from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const VideoPreviewDialog = ({ video, videoUrl }) => (
  <Dialog>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8"
            >
              <Play className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Preview Video</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] bg-black/90 backdrop-blur-xl border border-white/10">
      <DialogHeader>
        <DialogTitle className="text-2xl text-white">{video.title}</DialogTitle>
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

export default VideoPreviewDialog; 