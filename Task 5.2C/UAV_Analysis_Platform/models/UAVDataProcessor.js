class UAVDataProcessor {

    // Validate JSON data format
    static validateFlightData(data) {
        try {
            // Check required fields
            const required = ['timestamp', 'position_data', 'sequence'];
            for (let field of required) {
                if (!data[field]) {
                    return { valid: false, error: `Missing required field: ${field}` };
                }
            }

            // Check position data format
            if (!Array.isArray(data.position_data) || data.position_data.length === 0) {
                return { valid: false, error: 'Position data must be a non-empty array' };
            }

            return { valid: true };
        } catch (error) {
            return { valid: false, error: 'Data format error: ' + error.message };
        }
    }

    // Process flight data
    static processFlightData(jsonData, metadata) {
        const flightName = metadata.flightName || `Flight_${jsonData.timestamp}`;

        // Extract and simplify position data
        const processedPositions = jsonData.position_data.map(point => ({
            x: point.x,
            y: point.y,
            z: point.z,
            time: point.time,
            target: point.target,
            phase: point.phase,
            error: point.error,
            networkQuality: point.networkQuality || 100,
            stabilized: point.stabilized || false
        }));

        // Calculate basic statistics
        const analysis = this.calculateAnalysis(jsonData);

        return {
            flightName,
            timestamp: jsonData.timestamp,
            sequence: jsonData.sequence,
            positionData: processedPositions,
            analysis
        };
    }

    // Calculate analysis data
    static calculateAnalysis(data) {
        const positions = data.position_data;
        const errors = positions.map(p => p.error).filter(e => e !== undefined);
        const waypointPositions = positions.filter(p => p.phase === 'waypoint');

        // Calculate statistics
        const overallStats = this.calculateStats(errors);
        const waypointErrors = waypointPositions.map(p => p.error).filter(e => e !== undefined);
        const waypointStats = this.calculateStats(waypointErrors);

        return {
            totalPoints: positions.length,
            waypointPoints: waypointPositions.length,
            transitPoints: positions.length - waypointPositions.length,
            responseTime: data.response_time || 0,

            positionAccuracy: {
                overall: overallStats,
                waypoint: {
                    ...waypointStats,
                    count: waypointPositions.length,
                    percentage: (waypointPositions.length / positions.length) * 100
                }
            },

            battery: {
                startVoltage: data.battery?.start_voltage || 0,
                minimumRequired: data.battery?.minimum_required || 3.8
            },

            commandStats: {
                sent: data.command_stats?.sent || 0,
                dropped: data.command_stats?.dropped || 0,
                totalAttempts: data.command_stats?.total_attempts || 0
            }
        };
    }

    // Calculate statistics (average, median, min, max)
    static calculateStats(values) {
        if (!values || values.length === 0) {
            return { average: 0, median: 0, min: 0, max: 0 };
        }

        const sorted = values.slice().sort((a, b) => a - b);
        const sum = values.reduce((a, b) => a + b, 0);

        return {
            average: sum / values.length,
            median: sorted[Math.floor(sorted.length / 2)],
            min: sorted[0],
            max: sorted[sorted.length - 1]
        };
    }

    // Generate 3D visualization data
    static generate3DVisualizationData(flightData) {
        const trajectory = flightData.positionData.map(point => ({
            position: [point.x, point.y, point.z],
            time: point.time,
            networkQuality: point.networkQuality,
            phase: point.phase,
            error: point.error
        }));

        // Network quality overlay points (every 10th point)
        const networkOverlay = flightData.positionData
            .filter((_, index) => index % 10 === 0)
            .map(point => ({
                position: [point.x, point.y, point.z],
                signalStrength: point.networkQuality,
                coverage: 20 + (point.networkQuality / 100) * 30
            }));

        // Error indicators (high error points)
        const avgError = flightData.analysis.positionAccuracy.overall.average;
        const errorThreshold = avgError * 1.5;

        const errorIndicators = flightData.positionData
            .filter(point => point.error > errorThreshold)
            .map(point => ({
                position: [point.x, point.y, point.z],
                errorMagnitude: point.error,
                errorType: 'position',
                severity: point.error > errorThreshold * 1.5 ? 'high' : 'medium'
            }));

        return {
            trajectory,
            networkOverlay,
            errorIndicators,
            sequence: flightData.sequence,
            flightName: flightData.flightName
        };
    }

    // Generate flight report
    static generateReport(flightData) {
        const analysis = flightData.analysis;

        return {
            flightName: flightData.flightName,
            timestamp: flightData.timestamp,
            summary: {
                totalPoints: analysis.totalPoints,
                responseTime: `${analysis.responseTime.toFixed(1)} seconds`,
                averageError: `${analysis.positionAccuracy.overall.average.toFixed(2)} meters`,
                waypointAccuracy: `${analysis.positionAccuracy.waypoint.average.toFixed(2)} meters`,
                batteryVoltage: `${analysis.battery.startVoltage.toFixed(2)}V`,
                commandSuccess: `${analysis.commandStats.sent}/${analysis.commandStats.totalAttempts}`
            },
            details: {
                bestAccuracy: `${analysis.positionAccuracy.overall.min.toFixed(3)} meters`,
                worstAccuracy: `${analysis.positionAccuracy.overall.max.toFixed(3)} meters`,
                waypointPercentage: `${analysis.positionAccuracy.waypoint.percentage.toFixed(1)}%`,
                commandDropped: analysis.commandStats.dropped
            }
        };
    }
}

module.exports = UAVDataProcessor;