import React from 'react';

const ErrorNotification = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="error-notification">
      <span className="error-message">{message}</span>
      <button className="error-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default ErrorNotification;