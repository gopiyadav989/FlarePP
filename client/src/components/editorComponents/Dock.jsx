import React from "react";
import {
  Video,
  Upload,
  Home,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  MessageCircle
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Dock = () => {
  const location = useLocation();

  const links = [
    { title: "Dashboard", icon: <Home className="h-5 w-5" />, href: "/editor-dashboard", description: "Overview and analytics", badge: null },
    { title: "In Progress", icon: <Clock className="h-5 w-5" />, href: "/editor-dashboard/in-progress", description: "Currently editing", badge: 2 },
    { title: "Revisions", icon: <AlertCircle className="h-5 w-5" />, href: "/editor-dashboard/revisions", description: "Need modifications", badge: 1 },
    { title: "Completed", icon: <CheckCircle className="h-5 w-5" />, href: "/editor-dashboard/completed", description: "Videos Live on Youtube", badge: null },
    { title: "Messages", icon: <MessageCircle className="h-5 w-5" />, href: "/editor-dashboard/messages", description: "Creator communications", badge: 5 }
  ];

  const DockItem = ({ title, icon, href, description, badge }) => {
    const isActive = location.pathname === href;

    return (
      <Link
        to={href}
        className={cn(
          "group relative flex flex-col items-center",
          isActive && "text-blue-500"
        )}
        aria-label={title}>
        <div className="relative">
          <div className={cn(
            "p-3 rounded-full transition-all",
            isActive ? "bg-blue-500/10" : "hover:bg-zinc-800")}>
            {icon}
          </div>
          {badge && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              {badge}
            </div>
          )}
        </div>
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 scale-0 transition-all group-hover:scale-100 z-50">
          <div className="bg-zinc-800 backdrop-blur-sm border border-zinc-700 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap flex flex-col items-center gap-1">
            <span className="font-medium">{title}</span>
            <span className="text-zinc-400 text-[10px]">{description}</span>
          </div>
        </div>
        <div className={cn(
          "absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500",
          isActive ? "scale-100" : "scale-0 group-hover:scale-100",
          "transition-all")} />
      </Link>
    );
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
      <div className="bg-zinc-900/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-zinc-800">
        <div className="flex items-center gap-5">
          {links.map((link, index) => (
            <DockItem key={index} {...link} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dock;
