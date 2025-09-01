const FlightData = require('../models/FlightData');
const UAVDataProcessor = require('../models/UAVDataProcessor');
const multer = require('multer');
const fs = require('fs');

class FlightController {
    constructor() {
        this.setupFileUpload();
    }

    setupFileUpload() {
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = 'uploads/';
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, 'flight-' + uniqueSuffix + '.json');
            }
        });

        this.upload = multer({
            storage,
            fileFilter: (req, file, cb) => {
                if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
                    cb(null, true);
                } else {
                    cb(new Error('Only JSON files are supported'), false);
                }
            },
            limits: { fileSize: 50 * 1024 * 1024 } // 50MB
        });
    }

    // Upload flight data
    async uploadFlightData(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            const { flightName } = req.body;
            const filePath = req.file.path;

            // Read and parse JSON file
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const jsonData = JSON.parse(fileContent);

            // Validate data format
            const validation = UAVDataProcessor.validateFlightData(jsonData);
            if (!validation.valid) {
                fs.unlinkSync(filePath); // Delete invalid file
                return res.status(400).json({
                    success: false,
                    message: validation.error
                });
            }

            // Process flight data
            const processedData = UAVDataProcessor.processFlightData(jsonData, {
                flightName: flightName || `Flight_${jsonData.timestamp}`
            });

            // Save to database
            const flightData = new FlightData({
                userId: req.user.userId,
                ...processedData
            });

            await flightData.save();

            // Clean up uploaded file
            fs.unlinkSync(filePath);

            res.json({
                success: true,
                message: 'Flight data uploaded successfully',
                flightId: flightData._id,
                summary: {
                    flightName: processedData.flightName,
                    totalPoints: processedData.analysis.totalPoints,
                    responseTime: processedData.analysis.responseTime,
                    averageError: processedData.analysis.positionAccuracy.overall.average
                }
            });

        } catch (error) {
            console.error('Upload error:', error);

            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                success: false,
                message: 'Upload processing failed: ' + error.message
            });
        }
    }

    // Get user's flight history
    async getFlightHistory(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const flights = await FlightData
                .find({ userId: req.user.userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('flightName timestamp analysis.totalPoints analysis.responseTime analysis.positionAccuracy.overall.average createdAt');

            const total = await FlightData.countDocuments({ userId: req.user.userId });

            res.json({
                success: true,
                flights: flights.map(flight => ({
                    id: flight._id,
                    flightName: flight.flightName,
                    timestamp: flight.timestamp,
                    uploadDate: flight.createdAt,
                    totalPoints: flight.analysis?.totalPoints || 0,
                    responseTime: flight.analysis?.responseTime || 0,
                    averageError: flight.analysis?.positionAccuracy?.overall?.average || 0
                })),
                pagination: {
                    current: page,
                    total: Math.ceil(total / limit),
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            });

        } catch (error) {
            console.error('Get flight history error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get flight history: ' + error.message
            });
        }
    }

    // Get specific flight details
    async getFlightDetails(req, res) {
        try {
            const { flightId } = req.params;

            const flight = await FlightData.findOne({
                _id: flightId,
                userId: req.user.userId
            });

            if (!flight) {
                return res.status(404).json({
                    success: false,
                    message: 'Flight data not found'
                });
            }

            res.json({
                success: true,
                flight: {
                    id: flight._id,
                    flightName: flight.flightName,
                    timestamp: flight.timestamp,
                    sequence: flight.sequence,
                    analysis: flight.analysis,
                    uploadDate: flight.createdAt
                }
            });

        } catch (error) {
            console.error('Get flight details error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get flight details: ' + error.message
            });
        }
    }

    // Get 3D visualization data
    async getVisualizationData(req, res) {
        try {
            const { flightId } = req.params;

            const flight = await FlightData.findOne({
                _id: flightId,
                userId: req.user.userId
            });

            if (!flight) {
                return res.status(404).json({
                    success: false,
                    message: 'Flight data not found'
                });
            }

            const visualizationData = UAVDataProcessor.generate3DVisualizationData(flight);

            res.json({
                success: true,
                data: visualizationData
            });

        } catch (error) {
            console.error('Get visualization data error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get visualization data: ' + error.message
            });
        }
    }

    // Generate flight report
    async generateReport(req, res) {
        try {
            const { flightId } = req.params;

            const flight = await FlightData.findOne({
                _id: flightId,
                userId: req.user.userId
            });

            if (!flight) {
                return res.status(404).json({
                    success: false,
                    message: 'Flight data not found'
                });
            }

            const report = UAVDataProcessor.generateReport(flight);

            res.json({
                success: true,
                report
            });

        } catch (error) {
            console.error('Generate report error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate report: ' + error.message
            });
        }
    }

    // Delete flight data
    async deleteFlight(req, res) {
        try {
            const { flightId } = req.params;

            const result = await FlightData.findOneAndDelete({
                _id: flightId,
                userId: req.user.userId
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Flight data not found'
                });
            }

            res.json({
                success: true,
                message: 'Flight data deleted successfully'
            });

        } catch (error) {
            console.error('Delete flight data error:', error);
            res.status(500).json({
                success: false,
                message: 'Delete failed: ' + error.message
            });
        }
    }
}

module.exports = FlightController;