import React from 'react';
import { Button } from "@/components/ui/button";
import { VideoIcon } from "lucide-react";

const EmptyVideoState = ({ filterOption, onReset }) => (
  <div className="text-center py-12">
    <VideoIcon className="h-16 w-16 mx-auto text-gray-500 mb-4" />
    <h3 className="text-xl font-semibold text-white mb-2">No Videos Found</h3>
    <p className="text-gray-400 mb-6">
      {filterOption === "all" 
        ? "You haven't uploaded any videos yet." 
        : `You don't have any videos with '${filterOption}' status.`}
    </p>
    {filterOption !== "all" && (
      <Button 
        variant="outline"
        className="bg-black/40 border-white/10 text-white hover:bg-white/10"
        onClick={onReset}
      >
        View All Videos
      </Button>
    )}
  </div>
);

export default EmptyVideoState; 