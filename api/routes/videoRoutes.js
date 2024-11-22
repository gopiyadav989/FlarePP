import express from "express";
import { auth, isCreator, isEditor } from "../middlewares/auth.js";
import { uploadVideo } from "../controllers/videoController.js";


const router = express.Router();

router.post("/uploadVideo", auth, isCreator, uploadVideo);

export default router;