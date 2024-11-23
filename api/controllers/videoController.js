import Creator from "../models/creatorModel.js";
import Editor from "../models/editorModel.js";
import Video from "../models/videoModel.js";
import cloudinaryUploader from "../utils/cloudinaryUploader.js"

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
        const videos = await Video.find({creator: req.user.id})
        .populate("creator", "name username email")
        .populate("editor", "name username email")
        .select("-__v");

        console.log(videos);
        return res.status(200).json({ success: true, videos });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch videos", error: error.message });
    }
};

// Assign an editor to a video
export async function assignEditor(req, res) {
    const { videoId,editorId } = req.body;
    console.log("fvsf");

    try {
        // Check if editor exists
        const editor = await Editor.findById(editorId);
        if (!editor) {
            return res.status(404).json({ success: false, message: "Editor not found" });
        }

        // Update the video
        const video = await Video.findByIdAndUpdate(
            videoId,
            { editor: editorId, status: "assigned" },
            { new: true }
        );

        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }

        res.status(200).json({ success: true, message: "Editor assigned successfully", video });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to assign editor", error: error.message });
    }
};