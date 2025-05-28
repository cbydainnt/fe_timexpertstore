// src/components/auth/ProtectedRoute.jsx

import React from 'react';
// Navigate: Component để thực hiện chuyển hướng
// Outlet: Component để render các route con được định nghĩa bên trong route cha sử dụng ProtectedRoute
// useLocation (Tùy chọn): Hook để lấy thông tin về vị trí hiện tại, dùng để lưu lại trang người dùng muốn vào trước khi bị chuyển hướng đến login
import { Navigate, Outlet, useLocation } from 'react-router-dom';
// Import store Zustand để kiểm tra trạng thái đăng nhập
import { useAuthStore } from '../../store/authStore';

/**
 * Component Route bảo vệ:
 * - Nếu người dùng đã đăng nhập (isAuthenticated = true), cho phép truy cập vào các route con (render <Outlet />).
 * - Nếu người dùng chưa đăng nhập, chuyển hướng họ đến trang đăng nhập ('/login').
 * - (Tùy chọn) Lưu lại đường dẫn mà người dùng đang cố gắng truy cập để có thể quay lại sau khi đăng nhập thành công.
 */
const ProtectedRoute = ({ children }) => {
  // Lấy trạng thái isAuthenticated từ authStore
  const { isAuthenticated } = useAuthStore();
  // Lấy thông tin vị trí hiện tại (tùy chọn)
  const location = useLocation();

  // Kiểm tra nếu chưa đăng nhập
  if (!isAuthenticated) {
    // Chuyển hướng đến trang /login
    // replace: Thay thế entry hiện tại trong history, để nút back của trình duyệt không quay lại trang bị chặn
    // state: Truyền vị trí hiện tại (location) đến trang Login, để trang Login biết cần redirect về đâu sau khi thành công
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập, render nội dung được bọc bên trong ProtectedRoute
  // Nếu dùng <ProtectedRoute><ChildComponent /></ProtectedRoute>, children sẽ là ChildComponent
  // Nếu dùng trong <Route element={<ProtectedRoute />}> <Route path="child" element={<Child />} /> </Route>, <Outlet /> sẽ render <Child />
  return children ? children : <Outlet />;
};

export default ProtectedRoute;