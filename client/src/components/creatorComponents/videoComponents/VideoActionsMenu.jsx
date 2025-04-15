import React from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical, VideoIcon, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const VideoActionsMenu = ({ video, onReview, onAssign }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full h-8 w-8">
        <MoreVertical className="h-5 w-5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="bg-black/80 backdrop-blur-xl border border-white/10 text-white">
      {video.editorUploadedVideo && (
        <DropdownMenuItem
          className="cursor-pointer hover:bg-white/10"
          onSelect={() => onReview(video._id)}
        >
          <VideoIcon className="mr-2 h-4 w-4" /> Review Edited Video
        </DropdownMenuItem>
      )}
      {video.status === "uploaded" && (
        <DropdownMenuItem
          className="cursor-pointer hover:bg-white/10"
          onSelect={() => onAssign(video._id)}
        >
          <Edit className="mr-2 h-4 w-4" /> Assign Editor
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

export default VideoActionsMenu; 