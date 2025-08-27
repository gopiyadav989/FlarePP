import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import editorRoutes from "./routes/editorRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { startNotificationCleanupJob } from "./utils/notificationCleanup.js";

dotenv.config();
import connectToDatabase from "./config/database.js";
connectToDatabase();

import cloudinaryConnect from "./config/cloudinary.js";
cloudinaryConnect();

const app = express();

app.use(express.json());
app.use(cors({
  credentials: true,
  origin: "http://localhost:5173",
}));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp"
}));

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/editor", editorRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running....",
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);

  // Start notification cleanup job
  startNotificationCleanupJob();
});