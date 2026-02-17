// AOS Animation Library
const Utils = {
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle: (func, limit) => {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

AOS.init({
    duration: 800,
    once: true,
    offset: 100,
    easing: 'ease-out-cubic',
    delay: 100,
    mirror: false
});

// Application State 
const AppState = {
    routes: [],
    currentRoute: null,
    midpoints: [],
    chart: null,
    fullscreenChart: null,
    currentChartType: 'bar',
    theme: localStorage.getItem('theme') || 'light',
    notifications: [],
    weatherData: null,
    tutorialActive: false,
    dragState: {
        dragging: false,
        draggedElement: null,
        originalIndex: null,
        placeholder: null
    },
    shortcutsEnabled: true,
    firstLoad: true,
    analysisVisible: false,
    visualizationVisible: false
};

// Configuration
const Config = {
    pollutants: {
        pm25: {
            label: 'PM2.5',
            icon: 'fa-smog',
            unit: 'µg/m³',
            max: 500,
            min: 0,
            step: 1,
            thresholds: [12, 35.4, 55.4, 150.4],
            gradient: 'linear-gradient(135deg, #ef4444, #f97316)'
        },
        pm10: {
            label: 'PM10',
            icon: 'fa-cloud',
            unit: 'µg/m³',
            max: 600,
            min: 0,
            step: 1,
            thresholds: [54, 154, 254, 354],
            gradient: 'linear-gradient(135deg, #f97316, #eab308)'
        },
        no2: {
            label: 'NO₂',
            icon: 'fa-fire',
            unit: 'ppm',
            max: 5,
            min: 0,
            step: 0.001,
            thresholds: [0.053, 0.1, 0.36, 0.65],
            gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)'
        },
        o3: {
            label: 'O₃',
            icon: 'fa-shield-alt',
            unit: 'ppm',
            max: 0.5,
            min: 0,
            step: 0.001,
            thresholds: [0.054, 0.07, 0.085, 0.105],
            gradient: 'linear-gradient(135deg, #10b981, #14b8a6)'
        }
    },
    transportFactors: {
        walking: { factor: 1.2, description: 'Walking exposes you directly to pollution' },
        cycling: { factor: 1.1, description: 'Cycling increases breathing rate' },
        car_window: { factor: 0.8, description: 'Car with windows open' },
        car_ac: { factor: 0.9, description: 'Car with AC (recirculation)' },
        bus: { factor: 0.7, description: 'Bus with controlled environment' },
        motorcycle: { factor: 1.3, description: 'Motorcycle - highest exposure' }
    },
    healthConditions: [
        { value: 'healthy', label: 'Healthy' },
        { value: 'cough', label: 'Cough' },
        { value: 'cold_flu', label: 'Cold/Flu' },
        { value: 'asthma', label: 'Asthma' },
        { value: 'allergies', label: 'Allergies' },
        { value: 'bronchitis', label: 'Bronchitis' },
        { value: 'pneumonia', label: 'Pneumonia' },
        { value: 'respiratory_issues', label: 'Respiratory Issues' },
        { value: 'heart_condition', label: 'Heart Condition' },
        { value: 'high_blood_pressure', label: 'High Blood Pressure' },
        { value: 'diabetes', label: 'Diabetes' },
        { value: 'pregnant', label: 'Pregnant' },
        { value: 'elderly_frailty', label: 'Elderly Frailty' },
        { value: 'children_weak_immunity', label: 'Children with Weak Immunity' }
    ],
    ageGroups: {
        child: { min: 0, max: 15, label: 'Child (0-15)' },
        teen: { min: 16, max: 19, label: 'Teen (16-19)' },
        adult: { min: 20, max: 64, label: 'Adult (20-64)' },
        senior: { min: 65, max: 120, label: 'Senior (65+)' }
    },
    weatherConditions: [
        { condition: 'Sunny', icon: 'fa-sun', temp: 24, humidity: 50, wind: 10 },
        { condition: 'Partly Cloudy', icon: 'fa-cloud-sun', temp: 22, humidity: 55, wind: 9 },
        { condition: 'Cloudy', icon: 'fa-cloud', temp: 20, humidity: 65, wind: 8 },
        { condition: 'Overcast', icon: 'fa-cloud', temp: 19, humidity: 70, wind: 7 },
        { condition: 'Light Rain', icon: 'fa-cloud-rain', temp: 21, humidity: 80, wind: 12 },
        { condition: 'Heavy Rain', icon: 'fa-cloud-showers-heavy', temp: 19, humidity: 90, wind: 16 },
        { condition: 'Monsoon Rain', icon: 'fa-cloud-rain', temp: 22, humidity: 85, wind: 14 },
        { condition: 'Thunderstorm', icon: 'fa-bolt', temp: 20, humidity: 88, wind: 20 },
        { condition: 'Foggy', icon: 'fa-smog', temp: 12, humidity: 85, wind: 4 },
        { condition: 'Hazy', icon: 'fa-smog', temp: 18, humidity: 75, wind: 6 },
        { condition: 'Cold Morning', icon: 'fa-snowflake', temp: 8, humidity: 60, wind: 5 },
        { condition: 'Cold Day', icon: 'fa-snowflake', temp: 10, humidity: 55, wind: 6 },
        { condition: 'Windy', icon: 'fa-wind', temp: 18, humidity: 50, wind: 25 }
    ],
    aqiCategories: [
        { min: 0, max: 50, level: 'Good', color: '#10b981', description: 'Air quality is satisfactory' },
        { min: 51, max: 100, level: 'Moderate', color: '#f59e0b', description: 'Acceptable air quality' },
        { min: 101, max: 150, level: 'Unhealthy for Sensitive Groups', color: '#ef4444', description: 'Members of sensitive groups may experience health effects' },
        { min: 151, max: 200, level: 'Unhealthy', color: '#dc2626', description: 'Everyone may begin to experience health effects' },
        { min: 201, max: 300, level: 'Very Unhealthy', color: '#991b1b', description: 'Health warnings of emergency conditions' },
        { min: 301, max: 500, level: 'Hazardous', color: '#7f1d1d', description: 'Health alert: everyone may experience serious health effects' }
    ]
};

// DOM Elements with enhanced selectors
const DOM = {
    // Core Elements
    loadingScreen: document.getElementById('loadingScreen'),
    loaderProgress: document.getElementById('loaderProgress'),
    mottoText: document.getElementById('mottoText'),

    // Form Elements
    routeName: document.getElementById('routeName'),
    startPoint: document.getElementById('startPoint'),
    endPoint: document.getElementById('endPoint'),
    travelTime: document.getElementById('travelTime'),
    travelTimeRange: document.getElementById('travelTimeRange'),
    distance: document.getElementById('distance'),
    distanceRange: document.getElementById('distanceRange'),

    // Pollution Controls
    startPollutionControls: document.getElementById('startPollutionControls'),
    endPollutionControls: document.getElementById('endPollutionControls'),

    // Midpoints
    addMidpointBtn: document.getElementById('addMidpointBtn'),
    midpointsContainer: document.getElementById('midpointsContainer'),
    midpointCount: document.getElementById('midpointCount'),
    midpointsGuide: document.getElementById('midpointsGuide'),

    // Location Suggestions
    startSuggestions: document.getElementById('startSuggestions'),
    endSuggestions: document.getElementById('endSuggestions'),

    // Display Elements
    startPointDisplay: document.getElementById('startPointDisplay'),
    endPointDisplay: document.getElementById('endPointDisplay'),

    // Profile Selectors
    transportMode: document.getElementById('transportMode'),
    ageGroup: document.getElementById('ageGroup'),
    healthStatus: document.getElementById('healthStatus'),

    // Weather
    weatherInfo: document.getElementById('weatherInfo'),
    weatherPresets: document.querySelector('.weather-presets'),

    // Action Buttons
    addRouteBtn: document.getElementById('addRouteBtn'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    resetBtn: document.getElementById('resetBtn'),
    quickAnalyzeBtn: document.getElementById('quickAnalyzeBtn'),

    // Stats Elements
    routesCount: document.getElementById('routesCount'),
    avgPM25: document.getElementById('avgPM25'),
    safestRoute: document.getElementById('safestRoute'),
    totalPoints: document.getElementById('totalPoints'),
    riskMeter: document.getElementById('riskMeter'),
    riskIndicator: document.getElementById('riskIndicator'),

    // Results Display
    routesContainer: document.getElementById('routesContainer'),
    quickStartBtn: document.getElementById('quickStartBtn'),

    // Export Controls
    printReportBtn: document.getElementById('printReportBtn'),
    exportDataBtn: document.getElementById('exportDataBtn'),
    shareResultsBtn: document.getElementById('shareResultsBtn'),
    saveProjectBtn: document.getElementById('saveProjectBtn'),

    // Chart Elements
    exposureChart: document.getElementById('exposureChart'),
    chartTypeBtns: document.querySelectorAll('.chart-type-btn'),
    exportChartBtn: document.getElementById('exportChartBtn'),
    animateChartBtn: document.getElementById('animateChartBtn'),
    fullscreenChartBtn: document.getElementById('fullscreenChartBtn'),
    fullscreenChartModal: document.getElementById('fullscreenChartModal'),
    fullscreenChart: document.getElementById('fullscreenChart'),
    closeFullscreenBtn: document.getElementById('closeFullscreenBtn'),

    // Navigation
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    helpBtn: document.getElementById('helpBtn'),
    navLinks: document.querySelectorAll('.nav-link'),
    mobileMenuBtn: null, // Will be set if exists
    navLinksContainer: null, // Will be set if exists
    backToTopBtn: document.getElementById('backToTopBtn'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    sidebarNav: document.getElementById('sidebarNav'),

    // Modal Elements
    guideModal: document.getElementById('guideModal'),
    closeGuideBtn: document.getElementById('closeGuideBtn'),
    startTutorialBtn: document.getElementById('startTutorialBtn'),
    skipTutorialBtn: document.getElementById('skipTutorialBtn'),

    // Print Modal
    printModal: document.getElementById('printModal'),
    cancelPrintBtn: document.getElementById('cancelPrintBtn'),
    confirmPrintBtn: document.getElementById('confirmPrintBtn'),

    // Feedback Modal
    feedbackModal: document.getElementById('feedbackModal'),
    feedbackBtn: document.getElementById('feedbackBtn'),
    closeFeedbackBtn: document.getElementById('closeFeedbackBtn'),
    feedbackText: document.getElementById('feedbackText'),
    submitFeedbackBtn: document.getElementById('submitFeedbackBtn'),
    ratingStars: document.querySelectorAll('.rating-stars i'),

    // Clear All
    clearAllBtn: document.getElementById('clearAllBtn'),

    // Section Elements
    analysisSection: document.getElementById('analysis'),
    visualizationSection: document.getElementById('visualization'),

    // Back to Top Mobile
    backToTopBtnMobile: document.getElementById('backToTopBtnMobile'),

    // Health Risk Cards Container
    healthRiskCards: document.querySelector('.health-risk-cards')
};

// Initialize Application
async function initApp() {
    // Show loading screen
    simulateLoading();

    // Set initial theme
    setTheme(AppState.theme);

    // Initialize DOM elements that might not exist initially
    initDOMReferences();

    // Hide analysis and visualization sections initially
    hideSectionsInitially();

    // Setup enhanced UI components
    setupHealthConditions();
    setupWeatherPresets();
    setupAgeGroups();
    createEnhancedPollutionMeters();
    initEnhancedSliders();

    // Setup all event listeners
    setupEventListeners();

    // Create animated particles
    createParticles();

    // Setup charts
    setupChart();
    setupFullscreenChart();

    // Remove sample data
    AppState.routes = [];
    AppState.midpoints = [];

    // Update all displays
    updateAllDisplays();

    // Setup typing animation for motto
    typeMotto("If you can measure it, you can control it", DOM.mottoText, 50);

    // Initialize drag and drop
    initDragAndDrop();

    AppState.firstLoad = false;
}

// Initialize DOM references
function initDOMReferences() {
    // Try to get mobile menu elements if they exist
    DOM.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    DOM.navLinksContainer = document.querySelector('.nav-links');

    // Set sidebar as active by default
    if (DOM.sidebarNav) {
        DOM.sidebarNav.classList.add('active');
    }
}

// Hide sections initially
function hideSectionsInitially() {
    if (DOM.analysisSection) {
        DOM.analysisSection.style.display = 'none';
    }
    if (DOM.visualizationSection) {
        DOM.visualizationSection.style.display = 'none';
    }
}

// Show sections when first route is added
function showAnalysisSections() {
    if (!AppState.analysisVisible && DOM.analysisSection) {
        DOM.analysisSection.style.display = 'block';
        AppState.analysisVisible = true;

        // Trigger AOS refresh for animations
        setTimeout(() => {
            AOS.refresh();
            DOM.analysisSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    if (!AppState.visualizationVisible && DOM.visualizationSection) {
        DOM.visualizationSection.style.display = 'block';
        AppState.visualizationVisible = true;

        setTimeout(() => {
            AOS.refresh();
        }, 200);
    }
}

// Simulate loading with progress bar
function simulateLoading() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                if (DOM.loadingScreen) {
                    DOM.loadingScreen.classList.add('hidden');
                }
                AOS.refresh();
            }, 300);
        }
        if (DOM.loaderProgress) {
            DOM.loaderProgress.style.width = `${progress}%`;
        }
    }, 30);
}

