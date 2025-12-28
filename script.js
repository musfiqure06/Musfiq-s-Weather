// Main App Controller
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initApp();
});

// App State
const AppState = {
    currentLocation: {
        name: 'Dhaka',
        lat: 23.8103,
        lon: 90.4125
    },
    temperatureUnit: 'celsius',
    locations: [], // Will be populated from bangladesh-locations.js
    weatherData: null,
    forecastData: null,
    lastUpdate: null,
    updateInterval: null,
    isUpdating: false
};

// DOM Elements
const DOM = {
    locationSearch: document.getElementById('location-search'),
    searchDropdown: document.getElementById('search-dropdown'),
    currentLocation: document.getElementById('current-location'),
    currentTemp: document.getElementById('current-temp'),
    weatherIcon: document.getElementById('weather-icon'),
    conditionText: document.getElementById('condition-text'),
    windSpeed: document.getElementById('wind-speed'),
    humidity: document.getElementById('humidity'),
    feelsLike: document.getElementById('feels-like'),
    currentTime: document.getElementById('current-time'),
    lastUpdate: document.getElementById('last-update'),
    popularLocations: document.getElementById('popular-locations'),
    forecastContainer: document.getElementById('forecast-container'),
    refreshBtn: document.getElementById('refresh-btn'),
    loadingOverlay: document.getElementById('loading-overlay'),
    unitButtons: document.querySelectorAll('.unit-btn')
};

// Initialize the app
async function initApp() {
    console.log('Initializing Musfiqs Weather App...');

    // Create particles for background
    createParticles();

    // Set up event listeners
    setupEventListeners();

    // Load popular locations
    loadPopularLocations();

    // Set initial time
    updateTime();

    // Set up auto time update
    setInterval(updateTime, 1000);

    // Load weather for default location (Dhaka)
    await loadWeatherData(AppState.currentLocation.lat, AppState.currentLocation.lon);

    // Start auto-update interval (5 minutes)
    AppState.updateInterval = setInterval(async() => {
        await loadWeatherData(AppState.currentLocation.lat, AppState.currentLocation.lon);
    }, 5 * 60 * 1000);
}

// Create animated particles in background
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;

        // Random size
        const size = Math.random() * 4 + 1;

        // Random color
        const colors = ['#0ff0fc', '#ff00ff', '#00ff9d'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Random animation delay
        const delay = Math.random() * 20;

        // Apply styles
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = color;
        particle.style.animationDelay = `${delay}s`;

        particlesContainer.appendChild(particle);
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Search input
    DOM.locationSearch.addEventListener('input', handleSearchInput);

    // Refresh button
    DOM.refreshBtn.addEventListener('click', handleRefresh);

    // Unit toggle buttons
    DOM.unitButtons.forEach(button => {
        button.addEventListener('click', handleUnitToggle);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!DOM.locationSearch.contains(e.target) && !DOM.searchDropdown.contains(e.target)) {
            DOM.searchDropdown.style.display = 'none';
        }
    });
}

// Handle search input
function handleSearchInput(e) {
    const query = e.target.value.toLowerCase().trim();

    if (query.length < 2) {
        DOM.searchDropdown.style.display = 'none';
        return;
    }

    // Filter locations based on query
    const filteredLocations = bangladeshLocations.filter(location =>
        location.name.toLowerCase().includes(query) ||
        location.district.toLowerCase().includes(query) ||
        location.upazila.toLowerCase().includes(query)
    ).slice(0, 10); // Limit to 10 results

    // Populate dropdown
    populateSearchDropdown(filteredLocations);

    // Show dropdown
    DOM.searchDropdown.style.display = 'block';
}

