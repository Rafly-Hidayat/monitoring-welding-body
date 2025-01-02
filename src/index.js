import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import router from "./router/router.js";
import authRouter from "./router/auth-router.js";
import { errorMiddleware } from "./middleware/err-middleware.js";
import { verifyToken } from "./middleware/auth-middleware.js";
import { MetricsCalculator, OHCMonitoringService } from "./services/ohc-service.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:5173/"],
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

// Override the logStatus method to emit data through Socket.IO
ohcService.logStatus = function () {
    try {
        const ohcData = this.ohcSystem.monitorAllOHC();
        const summary = MetricsCalculator.generateMetricsSummary(ohcData);
        const ohcs = Array.from(ohcData.values()).map(element =>
            Object.fromEntries(element)
        );

        // Debug logging to verify data generation
        console.log('Generating OHC status update at:', new Date().toISOString());

        // Emit the data to all connected clients
        io.emit('ohcStatus', { summary, ohcs });

        // Debug logging to confirm emission
        console.log('Emitted OHC status to', io.engine.clientsCount, 'clients');
    } catch (error) {
        console.error('Error in logStatus:', error);
    }
};

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send initial data when client connects
    try {
        const ohcData = ohcService.ohcSystem.monitorAllOHC();
        const summary = MetricsCalculator.generateMetricsSummary(ohcData);
        const ohcs = Array.from(ohcData.values()).map(element =>
            Object.fromEntries(element)
        );
        socket.emit('ohcStatus', { summary, ohcs });
        console.log('Sent initial data to client:', socket.id);
    } catch (error) {
        console.error('Error sending initial data:', error);
    }

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
app.use("/api", verifyToken, router);

// Error handling
app.use(errorMiddleware);
app.use("*", function (req, res) {
    res.status(404).send("PAGE NOT FOUND");
});

// Start the monitoring service with immediate monitoring
ohcService.start();
// ohcService.startMonitoringJob(); // Explicitly start the monitoring job

// Start the server
httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('OHC Monitoring system active');
});