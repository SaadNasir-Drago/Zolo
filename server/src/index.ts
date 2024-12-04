import { configDotenv } from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import { router } from "./routes/authRoutes";
import { mrouter } from "./routes/messageRoutes";
import propertyrouter from "./routes/propertyRoutes";
import { drouter } from "./routes/dealRoutes";
import sendEmail from "./routes/emailRoute";
import { createServer } from "http"; // Import to create an HTTP server
import { Server } from "socket.io"; // Import Socket.IO server

configDotenv();
const app = express();
const httpServer = createServer(app); // Create HTTP server to attach Socket.IO

// Set up Socket.IO with the HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust this to specify allowed origins
    methods: ["GET", "POST"],
  },
});
app.set("io", io); // Make io accessible in routes

// Use CORS middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/api/auth', router);
app.use('/api', mrouter);
app.use('/api', propertyrouter);
app.use('/api', drouter);
app.use('/api/email', sendEmail);

// MongoDB connection
const mongoURI = "mongodb+srv://mdmehedihasanrifat2407nsu:zillow@cluster0.dopsh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Failed to connect to MongoDB", err));

// Set up Socket.IO connection and events
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for messages
  socket.on("sendMessage", (message) => {
    console.log("Message received:", message);

    // Broadcast the message to all connected clients
    io.emit("receiveMessage", message);
  });


  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Function to emit new property creation
export const notifyNewProperty = (property: any) => {
  io.emit('newProperty', property); // Broadcast to all connected clients
};


// Start the server
const port = process.env.PORT || 8001;
httpServer.listen(port, () => {
  console.log(`Socket.IO server running on port ${port}`);
});
