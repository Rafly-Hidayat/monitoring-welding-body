import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import router from "./router/router.js";
import authRouter from "./router/auth-router.js";
import { errorMiddleware } from "./middleware/err-middleware.js";
import { verifyToken } from "./middleware/auth-middleware.js";
import { OHCMonitoringService } from "./services/ohc-service.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["*"],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ["polling", "websocket"],
    allowEIO3: true,
    maxHttpBufferSize: 1e8
});

const port = 8000;

// Create a monitoring service instance
const ohcService = new OHCMonitoringService();
let message = null

// Override the logStatus method to emit data through Socket.IO
ohcService.logStatus = async function () {
    try {
        const metrics = await this.ohcSystem.getOHCMetrics(message);
        // Emit the data to all connected clients
        io.emit('ohcStatus', metrics);

        // Debug logging to confirm emission
        console.log('Emitted OHC status to', io.engine.clientsCount, 'clients');
    } catch (error) {
        console.error('Error in logStatus:', error);
    }
};

// Socket.IO connection handling
io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);

    // Send initial data when client connects
    try {
        const metrics = await ohcService.ohcSystem.getOHCMetrics(message);
        console.log('init value')
        socket.emit('ohcStatus', metrics);
    } catch (error) {
        console.error('Error sending initial data:', error);
    }

    socket.on('getFilteredWarnigRecord', async (messageFilter) => {
        try {
            message = messageFilter
            console.log('object', message)
            const metrics = await ohcService.ohcSystem.getOHCMetrics(message);
            socket.emit('ohcStatus', metrics);
        } catch (error) {
            console.error('Error getting filtered Warnig Record:', error);
            socket.emit('error', { message: 'Error fetching Warnig Record' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Express middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
};
app.use(cors(corsOptions));

// Routes
app.use("/auth", authRouter);
// app.use("/api", verifyToken, router);
app.use("/api", router);

// Error handling
app.use(errorMiddleware);
app.all("/", function (req, res) {
    res.status(200).send("SERVER IS RUNNING");
});

app.use("*", function (req, res) {
    res.status(404).send("PAGE NOT FOUND");
});

// Start the monitoring service with immediate monitoring
ohcService.start().catch(error => {
    console.error('Error starting OHC service:', error);
});

// Start the server
httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('OHC Monitoring system active');
});