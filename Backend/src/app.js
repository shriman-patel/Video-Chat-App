import express from "express";
import { createServer } from "node:http";
import * as dotenv from "dotenv";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/usersRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import { connectToSocket } from "./controller/socketManager.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

// ✅ Setup
app.set("port", process.env.PORT || 8000);

// ✅ CORS Config
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://video-chat-appfrontend.onrender.com",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

// ✅ JSON Body Parsing
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// ✅ Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1", imageRoutes);

// ✅ ---------- Serve React Build in Production ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  // Serve frontend build
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  // All unmatched routes → React index.html
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  });
}
// ✅ ------------------------------------------------------

// ✅ Database Connection and Server Start
const start = async () => {
  try {
    const connectionDb = await mongoose.connect(
      "mongodb+srv://shrimanp304:shrimanp304@cluster0.tslnkr9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log(`✅ Mongo connected: ${connectionDb.connection.host}`);

    server.listen(app.get("port"), () => {
      console.log(`🚀 Server running on port ${app.get("port")}`);
    });
  } catch (err) {
    console.error("❌ DB connection error:", err);
  }
};

start();
