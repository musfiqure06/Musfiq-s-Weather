export const formatTime = (timestamp, timezone) => {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toUTCString().split(' ')[4].slice(0, 5);
};

export const getWindDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
};

export const getTimeOfDay = (timezone) => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (timezone * 1000));
    const hours = localTime.getUTCHours();

    return hours >= 6 && hours < 18 ? 'day' : 'night';
};

export const getWeatherIcon = (main, description) => {
    const icons = {
        Clear: description.includes('night') ? 'wi:night-clear' : 'wi:day-sunny',
        Clouds: description.includes('few') ? 'wi:day-cloudy' : 'wi:cloudy',
        Rain: 'wi:rain',
        Drizzle: 'wi:sprinkle',
        Thunderstorm: 'wi:thunderstorm',
        Snow: 'wi:snow',
        Mist: 'wi:fog',
        Smoke: 'wi:smoke',
        Haze: 'wi:day-haze',
        Dust: 'wi:dust',
        Fog: 'wi:fog',
        Sand: 'wi:sandstorm',
        Ash: 'wi:volcano',
        Squall: 'wi:strong-wind',
        Tornado: 'wi:tornado'
    };

    return icons[main] || 'wi:day-sunny';
};

export const saveToLocalStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

export const loadFromLocalStorage = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
};

export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};