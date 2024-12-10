import React from "react";
import { Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileDropdown from "./ProfileDropdown";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  return (
    <div className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-lg">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Creator Studio</h1>
          <div 
            className="relative w-64 cursor-pointer"
            onClick={() => navigate('/creator-dashboard/search')}
          >
            <div className="w-full bg-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-400">
              Search videos...
            </div>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
          </Button>
          <div className="h-8 w-px bg-zinc-800" />
          <ProfileDropdown>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 h-10 rounded-full hover:bg-zinc-800"
            >
              <img 
                src={user?.avatar || "/api/placeholder/32/32"} 
                alt={`${user?.name}'s Profile`} 
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium">
                {user?.name || 'Loading...'}
              </span>
            </Button>
          </ProfileDropdown>
        </div>
      </div>
    </div>
  );
};

export default Navbar;