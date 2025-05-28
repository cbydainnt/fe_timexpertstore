// src/components/common/LoadingSpinner.jsx

import React from 'react';
import { Spinner } from 'react-bootstrap'; // Import Spinner component

/**
 * Component hiển thị chỉ báo loading (spinner).
 *
 * @param {object} props - Props của component.
 * @param {boolean} [props.small=false] - Nếu true, hiển thị spinner kích thước nhỏ hơn (sm).
 * @param {string} [props.text='Loading...'] - Văn bản hiển thị bên cạnh spinner (hoặc bên trong visually-hidden).
 * @param {string} [props.className] - Các class CSS tùy chỉnh thêm vào container.
 */
function LoadingSpinner({ small = false, text = 'Loading...', className = '' }) {
  return (
    // Sử dụng d-flex và justify-content-center để căn giữa spinner
    // Thêm class tùy chỉnh nếu được truyền vào
    <div className={`d-flex justify-content-center align-items-center p-3 ${className}`}>
      <Spinner
        animation="border"
        role="status"
        size={small ? 'sm' : undefined} // Dùng size 'sm' nếu prop small là true
        variant="primary" // Màu của spinner (có thể là primary, secondary, success,...)
      >
        {/* Văn bản này chỉ hiển thị cho trình đọc màn hình */}
        <span className="visually-hidden">{text}</span>
      </Spinner>
      {/* Có thể hiển thị text bên cạnh spinner nếu muốn */}
      {/* {!small && <span className="ms-2 text-muted">{text}</span>} */}
    </div>
  );
}

export default LoadingSpinner;