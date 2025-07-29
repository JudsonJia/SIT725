// UAV Performance Analysis Platform - JavaScript

// Feature cards data
const featureCards = [
    {
        title: "Network-Aware Flight Analysis",
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TmV0d29yayBBbmFseXNpczwvdGV4dD48L3N2Zz4=",
        link: "View Analysis",
        description: "Analyze correlation between network connectivity and UAV flight accuracy with real-time monitoring and statistical analysis."
    },
    {
        title: "3D Trajectory Visualization",
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjY2NjY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+M0QgVmlzdWFsaXphdGlvbjwvdGV4dD48L3N2Zz4=",
        link: "View 3D Trajectory",
        description: "Interactive 3D reconstruction of UAV flight paths with network quality overlays and position error indicators."
    },
    {
        title: "Statistical Analysis",
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOTk5OTk5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9ImJsYWNrIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U3RhdGlzdGljYWwgQW5hbHlzaXM8L3RleHQ+PC9zdmc+",
        link: "View Statistics",
        description: "Comprehensive statistical analysis with confidence intervals, phase-based comparisons, and academic-grade error analysis."
    }
];

// Simulation data for dashboard
let analysisData = {
    networkQuality: 70,
    flightAccuracy: 85,
    positionError: 15,
    totalFlights: 0,
    analysisStarted: false
};

// Initialize the application
const initializeApp = () => {
    console.log("UAV Performance Analysis Platform initialized");
    showWelcomeMessage();
};

// Show welcome message
const showWelcomeMessage = () => {
    M.toast({
        html: '<i class="material-icons left">flight_takeoff</i>Welcome to UAV Analysis Platform!',
        classes: 'rounded teal',
        displayLength: 4000
    });
};

// Handle file upload
const handleUpload = () => {
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput.files.length > 0) {
        analysisData.analysisStarted = true;
        analysisData.totalFlights++;

        // Show loading toast
        M.toast({
            html: '<div class="loading"></div> Processing flight data...',
            classes: 'rounded orange',
            displayLength: 3000
        });

        // Simulate analysis progress
        setTimeout(() => {
            updateDashboard();
            M.toast({
                html: '<i class="material-icons left">check_circle</i>Analysis completed successfully!',
                classes: 'rounded green',
                displayLength: 3000
            });
        }, 3000);

        // Simulate real-time updates
        simulateRealTimeUpdates();
    } else {
        M.toast({
            html: '<i class="material-icons left">error</i>Please select files to upload',
            classes: 'rounded red',
            displayLength: 3000
        });
    }
};

// Simulate real-time dashboard updates
const simulateRealTimeUpdates = () => {
    const interval = setInterval(() => {
        // Simulate network fluctuations
        analysisData.networkQuality = Math.max(30, Math.min(95,
            analysisData.networkQuality + (Math.random() - 0.5) * 10));

        // Simulate accuracy changes based on network quality
        analysisData.flightAccuracy = Math.max(60, Math.min(98,
            70 + (analysisData.networkQuality - 50) * 0.4));

        // Calculate position error inversely related to accuracy
        analysisData.positionError = Math.max(5, Math.min(50,
            60 - analysisData.flightAccuracy * 0.6));

        updateDashboard();

        // Stop after 30 seconds
        if (analysisData.totalFlights > 10) {
            clearInterval(interval);
        }
    }, 2000);
};

// Update dashboard metrics
const updateDashboard = () => {
    // Update progress bars
    const networkProgress = document.querySelector('#analysis .progress .determinate');
    const accuracyProgress = document.querySelector('#analysis .col:nth-child(2) .progress .determinate');

    if (networkProgress) {
        networkProgress.style.width = `${analysisData.networkQuality}%`;
        networkProgress.parentElement.nextElementSibling.textContent =
            `Signal Strength: ${Math.round(analysisData.networkQuality)}%`;
    }

    if (accuracyProgress) {
        accuracyProgress.style.width = `${analysisData.flightAccuracy}%`;
        accuracyProgress.parentElement.nextElementSibling.textContent =
            `Positioning Error: ${Math.round(analysisData.positionError)}cm`;
    }

    // Update card colors based on performance
    updateCardColors();
};

// Update card colors based on performance
const updateCardColors = () => {
    const networkCard = document.querySelector('#analysis .teal.lighten-4');
    const accuracyCard = document.querySelector('#analysis .orange.lighten-4');

    if (networkCard) {
        networkCard.className = `card-panel ${getStatusColor(analysisData.networkQuality)} lighten-4`;
    }

    if (accuracyCard) {
        accuracyCard.className = `card-panel ${getStatusColor(analysisData.flightAccuracy)} lighten-4`;
    }
};

// Get status color based on performance
const getStatusColor = (value) => {
    if (value >= 80) return 'green';
    if (value >= 60) return 'orange';
    return 'red';
};

// Handle 3D visualization loading
const load3DVisualization = () => {
    const placeholder = document.querySelector('.visualization-placeholder');
    if (placeholder) {
        placeholder.innerHTML = `
            <div class="loading"></div>
            <p>Loading 3D trajectory visualization...</p>
        `;

        setTimeout(() => {
            placeholder.innerHTML = `
                <i class="material-icons large green-text">check_circle</i>
                <p>3D Visualization Ready!</p>
                <p>Interactive flight path with network quality overlays</p>
                <div class="row">
                    <div class="col s4">
                        <div class="card-panel green lighten-4 center-align">
                            <h6>Transit Phase</h6>
                            <p>Avg Error: 12cm</p>
                        </div>
                    </div>
                    <div class="col s4">
                        <div class="card-panel orange lighten-4 center-align">
                            <h6>Waypoint Phase</h6>
                            <p>Avg Error: 18cm</p>
                        </div>
                    </div>
                    <div class="col s4">
                        <div class="card-panel blue lighten-4 center-align">
                            <h6>Network Quality</h6>
                            <p>Avg: ${Math.round(analysisData.networkQuality)}%</p>
                        </div>
                    </div>
                </div>
            `;
        }, 2000);
    }
};

// Add feature cards to the page
const addFeatureCards = (items) => {
    items.forEach((item, index) => {
        const itemToAppend = `
            <div class="col s12 m4 center-align">
                <div class="card medium feature-card">
                    <div class="card-image waves-effect waves-block waves-light">
                        <img class="activator" src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="card-content">
                        <span class="card-title activator grey-text text-darken-4">
                            ${item.title}
                            <i class="material-icons right">more_vert</i>
                        </span>
                        <p><a href="#" class="teal-text">${item.link}</a></p>
                    </div>
                    <div class="card-reveal">
                        <span class="card-title grey-text text-darken-4">
                            ${item.title}
                            <i class="material-icons right">close</i>
                        </span>
                        <p class="card-text">${item.description}</p>
                    </div>
                </div>
            </div>
        `;
        $("#card-section").append(itemToAppend);
    });
};

// Document ready function
$(document).ready(function() {
    // Initialize Materialize components
    $('.modal').modal();
    $('.tooltipped').tooltip();

    // Add feature cards
    addFeatureCards(featureCards);

    // Event listeners
    $('#uploadBtn').click(() => {
        handleUpload();
    });

    $('#load3DBtn').click(() => {
        load3DVisualization();
    });

    // Initialize the app
    initializeApp();

    // Auto-show demo modal after 2 seconds
    setTimeout(() => {
        const demoModal = M.Modal.getInstance(document.getElementById('demoModal'));
        demoModal.open();
    }, 2000);
});