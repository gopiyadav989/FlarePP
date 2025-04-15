import express from "express";
import { auth, isCreator, isEditor } from "../middlewares/auth.js";
import { getVideos, uploadVideo, assignEditor, uploadVideoToYouTube, getAllEditors, searchVideos, getVideoById, uploadEditedVideo, rejectVideo } from "../controllers/videoController.js";


const router = express.Router();

router.post("/creator-upload-video", auth, isCreator, uploadVideo);
router.get("/creator-get-videos", auth, getVideos);
router.get('/getEditors', getAllEditors);
router.post("/assign-editor", auth, assignEditor);

// Add route for getting a single video by ID
router.get("/get-video/:videoId", auth, getVideoById);

router.post("/creator-upload-to-youtube", uploadVideoToYouTube);

router.get("/creator-search-videos", auth, isCreator, searchVideos);

// New routes for editor uploading edited videos and creator rejections
router.post("/upload-edited", auth, isEditor, uploadEditedVideo);
router.post("/reject-video", auth, isCreator, rejectVideo);

export default router;