import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import http from "http";

import authRoutes from "./routes/authRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import editorRoutes from "./routes/editorRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import conversationRoutes from "./routes/conversationRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"
import { setupWebSocket } from "./websockets/socket.js";

dotenv.config();
import connectToDatabase from "./config/database.js";
connectToDatabase();

import cloudinaryConnect from "./config/cloudinary.js";
cloudinaryConnect();

const app = express();

app.use(express.json());

// Properly configured CORS for credentials
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
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
app.use("/api/user", userRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/notifications", notificationRoutes);
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running....",
  });
});

const PORT = process.env.PORT;

// 🔁 Replace app.listen with HTTP server + WebSocket
const server = http.createServer(app);
setupWebSocket(server);
server.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
