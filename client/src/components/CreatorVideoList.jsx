import React from "react";

const CreatorVideoList = ({ videos, onAssignEditor, onWatchVideo }) => {
  
  const getProgress = (status) => {
    const statusSteps = ["uploaded", "assigned", "edited", "approved", "published"];
    return ((statusSteps.indexOf(status) + 1) / statusSteps.length) * 100;
  };

  return (
    <div className="container mx-auto p-5">
      <div className="grid grid-cols-1 gap-6">
        {videos.map((video) => (
          <div key={video._id} className="flex items-center justify-between border p-4 rounded-lg shadow-md bg-white">
            {/* Video Info */}
            <div className="flex items-center space-x-4">
              <img src={video.thumbnail || "https://via.placeholder.com/150"} alt="Video Thumbnail" className="w-16 h-16 rounded-lg"/>
              <div>
                <h3 className="text-lg font-semibold text-zinc-950">{video.title}</h3>
                <p className="text-sm text-gray-600">Uploaded: {new Date(video.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex flex-col items-center w-1/4">
              <p className="text-sm mb-1">{video.status.toUpperCase()}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${getProgress(video.status)}%` }}
                ></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => onWatchVideo(video.creatorUploadedVideo)}
              >
                Watch Uploaded
              </button>
              {video.editorUploadedVideo && (
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => onWatchVideo(video.editorUploadedVideo)}
                >
                  Watch Edited
                </button>
              )}
              <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"onClick={() => onAssignEditor(video._id)}
              >
                Assign Editor
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreatorVideoList;
