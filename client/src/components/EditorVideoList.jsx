import React from 'react';

const EditorVideoList = ({ videos, onWatchVideo, handleVideoUpload }) => {
  

  const handleFileUpload = async (videoId, event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('editedVideo', file);
      
      try {
        await handleVideoUpload(videoId, formData);
      } catch (error) {
        console.error('Video upload failed', error);
      }
    }
  };

  return (
    <div className="container mx-auto p-5 space-y-6 overflow-y-auto max-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-white">Assigned Videos</h2>
      <div className="flex flex-col space-y-6">
        
      </div>
    </div>
  );
};

export default EditorVideoList;