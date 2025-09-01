// UAV Analysis Platform - JavaScript Initialization
$(document).ready(function() {
    // Initialize Materialize components
    $('.modal').modal();
    $('.dropdown-trigger').dropdown();
    $('.sidenav').sidenav();
    $('.collapsible').collapsible();
    $('.tooltipped').tooltip();

    console.log('UAV Analysis Platform initialized');

    // File upload form handling
    $('#upload-form').on('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const uploadBtn = $('#uploadBtn');
        const originalText = uploadBtn.text();

        // Show loading state
        uploadBtn.text('Processing...').prop('disabled', true);

        // Simulate upload process (replace with actual API call)
        setTimeout(() => {
            uploadBtn.text(originalText).prop('disabled', false);
            M.toast({html: 'File upload feature coming soon!', classes: 'teal'});
        }, 2000);
    });

    // 3D visualization button
    $('#load3DBtn').on('click', function() {
        M.toast({html: '3D visualization feature coming soon!', classes: 'blue'});
    });

    // Demo modal trigger
    $('.modal-trigger').on('click', function() {
        const modalId = $(this).attr('data-target');
        $(`#${modalId}`).modal('open');
    });

    // Add some interactive animations
    $('.feature-card').hover(
        function() {
            $(this).addClass('hoverable');
        },
        function() {
            $(this).removeClass('hoverable');
        }
    );

    // Initialize progress bars with animation
    $('.progress .determinate').each(function() {
        const width = $(this).css('width');
        $(this).css('width', '0%').animate({width: width}, 1500);
    });

    // Add floating action for quick access
    setTimeout(() => {
        if (window.innerWidth > 768) {
            $('body').append(`
                <div class="fixed-action-btn" style="bottom: 45px; right: 24px;">
                    <a class="btn-floating btn-large teal pulse">
                        <i class="large material-icons">add</i>
                    </a>
                    <ul>
                        <li><a class="btn-floating red tooltipped" data-position="left" data-tooltip="Upload Data"><i class="material-icons">cloud_upload</i></a></li>
                        <li><a class="btn-floating yellow tooltipped" data-position="left" data-tooltip="View Reports"><i class="material-icons">assessment</i></a></li>
                        <li><a class="btn-floating green tooltipped" data-position="left" data-tooltip="3D View"><i class="material-icons">3d_rotation</i></a></li>
                    </ul>
                </div>
            `);
            $('.fixed-action-btn').floatingActionButton();
            $('.tooltipped').tooltip();
        }
    }, 1000);
});

// API helper functions
const UAVApi = {
    baseUrl: '/api',

    // Health check
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            return null;
        }
    },

    // Upload flight data
    async uploadFlightData(formData) {
        try {
            const response = await fetch(`${this.baseUrl}/flights/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    },

    // Get flight history
    async getFlightHistory(page = 1, limit = 10) {
        try {
            const response = await fetch(`${this.baseUrl}/flights?page=${page}&limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to get flight history:', error);
            throw error;
        }
    }
};

// Global utility functions
window.showToast = function(message, type = 'info') {
    const colors = {
        success: 'green',
        error: 'red',
        warning: 'orange',
        info: 'blue'
    };

    M.toast({
        html: message,
        classes: colors[type] || 'blue',
        displayLength: 4000
    });
};

// Initialize app
$(window).on('load', function() {
    // Check API health
    UAVApi.healthCheck().then(health => {
        if (health && health.success) {
            console.log('✅ API is healthy:', health.message);
        } else {
            console.warn('⚠️ API health check failed');
        }
    });

    // Add some visual feedback
    $('body').addClass('loaded');
});