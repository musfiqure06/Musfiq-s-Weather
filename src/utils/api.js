import axios from 'axios';

const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEOCODING_API = 'https://api.openweathermap.org/geo/1.0';

const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;

// Cache implementation
const cache = {
    weather: new Map(),
    geocoding: new Map(),
    expiry: new Map()
};

const isCacheValid = (key) => {
    const expiry = cache.expiry.get(key);
    return expiry && Date.now() < expiry;
};

const setCache = (key, data, ttl = 5 * 60 * 1000) => {
    cache.weather.set(key, data);
    cache.expiry.set(key, Date.now() + ttl);
};

export const fetchWeatherData = async(lat, lon) => {
    const cacheKey = `weather_${lat}_${lon}`;

    if (isCacheValid(cacheKey)) {
        return cache.weather.get(cacheKey);
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/weather`, {
            params: {
                lat,
                lon,
                appid: API_KEY,
                units: 'metric',
                lang: 'en'
            }
        });

        const data = response.data;
        setCache(cacheKey, data);
        return data;
    } catch (error) {
        if (error.response ? .status === 401) {
            throw new Error('Invalid API key. Please check your configuration.');
        } else if (error.response ? .status === 429) {
            throw new Error('API limit exceeded. Please try again later.');
        } else if (error.response ? .status === 404) {
            throw new Error('Location not found. Please try another location.');
        } else {
            throw new Error('Failed to fetch weather data. Please check your connection.');
        }
    }
};

export const fetchReverseGeocoding = async(lat, lon) => {
    const cacheKey = `reverse_${lat}_${lon}`;

    if (isCacheValid(cacheKey)) {
        return cache.geocoding.get(cacheKey);
    }

    try {
        const response = await axios.get(`${GEOCODING_API}/reverse`, {
            params: {
                lat,
                lon,
                appid: API_KEY,
                limit: 1
            }
        });

        if (response.data.length > 0) {
            const location = response.data[0];
            const name = location.name || location.local_names ? .en || '';
            const country = location.country || '';
            const result = name ? `${name}, ${country}` : `${lat.toFixed(2)}, ${lon.toFixed(2)}`;

            cache.geocoding.set(cacheKey, result);
            cache.expiry.set(cacheKey, Date.now() + 30 * 60 * 1000); // 30 minutes

            return result;
        }
        return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    } catch (error) {
        return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    }
};

export const getWeatherAnimation = (weatherCondition, timeOfDay) => {
    const animations = {
        Clear: timeOfDay === 'night' ?
            { background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' } :
            { background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },

        Clouds: { background: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)' },

        Rain: {
            background: 'linear-gradient(135deg, #4ca1af 0%, #2c3e50 100%)',
            position: 'relative',
            overflow: 'hidden'
        },

        Drizzle: { background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' },

        Thunderstorm: {
            background: 'linear-gradient(135deg, #2c3e50 0%, #4a235a 100%)',
            animation: 'lightning 3s infinite'
        },

        Snow: { background: 'linear-gradient(135deg, #e6dada 0%, #274046 100%)' },

        Mist: { background: 'linear-gradient(135deg, #636e72 0%, #b2bec3 100%)' },

        Smoke: { background: 'linear-gradient(135deg, #636e72 0%, #2d3436 100%)' },

        Haze: { background: 'linear-gradient(135deg, #fdbb2d 0%, #3a1c71 100%)' },

        Dust: { background: 'linear-gradient(135deg, #B79891 0%, #94716B 100%)' },

        Fog: { background: 'linear-gradient(135deg, #D7D2CC 0%, #304352 100%)' },

        Sand: { background: 'linear-gradient(135deg, #C6FFDD 0%, #FBD786 50%, #f7797d 100%)' },

        Ash: { background: 'linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)' },

        Squall: { background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },

        Tornado: { background: 'linear-gradient(135deg, #834d9b 0%, #d04ed6 100%)' }
    };

    return animations[weatherCondition] || animations.Clear;
};