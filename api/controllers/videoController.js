import Creator from "../models/creatorModel.js";
import Editor from "../models/editorModel.js";
import Video from "../models/videoModel.js";
import cloudinaryUploader from "../utils/cloudinaryUploader.js"
import { createNotification } from "./notificationController.js";

import { google } from "googleapis";
import axios from "axios";

const youtube = google.youtube("v3");

export async function uploadVideo(req, res) {
  try {
    const { title, description } = req.body;
    if (req.user.role != "creator") {
      return res.status(403).json({ message: "Forbidden: Only creators can start" });
    }

    if (!req.files || !req.files.videofile || !req.files.thumbnail) {
      return res.status(400).json({ message: "Video file and thumbnail are required" });
    }

    const videoFile = req.files.videofile;
    const thumbnailFile = req.files.thumbnail;

    const videoUploadResponse = await cloudinaryUploader(
      videoFile,
      process.env.FOLDER_NAME
    );

    const thumbnailUploadResponse = await cloudinaryUploader(
      thumbnailFile,
      process.env.FOLDER_NAME
    );

    const newVideo = new Video({
      creatorUploadedVideo: videoUploadResponse.secure_url,
      thumbnail: thumbnailUploadResponse.secure_url,
      title,
      description,
      creator: req.user.id,
    })

    await newVideo.save();

    const updatedCreator = await Creator.findByIdAndUpdate(req.user.id,
      { $push: { videos: newVideo._id } },
      { new: true }
    );

    console.log(updatedCreator);

    return res.status(201).json({
      message: "Video uploaded successfully",
      video: newVideo,
      creator: updatedCreator,
    });

  }
  catch (error) {
    console.error("Error in uploading video ", error.message);
    return res.status(500).json({ message: "Error in uploading video", error: error.message });
  }
}

export async function getVideos(req, res) {
  try {
    const videos = await Video.find({ creator: req.user.id })
      .populate("creator", "name username email")
      .populate("editor", "name username email")
      .select("-__v");

    // console.log(videos);
    return res.status(200).json({ success: true, videos });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch videos", error: error.message });
  }
};

/**
 * Get a single video by ID
 */
export async function getVideoById(req, res) {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId)
      .populate("creator", "name username email")
      .populate("editor", "name username email")
      .select("-__v");

    if (!video) {
      return res.status(404).json({ 
        success: false, 
        message: "Video not found" 
      });
    }

    // Verify that the user is authorized to view this video
    // Creators can only view their own videos, editors can view videos assigned to them
    if (req.user.role === 'creator' && video.creator._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized: You don't have permission to access this video" 
      });
    } else if (req.user.role === 'editor' && (!video.editor || video.editor._id.toString() !== req.user.id)) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized: You don't have permission to access this video" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      video 
    });
  } catch (error) {
    console.error("Error fetching video by ID:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch video", 
      error: error.message 
    });
  }
};

// Assign an editor to a video
export const getAllEditors = async (req, res) => {
  
  try {
    // Fetch all editors
    const editors = await Editor.find({})
      .select('_id name email username avatar');

    // If no editors found
    if (editors.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No editors found',
        editors: [] 
      });
    }

    // Return list of editors
    res.status(200).json({ 
      success: true,
      message: 'Editors retrieved successfully',
      editors 
    });
  } catch (error) {
    console.error('Error fetching editors:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Existing assignEditor function is already well-implemented in the provided code
export const assignEditor = async (req, res) => {
  const { videoId, editorId } = req.body;
  try {
    const editor = await Editor.findById(editorId);
    if (!editor) {
      return res.status(404).json({ success: false, message: "Editor not found" });
    }

    const video = await Video.findByIdAndUpdate(
      videoId,
      { editor: editorId, status: "assigned" },
      { new: true }
    ).populate("creator", "name");

    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }

    const updatedEditor = await Editor.findByIdAndUpdate(
      editorId,
      { $addToSet: { videos: videoId } }, // prevents duplicate video references
      { new: true }
    );

    // Add the editor to preferredEditors of creator, only if not already there
    await Creator.findByIdAndUpdate(
      video.creator._id,
      { $addToSet: { preferredEditors: editorId } },
      { new: true }
    );
    
    // Create notification for the editor
    await createNotification({
      recipient: editorId,
      recipientModel: "Editor",
      title: "New Video Assignment",
      message: `You have been assigned to edit the video "${video.title}"`,
      type: "VIDEO_ASSIGNED",
      relatedVideo: videoId,
      link: `/editor-dashboard/in-progress`
    });

    res.status(200).json({
      success: true,
      message: "Editor assigned successfully",
      video,
      editor: updatedEditor
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to assign editor", error: error.message });
  }
};

// Add a function to handle video uploads from editors
export const uploadEditedVideo = async (req, res) => {
  try {
    const { videoId } = req.body;
    
    if (!req.files || !req.files.editedVideo) {
      return res.status(400).json({ 
        success: false,
        message: "Edited video file is required"
      });
    }
    
    // Make sure the editor is assigned to this video
    const video = await Video.findById(videoId).populate("creator", "name _id");
    
    if (!video) {
      return res.status(404).json({ 
        success: false, 
        message: "Video not found" 
      });
    }
    
    if (!video.editor || video.editor.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized: You are not assigned to this video" 
      });
    }
    
    const videoFile = req.files.editedVideo;
    
    const videoUploadResponse = await cloudinaryUploader(
      videoFile,
      process.env.FOLDER_NAME
    );
    
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { 
        editorUploadedVideo: videoUploadResponse.secure_url,
        status: "edited" 
      },
      { new: true }
    );
    
    // Create notification for the creator
    await createNotification({
      recipient: video.creator._id,
      recipientModel: "Creator",
      title: "Video Edited",
      message: `Your video "${video.title}" has been edited and is ready for review`,
      type: "VIDEO_EDITED",
      relatedVideo: videoId,
      link: `/videos/${videoId}`
    });
    
    return res.status(200).json({
      success: true,
      message: "Edited video uploaded successfully",
      video: updatedVideo
    });
    
  } catch (error) {
    console.error("Error uploading edited video:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to upload edited video", 
      error: error.message 
    });
  }
};

