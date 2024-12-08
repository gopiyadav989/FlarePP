import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/editorComponents/Navbar";
import Dock from "../components/editorComponents/Dock";

const EditorDashboard = () => {
  const [assignedVideos, setAssignedVideos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  


  if(assignedVideos == null) {
    <div>
      assinging videos
    </div>
  }

  return (
    <div className="flex min-h-screen flex-col h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
        
      </main>
      <Dock />
    </div>
  );
};

export default EditorDashboard;