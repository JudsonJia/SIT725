// server.js - Main server file
const express = require("express");
const path = require("path");
const cors = require('cors');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const flightRoutes = require('./routes/flights');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'UAV Analysis Platform is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);

    // File upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 50MB.'
        });
    }

    if (err.message.includes('Only JSON files are supported')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // MongoDB errors
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate entry. User already exists.'
        });
    }

    // Generic error
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`UAV Performance Analysis Platform (MVC) listening on port ${port}`);
    console.log(`Server started at: ${new Date().toISOString()}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('\nAvailable endpoints:');
    console.log('  GET  / - Main application');
    console.log('  POST /api/auth/register - User registration');
    console.log('  POST /api/auth/login - User login');
    console.log('  GET  /api/auth/profile - Get user profile');
    console.log('  PUT  /api/auth/profile - Update user profile');
    console.log('  POST /api/flights/upload - Upload UAV flight data');
    console.log('  GET  /api/flights - Get user\'s flight history');
    console.log('  GET  /api/flights/:id - Get specific flight analysis');
    console.log('  GET  /api/flights/:id/visualization - Get 3D visualization data');
    console.log('  GET  /api/flights/:id/report - Generate flight report');
    console.log('  DELETE /api/flights/:id - Delete flight data');
    console.log('  GET  /api/health - Health check');
});

module.exports = app;