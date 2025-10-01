import express from "express";
import { createServer } from "node:http";

import * as dotenv from 'dotenv'; 

dotenv.config(); 
// for test
// console.log("Loaded Environment Variables:", process.env); 

import {Server}  from "socket.io";
import mongoose, { connect } from "mongoose";
import cors from "cors";
import userRoutes from "./routes/usersRoutes.js";
import { connectToSocket } from "./controller/socketManager.js";

import imageRoutes from "./routes/imageRoutes.js";
// import userRoutes from  "./routes/usersRoutes.js";


const app = express();
const server = createServer(app);
const io =  connectToSocket(server);


app.set("port",(process.env.PORT ||8000))
// app.use(cors());

app.use(cors({
    // यह सुनिश्चित करता है कि React App (3000) को अनुमति मिले
    origin: 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // सभी ज़रूरी methods
    credentials: true,
}));

app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb", extended: true}));

// for testing
app.use("/api/v1/users",userRoutes);
app.use("/api/v1", imageRoutes);

const start = async () => {
    app.set("mongo_user")
    const connectionDb = await mongoose.connect("mongodb+srv://shrimanp304:shrimanp304@cluster0.tslnkr9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    console.log(`mongo connected host: ${connectionDb.connection.host}`);
    server.listen(app.get("port"),()=> {   
    console.log("Listing on port 8000");
    });
};
start();