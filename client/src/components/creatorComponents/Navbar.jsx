import React, { useState } from "react";
import { Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileDropdown from "./ProfileDropDown";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="sticky top-0 z-40 border-b border-zinc-900 bg-zinc-950/95 backdrop-blur-xl">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button
            variant="link"
            onClick={() => navigate("/creator-dashboard")}
            className="text-white text-xl font-bold hover:text-zinc-200 transition-colors px-0"
          >
            Creator Studio
          </Button>

          <div
            className={`relative w-72 transition-all duration-200 ${
              isSearchFocused ? "w-96" : "w-72"
            }`}
            onClick={() => navigate("/creator-dashboard/search")}
          >
            <div
              className={`w-full bg-zinc-900 hover:bg-zinc-900/90 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-400 
                transition-all duration-200 border border-zinc-900
                ${isSearchFocused ? "border-zinc-800 bg-zinc-900" : ""}`}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            >
              Search videos...
            </div>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-zinc-900 transition-colors rounded-xl"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-4 ring-zinc-950 animate-pulse" />
          </Button>
          <div className="h-8 w-px bg-zinc-900" />
          <ProfileDropdown>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-10 rounded-xl hover:bg-zinc-900 transition-colors pl-2 pr-3"
            >
              <div className="relative">
                <img
                  src={user?.avatar || "/api/placeholder/32/32"}
                  alt={`${user?.name}'s Profile`}
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full ring-2 ring-zinc-950" />
              </div>
              <span className="text-sm font-medium text-zinc-200">
                {user?.name || "Loading..."}
              </span>
            </Button>
          </ProfileDropdown>
        </div>
      </div>
    </div>
  );
};

export default Navbar;