// Setup typing animation
function typeMotto(text, element, speed) {
    if (!element) return;

    element.innerHTML = '';
    let i = 0;

    function typeChar() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(typeChar, speed);
        }
    }

    setTimeout(typeChar, 1000);
}

// Setup all event listeners
function setupEventListeners() {
    // Theme toggle
    if (DOM.themeToggleBtn) {
        DOM.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Sidebar toggle
    if (DOM.sidebarToggle) {
        DOM.sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Mobile menu toggle if exists
    if (DOM.mobileMenuBtn && DOM.navLinksContainer) {
        DOM.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (DOM.navLinksContainer && DOM.navLinksContainer.classList.contains('active') &&
            !e.target.closest('.nav-container') &&
            !e.target.closest('.mobile-menu-btn')) {
            toggleMobileMenu();
        }
    });

    // Close mobile menu on link click
    if (DOM.navLinks) {
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (DOM.navLinksContainer && DOM.navLinksContainer.classList.contains('active')) {
                    toggleMobileMenu();
                }
            });
        });
    }

    // Location inputs with autocomplete
    if (DOM.startPoint && DOM.startSuggestions) {
        DOM.startPoint.addEventListener('input', () => {
            updateLocationDisplay();
            showLocationSuggestions(DOM.startPoint, DOM.startSuggestions);
        });
    }

    if (DOM.endPoint && DOM.endSuggestions) {
        DOM.endPoint.addEventListener('input', () => {
            updateLocationDisplay();
            showLocationSuggestions(DOM.endPoint, DOM.endSuggestions);
        });
    }

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.input-with-suggestions')) {
            if (DOM.startSuggestions) DOM.startSuggestions.classList.remove('active');
            if (DOM.endSuggestions) DOM.endSuggestions.classList.remove('active');
        }
    });

    // Range and number input synchronization
    if (DOM.travelTimeRange && DOM.travelTime) {
        DOM.travelTimeRange.addEventListener('input', (e) => {
            DOM.travelTime.value = e.target.value;
        });

        DOM.travelTime.addEventListener('input', (e) => {
            const value = Math.min(300, Math.max(1, parseInt(e.target.value) || 25));
            DOM.travelTime.value = value;
            DOM.travelTimeRange.value = value;
        });
    }

    if (DOM.distanceRange && DOM.distance) {
        DOM.distanceRange.addEventListener('input', (e) => {
            DOM.distance.value = parseFloat(e.target.value).toFixed(1);
        });

        DOM.distance.addEventListener('input', (e) => {
            const value = Math.min(100, Math.max(0.1, parseFloat(e.target.value) || 8.5));
            DOM.distance.value = value.toFixed(1);
            DOM.distanceRange.value = value;
        });
    }

    // Pollution slider updates
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('pollution-slider') ||
            e.target.classList.contains('enhanced-slider') ||
            e.target.classList.contains('pollution-value-input')) {
            updateEnhancedSliderDisplay(e.target);
        }
    });

    // Midpoints
    if (DOM.addMidpointBtn) {
        DOM.addMidpointBtn.addEventListener('click', addMidpoint);
    }

    // Form buttons
    if (DOM.addRouteBtn) DOM.addRouteBtn.addEventListener('click', addRoute);
    if (DOM.analyzeBtn) DOM.analyzeBtn.addEventListener('click', analyzeRoutes);
    if (DOM.resetBtn) DOM.resetBtn.addEventListener('click', resetForm);
    if (DOM.quickAnalyzeBtn) DOM.quickAnalyzeBtn.addEventListener('click', quickAnalyze);

    // Export buttons
    if (DOM.printReportBtn) DOM.printReportBtn.addEventListener('click', showPrintModal);
    if (DOM.exportDataBtn) DOM.exportDataBtn.addEventListener('click', exportData);
    if (DOM.shareResultsBtn) DOM.shareResultsBtn.addEventListener('click', shareResults);
    if (DOM.saveProjectBtn) DOM.saveProjectBtn.addEventListener('click', saveProject);

    // Chart controls
    if (DOM.chartTypeBtns) {
        DOM.chartTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => switchChart(btn.dataset.chart));
        });
    }
    if (DOM.exportChartBtn) DOM.exportChartBtn.addEventListener('click', exportChart);
    if (DOM.animateChartBtn) DOM.animateChartBtn.addEventListener('click', animateChart);
    if (DOM.fullscreenChartBtn) DOM.fullscreenChartBtn.addEventListener('click', showFullscreenChart);
    if (DOM.closeFullscreenBtn) DOM.closeFullscreenBtn.addEventListener('click', hideFullscreenChart);

    // Navigation
    if (DOM.navLinks) {
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    setActiveNavLink(link);
                }
            });
        });
    }

    if (DOM.backToTopBtn) DOM.backToTopBtn.addEventListener('click', scrollToTop);
    if (DOM.backToTopBtnMobile) DOM.backToTopBtnMobile.addEventListener('click', scrollToTop);
    if (DOM.helpBtn) DOM.helpBtn.addEventListener('click', showGuideModal);

    // Modal controls
    if (DOM.quickStartBtn) DOM.quickStartBtn.addEventListener('click', showGuideModal);
    if (DOM.closeGuideBtn) DOM.closeGuideBtn.addEventListener('click', hideGuideModal);
    if (DOM.startTutorialBtn) DOM.startTutorialBtn.addEventListener('click', startTutorial);
    if (DOM.skipTutorialBtn) DOM.skipTutorialBtn.addEventListener('click', hideGuideModal);

    // Print modal
    if (DOM.cancelPrintBtn) DOM.cancelPrintBtn.addEventListener('click', hidePrintModal);
    if (DOM.confirmPrintBtn) DOM.confirmPrintBtn.addEventListener('click', printReport);

    // Feedback modal
    if (DOM.feedbackBtn) DOM.feedbackBtn.addEventListener('click', showFeedbackModal);
    if (DOM.closeFeedbackBtn) DOM.closeFeedbackBtn.addEventListener('click', hideFeedbackModal);
    if (DOM.submitFeedbackBtn) DOM.submitFeedbackBtn.addEventListener('click', submitFeedback);

    // Rating stars
    if (DOM.ratingStars) {
        DOM.ratingStars.forEach(star => {
            star.addEventListener('click', setRating);
            star.addEventListener('mouseover', hoverRating);
            star.addEventListener('mouseout', resetRating);
        });
    }

    // Clear all
    if (DOM.clearAllBtn) DOM.clearAllBtn.addEventListener('click', clearAllData);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Close modals on outside click
    document.addEventListener('click', (e) => {
        if (DOM.guideModal && e.target === DOM.guideModal) hideGuideModal();
        if (DOM.printModal && e.target === DOM.printModal) hidePrintModal();
        if (DOM.feedbackModal && e.target === DOM.feedbackModal) hideFeedbackModal();
        if (DOM.fullscreenChartModal && e.target === DOM.fullscreenChartModal) hideFullscreenChart();
    });

    // Close modals on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideAllModals();
            hideFullscreenChart();
        }
    });

    // Window events
    window.addEventListener('scroll', Utils.throttle(handleScroll, 100));
    window.addEventListener('resize', Utils.debounce(handleResize, 200));
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Prevent form submission
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => e.preventDefault());
    });
}

// Toggle sidebar
function toggleSidebar() {
    if (DOM.sidebarNav) {
        DOM.sidebarNav.classList.toggle('active');
        const icon = DOM.sidebarToggle.querySelector('i');
        if (icon) {
            icon.className = DOM.sidebarNav.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
        }
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    if (!DOM.navLinksContainer || !DOM.mobileMenuBtn) return;

    DOM.navLinksContainer.classList.toggle('active');
    const icon = DOM.mobileMenuBtn.querySelector('i');
    if (icon) {
        icon.className = DOM.navLinksContainer.classList.contains('active')
            ? 'fas fa-times'
            : 'fas fa-bars';
    }
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    if (!AppState.shortcutsEnabled) return;

    // Ctrl/Cmd + Key combinations
    if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
            case 'a':
                e.preventDefault();
                if (DOM.addRouteBtn) DOM.addRouteBtn.click();
                break;
            case 'm':
                e.preventDefault();
                if (DOM.addMidpointBtn) DOM.addMidpointBtn.click();
                break;
            case 'enter':
                e.preventDefault();
                if (DOM.analyzeBtn) DOM.analyzeBtn.click();
                break;
            case 'p':
                e.preventDefault();
                showPrintModal();
                break;
            case 's':
                e.preventDefault();
                saveProject();
                break;
            case 'r':
                e.preventDefault();
                resetForm();
                break;
            case 'h':
                e.preventDefault();
                showGuideModal();
                break;
            case 'd':
                e.preventDefault();
                clearAllData();
                break;
            case 't':
                e.preventDefault();
                toggleTheme();
                break;
        }
    }

    // Function keys
    switch (e.key) {
        case 'F1':
            e.preventDefault();
            showGuideModal();
            break;
    }
}

// Handle scroll events
function handleScroll() {
    // Show/hide back to top button
    const backToTopBtn = DOM.backToTopBtnMobile || DOM.backToTopBtn;
    if (backToTopBtn) {
        if (window.scrollY > 500) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    }

    // Update active nav link
    updateActiveNavLink();
}

// Handle resize events
function handleResize() {
    // Refresh AOS on resize
    AOS.refresh();

    // Update chart if it exists
    if (AppState.chart) {
        AppState.chart.resize();
    }
    if (AppState.fullscreenChart) {
        AppState.fullscreenChart.resize();
    }
}

// Handle before unload
function handleBeforeUnload(e) {
    if (AppState.routes.length > 0 || AppState.midpoints.length > 0) {
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        e.returnValue = message;
        return message;
    }
}

