import React from 'react';

const DarkModeToggle = ({ darkMode, toggleDarkMode }) => {
  return (
    <button className="dark-mode-toggle" onClick={toggleDarkMode}>
      <div className={`toggle-switch ${darkMode ? 'dark' : 'light'}`}>
        <div className="toggle-knob"></div>
      </div>
      <span className="toggle-label">
        {darkMode ? '🌙 Dark' : '☀️ Light'}
      </span>
    </button>
  );
};

export default DarkModeToggle;