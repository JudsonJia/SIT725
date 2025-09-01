const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');

describe('Simplified Socket Tests - Analysis Progress', () => {
    let io, serverSocket, clientSocket, httpServer;

    beforeAll((done) => {
        httpServer = createServer();
        io = new Server(httpServer);

        httpServer.listen(() => {
            const port = httpServer.address().port;
            clientSocket = new Client(`http://localhost:${port}`);

            io.on('connection', (socket) => {
                serverSocket = socket;
            });

            clientSocket.on('connect', done);
        });
    });

    afterAll((done) => {
        if (clientSocket) clientSocket.disconnect();
        if (io) io.close();
        if (httpServer) httpServer.close(done);
    });

    test('should establish socket connection', () => {
        expect(serverSocket).toBeDefined();
        expect(clientSocket.connected).toBe(true);
    });

    test('should handle user connection', (done) => {
        serverSocket.on('user_connected', (userData) => {
            expect(userData).toBeDefined();
            serverSocket.emit('connection_confirmed', {
                message: 'Connected to UAV Analysis Platform'
            });
        });

        clientSocket.on('connection_confirmed', (data) => {
            expect(data.message).toContain('Connected');
            done();
        });

        clientSocket.emit('user_connected', {
            userId: 'test-user',
            username: 'Test User'
        });
    });

    test('should handle analysis subscription', (done) => {
        const flightId = 'flight-123';

        serverSocket.on('subscribe_to_analysis', (id) => {
            expect(id).toBe(flightId);
            serverSocket.emit('subscription_confirmed', {
                flightId: id,
                message: 'Subscribed to analysis updates'
            });
        });

        clientSocket.on('subscription_confirmed', (data) => {
            expect(data.flightId).toBe(flightId);
            done();
        });

        clientSocket.emit('subscribe_to_analysis', flightId);
    });

    test('should handle analysis progress updates', (done) => {
        const flightId = 'flight-123';
        const progress = 75;

        clientSocket.on('analysis_progress', (data) => {
            expect(data.flightId).toBe(flightId);
            expect(data.progress).toBe(progress);
            expect(data.timestamp).toBeDefined();
            done();
        });

        // Simulate server sending progress update
        serverSocket.emit('analysis_progress', {
            flightId,
            progress,
            timestamp: new Date().toISOString()
        });
    });

    test('should handle analysis completion', (done) => {
        const flightId = 'flight-123';
        const results = {
            totalPoints: 1000,
            averageError: 5.2,
            processingTime: 2500
        };

        clientSocket.on('analysis_complete', (data) => {
            expect(data.flightId).toBe(flightId);
            expect(data.results).toEqual(results);
            done();
        });

        serverSocket.emit('analysis_complete', {
            flightId,
            results,
            timestamp: new Date().toISOString()
        });
    });
});