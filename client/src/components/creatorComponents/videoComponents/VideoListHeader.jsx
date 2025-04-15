import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const VideoListHeader = ({ sortOption, setSortOption, onRefresh }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          Your Videos
        </h1>
        <p className="text-gray-400">
          Manage and track all your video content
        </p>
      </div>
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="bg-black/40 border-white/10 text-white hover:bg-white/10 flex items-center gap-2"
            >
              Sort
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 opacity-50"
                aria-hidden="true"
              >
                <path
                  d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C9.89245 9.39245 9.60753 9.39245 9.43179 9.56819L7.49999 11.5L5.56819 9.56819C5.39245 9.39245 5.10753 9.39245 4.93179 9.56819C4.75605 9.74392 4.75605 10.0288 4.93179 10.2046L7.18179 12.4546C7.26618 12.5389 7.38064 12.5863 7.49999 12.5863C7.61933 12.5863 7.73379 12.5389 7.81819 12.4546L10.0682 10.2046C10.2439 10.0288 10.2439 9.74392 10.0682 9.56819Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-black/80 backdrop-blur-xl border border-white/10 text-white">
            <DropdownMenuItem disabled className="opacity-50 text-sm">
              Sort By
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`cursor-pointer hover:bg-white/10 ${sortOption === 'newest' ? 'bg-white/5' : ''}`}
              onSelect={() => setSortOption("newest")}
            >
              Newest First
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`cursor-pointer hover:bg-white/10 ${sortOption === 'oldest' ? 'bg-white/5' : ''}`}
              onSelect={() => setSortOption("oldest")}
            >
              Oldest First
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`cursor-pointer hover:bg-white/10 ${sortOption === 'status' ? 'bg-white/5' : ''}`}
              onSelect={() => setSortOption("status")}
            >
              By Status
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`cursor-pointer hover:bg-white/10 ${sortOption === 'title' ? 'bg-white/5' : ''}`}
              onSelect={() => setSortOption("title")}
            >
              By Title
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          className="bg-gradient-to-r from-blue-600/70 to-purple-600/70 hover:from-blue-600/90 hover:to-purple-600/90 text-white flex items-center gap-2"
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Videos
        </Button>
      </div>
    </div>
  );
};

export default VideoListHeader; 