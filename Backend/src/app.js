import express from "express";
import { createServer } from "node:http";

import {Server}  from "socket.io";

import mongoose, { connect } from "mongoose";
import cors from "cors";
import userRoutes from "./routes/usersRoutes.js";
import { connectToSocket } from "./controller/socketManager.js";
 
// import userRoutes from  "./routes/usersRoutes.js";


const app = express();
const server = createServer(app);
const io =  connectToSocket(server);


app.set("port",(process.env.PORT ||8000))
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb", extended: true}));

// for testing
app.use("/api/v1/users",userRoutes);

const start = async () => {
    app.set("mongo_user")
    const connectionDb = await mongoose.connect("mongodb+srv://shrimanp304:shrimanp304@cluster0.tslnkr9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    console.log(`mongo connected host: ${connectionDb.connection.host}`);
    server.listen(app.get("port"),()=> {   
    console.log("Listing on port 8000");
    });
};
start();