// Set theme
function setTheme(theme) {
    AppState.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update theme toggle button icon
    if (DOM.themeToggleBtn) {
        const icon = DOM.themeToggleBtn.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // Update chart colors
    if (AppState.chart) {
        updateChartTheme();
    }
}

// Toggle theme
function toggleTheme() {
    const newTheme = AppState.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Setup health conditions dropdown
function setupHealthConditions() {
    if (!DOM.healthStatus) return;

    DOM.healthStatus.innerHTML = '';

    Config.healthConditions.forEach(condition => {
        const option = document.createElement('option');
        option.value = condition.value;
        option.textContent = condition.label;
        DOM.healthStatus.appendChild(option);
    });
}

// Setup weather presets
function setupWeatherPresets() {
    if (!DOM.weatherPresets) return;

    DOM.weatherPresets.innerHTML = '';

    Config.weatherConditions.forEach((weather, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'weather-preset-btn';
        if (index === 0) button.classList.add('active');

        button.innerHTML = `
            <i class="fas ${weather.icon}"></i>
            <span>${weather.condition}</span>
        `;

        button.addEventListener('click', () => selectWeatherCondition(weather));
        DOM.weatherPresets.appendChild(button);
    });

    // Select first weather condition by default
    if (Config.weatherConditions.length > 0) {
        selectWeatherCondition(Config.weatherConditions[0]);
    }
}

// Select weather condition
function selectWeatherCondition(weather) {
    AppState.weatherData = weather;

    // Update active button
    document.querySelectorAll('.weather-preset-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Update weather info display
    if (DOM.weatherInfo) {
        DOM.weatherInfo.innerHTML = `
            <div class="weather-item selected">
                <i class="fas ${weather.icon}"></i>
                <div class="weather-details">
                    <span class="weather-condition">${weather.condition}</span>
                    <span class="weather-temp">${weather.temp}°C</span>
                </div>
            </div>
            <div class="weather-item selected">
                <i class="fas fa-tint"></i>
                <div class="weather-details">
                    <span>Humidity</span>
                    <span>${weather.humidity}%</span>
                </div>
            </div>
            <div class="weather-item selected">
                <i class="fas fa-wind"></i>
                <div class="weather-details">
                    <span>Wind Speed</span>
                    <span>${weather.wind} km/h</span>
                </div>
            </div>
            <div class="weather-item selected">
                <i class="fas fa-info-circle"></i>
                <div class="weather-details">
                    <span>Impact</span>
                    <span>${getWeatherImpact(weather.condition)}</span>
                </div>
            </div>
        `;
    }

    // Activate the clicked button
    const buttons = document.querySelectorAll('.weather-preset-btn');
    buttons.forEach(btn => {
        if (btn.querySelector('span').textContent === weather.condition) {
            btn.classList.add('active');
        }
    });
}

// Setup age groups
function setupAgeGroups() {
    if (!DOM.ageGroup) return;

    DOM.ageGroup.innerHTML = '';

    Object.entries(Config.ageGroups).forEach(([key, group]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = group.label;
        if (key === 'adult') option.selected = true;
        DOM.ageGroup.appendChild(option);
    });
}

// Create enhanced pollution meters
function createEnhancedPollutionMeters() {
    if (!DOM.startPollutionControls || !DOM.endPollutionControls) return;

    // Clear existing meters
    DOM.startPollutionControls.innerHTML = '';
    DOM.endPollutionControls.innerHTML = '';

    // Create enhanced meters for each pollutant
    Object.entries(Config.pollutants).forEach(([key, pollutant]) => {
        // Start point meter
        const startMeter = createEnhancedPollutionMeter(key, pollutant, 'start');
        DOM.startPollutionControls.appendChild(startMeter);

        // End point meter
        const endMeter = createEnhancedPollutionMeter(key, pollutant, 'end');
        DOM.endPollutionControls.appendChild(endMeter);
    });
}

// Create individual enhanced pollution meter
function createEnhancedPollutionMeter(pollutantId, pollutant, point) {
    const value = point === 'start' ? getDefaultValue(pollutantId) : getDefaultValue(pollutantId) * 1.4;
    const percentage = (value / pollutant.max) * 100;
    const formattedValue = pollutantId === 'pm25' || pollutantId === 'pm10' ?
        Math.round(value) : value.toFixed(3);

    const meter = document.createElement('div');
    meter.className = 'pollution-meter enhanced';
    meter.innerHTML = `
        <div class="meter-header">
            <label class="meter-label" style="color: ${getPollutantColor(pollutantId)};">
                <i class="fas ${pollutant.icon}"></i>
                ${pollutant.label}
            </label>
            <div class="meter-value-container">
                <input type="number" class="pollution-value-input" 
                       value="${formattedValue}" 
                       min="${pollutant.min}" 
                       max="${pollutant.max}"
                       step="${pollutant.step}"
                       data-pollutant="${pollutantId}"
                       data-point="${point}">
                <span class="meter-unit">${pollutant.unit}</span>
                <div class="value-bubble" style="display: none;"></div>
            </div>
        </div>
        
        <div class="enhanced-slider-container">
            <input type="range" class="enhanced-slider" 
                   value="${value}" 
                   min="${pollutant.min}" 
                   max="${pollutant.max}" 
                   step="${pollutant.step}"
                   data-pollutant="${pollutantId}"
                   data-point="${point}">
            
            <div class="slider-track">
                <div class="slider-gradient"></div>
                <div class="slider-fill" style="width: ${percentage}%; background: ${pollutant.gradient};"></div>
            </div>
            
            <div class="slider-ticks">
                ${createSliderTicks(pollutant)}
            </div>
            
            <div class="slider-labels">
                <span class="slider-label">${pollutant.min}</span>
                <span class="slider-label">${pollutant.max / 2}</span>
                <span class="slider-label">${pollutant.max}</span>
            </div>
        </div>
    `;

    return meter;
}

// Create slider ticks
function createSliderTicks(pollutant) {
    const ticks = [];
    const numTicks = 5;

    for (let i = 0; i <= numTicks; i++) {
        const value = pollutant.min + (i * (pollutant.max - pollutant.min) / numTicks);
        const position = (i / numTicks) * 100;

        ticks.push(`
            <div class="tick" style="left: ${position}%;">
                ${value.toFixed(pollutant.step < 1 ? 2 : 0)}
            </div>
        `);
    }

    return ticks.join('');
}

// Initialize enhanced sliders
function initEnhancedSliders() {
    document.querySelectorAll('.enhanced-slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
            updateEnhancedSliderDisplay(e.target);
            showValueBubble(e.target);
        });

        slider.addEventListener('mouseenter', (e) => {
            showValueBubble(e.target);
        });

        slider.addEventListener('mouseleave', (e) => {
            hideValueBubble(e.target);
        });
    });

    document.querySelectorAll('.pollution-value-input').forEach(input => {
        input.addEventListener('input', (e) => {
            updateInputValue(e.target);
        });

        input.addEventListener('change', (e) => {
            validateInputValue(e.target);
        });
    });
}

// Update enhanced slider display
function updateEnhancedSliderDisplay(element) {
    const value = parseFloat(element.value);
    const pollutant = element.dataset.pollutant;
    const point = element.dataset.point;
    const pollutantConfig = Config.pollutants[pollutant];

    if (!pollutantConfig) return;

    // Update slider fill
    const container = element.closest('.enhanced-slider-container');
    if (container) {
        const sliderFill = container.querySelector('.slider-fill');
        const percentage = (value / pollutantConfig.max) * 100;
        sliderFill.style.width = `${percentage}%`;

        // Add animation class
        sliderFill.classList.add('animating');
        setTimeout(() => sliderFill.classList.remove('animating'), 500);
    }

    // Update corresponding input
    const inputId = `${point}${pollutant.toUpperCase()}`;
    const input = document.querySelector(`.pollution-value-input[data-pollutant="${pollutant}"][data-point="${point}"]`);
    if (input) {
        const formattedValue = pollutant === 'pm25' || pollutant === 'pm10' ?
            Math.round(value) : value.toFixed(3);
        input.value = formattedValue;
    }
}

// Show value bubble
function showValueBubble(slider) {
    const value = parseFloat(slider.value);
    const pollutant = slider.dataset.pollutant;
    const pollutantConfig = Config.pollutants[pollutant];

    if (!pollutantConfig) return;

    const container = slider.closest('.enhanced-slider-container');
    if (container) {
        const bubble = container.querySelector('.value-bubble');
        if (bubble) {
            const formattedValue = pollutant === 'pm25' || pollutant === 'pm10' ?
                Math.round(value) : value.toFixed(3);
            bubble.textContent = `${formattedValue} ${pollutantConfig.unit}`;
            bubble.style.display = 'block';
            bubble.style.opacity = '1';
        }
    }
}

// Hide value bubble
function hideValueBubble(slider) {
    const container = slider.closest('.enhanced-slider-container');
    if (container) {
        const bubble = container.querySelector('.value-bubble');
        if (bubble) {
            bubble.style.opacity = '0';
            setTimeout(() => bubble.style.display = 'none', 300);
        }
    }
}

// Update input value
function updateInputValue(input) {
    const value = parseFloat(input.value);
    const pollutant = input.dataset.pollutant;
    const point = input.dataset.point;
    const pollutantConfig = Config.pollutants[pollutant];

    if (!pollutantConfig) return;

    // Validate range
    let validValue = Math.max(pollutantConfig.min, Math.min(pollutantConfig.max, value));
    if (isNaN(validValue)) validValue = pollutantConfig.min;

    // Update slider
    const slider = document.querySelector(`.enhanced-slider[data-pollutant="${pollutant}"][data-point="${point}"]`);
    if (slider) {
        slider.value = validValue;
        updateEnhancedSliderDisplay(slider);
    }
}

// Validate input value
function validateInputValue(input) {
    const value = parseFloat(input.value);
    const pollutant = input.dataset.pollutant;
    const pollutantConfig = Config.pollutants[pollutant];

    if (!pollutantConfig) return;

    if (isNaN(value) || value < pollutantConfig.min || value > pollutantConfig.max) {
        input.classList.add('invalid');
        setTimeout(() => input.classList.remove('invalid'), 1000);

        // Reset to valid value
        const validValue = Math.max(pollutantConfig.min, Math.min(pollutantConfig.max, value || pollutantConfig.min));
        input.value = pollutant === 'pm25' || pollutant === 'pm10' ?
            Math.round(validValue) : validValue.toFixed(3);
    }
}

// Get default value for pollutant
function getDefaultValue(pollutantId) {
    const defaults = {
        pm25: 25,
        pm10: 40,
        no2: 0.02,
        o3: 0.04
    };
    return defaults[pollutantId] || 0;
}

// Get pollutant color
function getPollutantColor(pollutantId) {
    const colors = {
        pm25: '#ef4444',
        pm10: '#f97316',
        no2: '#8b5cf6',
        o3: '#10b981'
    };
    return colors[pollutantId] || '#4361ee';
}

// Get weather impact
function getWeatherImpact(condition) {
    const impacts = {
        'Sunny': 'Low dispersion',
        'Partly Cloudy': 'Moderate dispersion',
        'Cloudy': 'Moderate dispersion',
        'Overcast': 'Moderate dispersion',
        'Light Rain': 'Good dispersion',
        'Heavy Rain': 'Excellent dispersion',
        'Monsoon Rain': 'Excellent dispersion',
        'Thunderstorm': 'Excellent dispersion',
        'Foggy': 'Poor dispersion',
        'Hazy': 'Poor dispersion',
        'Cold Morning': 'Low dispersion',
        'Cold Day': 'Moderate dispersion',
        'Windy': 'Excellent dispersion'
    };
    return impacts[condition] || 'Normal conditions';
}

// Setup Chart.js
function setupChart() {
    const ctx = DOM.exposureChart?.getContext('2d');
    if (!ctx) return;

    // Register plugins
    Chart.register(ChartDataLabels);

    AppState.chart = new Chart(ctx, {
        type: AppState.currentChartType,
        data: {
            labels: [],
            datasets: [
                {
                    label: 'PM2.5 (µg/m³)',
                    data: [],
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Air Quality Index',
                    data: [],
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Health Score',
                    data: [],
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#f1f5f9',
                    borderColor: '#475569',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    padding: 12,
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.datasetIndex === 2) { // Health score
                                label += context.parsed.y + '/100';
                            } else {
                                label += context.parsed.y.toFixed(2);
                            }
                            return label;
                        }
                    }
                },
                datalabels: {
                    color: '#f1f5f9',
                    font: {
                        weight: 'bold',
                        size: 10
                    },
                    formatter: function (value, context) {
                        if (context.datasetIndex === 2) {
                            return value + '/100';
                        }
                        return Math.round(value);
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#64748b',
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#64748b',
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Setup fullscreen chart
function setupFullscreenChart() {
    const ctx = DOM.fullscreenChart?.getContext('2d');
    if (!ctx) return;

    AppState.fullscreenChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1500
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Route Pollution Analysis',
                    font: {
                        size: 20
                    }
                }
            }
        }
    });
}

// Update chart theme
function updateChartTheme() {
    if (!AppState.chart) return;

    const isDark = AppState.theme === 'dark';
    const gridColor = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(226, 232, 240, 0.5)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    AppState.chart.options.scales.x.grid.color = gridColor;
    AppState.chart.options.scales.x.ticks.color = textColor;
    AppState.chart.options.scales.y.grid.color = gridColor;
    AppState.chart.options.scales.y.ticks.color = textColor;

    AppState.chart.update();
}

