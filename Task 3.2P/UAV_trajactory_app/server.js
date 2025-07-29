// UAV Performance Analysis Platform - Server
const express = require("express");
const path = require("path");
const app = express();

// Middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set port
const port = process.env.PORT || 3000;

// Routes

// Home route - serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API route for UAV data upload simulation
app.post('/api/upload-data', (req, res) => {
    console.log('UAV data upload request received');

    // Simulate data processing
    setTimeout(() => {
        res.json({
            success: true,
            message: 'UAV flight data processed successfully',
            analysisId: 'UAV_' + Date.now(),
            metrics: {
                totalFlights: 1,
                networkQuality: Math.floor(Math.random() * 40) + 60,
                flightAccuracy: Math.floor(Math.random() * 30) + 70,
                positionError: Math.floor(Math.random() * 20) + 10
            }
        });
    }, 2000);
});

// API route for analysis results
app.get('/api/analysis/:id', (req, res) => {
    const analysisId = req.params.id;
    console.log(`Analysis requested for ID: ${analysisId}`);

    // Simulate analysis data
    res.json({
        id: analysisId,
        status: 'completed',
        results: {
            trajectory: {
                points: generateMockTrajectory(),
                phases: ['takeoff', 'transit', 'waypoint_1', 'waypoint_2', 'landing']
            },
            networkMetrics: {
                averageSignalStrength: Math.floor(Math.random() * 30) + 60,
                degradationEvents: Math.floor(Math.random() * 5) + 1,
                recoveryTime: Math.floor(Math.random() * 3) + 1
            },
            performanceMetrics: {
                positionAccuracy: {
                    mean: Math.floor(Math.random() * 10) + 10,
                    std: Math.floor(Math.random() * 3) + 2,
                    confidenceInterval: [8, 15]
                },
                phaseComparison: {
                    transit: { avgError: 12, samples: 150 },
                    waypoint: { avgError: 18, samples: 80 }
                }
            }
        },
        timestamp: new Date().toISOString()
    });
});

// API route for 3D visualization data
app.get('/api/visualization/:id', (req, res) => {
    const analysisId = req.params.id;
    console.log(`3D visualization data requested for ID: ${analysisId}`);

    res.json({
        trajectoryData: generateMock3DTrajectory(),
        networkOverlay: generateMockNetworkOverlay(),
        errorIndicators: generateMockErrorIndicators()
    });
});

// API route for research reports
app.get('/api/report/:id', (req, res) => {
    const analysisId = req.params.id;
    console.log(`Research report requested for ID: ${analysisId}`);

    res.json({
        reportId: analysisId,
        title: 'UAV Network Degradation Impact Analysis',
        summary: {
            totalFlightTime: '15.3 minutes',
            networkEvents: 4,
            avgPositionError: '14.2cm ± 3.1cm',
            significantFindings: [
                'Network degradation increased position error by 34%',
                'Waypoint phases showed higher sensitivity to network issues',
                'Recovery time averaged 2.3 seconds after network restoration'
            ]
        },
        methodology: 'Crazyflie 2.1 drones with custom MEC testbed',
        recommendations: [
            'Implement adaptive control algorithms for degraded network conditions',
            'Optimize waypoint positioning strategies',
            'Consider redundant communication channels for critical phases'
        ],
        generatedAt: new Date().toISOString()
    });
});

// Mock data generation functions
function generateMockTrajectory() {
    const points = [];
    for (let i = 0; i < 100; i++) {
        points.push({
            x: Math.sin(i * 0.1) * 50 + Math.random() * 5,
            y: i * 2 + Math.random() * 3,
            z: Math.cos(i * 0.1) * 20 + Math.random() * 2,
            timestamp: i * 100,
            networkQuality: Math.max(30, Math.min(95, 70 + Math.sin(i * 0.2) * 20 + Math.random() * 10))
        });
    }
    return points;
}

function generateMock3DTrajectory() {
    const trajectory = [];
    for (let i = 0; i < 200; i++) {
        trajectory.push({
            position: [
                Math.sin(i * 0.05) * 100 + Math.random() * 10,
                i * 1.5 + Math.random() * 5,
                Math.cos(i * 0.05) * 50 + 100 + Math.random() * 8
            ],
            rotation: [
                Math.random() * 0.2 - 0.1,
                Math.sin(i * 0.1) * 0.3,
                Math.random() * 0.1 - 0.05
            ],
            timestamp: i * 50
        });
    }
    return trajectory;
}

function generateMockNetworkOverlay() {
    const overlay = [];
    for (let i = 0; i < 50; i++) {
        overlay.push({
            position: [
                Math.random() * 200 - 100,
                Math.random() * 300,
                Math.random() * 150 + 50
            ],
            signalStrength: Math.random() * 100,
            coverage: Math.random() * 50 + 25
        });
    }
    return overlay;
}

function generateMockErrorIndicators() {
    const errors = [];
    for (let i = 0; i < 20; i++) {
        errors.push({
            position: [
                Math.sin(i * 0.3) * 80 + Math.random() * 20,
                i * 15 + Math.random() * 10,
                Math.cos(i * 0.3) * 40 + 80 + Math.random() * 15
            ],
            errorMagnitude: Math.random() * 30 + 5,
            errorType: Math.random() > 0.5 ? 'position' : 'orientation',
            severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
        });
    }
    return errors;
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
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
        message: 'API endpoint not found'
    });
});

// Start server
app.listen(port, () => {
    console.log(`UAV Performance Analysis Platform listening on port ${port}`);
    console.log(`Server started at: ${new Date().toISOString()}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('\nAvailable endpoints:');
    console.log('  GET  / - Main application');
    console.log('  POST /api/upload-data - Upload UAV flight data');
    console.log('  GET  /api/analysis/:id - Get analysis results');
    console.log('  GET  /api/visualization/:id - Get 3D visualization data');
    console.log('  GET  /api/report/:id - Generate research report');
});

module.exports = app;