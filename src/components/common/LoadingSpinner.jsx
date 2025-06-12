import React from 'react';
import { Spinner } from 'react-bootstrap'; // Import Spinner component

function LoadingSpinner({ small = false, text = 'Loading...', className = '' }) {
  return (
    <div className={`d-flex justify-content-center align-items-center p-3 ${className}`}>
      <Spinner
        animation="border"
        role="status"
        size={small ? 'sm' : undefined} // Dùng size 'sm' nếu prop small là true
        variant="primary" // Màu của spinner (có thể là primary, secondary, success,...)
      >
        <span className="visually-hidden">{text}</span>
      </Spinner>
    </div>
  );
}

export default LoadingSpinner;