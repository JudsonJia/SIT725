const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const cors = require('cors');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const flightRoutes = require('./routes/flights');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Connect to database (exclude testing mode)
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Make io available to routes
app.set('io', io);

// Socket connection handling
const activeUsers = new Map();
const analysisJobs = new Map();

io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Handle user connection
    socket.on('user_connected', (userData) => {
        activeUsers.set(socket.id, {
            userId: userData?.userId || 'anonymous',
            username: userData?.username || 'Anonymous User',
            joinTime: new Date()
        });

        // Broadcast updated user count
        io.emit('user_count_update', {
            count: activeUsers.size
        });

        socket.emit('connection_confirmed', {
            message: 'Connected to UAV Analysis Platform',
            timestamp: new Date().toISOString()
        });
    });

    // Handle flight analysis subscription
    socket.on('subscribe_to_analysis', (flightId) => {
        socket.join(`analysis_${flightId}`);
        socket.emit('subscription_confirmed', {
            flightId,
            message: 'Subscribed to analysis updates'
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        const user = activeUsers.get(socket.id);
        if (user) {
            console.log(`User ${user.username} disconnected`);
            activeUsers.delete(socket.id);

            // Update user count
            io.emit('user_count_update', {
                count: activeUsers.size
            });
        }
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Socket utility functions for flight analysis
const socketUtils = {
    // Emit analysis progress updates
    emitAnalysisProgress: (flightId, progress) => {
        io.to(`analysis_${flightId}`).emit('analysis_progress', {
            flightId,
            progress,
            timestamp: new Date().toISOString()
        });
    },

    // Emit analysis completion
    emitAnalysisComplete: (flightId, results) => {
        io.to(`analysis_${flightId}`).emit('analysis_complete', {
            flightId,
            results,
            timestamp: new Date().toISOString()
        });
    },

    // Emit analysis error
    emitAnalysisError: (flightId, error) => {
        io.to(`analysis_${flightId}`).emit('analysis_error', {
            flightId,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Make socket utilities available globally
global.socketUtils = socketUtils;

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'UAV Analysis Platform is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        sockets: {
            connected: io.engine.clientsCount,
            activeUsers: activeUsers.size
        }
    });
});

// Keep existing error handling middleware...
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    // ... (keep your existing error handling)
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`UAV Analysis Platform with Socket.io listening on port ${port}`);
    console.log(`Real-time features: Flight analysis progress tracking`);
});

// Conditional export for testing
if (process.env.NODE_ENV === 'test') {
    module.exports = { app, server, io };
} else {
    module.exports = app;
}