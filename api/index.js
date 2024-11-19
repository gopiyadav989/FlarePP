import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fileUpload from "express-fileupload";

import authRoutes from "./routes/authRoutes.js";
dotenv.config();
import connectToDatabase from "./config/database.js";
connectToDatabase();

import cloudinaryConnect from "./config/cloudinary.js";
cloudinaryConnect();



const app = express();

app.use(express.json());
app.use(cors());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp"
}))

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running....",
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});