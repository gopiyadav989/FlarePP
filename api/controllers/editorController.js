import Video from '../models/videoModel.js';
import Editor from '../models/editorModel.js';
import Creator from '../models/creatorModel.js';
import cloudinaryUploader from '../utils/cloudinaryUploader.js';

// Get all videos assigned to the current editor
export const getAssignedVideos = async (req, res) => {

  try {
    // Check if the user is an editor
    if (req.user.role !== 'editor') {
      return res.status(403).json({
        message: "Forbidden: Only editors can access assigned videos"
      });
    }

    // Find videos assigned to the current editor
    const assignedVideos = await Video.find({
      editor: req.user.id,
      //   status: { $nin: ['published'] } 
    })
      .populate('creator', 'name email avatar') // Populate creator details
      .sort({ createdAt: -1 }); // Sort by most recently created

    res.status(200).json({
      message: "Assigned videos retrieved successfully",
      results: assignedVideos.length,
      videos: assignedVideos
    });
  } catch (error) {
    console.error("Error in getting assigned videos:", error.message);
    res.status(500).json({
      message: "Failed to fetch assigned videos",
      error: error.message
    });
  }
};

// Upload edited video by an editor
export const uploadEditedVideo = async (req, res) => {

  try {
    const { videoId } = req.params;
    const editorId = req.user.id; // Assuming auth middleware adds user to request

    // Check if video files are uploaded
    if (!req.files || !req.files.editedVideo) {
      return res.status(400).json({
        message: "Edited video file is required"
      });
    }

    // Validate video file
    const editedVideoFile = req.files.editedVideo;
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    const maxSize = 500 * 1024 * 1024; // 500 MB

    if (!allowedTypes.includes(editedVideoFile.mimetype)) {
      return res.status(400).json({
        message: "Invalid file type. Please upload MP4, AVI, or MOV."
      });
    }

    if (editedVideoFile.size > maxSize) {
      return res.status(400).json({
        message: "File too large. Maximum size is 500 MB."
      });
    }
    console.log(videoId, editorId);
    // Upload edited video file to cloudinary
    const videoUploadResponse = await cloudinaryUploader(
      editedVideoFile,
      process.env.FOLDER_NAME
    );
    
    
    // Find and update the video
    const video = await Video.findOneAndUpdate(
      {
        _id: videoId,
        editor: editorId // Ensure only assigned editor can upload
      },
      {
        editorUploadedVideo: videoUploadResponse.secure_url,
        status: 'edited'
      },
      { new: true }
    ).populate('creator', 'name email');

    

    // Check if video exists and was updated
    if (!video) {
      return res.status(404).json({
        message: "Video not found or you are not authorized to edit this video"
      });
    }

    res.status(200).json({
      message: "Edited video uploaded successfully",
      video: video
    });

  } catch (error) {
    console.error("Error in uploading edited video:", error.message);
    res.status(500).json({
      message: "Failed to upload edited video",
      error: error.message
    });
  }
};