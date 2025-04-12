// routes/userRoutes.js
import express from "express";
import { assignedEditors } from "../controllers/userController.js";
import { auth, isCreator } from "../middlewares/auth.js";

const router = express.Router();

// Get editors assigned to the logged-in creator
router.get("/chat-users", auth, isCreator, assignedEditors);

export default router;
