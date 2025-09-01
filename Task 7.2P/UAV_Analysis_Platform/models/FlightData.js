const mongoose = require('mongoose');

const flightDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Basic flight information
    flightName: {
        type: String,
        required: true
    },
    timestamp: {
        type: String,
        required: true  // e.g., "20250514_104755"
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },

    // Flight path sequence
    sequence: [[Number]], // e.g., [[0,0,0.5], [0.5,0.5,0.5]]

    // Position data - core flight information
    positionData: [{
        x: Number,
        y: Number,
        z: Number,
        time: Number,
        target: {
            x: Number,
            y: Number,
            z: Number
        },
        phase: String, // 'transit' or 'waypoint'
        error: Number,
        networkQuality: Number,
        stabilized: Boolean
    }],

    // Analysis results
    analysis: {
        totalPoints: Number,
        waypointPoints: Number,
        transitPoints: Number,
        responseTime: Number, // seconds

        // Position accuracy statistics
        positionAccuracy: {
            overall: {
                average: Number,
                median: Number,
                min: Number,
                max: Number
            },
            waypoint: {
                average: Number,
                median: Number,
                min: Number,
                max: Number,
                count: Number,
                percentage: Number
            }
        },

        // Battery information
        battery: {
            startVoltage: Number,
            minimumRequired: Number
        },

        // Command statistics
        commandStats: {
            sent: Number,
            dropped: Number,
            totalAttempts: Number
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FlightData', flightDataSchema);