export const uploadVideoToYouTube = async (req, res) => {
  const { googleToken, videoId } = req.body;

  if (!googleToken || !videoId) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const video = await Video.findById(videoId).populate("editor", "name _id");

    console.log(video.editorUploadedVideo);
    
    const videoStream = await axios({
      method: "GET",
      url: video.editorUploadedVideo,
      responseType: "stream",
    });

    // Authenticate the YouTube API client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: googleToken });

    // Upload video to YouTube
    console.log(googleToken);
    
    const response = await youtube.videos.insert({
      part: "snippet,status",
      requestBody: {
        snippet: {
          title: video.title,
          description: video.description,
          tags: ["example", "video"],
        },
        status: {
          privacyStatus: "public",
        },
      },
      media: {
        body: videoStream.data,
      },
      auth: oauth2Client,
    });

    video.status = "published";
    video.youtubeLink = `https://www.youtube.com/watch?v=${response.data.id}`;
    video.youtubeVideoId = response.data.id;

    await video.save();
    console.log("upload to youtube fn");
    
    // Create notification for the editor that their work was published
    if (video.editor) {
      await createNotification({
        recipient: video.editor._id,
        recipientModel: "Editor",
        title: "Video Published",
        message: `The video "${video.title}" you edited has been published to YouTube!`,
        type: "VIDEO_PUBLISHED",
        relatedVideo: videoId,
        link: `/editor-dashboard/completed`
      });
    }

    // Respond with the uploaded video details
    return res.status(200).json({
      message: "Video uploaded successfully",
      videoId: response.data.id,
      link: `https://www.youtube.com/watch?v=${response.data.id}`,
    });

  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ message: "Failed to upload video", error });
  }
};

// Handle video rejection (when a creator rejects an edited video)
export const rejectVideo = async (req, res) => {
  try {
    const { videoId, feedbackMessage } = req.body;
    
    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: "Video ID is required"
      });
    }
    
    const video = await Video.findById(videoId).populate("editor", "name _id");
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found"
      });
    }
    
    // Make sure the user is the creator of this video
    if (video.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only reject your own videos"
      });
    }
    
    // Change status back to assigned
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { status: "assigned" },
      { new: true }
    );
    
    // Create rejection notification for the editor
    await createNotification({
      recipient: video.editor._id,
      recipientModel: "Editor",
      title: "Video Needs Revision",
      message: feedbackMessage || `Your edit for "${video.title}" needs revisions`,
      type: "VIDEO_REJECTED",
      relatedVideo: videoId,
      link: `/editor-dashboard/revisions`
    });
    
    return res.status(200).json({
      success: true,
      message: "Video rejected and sent back for revisions",
      video: updatedVideo
    });
    
  } catch (error) {
    console.error("Error rejecting video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject video",
      error: error.message
    });
  }
};

export async function searchVideos(req, res) {
  try {
    const { query } = req.query; // Get the search query from the request query parameters

    if (!query) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    const videos = await Video.find({
      creator: req.user.id,
      title: { $regex: query }, // Case-insensitive search using regex
    })
      .select("title thumbnail status createdAt") // Selecting relevant fields
      .populate("creator", "name username");

    if (videos.length === 0) {
      return res.status(404).json({ success: false, message: "No videos found" });
    }

    return res.status(200).json({ success: true, videos });
  } catch (error) {
    console.error("Error searching videos:", error);
    res.status(500).json({ success: false, message: "Failed to search videos", error: error.message });
  }
}