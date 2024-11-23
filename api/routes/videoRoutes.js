import express from "express";
import { auth, isCreator, isEditor } from "../middlewares/auth.js";
import { getVideos, uploadVideo, assignEditor } from "../controllers/videoController.js";


const router = express.Router();

router.post("/uploadVideo", auth, isCreator, uploadVideo);
router.get("/", auth, getVideos);
router.post("/assign-editor", auth, assignEditor);

export default router;