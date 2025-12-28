import React from 'react';
import { Icon } from '@iconify/react';
import { formatTime, getWeatherIcon, getWindDirection } from '../utils/helpers';

const WeatherCard = ({ data, darkMode }) => {
  const {
    name,
    sys,
    main,
    weather,
    wind,
    visibility,
    timezone
  } = data;

  const formatTemp = (temp) => `${Math.round(temp)}°C`;
  const formatSpeed = (speed) => `${Math.round(speed * 3.6)} km/h`;

  const weatherDetails = [
    {
      icon: 'wi:thermometer',
      label: 'Feels Like',
      value: formatTemp(main.feels_like)
    },
    {
      icon: 'wi:humidity',
      label: 'Humidity',
      value: `${main.humidity}%`
    },
    {
      icon: 'wi:barometer',
      label: 'Pressure',
      value: `${main.pressure} hPa`
    },
    {
      icon: 'wi:strong-wind',
      label: 'Wind Speed',
      value: formatSpeed(wind.speed)
    },
    {
      icon: 'wi:wind-direction',
      label: 'Wind Direction',
      value: getWindDirection(wind.deg)
    },
    {
      icon: 'wi:visibility',
      label: 'Visibility',
      value: `${(visibility / 1000).toFixed(1)} km`
    },
    {
      icon: 'wi:sunrise',
      label: 'Sunrise',
      value: formatTime(sys.sunrise, timezone)
    },
    {
      icon: 'wi:sunset',
      label: 'Sunset',
      value: formatTime(sys.sunset, timezone)
    }
  ];

  return (
    <div className="weather-card">
      <div className="weather-header">
        <div className="location">
          <h2>{name}, {sys.country}</h2>
          <p className="date-time">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="weather-icon-large">
          <Icon 
            icon={getWeatherIcon(weather[0].main, weather[0].description)} 
            width="80" 
            height="80"
          />
        </div>
      </div>

      <div className="temperature">
        <div className="temp-main">{formatTemp(main.temp)}</div>
        <p className="weather-condition">{weather[0].description}</p>
        <p className="feels-like">Feels like {formatTemp(main.feels_like)}</p>
      </div>

      <div className="weather-details">
        {weatherDetails.map((item, index) => (
          <div key={index} className="weather-item">
            <div className="weather-icon">
              <Icon icon={item.icon} width="24" height="24" />
            </div>
            <div className="weather-item-content">
              <h4>{item.label}</h4>
              <p>{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherCard;