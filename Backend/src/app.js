import express from "express";
import { createServer } from "node:http";
import * as dotenv from "dotenv";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/usersRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import { connectToSocket } from "./controller/socketManager.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);

// ✅ Proper CORS config
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://apnacollegefrontend.onrender.com",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

// ✅ JSON body parsing middleware (must come before routes)
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// ✅ Main routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1", imageRoutes);

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
