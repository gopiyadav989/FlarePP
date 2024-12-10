import React from "react";
import { Bell, Search, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Navbar = () => {
  const notifications = [
    { id: 1, text: "New video assigned: Product Launch", time: "5m ago" },
    { id: 2, text: "Deadline reminder: Tech Review", time: "1h ago" },
  ];

  return (
    <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/editor-dashboard" className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Editor Studio
            </h1>
          </Link>
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search assigned videos..."
              className="w-full bg-zinc-800/50 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative p-2 rounded-full hover:bg-zinc-800 transition-colors">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 h-2 w-2 bg-blue-500 rounded-full"></span>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 bg-zinc-900 border-zinc-800">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.map((notif) => (
                      <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1">
                        <span>{notif.text}</span>
                        <span className="text-xs text-zinc-400">{notif.time}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="h-8 w-px bg-zinc-800"></div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 bg-zinc-800/50 rounded-full p-1 pr-4 hover:bg-zinc-700/50 transition-colors border border-zinc-700">
              <img
                src="/api/placeholder/32/32"
                alt="Profile"
                className="h-8 w-8 rounded-full border border-zinc-600"
              />
              <span className="text-sm font-medium">John Editor</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Navbar;