// Populate search dropdown with results
function populateSearchDropdown(locations) {
    DOM.searchDropdown.innerHTML = '';

    if (locations.length === 0) {
        DOM.searchDropdown.innerHTML = `
            <div class="dropdown-item">
                <i class="fas fa-exclamation-circle"></i>
                <span>No locations found</span>
            </div>
        `;
        return;
    }

    locations.forEach(location => {
        const item = document.createElement('div');
        item.classList.add('dropdown-item');

        let locationText = location.name;
        if (location.district) {
            locationText += `, ${location.district}`;
        }
        if (location.upazila && location.upazila !== location.name) {
            locationText += `, ${location.upazila}`;
        }

        item.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            <span>${locationText}</span>
        `;

        item.addEventListener('click', () => {
            DOM.locationSearch.value = locationText;
            DOM.searchDropdown.style.display = 'none';

            // Update current location
            AppState.currentLocation = {
                name: locationText,
                lat: location.lat,
                lon: location.lon
            };

            // Load weather for new location
            loadWeatherData(location.lat, location.lon);
        });

        DOM.searchDropdown.appendChild(item);
    });
}

// Handle refresh button click
async function handleRefresh() {
    // Add rotation animation to refresh icon
    const icon = DOM.refreshBtn.querySelector('i');
    icon.style.transform = 'rotate(360deg)';

    // Reset rotation after animation
    setTimeout(() => {
        icon.style.transform = 'rotate(0deg)';
    }, 300);

    // Load weather data
    await loadWeatherData(AppState.currentLocation.lat, AppState.currentLocation.lon);
}

// Handle unit toggle
function handleUnitToggle(e) {
    const unit = e.target.dataset.unit;

    // Update active button
    DOM.unitButtons.forEach(button => {
        if (button.dataset.unit === unit) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    // Update app state
    AppState.temperatureUnit = unit;

    // Update temperature display if we have data
    if (AppState.weatherData) {
        updateWeatherDisplay();
    }
}

// Load popular locations
function loadPopularLocations() {
    const popularLocations = [
        { name: 'Dhaka', lat: 23.8103, lon: 90.4125 },
        { name: 'Chittagong', lat: 22.3569, lon: 91.7832 },
        { name: 'Sylhet', lat: 24.8949, lon: 91.8687 },
        { name: 'Khulna', lat: 22.8456, lon: 89.5403 },
        { name: 'Rajshahi', lat: 24.3745, lon: 88.6042 }
    ];

    DOM.popularLocations.innerHTML = '';

    popularLocations.forEach(async(location, index) => {
        // Create location element
        const locationEl = document.createElement('div');
        locationEl.classList.add('popular-location');

        // Set loading text initially
        locationEl.innerHTML = `
            <div class="location-name">${location.name}</div>
            <div class="location-temp">--°</div>
        `;

        DOM.popularLocations.appendChild(locationEl);

        // Add click event
        locationEl.addEventListener('click', () => {
            AppState.currentLocation = location;
            loadWeatherData(location.lat, location.lon);
        });

        // Load temperature for this location
        try {
            const temp = await fetchTemperature(location.lat, location.lon);
            const tempEl = locationEl.querySelector('.location-temp');
            tempEl.textContent = `${Math.round(temp)}°`;
        } catch (error) {
            console.error(`Failed to load temperature for ${location.name}:`, error);
        }
    });
}

// Fetch temperature for a location
async function fetchTemperature(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.current.temperature_2m;
    } catch (error) {
        throw error;
    }
}

// Load weather data from Open-Meteo API
async function loadWeatherData(lat, lon) {
    // Show loading overlay
    showLoading(true);

    // Set updating flag
    AppState.isUpdating = true;

    try {
        // Fetch current weather and forecast
        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code`),
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`)
        ]);

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        // Update app state
        AppState.weatherData = weatherData;
        AppState.forecastData = forecastData;
        AppState.lastUpdate = new Date();

        // Update display
        updateWeatherDisplay();
        updateForecastDisplay();
        updateBackgroundAnimation(weatherData.current.weather_code);

        // Update last update time
        const timeString = AppState.lastUpdate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        DOM.lastUpdate.textContent = timeString;

        // Update location name
        DOM.currentLocation.textContent = AppState.currentLocation.name;

        console.log('Weather data loaded successfully');
    } catch (error) {
        console.error('Failed to load weather data:', error);

        // Show error in UI
        DOM.currentTemp.textContent = '--';
        DOM.conditionText.textContent = 'Error loading data';
        DOM.windSpeed.textContent = '--';
        DOM.humidity.textContent = '--';
        DOM.feelsLike.textContent = '--';

        // Show error in console
        alert('Failed to load weather data. Please check your connection and try again.');
    } finally {
        // Hide loading overlay
        showLoading(false);

        // Reset updating flag
        AppState.isUpdating = false;
    }
}

// Update weather display with current data
function updateWeatherDisplay() {
    if (!AppState.weatherData) return;

    const current = AppState.weatherData.current;

    // Convert temperature based on selected unit
    let temp = current.temperature_2m;
    let feelsLikeTemp = current.apparent_temperature;

    if (AppState.temperatureUnit === 'fahrenheit') {
        temp = (temp * 9 / 5) + 32;
        feelsLikeTemp = (feelsLikeTemp * 9 / 5) + 32;
    }

    // Update temperature display
    DOM.currentTemp.textContent = Math.round(temp);

    // Update unit in temperature display
    const tempUnit = document.querySelector('.temp-unit');
    tempUnit.textContent = AppState.temperatureUnit === 'celsius' ? '°C' : '°F';

    // Update weather condition
    const weatherInfo = getWeatherInfo(current.weather_code);
    DOM.conditionText.textContent = weatherInfo.condition;

    // Update weather icon
    DOM.weatherIcon.innerHTML = `<i class="${weatherInfo.icon}"></i>`;

    // Update other details
    DOM.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    DOM.humidity.textContent = `${Math.round(current.relative_humidity_2m)}%`;
    DOM.feelsLike.textContent = `${Math.round(feelsLikeTemp)}°`;
}

// Update forecast display
function updateForecastDisplay() {
    if (!AppState.forecastData) return;

    const forecast = AppState.forecastData.daily;
    DOM.forecastContainer.innerHTML = '';

    // Day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Create forecast for next 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date(forecast.time[i]);
        const dayName = dayNames[date.getDay()];

        // Convert temperature based on selected unit
        let maxTemp = forecast.temperature_2m_max[i];
        if (AppState.temperatureUnit === 'fahrenheit') {
            maxTemp = (maxTemp * 9 / 5) + 32;
        }

        const weatherInfo = getWeatherInfo(forecast.weather_code[i]);

        const forecastDay = document.createElement('div');
        forecastDay.classList.add('forecast-day');

        forecastDay.innerHTML = `
            <div class="day-name">${i === 0 ? 'Today' : dayName}</div>
            <div class="forecast-icon"><i class="${weatherInfo.icon}"></i></div>
            <div class="forecast-temp">${Math.round(maxTemp)}°</div>
        `;

        DOM.forecastContainer.appendChild(forecastDay);
    }
}

// Update time display
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    DOM.currentTime.textContent = timeString;
}

// Get weather info from WMO weather code
function getWeatherInfo(weatherCode) {
    // WMO Weather interpretation codes (WW)
    const weatherCodes = {
        0: { condition: 'Clear sky', icon: 'fas fa-sun' },
        1: { condition: 'Mainly clear', icon: 'fas fa-cloud-sun' },
        2: { condition: 'Partly cloudy', icon: 'fas fa-cloud' },
        3: { condition: 'Overcast', icon: 'fas fa-cloud' },
        45: { condition: 'Foggy', icon: 'fas fa-smog' },
        48: { condition: 'Depositing rime fog', icon: 'fas fa-smog' },
        51: { condition: 'Light drizzle', icon: 'fas fa-cloud-rain' },
        53: { condition: 'Moderate drizzle', icon: 'fas fa-cloud-rain' },
        55: { condition: 'Dense drizzle', icon: 'fas fa-cloud-rain' },
        56: { condition: 'Light freezing drizzle', icon: 'fas fa-cloud-rain' },
        57: { condition: 'Dense freezing drizzle', icon: 'fas fa-cloud-rain' },
        61: { condition: 'Slight rain', icon: 'fas fa-cloud-rain' },
        63: { condition: 'Moderate rain', icon: 'fas fa-cloud-rain' },
        65: { condition: 'Heavy rain', icon: 'fas fa-cloud-showers-heavy' },
        66: { condition: 'Light freezing rain', icon: 'fas fa-cloud-rain' },
        67: { condition: 'Heavy freezing rain', icon: 'fas fa-cloud-rain' },
        71: { condition: 'Slight snow fall', icon: 'fas fa-snowflake' },
        73: { condition: 'Moderate snow fall', icon: 'fas fa-snowflake' },
        75: { condition: 'Heavy snow fall', icon: 'fas fa-snowflake' },
        77: { condition: 'Snow grains', icon: 'fas fa-snowflake' },
        80: { condition: 'Slight rain showers', icon: 'fas fa-cloud-showers-heavy' },
        81: { condition: 'Moderate rain showers', icon: 'fas fa-cloud-showers-heavy' },
        82: { condition: 'Violent rain showers', icon: 'fas fa-cloud-showers-heavy' },
        85: { condition: 'Slight snow showers', icon: 'fas fa-snowflake' },
        86: { condition: 'Heavy snow showers', icon: 'fas fa-snowflake' },
        95: { condition: 'Thunderstorm', icon: 'fas fa-bolt' },
        96: { condition: 'Thunderstorm with hail', icon: 'fas fa-bolt' },
        99: { condition: 'Heavy thunderstorm with hail', icon: 'fas fa-bolt' }
    };

    return weatherCodes[weatherCode] || { condition: 'Unknown', icon: 'fas fa-question' };
}

// Update background animation based on weather
function updateBackgroundAnimation(weatherCode) {
    const animationContainer = document.getElementById('weather-animation');
    animationContainer.innerHTML = '';

    // Clear any existing animations
    animationContainer.className = 'weather-animation';

    // Add class based on weather
    if (weatherCode === 0 || weatherCode === 1) {
        animationContainer.classList.add('sunny');
        createSunAnimation(animationContainer);
    } else if (weatherCode >= 51 && weatherCode <= 67 || weatherCode >= 80 && weatherCode <= 82) {
        animationContainer.classList.add('rainy');
        createRainAnimation(animationContainer);
    } else if (weatherCode >= 71 && weatherCode <= 77 || weatherCode >= 85 && weatherCode <= 86) {
        animationContainer.classList.add('snowy');
        createSnowAnimation(animationContainer);
    } else if (weatherCode >= 95 && weatherCode <= 99) {
        animationContainer.classList.add('stormy');
        createStormAnimation(animationContainer);
    } else {
        animationContainer.classList.add('cloudy');
        createCloudAnimation(animationContainer);
    }
}

// Create sun animation
function createSunAnimation(container) {
    // Create sun
    const sun = document.createElement('div');
    sun.classList.add('sun');
    sun.style.cssText = `
        position: absolute;
        top: 20%;
        right: 15%;
        width: 80px;
        height: 80px;
        background: radial-gradient(circle, #ffcc00, #ff9900);
        border-radius: 50%;
        box-shadow: 0 0 40px #ff9900, 0 0 80px #ff9900;
        z-index: 1;
    `;
    container.appendChild(sun);

    // Create sun rays
    for (let i = 0; i < 12; i++) {
        const ray = document.createElement('div');
        ray.classList.add('sun-ray');
        ray.style.cssText = `
            position: absolute;
            top: 20%;
            right: 15%;
            width: 4px;
            height: 120px;
            background: linear-gradient(to bottom, rgba(255, 204, 0, 0.8), rgba(255, 153, 0, 0));
            border-radius: 2px;
            transform-origin: center 40px;
            transform: translate(-50%, -50%) rotate(${i * 30}deg);
            z-index: 0;
        `;
        container.appendChild(ray);
    }
}

// Create rain animation
function createRainAnimation(container) {
    for (let i = 0; i < 50; i++) {
        const raindrop = document.createElement('div');
        raindrop.classList.add('raindrop');

        // Random properties
        const left = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = 0.5 + Math.random() * 0.5;
        const height = 10 + Math.random() * 20;

        raindrop.style.cssText = `
            position: absolute;
            left: ${left}%;
            top: -20px;
            width: 2px;
            height: ${height}px;
            background: linear-gradient(to bottom, rgba(0, 150, 255, 0.8), rgba(0, 150, 255, 0.2));
            border-radius: 1px;
            animation: fall ${duration}s linear ${delay}s infinite;
            z-index: 1;
        `;

        container.appendChild(raindrop);
    }

    // Add CSS for fall animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            0% {
                transform: translateY(0);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(100vh);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Create snow animation
function createSnowAnimation(container) {
    for (let i = 0; i < 30; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');

        // Random properties
        const left = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = 3 + Math.random() * 5;
        const size = 5 + Math.random() * 10;

        snowflake.style.cssText = `
            position: absolute;
            left: ${left}%;
            top: -20px;
            width: ${size}px;
            height: ${size}px;
            background: white;
            border-radius: 50%;
            opacity: 0.8;
            filter: blur(1px);
            animation: snowfall ${duration}s linear ${delay}s infinite;
            z-index: 1;
        `;

        container.appendChild(snowflake);
    }

    // Add CSS for snowfall animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes snowfall {
            0% {
                transform: translateY(0) translateX(0);
                opacity: 0;
            }
            10% {
                opacity: 0.8;
            }
            90% {
                opacity: 0.8;
            }
            100% {
                transform: translateY(100vh) translateX(${Math.random() * 100 - 50}px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Create cloud animation
function createCloudAnimation(container) {
    for (let i = 0; i < 5; i++) {
        const cloud = document.createElement('div');
        cloud.classList.add('cloud');

        // Random properties
        const left = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = 20 + Math.random() * 20;
        const size = 80 + Math.random() * 120;
        const opacity = 0.3 + Math.random() * 0.4;

        cloud.style.cssText = `
            position: absolute;
            left: ${left}%;
            top: ${20 + Math.random() * 60}%;
            width: ${size}px;
            height: ${size * 0.6}px;
            background: rgba(255, 255, 255, ${opacity});
            border-radius: 50%;
            filter: blur(10px);
            animation: floatCloud ${duration}s linear ${delay}s infinite;
            z-index: 1;
        `;

        container.appendChild(cloud);
    }

    // Add CSS for cloud animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatCloud {
            0% {
                transform: translateX(0);
            }
            100% {
                transform: translateX(100vw);
            }
        }
    `;
    document.head.appendChild(style);
}

// Create storm animation
function createStormAnimation(container) {
    // First create rain
    createRainAnimation(container);

    // Then add lightning flashes
    const flash = document.createElement('div');
    flash.classList.add('lightning-flash');
    flash.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        opacity: 0;
        pointer-events: none;
        z-index: 0;
    `;
    container.appendChild(flash);

    // Create random lightning flashes
    function flashLightning() {
        flash.style.opacity = '0.6';
        flash.style.transition = 'opacity 0.1s';

        setTimeout(() => {
            flash.style.opacity = '0';
        }, 100);

        setTimeout(() => {
            flash.style.opacity = '0.3';
            setTimeout(() => {
                flash.style.opacity = '0';
            }, 50);
        }, 200);

        // Schedule next flash
        const nextFlash = 3000 + Math.random() * 7000;
        setTimeout(flashLightning, nextFlash);
    }

    // Start lightning
    setTimeout(flashLightning, 2000);
}

// Show/hide loading overlay
function showLoading(show) {
    if (show) {
        DOM.loadingOverlay.classList.add('active');
    } else {
        DOM.loadingOverlay.classList.remove('active');
    }
}

// Global error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// Export for global access (for debugging)
window.AppState = AppState;
window.DOM = DOM;