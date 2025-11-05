// src/controller/socketManager.js
import { Server } from "socket.io";
import { registerCodeListeners } from './codeExecutionService.js';

let connections = {};
let messages = {};
let timeOnline = {};
let userNames = {};

// Helper function to extract room ID from full URL
const getRoomIdFromPath = (path) => {
    // Agar frontend full URL bhejta hai, sirf last segment le lo
    try {
        const url = new URL(path);
        const segments = url.pathname.split('/').filter(Boolean);
        return segments.length ? segments[segments.length - 1] : path;
    } catch (err) {
        // Agar path simple string hai
        return path;
    }
};

export const connectToSocket = (server) => {
    console.log("DEBUG: Setting up Socket.IO server.");

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("SUCCESS: Client connected with ID:", socket.id);

        // Code execution listeners
        registerCodeListeners(socket, io);

        socket.on("join-call", ({ path, username }) => {
            const roomId = getRoomIdFromPath(path);

            if (!connections[roomId]) {
                connections[roomId] = [];
                userNames[roomId] = {};
            }

            connections[roomId].push(socket.id);
            userNames[roomId][socket.id] = username;
            timeOnline[socket.id] = new Date();

            // Notify all users in room about new user
            connections[roomId].forEach((id) => {
                io.to(id).emit("user-joined", socket.id, connections[roomId], userNames[roomId]);
            });

            // Send previous messages
            if (messages[roomId]) {
                messages[roomId].forEach(msg => {
                    io.to(socket.id).emit("chat-message", msg.data, msg.sender, msg["socket-id-sender"]);
                });
            }
        });

        // WebRTC signaling
        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        // Chat messages
        socket.on("chat-message", (data, sender) => {
            const roomEntry = Object.entries(connections).find(([_, users]) => users.includes(socket.id));
            if (!roomEntry) return;

            const [roomId] = roomEntry;

            if (!messages[roomId]) messages[roomId] = [];

            messages[roomId].push({
                sender,
                data,
                "socket-id-sender": socket.id
            });

            connections[roomId].forEach(id => {
                io.to(id).emit("chat-message", data, sender, socket.id);
            });
        });

        // Disconnect
        socket.on("disconnect", () => {
            const roomEntry = Object.entries(connections).find(([_, users]) => users.includes(socket.id));
            if (!roomEntry) return;

            const [roomId] = roomEntry;

            connections[roomId].forEach(id => io.to(id).emit("user-left", socket.id));

            connections[roomId] = connections[roomId].filter(id => id !== socket.id);
            delete userNames[roomId]?.[socket.id];
            delete timeOnline[socket.id];

            if (connections[roomId].length === 0) {
                delete connections[roomId];
                delete userNames[roomId];
                delete messages[roomId];
            }
        });
    });

    return io;
};
