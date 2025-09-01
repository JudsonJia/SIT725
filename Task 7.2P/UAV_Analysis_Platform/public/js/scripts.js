let socket = null;

function initSocket() {
    socket = io();

    socket.on('connect', () => {
        console.log('Connected to UAV Analysis Platform:', socket.id);

        // Notify server of connection
        socket.emit('user_connected', {
            userId: getCurrentUserId(), // implement this based on your auth
            username: getCurrentUsername() // implement this based on your auth
        });

        updateConnectionStatus(true);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        updateConnectionStatus(false);
    });

    // Handle connection confirmation
    socket.on('connection_confirmed', (data) => {
        showToast('Connected to real-time analysis updates', 'success');
    });

    // Handle user count updates
    socket.on('user_count_update', (data) => {
        updateUserCount(data.count);
    });

    // Handle analysis progress updates
    socket.on('analysis_progress', (data) => {
        updateAnalysisProgress(data.flightId, data.progress);
    });

    // Handle analysis completion
    socket.on('analysis_complete', (data) => {
        handleAnalysisComplete(data.flightId, data.results);
    });

    // Handle analysis errors
    socket.on('analysis_error', (data) => {
        handleAnalysisError(data.flightId, data.error);
    });
}

// Updated file upload with real-time progress
function handleFileUploadWithProgress(form) {
    const formData = new FormData(form);
    const uploadBtn = $('#uploadBtn');

    uploadBtn.text('Processing...').prop('disabled', true);

    // Show progress bar
    const progressHtml = `
        <div id="analysis-progress" style="margin-top: 20px;">
            <h6>Analysis Progress</h6>
            <div class="progress">
                <div id="progress-bar" class="determinate" style="width: 0%"></div>
            </div>
            <p id="progress-text">Starting analysis...</p>
        </div>
    `;
    $('#upload-form').after(progressHtml);

    // Upload file
    UAVApi.uploadFlightData(formData)
        .then(response => {
            if (response.success) {
                // Subscribe to analysis updates for this flight
                if (socket && socket.connected) {
                    socket.emit('subscribe_to_analysis', response.flightId);
                }
                showToast('File uploaded successfully! Analysis in progress...', 'success');
            } else {
                throw new Error(response.message);
            }
        })
        .catch(error => {
            console.error('Upload error:', error);
            showToast('Upload failed: ' + error.message, 'error');
            $('#analysis-progress').remove();
            uploadBtn.text('Start Analysis').prop('disabled', false);
        });
}

// Update analysis progress display
function updateAnalysisProgress(flightId, progress) {
    const progressBar = $('#progress-bar');
    const progressText = $('#progress-text');

    if (progressBar.length) {
        progressBar.css('width', `${progress}%`);
        progressText.text(`Analysis ${progress}% complete...`);
    }
}

// Handle analysis completion
function handleAnalysisComplete(flightId, results) {
    const uploadBtn = $('#uploadBtn');
    const progressText = $('#progress-text');

    uploadBtn.text('Start Analysis').prop('disabled', false);
    progressText.text('Analysis complete!');

    showToast('Flight analysis completed successfully!', 'success');

    // Show results summary
    displayAnalysisResults(results);

    // Remove progress bar after delay
    setTimeout(() => {
        $('#analysis-progress').fadeOut(500, function() {
            $(this).remove();
        });
    }, 3000);
}

// Handle analysis errors
function handleAnalysisError(flightId, error) {
    const uploadBtn = $('#uploadBtn');

    uploadBtn.text('Start Analysis').prop('disabled', false);
    $('#analysis-progress').remove();

    showToast('Analysis failed: ' + error, 'error');
}

// Helper functions
function updateConnectionStatus(connected) {
    // Add connection indicator to navbar if it doesn't exist
    if ($('#connection-status').length === 0) {
        $('nav .nav-wrapper').append(`
            <ul class="right">
                <li><span id="connection-status" class="badge new"></span></li>
                <li><span id="user-count" class="badge new blue"></span></li>
            </ul>
        `);
    }

    const indicator = $('#connection-status');
    if (connected) {
        indicator.removeClass('red').addClass('green').text('Connected');
    } else {
        indicator.removeClass('green').addClass('red').text('Disconnected');
    }
}

function updateUserCount(count) {
    $('#user-count').text(`${count} user${count !== 1 ? 's' : ''} online`);
}

function getCurrentUserId() {
    // Return user ID if logged in, otherwise return null
    return localStorage.getItem('userId') || null;
}

function getCurrentUsername() {
    // Return username if logged in, otherwise return 'Anonymous'
    return localStorage.getItem('username') || 'Anonymous';
}

function displayAnalysisResults(results) {
    const resultsHtml = `
        <div class="card-panel green lighten-4" style="margin-top: 20px;">
            <h5>Analysis Results</h5>
            <p><strong>Total Data Points:</strong> ${results.totalPoints || 'N/A'}</p>
            <p><strong>Average Error:</strong> ${results.averageError || 'N/A'}cm</p>
            <p><strong>Processing Time:</strong> ${results.processingTime || 'N/A'}ms</p>
        </div>
    `;

    $('#analysis-progress').after(resultsHtml);
}

// Initialize when page loads
$(document).ready(function() {
    // ... your existing initialization code ...

    // Initialize Socket connection
    initSocket();

    // Update file upload form handler
    $('#upload-form').on('submit', function(e) {
        e.preventDefault();
        handleFileUploadWithProgress(this);
    });
});
