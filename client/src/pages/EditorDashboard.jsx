import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/editorComponents/Navbar";
import Dock from "../components/editorComponents/Dock";
import EditorVideoList from "../components/EditorVideoList.jsx";

const EditorDashboard = () => {
  const [assignedVideos, setAssignedVideos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignedVideos = async () => {
      try {
        console.log("ghjk");
        const response = await fetch("http://localhost:3000/api/editor/assigned-videos", {
          method: 'GET',
          "credentials": "include",
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }

        const data = await response.json();
        console.log("data", data.videos);
        setAssignedVideos(data.videos);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAssignedVideos();
  }, []);

  const handleVideoUpload = async (videoId, formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/editor/upload-edited-video/${videoId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Video upload failed');
      }

      const updatedVideo = await response.json();
      setAssignedVideos(prevVideos => 
        prevVideos.map(video => 
          video._id === videoId ? updatedVideo : video
        )
      );

      return updatedVideo;
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  };

  const handleWatchVideo = (videoUrl) => {
    window.open(videoUrl, '_blank');
  };

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
        {loading ? (
          <div className="text-center text-gray-500">Loading videos...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : assignedVideos.length === 0 ? (
          <div className="text-center text-gray-500">No assigned videos</div>
        ) : (
          <EditorVideoList 
            videos={assignedVideos} 
            onWatchVideo={handleWatchVideo}
            handleVideoUpload={handleVideoUpload}
          />
        )}
      </main>
      <Dock />
    </div>
  );
};

export default EditorDashboard;