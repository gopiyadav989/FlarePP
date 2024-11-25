import React from "react";

const CreatorVideoList = ({ videos, onAssignEditor, onWatchVideo }) => {

    const getProgress = (status) => {
        const statusSteps = ["uploaded", "assigned", "edited", "approved", "published"];
        return ((statusSteps.indexOf(status) + 1) / statusSteps.length) * 100;
    };

    return (
        <div className="container mx-auto p-5">
            <div className="w-full flex flex-wrap justify-start items-start gap-6">
                {videos.map((video) => (
                    <div
                        key={video._id}
                        className="w-96 md:w-80 h-72 border rounded-lg shadow-md overflow-hidden relative bg-cover bg-center"
                        style={{ backgroundImage: `url(${video.thumbnail || "https://via.placeholder.com/150"})` }}
                    >
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

                        {/* Title */}
                        <div className="absolute top-4 left-0 right-0 text-center">
                            <h3 className="text-lg font-semibold text-white px-4">{video.title}</h3>
                        </div>

                        {/* Progress Bar */}
                        <div className="absolute bottom-16 left-4 right-4">
                            <p className="text-sm text-white text-center mb-1">{video.status.toUpperCase()}</p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${getProgress(video.status)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between  space-x-2">
                            <button
                                className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                onClick={() => onWatchVideo(video.creatorUploadedVideo)}
                            >
                                Watch Uploaded
                            </button>
                            {video.editorUploadedVideo && (
                                <button
                                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                    onClick={() => onWatchVideo(video.editorUploadedVideo)}
                                >
                                    Watch Edited
                                </button>
                            )}
                            <button
                                className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                                onClick={() => onAssignEditor(video._id)}
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
