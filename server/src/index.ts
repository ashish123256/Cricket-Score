import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import scoreboardRoutes from "./routes/scoreboardRoute";

// Import socket event handlers
import { 
    addNewPlayerSocket, 
    newBallSocket, 
    clearScoreboardSocket, 
    cleanNonStrikerInputFieldOnRunWicket, 
    clearStrikerInputFieldOnWicket, 
    swapStrikerNonStriker 
} from "./sockets/socket";
import { NewBallEventPayload } from "./models/newBallModel";

dotenv.config();

// Initialize Express app
const app: Express = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_DB as string)
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((err) => {
        console.log("Failed to connect to MongoDB:", err);
        process.exit(1); // Exit the app if the connection fails
    });

// Routes
app.use("/api", scoreboardRoutes);

// Error handler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});

// Create the HTTP server using the Express app
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*", 
    },
});

interface BallEvent {
    type: 
    | "run"
    | "run_wicket"
    | "normal"
    | "normal_overthrow"
    | "bye"
    | "bye_overthrow"
    | "legbye"
    | "legbye_overthrow"
    | "noball"
    | "noball_overthrow"
    | "noball_bye"
    | "noball_bye_overthrow"
    | "noball_legbye"
    | "noball_legbye_overthrow"
    | "wide"
    | "wide_ball_no_ball"
    | "no_ball_wide_ball"
    | "wicket_no_ball"
    | "wide_overthrow"
    | "wide_bye"
    | "wide_bye_overthrow"
    | "wide_legbye"
    | "wide_legbye_overthrow"
    | "wicket";
    payload: NewBallEventPayload;
}
  

// Set up Socket.IO connection
io.on("connection", (socket: Socket) => {
    console.log("New client connected");

    // Client joins the "all" room
    socket.join("all");

    // Save event to the database and broadcast it to all clients
    socket.on("save_event_to_database", async (event:BallEvent) => {
        console.log("Event received to save:", event);
        socket.broadcast.to("all").emit("set_current_action", event);
    });

    // Attach all socket handlers
    addNewPlayerSocket(io, socket);
    swapStrikerNonStriker(io, socket);
    newBallSocket(io, socket);
    cleanNonStrikerInputFieldOnRunWicket(io, socket);
    clearStrikerInputFieldOnWicket(io, socket);
    clearScoreboardSocket(io, socket);

    // Log client disconnection
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

// Define the server's listening port
const PORT = process.env.PORT || 5000;

// Start listening on the defined port
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}...`);
});

export default app;