// Switch chart type
function switchChart(type) {
    AppState.currentChartType = type;

    // Update active button
    if (DOM.chartTypeBtns) {
        DOM.chartTypeBtns.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.chart-type-btn[data-chart="${type}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    // Update chart type
    if (AppState.chart) {
        AppState.chart.config.type = type;

        // Update dataset configuration
        AppState.chart.data.datasets.forEach((dataset, index) => {
            if (type === 'radar') {
                dataset.borderRadius = undefined;
                dataset.borderWidth = 3;
                dataset.fill = true;
                dataset.backgroundColor = dataset.backgroundColor.replace('0.7', '0.3');
                dataset.tension = 0.2;
            } else if (type === 'line') {
                dataset.borderRadius = undefined;
                dataset.borderWidth = 3;
                dataset.fill = false;
                dataset.tension = 0.4;
                dataset.backgroundColor = dataset.backgroundColor.replace('0.3', '0.1');
            } else if (type === 'pie') {
                dataset.borderRadius = undefined;
                dataset.borderWidth = 1;
                dataset.fill = false;
                dataset.tension = 0;
            } else { // bar chart
                dataset.borderRadius = 4;
                dataset.borderWidth = 2;
                dataset.fill = true;
                dataset.tension = 0;
                dataset.backgroundColor = dataset.backgroundColor.replace('0.1', '0.7').replace('0.3', '0.7');
            }
        });
        AppState.chart.update();
    }
}

// Animate chart
function animateChart() {
    if (!AppState.chart) return;

    AppState.chart.options.animation.duration = 1500;
    AppState.chart.update();

    // Reset animation duration
    setTimeout(() => {
        AppState.chart.options.animation.duration = 1000;
    }, 1600);
}

// Show fullscreen chart
function showFullscreenChart() {
    if (!AppState.chart || AppState.routes.length === 0) {
        return;
    }

    // Copy data from main chart
    AppState.fullscreenChart.data = JSON.parse(JSON.stringify(AppState.chart.data));
    AppState.fullscreenChart.config.type = AppState.currentChartType;
    AppState.fullscreenChart.update();

    if (DOM.fullscreenChartModal) {
        DOM.fullscreenChartModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Hide fullscreen chart
function hideFullscreenChart() {
    if (DOM.fullscreenChartModal) {
        DOM.fullscreenChartModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Export chart as image
function exportChart() {
    if (!AppState.chart || AppState.routes.length === 0) {
        return;
    }

    const link = document.createElement('a');
    link.download = `pollution-analysis-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = AppState.chart.toBase64Image('image/png', 1);
    link.click();
}

// Add a new midpoint
function addMidpoint() {
    const midpoint = {
        id: generateId(),
        name: `Measurement Point ${AppState.midpoints.length + 1}`,
        location: 'Enter location details',
        pollution: {
            pm25: 30,
            pm10: 45,
            no2: 0.025,
            o3: 0.045
        },
        order: AppState.midpoints.length
    };

    AppState.midpoints.push(midpoint);
    renderMidpoint(midpoint);
    updateMidpointCount();

    // Hide guide message
    if (DOM.midpointsGuide) {
        DOM.midpointsGuide.style.display = 'none';
    }
}

// Render midpoint with enhanced controls
function renderMidpoint(midpoint) {
    const div = document.createElement('div');
    div.className = 'measurement-point';
    div.style.borderColor = '#4cc9f0';
    div.id = `midpoint-${midpoint.id}`;
    div.draggable = true;
    div.dataset.id = midpoint.id;
    div.dataset.order = midpoint.order;

    div.innerHTML = `
        <div class="point-header">
            <div class="point-marker">
                <div class="marker-icon" style="background: linear-gradient(135deg, #4cc9f0, #3a86ff);">
                    <i class="fas fa-dot-circle"></i>
                </div>
                <div class="marker-label">Mid</div>
            </div>
            <div class="point-details">
                <h4>${midpoint.name}</h4>
                <p class="location-display">${midpoint.location}</p>
            </div>
            <div class="point-actions">
                <button class="point-btn edit-btn" data-id="${midpoint.id}" title="Edit point">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="point-btn delete-btn" data-id="${midpoint.id}" title="Delete point">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="point-drag" title="Drag to reorder">
                <i class="fas fa-grip-vertical"></i>
            </div>
        </div>
        
        <div class="pollution-controls">
            ${createEnhancedMidpointPollutionMeters(midpoint)}
        </div>
        
        <div class="midpoint-controls" style="display: none;">
            <div class="form-group">
                <label class="form-label">
                    <i class="fas fa-tag"></i>
                    <span class="label-text">Point Name</span>
                </label>
                <input type="text" class="form-input midpoint-name" 
                       value="${midpoint.name}" placeholder="Enter point name">
            </div>
            <div class="form-group">
                <label class="form-label">
                    <i class="fas fa-map-marker-alt"></i>
                    <span class="label-text">Location</span>
                </label>
                <input type="text" class="form-input midpoint-location" 
                       value="${midpoint.location}" placeholder="Enter location details">
            </div>
            <div class="form-actions">
                <button type="button" class="action-btn secondary-action save-btn" data-id="${midpoint.id}">
                    Save Changes
                </button>
            </div>
        </div>
    `;

    if (DOM.midpointsContainer) {
        DOM.midpointsContainer.appendChild(div);
    }

    // Add event listeners
    const editBtn = div.querySelector('.edit-btn');
    const deleteBtn = div.querySelector('.delete-btn');
    const saveBtn = div.querySelector('.save-btn');

    editBtn?.addEventListener('click', () => toggleMidpointEdit(midpoint.id));
    deleteBtn?.addEventListener('click', () => deleteMidpoint(midpoint.id));
    saveBtn?.addEventListener('click', () => saveMidpointChanges(midpoint.id));

    // Add enhanced slider event listeners
    div.querySelectorAll('.enhanced-slider').forEach(slider => {
        slider.addEventListener('input', (e) => updateEnhancedSliderDisplay(e.target));
        slider.addEventListener('mouseenter', (e) => showValueBubble(e.target));
        slider.addEventListener('mouseleave', (e) => hideValueBubble(e.target));
    });

    div.querySelectorAll('.pollution-value-input').forEach(input => {
        input.addEventListener('input', (e) => updateInputValue(e.target));
        input.addEventListener('change', (e) => validateInputValue(e.target));
    });

    // Add drag event listeners
    setupDragEvents(div);
}

// Create enhanced pollution meters for midpoint
function createEnhancedMidpointPollutionMeters(midpoint) {
    return Object.entries(Config.pollutants).map(([key, pollutant]) => {
        const value = midpoint.pollution[key];
        const percentage = (value / pollutant.max) * 100;
        const formattedValue = key === 'pm25' || key === 'pm10' ?
            Math.round(value) : value.toFixed(3);

        return `
            <div class="pollution-meter enhanced">
                <div class="meter-header">
                    <label class="meter-label" style="color: ${getPollutantColor(key)};">
                        <i class="fas ${pollutant.icon}"></i>
                        ${pollutant.label}
                    </label>
                    <div class="meter-value-container">
                        <input type="number" class="pollution-value-input" 
                               value="${formattedValue}" 
                               min="${pollutant.min}" 
                               max="${pollutant.max}"
                               step="${pollutant.step}"
                               data-pollutant="${key}"
                               data-point="midpoint-${midpoint.id}">
                        <span class="meter-unit">${pollutant.unit}</span>
                        <div class="value-bubble" style="display: none;"></div>
                    </div>
                </div>
                
                <div class="enhanced-slider-container">
                    <input type="range" class="enhanced-slider" 
                           value="${value}" 
                           min="${pollutant.min}" 
                           max="${pollutant.max}" 
                           step="${pollutant.step}"
                           data-pollutant="${key}"
                           data-point="midpoint-${midpoint.id}">
                    
                    <div class="slider-track">
                        <div class="slider-gradient"></div>
                        <div class="slider-fill" style="width: ${percentage}%; background: ${pollutant.gradient};"></div>
                    </div>
                    
                    <div class="slider-ticks">
                        ${createSliderTicks(pollutant)}
                    </div>
                    
                    <div class="slider-labels">
                        <span class="slider-label">${pollutant.min}</span>
                        <span class="slider-label">${pollutant.max / 2}</span>
                        <span class="slider-label">${pollutant.max}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Toggle midpoint edit mode
function toggleMidpointEdit(midpointId) {
    const midpointElement = document.getElementById(`midpoint-${midpointId}`);
    if (!midpointElement) return;

    const controls = midpointElement.querySelector('.midpoint-controls');
    const isVisible = controls.style.display !== 'none';

    controls.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
        const nameInput = midpointElement.querySelector('.midpoint-name');
        const locationInput = midpointElement.querySelector('.midpoint-location');
        nameInput?.focus();
    }
}

// Delete midpoint
function deleteMidpoint(midpointId) {
    if (confirm('Delete this measurement point?')) {
        AppState.midpoints = AppState.midpoints.filter(m => m.id !== midpointId);
        const midpointElement = document.getElementById(`midpoint-${midpointId}`);
        if (midpointElement) {
            midpointElement.remove();
        }
        updateMidpointCount();

        // Show guide if no midpoints left
        if (AppState.midpoints.length === 0 && DOM.midpointsGuide) {
            DOM.midpointsGuide.style.display = 'block';
        }
    }
}

// Save midpoint changes
function saveMidpointChanges(midpointId) {
    const midpointElement = document.getElementById(`midpoint-${midpointId}`);
    if (!midpointElement) return;

    const nameInput = midpointElement.querySelector('.midpoint-name');
    const locationInput = midpointElement.querySelector('.midpoint-location');

    const midpoint = AppState.midpoints.find(m => m.id === midpointId);
    if (midpoint) {
        midpoint.name = nameInput.value.trim() || `Measurement Point ${midpoint.order + 1}`;
        midpoint.location = locationInput.value.trim() || 'Enter location details';

        // Update display
        const nameDisplay = midpointElement.querySelector('.point-details h4');
        const locationDisplay = midpointElement.querySelector('.location-display');

        if (nameDisplay) nameDisplay.textContent = midpoint.name;
        if (locationDisplay) locationDisplay.textContent = midpoint.location;

        // Hide edit controls
        const controls = midpointElement.querySelector('.midpoint-controls');
        controls.style.display = 'none';
    }
}

// Initialize drag and drop
function initDragAndDrop() {
    const measurementPoints = document.querySelectorAll('.measurement-point');
    measurementPoints.forEach(point => setupDragEvents(point));
}

// Setup drag events
function setupDragEvents(element) {
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('drop', handleDrop);
    element.addEventListener('dragend', handleDragEnd);

    // Make drag handle work
    const dragHandle = element.querySelector('.point-drag');
    if (dragHandle) {
        dragHandle.addEventListener('mousedown', () => {
            element.draggable = true;
            element.classList.add('dragging');
        });
        dragHandle.addEventListener('mouseup', () => {
            element.draggable = false;
            element.classList.remove('dragging');
        });
    }
}

// Drag event handlers
function handleDragStart(e) {
    AppState.dragState.dragging = true;
    AppState.dragState.draggedElement = this;
    AppState.dragState.originalIndex = Array.from(this.parentNode.children).indexOf(this);

    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.id);
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const draggingElement = AppState.dragState.draggedElement;
    if (draggingElement === this) return;

    const boundingRect = this.getBoundingClientRect();
    const offset = e.clientY - boundingRect.top;

    if (offset < boundingRect.height / 2) {
        this.parentNode.insertBefore(draggingElement, this);
    } else {
        this.parentNode.insertBefore(draggingElement, this.nextSibling);
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    if (AppState.dragState.draggedElement !== this) {
        const draggedElement = AppState.dragState.draggedElement;
        const dropTarget = this;

        // Swap elements
        const temp = document.createElement('div');
        dropTarget.parentNode.insertBefore(temp, dropTarget);
        draggedElement.parentNode.insertBefore(dropTarget, draggedElement);
        temp.parentNode.insertBefore(draggedElement, temp);
        temp.parentNode.removeChild(temp);

        // Update midpoint order
        updateMidpointOrder();
    }
}

function handleDragEnd() {
    this.classList.remove('dragging');
    AppState.dragState.dragging = false;
    AppState.dragState.draggedElement = null;

    // Update all displays
    updateAllDisplays();
}

// Update midpoint order
function updateMidpointOrder() {
    const midpointElements = document.querySelectorAll('.measurement-point[data-id]');
    const midpoints = [];

    midpointElements.forEach((element, index) => {
        const midpointId = element.dataset.id;
        const midpoint = AppState.midpoints.find(m => m.id === midpointId);
        if (midpoint) {
            midpoint.order = index;
            midpoints.push(midpoint);
        }
    });

    // Update array order
    AppState.midpoints = midpoints;
}

// Add route
function addRoute() {
    // Validate form
    if (!validateForm()) {
        return;
    }

    // Calculate pollution data
    const pollutionData = calculateAveragePollution();

    // Calculate health metrics
    const healthMetrics = calculateHealthMetrics(pollutionData);

    // Create new route
    const newRoute = {
        id: generateId(),
        name: DOM.routeName.value.trim(),
        start: DOM.startPoint.value.trim(),
        end: DOM.endPoint.value.trim(),
        distance: parseFloat(DOM.distance.value),
        time: parseInt(DOM.travelTime.value),
        pollution: pollutionData,
        transport: DOM.transportMode.value,
        ageGroup: DOM.ageGroup.value,
        healthStatus: DOM.healthStatus.value,
        healthRisk: healthMetrics.riskLevel,
        aqi: healthMetrics.aqi,
        score: healthMetrics.score,
        aqiCategory: healthMetrics.aqiCategory,
        midpoints: [...AppState.midpoints],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        weather: AppState.weatherData ? { condition: AppState.weatherData.condition } : null
    };

    AppState.routes.push(newRoute);
    AppState.currentRoute = newRoute;

    // Show analysis sections when first route is added
    if (AppState.routes.length === 1) {
        showAnalysisSections();
    }

    // Update UI
    updateRoutesDisplay();
    updateStats();
    updateChart();
    updateHealthRiskCards();

    // Save to localStorage
    saveProject();

    // Scroll to results
    const analysisSection = document.getElementById('analysis');
    if (analysisSection) {
        analysisSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    // Reset midpoints for next route
    AppState.midpoints = [];
    if (DOM.midpointsContainer) {
        DOM.midpointsContainer.innerHTML = '';
    }
    updateMidpointCount();

    // Show guide message
    if (DOM.midpointsGuide) {
        DOM.midpointsGuide.style.display = 'block';
    }
}

// Validate form
function validateForm() {
    const errors = [];

    if (!DOM.routeName.value.trim()) {
        errors.push('Route name is required');
        highlightInvalid(DOM.routeName);
    }

    if (!DOM.startPoint.value.trim()) {
        errors.push('Start point is required');
        highlightInvalid(DOM.startPoint);
    }

    if (!DOM.endPoint.value.trim()) {
        errors.push('Destination is required');
        highlightInvalid(DOM.endPoint);
    }

    const distance = parseFloat(DOM.distance.value);
    if (isNaN(distance) || distance <= 0) {
        errors.push('Distance must be greater than 0');
        highlightInvalid(DOM.distance);
    }

    const time = parseInt(DOM.travelTime.value);
    if (isNaN(time) || time <= 0) {
        errors.push('Travel time must be greater than 0');
        highlightInvalid(DOM.travelTime);
    }

    return errors.length === 0;
}

// Highlight invalid field
function highlightInvalid(element) {
    if (!element) return;

    element.classList.add('invalid');
    const clearInvalid = () => {
        element.classList.remove('invalid');
        element.removeEventListener('input', clearInvalid);
    };
    element.addEventListener('input', clearInvalid, { once: true });

    // Scroll to invalid field
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Calculate average pollution
function calculateAveragePollution() {
    console.log("🔍 DEBUG: Starting pollution calculation...");

    const startValues = {
        pm25: getInputValue('start', 'pm25'),
        pm10: getInputValue('start', 'pm10'),
        no2: getInputValue('start', 'no2'),
        o3: getInputValue('start', 'o3')
    };

    console.log("Start values:", startValues);
    const endValues = {
        pm25: getInputValue('end', 'pm25'),
        pm10: getInputValue('end', 'pm10'),
        no2: getInputValue('end', 'no2'),
        o3: getInputValue('end', 'o3')
    };

    console.log("End values:", endValues);

    // Collect ALL points
    const allPoints = [startValues];

    // Add midpoints
    AppState.midpoints.forEach((midpoint, index) => {
        const midValues = {
            pm25: getMidpointValue(midpoint.id, 'pm25'),
            pm10: getMidpointValue(midpoint.id, 'pm10'),
            no2: getMidpointValue(midpoint.id, 'no2'),
            o3: getMidpointValue(midpoint.id, 'o3')
        };
        console.log(`Midpoint ${index + 1} values:`, midValues);
        allPoints.push(midValues);
    });

    allPoints.push(endValues);
    console.log("All points:", allPoints);
    const weights = calculateWeights(allPoints.length);
    console.log("Weights:", weights);

    const averages = {
        pm25: calculateWeightedAverage(allPoints.map(p => p.pm25 || 0), weights),
        pm10: calculateWeightedAverage(allPoints.map(p => p.pm10 || 0), weights),
        no2: calculateWeightedAverage(allPoints.map(p => p.no2 || 0), weights),
        o3: calculateWeightedAverage(allPoints.map(p => p.o3 || 0), weights)
    };

    // Round values
    averages.pm25 = Math.round(averages.pm25 * 10) / 10;
    averages.pm10 = Math.round(averages.pm10 * 10) / 10;
    averages.no2 = Math.round(averages.no2 * 1000) / 1000;
    averages.o3 = Math.round(averages.o3 * 1000) / 1000;

    console.log("Final averages:", averages);
    return averages;
}

// Helper to get input values
function getInputValue(pointType, pollutant) {
    const selector = `.pollution-value-input[data-point="${pointType}"][data-pollutant="${pollutant}"]`;
    const input = document.querySelector(selector);

    if (input && input.value && input.value.trim() !== '') {
        const value = parseFloat(input.value);
        console.log(`Input ${pointType}-${pollutant}: ${value} (from input)`);
        return value;
    }

    // Fallback to default
    const defaultValue = getDefaultValue(pollutant);
    console.log(`Input ${pointType}-${pollutant}: ${defaultValue} (default)`);
    return defaultValue;
}

//  Helper to get midpoint values
function getMidpointValue(midpointId, pollutant) {
    const selector = `#midpoint-${midpointId} .pollution-value-input[data-pollutant="${pollutant}"]`;
    const input = document.querySelector(selector);

    if (input && input.value && input.value.trim() !== '') {
        const value = parseFloat(input.value);
        console.log(`Midpoint ${midpointId}-${pollutant}: ${value}`);
        return value;
    }

    // Check midpoint data in state
    const midpoint = AppState.midpoints.find(m => m.id === midpointId);
    if (midpoint && midpoint.pollution && midpoint.pollution[pollutant] !== undefined) {
        console.log(`Midpoint ${midpointId}-${pollutant}: ${midpoint.pollution[pollutant]} (from state)`);
        return midpoint.pollution[pollutant];
    }

    // Fallback
    const defaultValue = getDefaultValue(pollutant);
    console.log(`Midpoint ${midpointId}-${pollutant}: ${defaultValue} (default)`);
    return defaultValue;
}

// Calculate weights for weighted average
function calculateWeights(numPoints) {
    
    return Array(numPoints).fill(1 / numPoints);
}

// Calculate weighted average
function calculateWeightedAverage(values, weights) {
    
    if (weights.length === values.length) {
        return values.reduce((sum, value, index) => sum + value * weights[index], 0);
    }
    // Fallback to simple average
    const sum = values.reduce((total, val) => total + (val || 0), 0);
    return sum / values.length;
}


function calculateHealthMetrics(pollution) {
    console.log("🧮 HEALTH METRICS - Pollution levels:", pollution);

    // 1. Calculate proper EPA AQI
    const aqi = calculateEPA_AQI(pollution.pm25);
    console.log("🔢 AQI calculated:", aqi);

    // 2. Find AQI category
    let aqiCategory = Config.aqiCategories[0];
    for (const category of Config.aqiCategories) {
        if (aqi >= category.min && aqi <= category.max) {
            aqiCategory = category;
            break;
        }
    }
    console.log("📊 AQI Category:", aqiCategory.level);

    // 3. Calculate CORRECT health score using WHO/EPA guidelines
    const score = calculateCorrectHealthScore(pollution);
    console.log("🏥 Health Score:", score);

    // 4. Determine risk level based on WHO categories
    let riskLevel = determineRiskFromAQI(aqi);
    console.log("⚠️ Risk Level:", riskLevel);

    // 5. Return results
    return {
        aqi: aqi,
        score: Math.round(score),
        riskLevel: riskLevel,
        aqiCategory: aqiCategory,
        transportFactor: Config.transportFactors[DOM.transportMode?.value || 'car_window']?.factor || 1,
        healthFactor: getHealthFactor(DOM.healthStatus?.value || 'healthy'),
        ageFactor: getAgeFactor(DOM.ageGroup?.value || 'adult')
    };
}

// health score calculator
function calculateCorrectHealthScore(pollution) {
    const WHO_PM25_24HR = 15; 
    const WHO_PM10_24HR = 45; 
    const WHO_NO2_24HR = 25;  
    const WHO_O3_8HR = 100;   

    let score = 100;
    const MAX_PM25 = 35; 
    const MAX_PM10 = 18;
    const MAX_NO2 = 18;
    const MAX_O3 = 17;

    // PM2.5
    const pm25Ratio = pollution.pm25 / WHO_PM25_24HR;
    if (pm25Ratio <= 1) {
        score -= pm25Ratio * (MAX_PM25 * 0.2); 
    } else if (pm25Ratio <= 3) {
        score -= (MAX_PM25 * 0.2) + ((pm25Ratio - 1) / 2) * (MAX_PM25 * 0.4);
    } else {
        score -= (MAX_PM25 * 0.6) + Math.min(((pm25Ratio - 3) / 7) * (MAX_PM25 * 0.4), MAX_PM25 * 0.4);
    }

    // PM10
    const pm10Ratio = pollution.pm10 / WHO_PM10_24HR;
    if (pm10Ratio <= 1) {
        score -= pm10Ratio * (MAX_PM10 * 0.2);
    } else if (pm10Ratio <= 4) {
        score -= (MAX_PM10 * 0.2) + ((pm10Ratio - 1) / 3) * (MAX_PM10 * 0.4);
    } else {
        score -= (MAX_PM10 * 0.6) + Math.min(((pm10Ratio - 4) / 6) * (MAX_PM10 * 0.4), MAX_PM10 * 0.4);
    }

    // NO₂
    const no2_ugm3 = pollution.no2 * 1880;
    const no2Ratio = no2_ugm3 / WHO_NO2_24HR;
    if (no2Ratio <= 1) {
        score -= no2Ratio * (MAX_NO2 * 0.2);
    } else if (no2Ratio <= 5) {
        score -= (MAX_NO2 * 0.2) + ((no2Ratio - 1) / 4) * (MAX_NO2 * 0.4);
    } else {
        score -= (MAX_NO2 * 0.6) + Math.min(((no2Ratio - 5) / 5) * (MAX_NO2 * 0.4), MAX_NO2 * 0.4);
    }

    // O₃
    const o3_ugm3 = pollution.o3 * 1960;
    const o3Ratio = o3_ugm3 / WHO_O3_8HR;
    if (o3Ratio <= 1) {
        score -= o3Ratio * (MAX_O3 * 0.2);
    } else if (o3Ratio <= 4) {
        score -= (MAX_O3 * 0.2) + ((o3Ratio - 1) / 3) * (MAX_O3 * 0.4);
    } else {
        score -= (MAX_O3 * 0.6) + Math.min(((o3Ratio - 4) / 6) * (MAX_O3 * 0.4), MAX_O3 * 0.4);
    }

    //  personal factors
    const transport = DOM.transportMode?.value || 'car_window';
    const transportFactors = {
        'walking': 0.995,
        'cycling': 0.993,
        'car_window': 0.997,
        'car_ac': 1.0,
        'bus': 0.998,
        'motorcycle': 0.9992
    };
    score *= transportFactors[transport] || 0.995;

    // health condition factor
    const health = DOM.healthStatus?.value || 'healthy';
    const healthFactors = {
        'healthy': 1.0,
        'cough': 0.998,
        'cold_flu': 0.997,
        'asthma': 0.99,
        'allergies': 0.996,
        'bronchitis': 0.992,
        'pneumonia': 0.99,
        'respiratory_issues': 0.992,
        'heart_condition': 0.993,
        'high_blood_pressure': 0.997,
        'diabetes': 0.997,
        'pregnant': 0.995,
        'elderly_frailty': 0.99,
        'children_weak_immunity': 0.992
    };
    score *= healthFactors[health] || 0.997;

    //  age factor
    const age = DOM.ageGroup?.value || 'adult';
    const ageFactors = {
        'child': 0.995,
        'teen': 0.997,
        'adult': 1.0,
        'senior': 0.995
    };
    score *= ageFactors[age] || 0.979;
    return Math.max(0, Math.min(100, score));
}

//  Determine risk from AQI
function determineRiskFromAQI(aqi) {
    if (aqi <= 50) return 'low';
    if (aqi <= 100) return 'moderate';
    if (aqi <= 150) return 'high';
    if (aqi <= 200) return 'very high';
    if (aqi <= 300) return 'hazardous';
    return 'extreme';
}

function calculateEPA_AQI(pm25) {
    if (pm25 <= 0) return 0;
    if (pm25 > 500.4) return 500;
    const breakpoints = [
        { concLow: 0.0, concHigh: 12.0, aqiLow: 0, aqiHigh: 50, level: "Good" },
        { concLow: 12.1, concHigh: 35.4, aqiLow: 51, aqiHigh: 100, level: "Moderate" },
        { concLow: 35.5, concHigh: 55.4, aqiLow: 101, aqiHigh: 150, level: "Unhealthy for Sensitive" },
        { concLow: 55.5, concHigh: 150.4, aqiLow: 151, aqiHigh: 200, level: "Unhealthy" },
        { concLow: 150.5, concHigh: 250.4, aqiLow: 201, aqiHigh: 300, level: "Very Unhealthy" },
        { concLow: 250.5, concHigh: 350.4, aqiLow: 301, aqiHigh: 400, level: "Hazardous" },
        { concLow: 350.5, concHigh: 500.4, aqiLow: 401, aqiHigh: 500, level: "Hazardous" }
    ];
    const bp = breakpoints.find(b => pm25 >= b.concLow && pm25 <= b.concHigh);

    if (!bp) return Math.round(pm25); // Fallback

    // EPA Standard Formula: AQI = [(I_high - I_low)/(C_high - C_low)] × (C - C_low) + I_low
    const aqi = Math.round(
        ((bp.aqiHigh - bp.aqiLow) / (bp.concHigh - bp.concLow)) *
        (pm25 - bp.concLow) +
        bp.aqiLow
    );

    return aqi;
}

function calculateMultiPointHealthScore(pollution) {
    let score = 100; 

    // === PM2.5 IMPACT (EPA & WHO Guidelines) ===
    if (pollution.pm25 <= 12.0) {
        // Good (0-12 μg/m³): Minimal impact
        score -= pollution.pm25 * 0.8;
    } else if (pollution.pm25 <= 35.4) {
        // Moderate (12.1-35.4 μg/m³): Noticeable impact
        score -= 9.6 + (pollution.pm25 - 12) * 1.6;
    } else if (pollution.pm25 <= 55.4) {
        // Unhealthy for Sensitive (35.5-55.4 μg/m³): Significant impact
        score -= 46.4 + (pollution.pm25 - 35.4) * 2.2;
    } else {
        // Unhealthy+ (>55.5 μg/m³): Severe impact
        score -= 90 + (pollution.pm25 - 55.4) * 0.7;
    }

    // === PM10 IMPACT ===
    if (pollution.pm10 > 54) {
        score -= (pollution.pm10 - 54) * 0.12;
    }

    // === NO2 IMPACT (convert ppm → μg/m³) ===
    const no2_ugm3 = pollution.no2 * 1880; // 1 ppm NO2 = 1880 μg/m³
    if (no2_ugm3 > 25) {
        score -= (no2_ugm3 - 25) * 0.04;
    }

    // === O3 IMPACT (convert ppm → μg/m³) ===
    const o3_ugm3 = pollution.o3 * 1960; // 1 ppm O3 = 1960 μg/m³
    if (o3_ugm3 > 100) {
        score -= (o3_ugm3 - 100) * 0.02;
    }

    // === TRANSPORT FACTOR ===
    const transport = DOM.transportMode?.value || 'car_window';
    const transportFactors = {
        'walking': 0.998,
        'cycling': 0.997,
        'car_window': 0.99,
        'car_ac': 1.0,
        'bus': 0.99,
        'motorcycle': 0.996
    };
    score *= transportFactors[transport] || 0.998;

    // === AGE FACTOR ===
    const age = DOM.ageGroup?.value || 'adult';
    const ageFactors = { 'child': 0.995, 'teen': 0.998, 'adult': 1.0, 'senior': 0.995 };
    score *= ageFactors[age] || 0.997;

    // === HEALTH FACTOR ===
    const health = DOM.healthStatus?.value || 'healthy';
    const healthFactors = {
        'healthy': 1.0,
        'cough': 0.998,
        'cold_flu': 0.997,
        'asthma': 0.99,
        'allergies': 0.996,
        'bronchitis': 0.992,
        'pneumonia': 0.99,
        'respiratory_issues': 0.992,
        'heart_condition': 0.993,
        'high_blood_pressure': 0.997,
        'diabetes': 0.997,
        'pregnant': 0.995,
        'elderly_frailty': 0.99,
        'children_weak_immunity': 0.992
    };
    score *= healthFactors[health] || 0.997;

    // === WEATHER FACTOR ===
    if (AppState.weatherData) {
        const weatherFactors = {
            'Sunny': 0.998,
            'Partly Cloudy': 0.99,
            'Cloudy': 1.0,
            'Overcast': 1.0,
            'Light Rain': 1.01,
            'Heavy Rain': 1.02,
            'Monsoon Rain': 1.03,
            'Thunderstorm': 1.02,
            'Foggy': 0.997,
            'Hazy': 0.996,
            'Cold Morning': 0.98,
            'Cold Day': 1.0,
            'Windy': 1.03
        };
        score *= weatherFactors[AppState.weatherData.condition] || 1.0;
    }
    return Math.max(0, Math.min(100, Math.round(score)));
}

// Get age factor
function getAgeFactor(ageGroup) {
    const factors = {
        'child': 0.995,
        'teen': 0.997,
        'adult': 1.0,
        'senior': 0.995
    };
    return factors[ageGroup] || 0.997;
}

// Get health factor
function getHealthFactor(healthStatus) {
    const factors = {
        'healthy': 1.0,
        'cough': 0.998,
        'cold_flu': 0.997,
        'asthma': 0.99,
        'allergies': 0.996,
        'bronchitis': 0.992,
        'pneumonia': 0.99,
        'respiratory_issues': 0.992,
        'heart_condition': 0.993,
        'high_blood_pressure': 0.997,
        'diabetes': 0.997,
        'pregnant': 0.995,
        'elderly_frailty': 0.99,
        'children_weak_immunity': 0.992

    };
    return factors[healthStatus] || 0.997;
}

// Analyze routes
function analyzeRoutes() {
    if (AppState.routes.length === 0) {
        return;
    }

    if (AppState.routes.length === 1) {
        return;
    }

    // Sort routes by health score (best first)
    AppState.routes.sort((a, b) => b.score - a.score);

    // Update UI
    updateRoutesDisplay();
    updateStats();
    updateChart();
    updateHealthRiskCards();

    // Animate the results
    animateResults();

    // Switch to bar chart for better comparison
    switchChart('bar');
}

// Quick analysis
function quickAnalyze() {
    if (!validateForm()) {
        return;
    }

    // Temporarily add a route
    const originalMidpoints = [...AppState.midpoints];
    addRoute();

    // Analyze if we have routes
    if (AppState.routes.length > 0) {
        analyzeRoutes();
    }

    // Restore midpoints for further input
    AppState.midpoints = originalMidpoints;
    updateMidpointCount();
}

// Update routes display
function updateRoutesDisplay() {
    if (!DOM.routesContainer) return;

    if (AppState.routes.length === 0) {
        DOM.routesContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-visual">
                    <i class="fas fa-chart-line"></i>
                    <div class="empty-wave"></div>
                </div>
                <div class="empty-content">
                    <h3>Ready for Analysis</h3>
                    <p>Configure your routes and click "Add Route" to begin</p>
                    <button class="guide-btn" id="quickStartBtn">
                        <i class="fas fa-play-circle"></i>
                        Quick Start Guide
                    </button>
                </div>
            </div>
        `;

        // Re-add event listener
        const quickStartBtn = document.getElementById('quickStartBtn');
        if (quickStartBtn) {
            quickStartBtn.addEventListener('click', showGuideModal);
        }
        return;
    }

    DOM.routesContainer.innerHTML = '';

    AppState.routes.forEach((route, index) => {
        const routeElement = createRouteElement(route, index);
        DOM.routesContainer.appendChild(routeElement);
    });
}

// Create route element
function createRouteElement(route, index) {
    const div = document.createElement('div');
    div.className = 'route-card';
    div.dataset.id = route.id;

    // Determine badge color based on score
    let badgeClass = 'score-badge ';
    if (route.score >= 80) badgeClass += 'high';
    else if (route.score >= 60) badgeClass += 'medium';
    else badgeClass += 'low';

    // Get AQI category
    const aqiCategory = route.aqiCategory || Config.aqiCategories.find(c =>
        route.aqi >= c.min && route.aqi <= c.max) || Config.aqiCategories[0];
    const aqiClass = `aqi-${aqiCategory.level.toLowerCase().split(' ')[0]}`;

    // Format date
    const date = new Date(route.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    div.innerHTML = `
        <div class="route-header">
            <div class="route-title">
                <h3>${route.name}</h3>
                <div class="route-meta">
                    <span><i class="fas fa-location-arrow"></i> ${route.start}</span>
                    <span><i class="fas fa-arrow-right"></i></span>
                    <span><i class="fas fa-flag"></i> ${route.end}</span>
                </div>
                <div class="route-meta">
                    <span><i class="fas fa-clock"></i> ${route.time} min</span>
                    <span><i class="fas fa-road"></i> ${route.distance} km</span>
                    <span><i class="fas fa-layer-group"></i> ${route.midpoints ? route.midpoints.length + 2 : 2} points</span>
                </div>
                <div class="route-timestamp">
                    <i class="fas fa-calendar"></i>
                    <span>${formattedDate}</span>
                </div>
            </div>
            <div class="route-score">
                <div class="${badgeClass}">
                    <span>${route.score}</span>
                </div>
                <div class="score-label">Health Score</div>
            </div>
        </div>
        
        <div class="route-details">
            <div class="pollution-breakdown">
                ${Object.entries(route.pollution).map(([key, value]) => {
        const pollutant = Config.pollutants[key];
        const max = pollutant ? pollutant.max : 100;
        const percentage = (value / max) * 100;
        const color = getPollutionColor(key, value);

        return `
                        <div class="pollution-item">
                            <span class="pollution-label">${pollutant?.label || key}</span>
                            <div class="pollution-bar">
                                <div class="bar-fill" style="width: ${percentage}%; background: ${color};"></div>
                            </div>
                            <span class="pollution-value">${value} ${pollutant?.unit || ''}</span>
                        </div>
                    `;
    }).join('')}
            </div>
            
            <div class="route-stats">
                <div class="stat-item">
                    <span class="stat-item-label">Air Quality Index</span>
                    <span class="stat-item-value ${aqiClass}">${route.aqi}</span>
                    <span class="stat-item-description">${aqiCategory.level}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-item-label">Health Risk</span>
                    <span class="stat-item-value">${formatRiskLevel(route.healthRisk)}</span>
                    <span class="stat-item-description">${getRiskDescription(route.healthRisk)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-item-label">Transport</span>
                    <span class="stat-item-value">${formatTransportMode(route.transport)}</span>
                    <span class="stat-item-description">${Config.transportFactors[route.transport]?.description || ''}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-item-label">Profile</span>
                    <span class="stat-item-value">${formatHealthStatus(route.healthStatus)}</span>
                    <span class="stat-item-description">${getHealthStatusDescription(route.healthStatus)}</span>
                </div>
            </div>
        </div>
        
        <div class="route-footer">
            <div class="route-actions">
                <button class="route-btn view-btn" onclick="window.viewRouteDetails('${route.id}')">
                    <i class="fas fa-eye"></i>
                    Details
                </button>
                <button class="route-btn compare-btn" onclick="window.compareRoute('${route.id}')">
                    <i class="fas fa-balance-scale"></i>
                    Compare
                </button>
                
                <button class="route-btn delete" onclick="window.deleteRoute('${route.id}')">
                    <i class="fas fa-trash"></i>
                    Remove
                </button>
            </div>
            <div class="route-index">
                <span>#${index + 1}</span>
            </div>
        </div>
    `;

    return div;
}

// Get pollution color based on value
function getPollutionColor(pollutant, value) {
    const pollutantConfig = Config.pollutants[pollutant];
    if (!pollutantConfig || !pollutantConfig.thresholds) return '#4361ee';

    const [good, moderate, unhealthy, hazardous] = pollutantConfig.thresholds;

    if (value <= good) return '#10b981';
    if (value <= moderate) return '#f59e0b';
    if (value <= unhealthy) return '#ef4444';
    if (value <= hazardous) return '#dc2626';
    return '#7f1d1d';
}

// Get risk description
function getRiskDescription(riskLevel) {
    const descriptions = {
        'low': 'Safe for all groups',
        'moderate': 'Generally acceptable',
        'high': 'Sensitive groups affected',
        'hazardous': 'Health emergency'
    };
    return descriptions[riskLevel] || '';
}

// Get health status description
function getHealthStatusDescription(healthStatus) {
    const status = Config.healthConditions.find(c => c.value === healthStatus);
    return status ? status.label : healthStatus;
}

// Update health risk cards
function updateHealthRiskCards() {
    if (!DOM.healthRiskCards || AppState.routes.length === 0) return;

    DOM.healthRiskCards.innerHTML = '';

    AppState.routes.forEach((route, index) => {
        const card = document.createElement('div');
        card.className = 'health-risk-card';
        if (index === 0) card.classList.add('active');

        const riskColor = getRiskColor(route.healthRisk);

        card.innerHTML = `
            <div class="risk-icon" style="color: ${riskColor};">
                <i class="fas fa-${getRiskIcon(route.healthRisk)}"></i>
            </div>
            <div class="risk-content">
                <h4>${route.name}</h4>
                <p>Health Score: ${route.score}/100</p>
                <p>Risk Level: ${formatRiskLevel(route.healthRisk)}</p>
            </div>
            <div class="risk-range">
                AQI: ${route.aqi}
            </div>
        `;

        DOM.healthRiskCards.appendChild(card);
    });
}

// Get risk color
function getRiskColor(riskLevel) {
    const colors = {
        'low': '#10b981',
        'moderate': '#f59e0b',
        'high': '#ef4444',
        'hazardous': '#7f1d1d'
    };
    return colors[riskLevel] || '#64748b';
}

// Get risk icon
function getRiskIcon(riskLevel) {
    const icons = {
        'low': 'shield-alt',
        'moderate': 'exclamation-triangle',
        'high': 'exclamation-circle',
        'hazardous': 'skull-crossbones'
    };
    return icons[riskLevel] || 'info-circle';
}

// Update all displays
function updateAllDisplays() {
    updateLocationDisplay();
    updateMidpointCount();
    updateStats();
    updateRoutesDisplay();
    updateChart();
    updateHealthRiskCards();
}

// Update statistics
function updateStats() {
    if (!DOM.routesCount || !DOM.avgPM25 || !DOM.safestRoute || !DOM.totalPoints) return;

    DOM.routesCount.textContent = AppState.routes.length;

    if (AppState.routes.length > 0) {
        // Calculate average PM2.5
        const avgPM25 = AppState.routes.reduce((sum, route) => sum + route.pollution.pm25, 0) / AppState.routes.length;
        DOM.avgPM25.textContent = avgPM25.toFixed(1);

        // Find safest route
        const safest = AppState.routes.reduce((best, route) =>
            route.score > (best?.score || 0) ? route : best, null);
        DOM.safestRoute.textContent = safest ? safest.name.substring(0, 15) + (safest.name.length > 15 ? '...' : '') : '--';

        // Count total measurement points
        const totalPoints = AppState.routes.reduce((sum, route) =>
            sum + (route.midpoints ? route.midpoints.length + 2 : 2), 0);
        DOM.totalPoints.textContent = totalPoints;

        // Update risk meter
        const avgScore = AppState.routes.reduce((sum, route) => sum + route.score, 0) / AppState.routes.length;
        updateRiskDisplay(avgScore);
    } else {
        DOM.avgPM25.textContent = '0';
        DOM.safestRoute.textContent = '--';
        DOM.totalPoints.textContent = '0';
        updateRiskDisplay(100);
    }
}

// Update risk display
function updateRiskDisplay(score) {
    if (!DOM.riskMeter || !DOM.riskIndicator) return;

    const riskPercentage = 100 - score;

    DOM.riskMeter.style.width = `${riskPercentage}%`;
    DOM.riskIndicator.style.left = `${riskPercentage}%`;

    const indicatorValue = DOM.riskIndicator.querySelector('.indicator-value');
    if (indicatorValue) {
        indicatorValue.textContent = `${score.toFixed(0)}/100`;
    }

    // Update indicator color based on score
    let color;
    if (score >= 80) color = '#10b981';
    else if (score >= 60) color = '#f59e0b';
    else if (score >= 40) color = '#ef4444';
    else color = '#7f1d1d';

    const indicatorArrow = DOM.riskIndicator.querySelector('.indicator-arrow');
    if (indicatorArrow) {
        indicatorArrow.style.borderBottomColor = color;
    }
}

// Update chart
function updateChart() {
    if (!AppState.chart) return;

    const labels = AppState.routes.map(route => route.name);
    const pm25Data = AppState.routes.map(route => route.pollution.pm25);
    const aqiData = AppState.routes.map(route => route.aqi);
    const scoreData = AppState.routes.map(route => route.score);

    AppState.chart.data.labels = labels;
    AppState.chart.data.datasets[0].data = pm25Data;
    AppState.chart.data.datasets[1].data = aqiData;
    AppState.chart.data.datasets[2].data = scoreData;

    AppState.chart.update();
}

// Reset form
function resetForm() {
    if (confirm('Reset all inputs and midpoints?')) {
        // Reset form inputs
        if (DOM.routeName) DOM.routeName.value = '';
        if (DOM.startPoint) DOM.startPoint.value = '';
        if (DOM.endPoint) DOM.endPoint.value = '';
        if (DOM.travelTime) DOM.travelTime.value = '25';
        if (DOM.travelTimeRange) DOM.travelTimeRange.value = '25';
        if (DOM.distance) DOM.distance.value = '8.5';
        if (DOM.distanceRange) DOM.distanceRange.value = '8.5';

        // Reset pollution sliders to defaults
        Object.entries(Config.pollutants).forEach(([key, pollutant]) => {
            const startSlider = document.querySelector(`.enhanced-slider[data-pollutant="${key}"][data-point="start"]`);
            const endSlider = document.querySelector(`.enhanced-slider[data-pollutant="${key}"][data-point="end"]`);
            const startInput = document.querySelector(`.pollution-value-input[data-pollutant="${key}"][data-point="start"]`);
            const endInput = document.querySelector(`.pollution-value-input[data-pollutant="${key}"][data-point="end"]`);

            if (startSlider && startInput) {
                const startValue = getDefaultValue(key);
                startSlider.value = startValue;
                startInput.value = key === 'pm25' || key === 'pm10' ? Math.round(startValue) : startValue.toFixed(3);
                updateEnhancedSliderDisplay(startSlider);
            }

            if (endSlider && endInput) {
                const endValue = getDefaultValue(key) * 1.4;
                endSlider.value = endValue;
                endInput.value = key === 'pm25' || key === 'pm10' ? Math.round(endValue) : endValue.toFixed(3);
                updateEnhancedSliderDisplay(endSlider);
            }
        });

        // Reset midpoints
        AppState.midpoints = [];
        if (DOM.midpointsContainer) {
            DOM.midpointsContainer.innerHTML = '';
        }
        updateMidpointCount();

        // Reset displays
        if (DOM.startPointDisplay) DOM.startPointDisplay.textContent = 'Enter start location above';
        if (DOM.endPointDisplay) DOM.endPointDisplay.textContent = 'Enter destination above';

        // Reset profile selects
        if (DOM.transportMode) DOM.transportMode.value = 'car_window';
        if (DOM.ageGroup) DOM.ageGroup.value = 'adult';
        if (DOM.healthStatus) DOM.healthStatus.value = 'healthy';

        // Reset weather to first condition
        if (Config.weatherConditions.length > 0) {
            selectWeatherCondition(Config.weatherConditions[0]);
        }

        // Show guide message
        if (DOM.midpointsGuide) {
            DOM.midpointsGuide.style.display = 'block';
        }

        // Clear any invalid styles
        document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    }
}

// Show location suggestions
function showLocationSuggestions(input, dropdown) {
    if (!input || !dropdown) return;

    const value = input.value.toLowerCase();
    if (value.length < 2) {
        dropdown.classList.remove('active');
        return;
    }

    const suggestions = [
        'University Campus',
        'City Center',
        'Residential Area',
        'Industrial Zone',
        'Park Area',
        'Shopping District',
        'Bus Station',
        'Train Station',
        'Hospital Zone',
        'School Area'
    ];

    const filtered = suggestions.filter(s => s.toLowerCase().includes(value));

    if (filtered.length === 0) {
        dropdown.classList.remove('active');
        return;
    }

    dropdown.innerHTML = filtered.map(s =>
        `<div class="suggestion-item">${s}</div>`
    ).join('');

    dropdown.classList.add('active');

    // Add click handlers
    dropdown.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            input.value = item.textContent;
            dropdown.classList.remove('active');
            updateLocationDisplay();
        });
    });
}

// Update location display
function updateLocationDisplay() {
    if (DOM.startPointDisplay) {
        DOM.startPointDisplay.textContent = DOM.startPoint?.value || 'Enter start location above';
    }
    if (DOM.endPointDisplay) {
        DOM.endPointDisplay.textContent = DOM.endPoint?.value || 'Enter destination above';
    }
}

// Update midpoint count
function updateMidpointCount() {
    if (DOM.midpointCount) {
        DOM.midpointCount.textContent = AppState.midpoints.length;
    }
}

// Show guide modal
function showGuideModal() {
    if (DOM.guideModal) {
        DOM.guideModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Hide guide modal
function hideGuideModal() {
    if (DOM.guideModal) {
        DOM.guideModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Hide all modals
function hideAllModals() {
    hideGuideModal();
    hidePrintModal();
    hideFeedbackModal();
}

// Start tutorial
function startTutorial() {
    AppState.tutorialActive = true;
    hideGuideModal();

    const steps = [
        {
            element: DOM.routeName,
            message: 'Step 1: Enter a descriptive name for your route',
            action: () => DOM.routeName?.focus()
        },
        {
            element: DOM.startPoint,
            message: 'Step 2: Enter your starting location',
            action: () => DOM.startPoint?.focus()
        },
        {
            element: DOM.endPoint,
            message: 'Step 3: Enter your destination',
            action: () => DOM.endPoint?.focus()
        },
        {
            element: DOM.addMidpointBtn,
            message: 'Step 4: Add measurement points along your route',
            action: () => DOM.addMidpointBtn?.click()
        },
        {
            element: DOM.transportMode,
            message: 'Step 5: Select your transportation mode',
            action: () => DOM.transportMode?.focus()
        },
        {
            element: DOM.addRouteBtn,
            message: 'Step 6: Add your route to analysis',
            action: () => DOM.addRouteBtn?.click()
        },
        {
            element: DOM.analyzeBtn,
            message: 'Step 7: Analyze all routes to find the safest one',
            action: () => DOM.analyzeBtn?.click()
        }
    ];

    let currentStep = 0;

    function nextStep() {
        if (currentStep >= steps.length) {
            AppState.tutorialActive = false;
            return;
        }

        const step = steps[currentStep];

        // Scroll to element
        if (step.element) {
            step.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Highlight element
            const originalBorder = step.element.style.border;
            step.element.style.border = '2px solid #f72585';
            step.element.style.boxShadow = '0 0 20px rgba(247, 37, 133, 0.5)';

            // Perform action
            if (step.action) step.action();

            // Set timeout for next step
            setTimeout(() => {
                step.element.style.border = originalBorder;
                step.element.style.boxShadow = '';
                currentStep++;
                nextStep();
            }, 3000);
        } else {
            currentStep++;
            nextStep();
        }
    }

    nextStep();
}

// Show print modal
function showPrintModal() {
    if (DOM.printModal) {
        DOM.printModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Hide print modal
function hidePrintModal() {
    if (DOM.printModal) {
        DOM.printModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Print report
function printReport() {
    hidePrintModal();

    // Get print options
    const includeAnalysis = document.getElementById('printAnalysis')?.checked || false;
    const includeCharts = document.getElementById('printCharts')?.checked || false;
    const includeData = document.getElementById('printData')?.checked || false;
    const includeSummary = document.getElementById('printSummary')?.checked || false;

    // Create print content
    const printContent = document.createElement('div');
    printContent.className = 'print-content';
    printContent.innerHTML = createPrintContent(includeAnalysis, includeCharts, includeData, includeSummary);

    // Create print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Route Pollution Analysis Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                h1 { color: #4361ee; border-bottom: 2px solid #4361ee; padding-bottom: 10px; margin-bottom: 20px; }
                h2 { color: #3a0ca3; margin-top: 25px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
                h3 { color: #4cc9f0; margin-top: 20px; }
                .route-card { border: 1px solid #e2e8f0; padding: 15px; margin: 15px 0; border-radius: 8px; background: #f8fafc; }
                .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
                .stat-card { background: #f1f5f9; padding: 12px; border-radius: 6px; text-align: center; }
                .score-badge { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin: 0 auto 8px; }
                .score-high { background: #10b981; }
                .score-medium { background: #f59e0b; }
                .score-low { background: #ef4444; }
                .chart-container { margin: 25px 0; text-align: center; page-break-inside: avoid; }
                .chart-container img { max-width: 100%; height: auto; }
                .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px; }
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 15px; font-size: 12pt; }
                    h1 { font-size: 24pt; }
                    h2 { font-size: 18pt; }
                    h3 { font-size: 14pt; }
                    .route-card { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            ${printContent.innerHTML}
        </body>
        </html>
    `);

    printWindow.document.close();

    // Print after content loads
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

// Create print content
function createPrintContent(includeAnalysis, includeCharts, includeData, includeSummary) {
    let content = `
        <div class="header">
            <h1>Route Pollution Analysis Report</h1>
            <p>Generated on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}</p>
            <hr>
        </div>
    `;

    if (includeSummary && AppState.routes.length > 0) {
        const totalRoutes = AppState.routes.length;
        const avgScore = AppState.routes.reduce((sum, r) => sum + r.score, 0) / totalRoutes;
        const bestRoute = AppState.routes.sort((a, b) => b.score - a.score)[0];

        content += `
            <div class="summary">
                <h2>Executive Summary</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>${totalRoutes}</h3>
                        <p>Routes Analyzed</p>
                    </div>
                    <div class="stat-card">
                        <h3>${avgScore.toFixed(1)}/100</h3>
                        <p>Average Health Score</p>
                    </div>
                    <div class="stat-card">
                        <h3>${bestRoute.score}/100</h3>
                        <p>Best Route Score</p>
                    </div>
                    <div class="stat-card">
                        <h3>${bestRoute.name}</h3>
                        <p>Safest Route</p>
                    </div>
                </div>
            </div>
        `;
    }

    if (includeAnalysis && AppState.routes.length > 0) {
        content += `
            <div class="analysis">
                <h2>Route Analysis</h2>
        `;

        AppState.routes.forEach((route, index) => {
            const scoreClass = route.score >= 80 ? 'score-high' :
                route.score >= 60 ? 'score-medium' : 'score-low';

            content += `
                <div class="route-card">
                    <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 250px;">
                            <h3>${index + 1}. ${route.name}</h3>
                            <p><strong>Route:</strong> ${route.start} → ${route.end}</p>
                            <p><strong>Distance:</strong> ${route.distance} km | <strong>Time:</strong> ${route.time} min</p>
                            <p><strong>Pollution Levels:</strong> 
                                PM2.5: ${route.pollution.pm25}µg/m³, 
                                PM10: ${route.pollution.pm10}µg/m³,
                                NO₂: ${route.pollution.no2}ppm,
                                O₃: ${route.pollution.o3}ppm
                            </p>
                        </div>
                        <div style="text-align: center; margin-left: 20px;">
                            <div class="score-badge ${scoreClass}">
                                ${route.score}
                            </div>
                            <p style="margin-top: 5px; font-weight: bold;">Health Score</p>
                        </div>
                    </div>
                    <p><strong>Health Assessment:</strong> 
                        Score: ${route.score}/100 | 
                        AQI: ${route.aqi} | 
                        Risk: ${formatRiskLevel(route.healthRisk)}
                    </p>
                    <p><strong>Profile:</strong> 
                        ${formatTransportMode(route.transport)} | 
                        ${formatHealthStatus(route.healthStatus)} | 
                        ${route.ageGroup}
                    </p>
                </div>
            `;
        });

        content += `</div>`;
    }

    if (includeCharts && AppState.chart && AppState.routes.length > 0) {
        content += `
            <div class="chart-container">
                <h2>Data Visualization</h2>
                <img src="${AppState.chart.toBase64Image()}">
            </div>
        `;
    }

    if (includeData && AppState.routes.length > 0) {
        content += `
            <div class="data">
                <h2>Raw Data</h2>
                <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 11px; overflow-x: auto; white-space: pre-wrap;">
${JSON.stringify(AppState.routes, null, 2)}
                </pre>
            </div>
        `;
    }

    content += `
        <div class="footer">
            <p>Generated by Route Pollution Calculator</p>
            <p>Academic Project | Environmental Science</p>
        </div>
    `;

    return content;
}

// Export data
function exportData() {
    if (AppState.routes.length === 0) {
        return;
    }

    const data = {
        project: 'Route Pollution Calculator',
        version: '2.0',
        generated: new Date().toISOString(),
        routes: AppState.routes,
        summary: {
            totalRoutes: AppState.routes.length,
            averagePM25: AppState.routes.reduce((sum, r) => sum + r.pollution.pm25, 0) / AppState.routes.length,
            bestRoute: AppState.routes.sort((a, b) => b.score - a.score)[0]?.name,
            bestScore: AppState.routes.sort((a, b) => b.score - a.score)[0]?.score
        },
        config: Config
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pollution-analysis-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Share results
function shareResults() {
    if (AppState.routes.length === 0) {
        return;
    }

    const bestRoute = AppState.routes.sort((a, b) => b.score - a.score)[0];
    const text = `🏆 Route Pollution Analysis Results:\n\n` +
        `📊 Total Routes: ${AppState.routes.length}\n` +
        `🛡️ Safest Route: "${bestRoute.name}"\n` +
        `❤️ Health Score: ${bestRoute.score}/100\n` +
        `🌫️ Average PM2.5: ${DOM.avgPM25?.textContent || '0'} µg/m³\n\n` +
        `🔗 ${window.location.href}\n\n` +
        `Generated by Route Pollution Calculator`;

    if (navigator.share) {
        navigator.share({
            title: 'Pollution Analysis Results',
            text: text,
            url: window.location.href
        }).catch(error => {
            console.error('Share failed:', error);
            copyToClipboard(text);
        });
    } else {
        copyToClipboard(text);
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (e) {
            console.error('Copy failed:', e);
        }
        document.body.removeChild(textArea);
    });
}

// Save project data
function saveProject() {
    if (AppState.routes.length === 0) return;

    const data = {
        routes: AppState.routes,
        midpoints: AppState.midpoints,
        theme: AppState.theme,
        savedAt: new Date().toISOString()
    };

    localStorage.setItem('pollutionCalculatorData', JSON.stringify(data));
}

// Scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Clear all data
function clearAllData() {
    if (confirm('Clear all data, routes, and midpoints?')) {
        AppState.routes = [];
        AppState.midpoints = [];
        AppState.currentRoute = null;
        AppState.analysisVisible = false;
        AppState.visualizationVisible = false;

        // Hide analysis sections
        hideSectionsInitially();

        // Clear localStorage
        localStorage.removeItem('pollutionCalculatorData');

        // Update UI
        updateAllDisplays();

        // Reset form
        resetForm();
    }
}

// View route details
function viewRouteDetails(routeId) {
    const route = AppState.routes.find(r => r.id === routeId);
    if (!route) return;

    // Create detailed view modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h3><i class="fas fa-info-circle"></i> Route Details: ${route.name}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: 16px;">
                    <div>
                        <h4>Route Information</h4>
                        <p><strong>From:</strong> ${route.start}</p>
                        <p><strong>To:</strong> ${route.end}</p>
                        <p><strong>Distance:</strong> ${route.distance} km</p>
                        <p><strong>Time:</strong> ${route.time} minutes</p>
                    </div>
                    
                    <div>
                        <h4>Pollution Levels</h4>
                        ${Object.entries(route.pollution).map(([key, value]) => {
        const pollutant = Config.pollutants[key];
        return `<p><strong>${pollutant?.label || key}:</strong> ${value} ${pollutant?.unit || ''}</p>`;
    }).join('')}
                    </div>
                    
                    <div>
                        <h4>Health Assessment</h4>
                        <p><strong>Health Score:</strong> ${route.score}/100</p>
                        <p><strong>AQI:</strong> ${route.aqi} (${route.aqiCategory?.level || 'Unknown'})</p>
                        <p><strong>Risk Level:</strong> ${formatRiskLevel(route.healthRisk)}</p>
                    </div>
                    
                    <div>
                        <h4>Travel Profile</h4>
                        <p><strong>Transport:</strong> ${formatTransportMode(route.transport)}</p>
                        <p><strong>Age Group:</strong> ${route.ageGroup}</p>
                        <p><strong>Health Status:</strong> ${formatHealthStatus(route.healthStatus)}</p>
                    </div>
                    
                    ${route.midpoints && route.midpoints.length > 0 ? `
                        <div>
                            <h4>Measurement Points (${route.midpoints.length})</h4>
                            ${route.midpoints.map(mp => `
                                <div style="margin-bottom: 8px; padding: 8px; background: var(--current-bg); border-radius: 4px; border: 1px solid var(--current-border);">
                                    <strong>${mp.name}</strong><br>
                                    <small style="color: var(--current-muted);">${mp.location}</small>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div>
                        <h4>Timestamps</h4>
                        <p><strong>Created:</strong> ${new Date(route.createdAt).toLocaleString()}</p>
                        <p><strong>Updated:</strong> ${new Date(route.updatedAt).toLocaleString()}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn secondary" onclick="this.closest('.modal-overlay').remove()">
                    Close
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close on outside click
    modal.addEventListener('click', function (e) {
        if (e.target === this) {
            this.remove();
        }
    });
}

function compareRoute(routeId) {
    const route = AppState.routes.find(r => r.id === routeId);
    if (!route) return;

    const otherRoutes = AppState.routes.filter(r => r.id !== routeId);
    if (otherRoutes.length === 0) {
        return;
    }

    // Find the best alternative route
    const bestOther = otherRoutes.sort((a, b) => b.score - a.score)[0];
    const comparison = route.score > bestOther.score ? 'better' : 'worse';
    const difference = Math.abs(route.score - bestOther.score);

    // Show comparison in alert for simplicity
    alert(`This route is ${comparison} than "${bestOther.name}" by ${difference} points`);
}

// Delete route
function deleteRoute(routeId) {
    if (confirm('Delete this route?')) {
        AppState.routes = AppState.routes.filter(r => r.id !== routeId);

        // Hide sections if no routes left
        if (AppState.routes.length === 0) {
            hideSectionsInitially();
            AppState.analysisVisible = false;
            AppState.visualizationVisible = false;
        }

        updateAllDisplays();
        saveProject();
    }
}

// Show feedback modal
function showFeedbackModal() {
    if (DOM.feedbackModal) {
        DOM.feedbackModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Hide feedback modal
function hideFeedbackModal() {
    if (DOM.feedbackModal) {
        DOM.feedbackModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Set rating
function setRating(e) {
    const rating = parseInt(e.target.dataset.rating);
    if (DOM.ratingStars) {
        DOM.ratingStars.forEach((star, index) => {
            star.classList.toggle('active', index < rating);
        });
    }
}

// Hover rating
function hoverRating(e) {
    const rating = parseInt(e.target.dataset.rating);
    if (DOM.ratingStars) {
        DOM.ratingStars.forEach((star, index) => {
            star.classList.toggle('hover', index < rating);
        });
    }
}

// Reset rating
function resetRating() {
    if (DOM.ratingStars) {
        DOM.ratingStars.forEach(star => {
            star.classList.remove('hover');
        });
    }
}

// Submit feedback
function submitFeedback() {
    const feedback = DOM.feedbackText?.value.trim();
    const rating = DOM.ratingStars ? Array.from(DOM.ratingStars).filter(star => star.classList.contains('active')).length : 0;

    if (!feedback && rating === 0) {
        return;
    }

    // In a real app, this would send to a server
    console.log('Feedback submitted:', { feedback, rating, timestamp: new Date().toISOString() });

    hideFeedbackModal();
    if (DOM.feedbackText) DOM.feedbackText.value = '';
    if (DOM.ratingStars) DOM.ratingStars.forEach(star => star.classList.remove('active'));
}

// Create animated particles
function createParticles() {
    const container = document.querySelector('.particle-container');
    if (!container) return;

    // Clear existing particles
    container.innerHTML = '';

    // Create particles
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random properties
        const size = Math.random() * 4 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 15 + 10;
        const delay = Math.random() * 5;
        const opacity = Math.random() * 0.2 + 0.05;
        const color = Math.random() > 0.5 ? '67, 97, 238' : '76, 201, 240';

        // Apply styles
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${posX}%;
            top: ${posY}%;
            background: rgba(${color}, ${opacity});
            border-radius: 50%;
            position: absolute;
            animation: float ${duration}s ease-in-out infinite;
            animation-delay: ${delay}s;
            pointer-events: none;
        `;

        container.appendChild(particle);
    }
}

// Set active nav link
function setActiveNavLink(link) {
    if (DOM.navLinks) {
        DOM.navLinks.forEach(l => l.classList.remove('active'));
    }
    link.classList.add('active');
}

// Update active nav link on scroll
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    let currentSection = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            currentSection = sectionId;
        }
    });

    // Update nav link
    if (currentSection && DOM.navLinks) {
        const correspondingLink = document.querySelector(`.nav-link[href="#${currentSection}"]`);
        if (correspondingLink) {
            setActiveNavLink(correspondingLink);
        }
    }
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format risk level
function formatRiskLevel(risk) {
    const riskMap = {
        'low': 'Low',
        'moderate': 'Moderate',
        'high': 'High',
        'hazardous': 'Hazardous'
    };
    return riskMap[risk] || risk;
}

// Format transport mode
function formatTransportMode(mode) {
    const modeMap = {
        'walking': 'Walking',
        'cycling': 'Cycling',
        'car_window': 'Car (Windows)',
        'car_ac': 'Car (AC)',
        'bus': 'Bus',
        'motorcycle': 'Motorcycle'
    };
    return modeMap[mode] || mode;
}

// Format health status
function formatHealthStatus(status) {
    const condition = Config.healthConditions.find(c => c.value === status);
    return condition ? condition.label : status;
}

// Animate results
function animateResults() {
    // Add pulse animation to all route cards
    document.querySelectorAll('.route-card').forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('highlight');
            setTimeout(() => card.classList.remove('highlight'), 1000);
        }, index * 200);
    });

    // Animate stats
    document.querySelectorAll('.stat-card').forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('pulse');
            setTimeout(() => card.classList.remove('pulse'), 500);
        }, index * 300);
    });
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Add global functions for HTML event handlers
window.viewRouteDetails = viewRouteDetails;
window.compareRoute = compareRoute;
window.deleteRoute = deleteRoute;


