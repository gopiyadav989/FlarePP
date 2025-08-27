import React, { useState } from "react";
import {
  Video,
  Upload,
  Home,
  FolderOpen,
  Clock,
  MessageCircle
} from 'lucide-react';
import FormPage from "./FormPage";
import { useNavigate } from 'react-router-dom';

const Dock = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const links = [
    { title: "Dashboard", icon: <Home className="h-5 w-5" />, path: "/creator-dashboard" },
    {
      title: "Upload",
      icon: <Upload className="h-5 w-5" />,
      onClick: () => setIsUploadModalOpen(true)
    },
    { title: "Chat", icon: <MessageCircle className="h-5 w-5" />, path: "/chat" },
  ];
  
  const DockItem = ({ title, icon, path, onClick }) => {
    const handleClick = () => {
      if (onClick) {
        onClick();
      } else if (path) {
        navigate(path);
      }
    };
    
    return (
      <button
        onClick={handleClick}
        className="group relative flex flex-col items-center"
      >
        <div className="p-3 rounded-full hover:bg-zinc-800 transition-colors">
          {icon}
        </div>
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 transition-all group-hover:scale-100">
          <div className="bg-zinc-800 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap">
            {title}
          </div>
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500 scale-0 group-hover:scale-100 transition-all" />
      </button>
    );
  };
  
  return (
    <div className="dock-container">
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 px-7">
        <div className="bg-zinc-900/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-zinc-800">
          <div className="flex items-center gap-2">
            {links.map((link, index) => (
              <DockItem key={index} {...link} />
            ))}
          </div>
        </div>
      </div>
      <FormPage
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};

export default Dock;