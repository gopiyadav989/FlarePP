import Creator from "../models/creatorModel.js";
import Video from "../models/videoModel.js";
import cloudinaryUploader from "../utils/cloudinaryUploader.js"

export async function uploadVideo(req,res){
    try{
        const {title, description} = req.body;
        if(req.user.role != "creator"){
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
    catch(error){
        console.error("Error in uploading video ", error.message);
        return res.status(500).json({ message: "Error in uploading video", error: error.message });
    }
}