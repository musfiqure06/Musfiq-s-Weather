import React from 'react';

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader-wrapper">
        <div className="loader"></div>
        <p className="loading-text">Fetching weather data...</p>
      </div>
    </div>
  );
};

export default Loader;