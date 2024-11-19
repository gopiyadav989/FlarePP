import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";

import connectToDatabase from "./config/database.js";

dotenv.config();
connectToDatabase();
const app = express();

app.use(express.json());
app.use(cors());

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