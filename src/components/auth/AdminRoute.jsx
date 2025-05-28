// src/components/auth/AdminRoute.jsx

import React from 'react';
// Navigate: Dùng để chuyển hướng
// Outlet: Dùng để render các route con nếu điều kiện thỏa mãn
import { Navigate, Outlet } from 'react-router-dom';
// Import store Zustand để lấy thông tin user và trạng thái đăng nhập
import { useAuthStore } from '../../store/authStore';

/**
 * Component Route bảo vệ cho Admin:
 * - Kiểm tra xem người dùng đã đăng nhập chưa (isAuthenticated).
 * - Kiểm tra xem người dùng có vai trò (role) là 'ADMIN' không.
 * - Nếu cả hai điều kiện đều đúng, cho phép truy cập (render <Outlet />).
 * - Nếu chưa đăng nhập, chuyển hướng về trang Login ('/login').
 * - Nếu đã đăng nhập nhưng không phải Admin, chuyển hướng về trang chủ ('/') hoặc trang báo lỗi không có quyền ('/unauthorized').
 */
const AdminRoute = ({ children }) => {
  // Lấy trạng thái và thông tin user từ store
  const { isAuthenticated, user } = useAuthStore();

  // 1. Kiểm tra đã đăng nhập chưa
  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, chuyển hướng về trang login
    // Lưu lại trang admin họ muốn vào để có thể quay lại sau khi login (tùy chọn)
    return <Navigate to="/login" replace />;
    // return <Navigate to="/login" state={{ from: location }} replace />; // Nếu muốn lưu location
  }

  // 2. Kiểm tra có phải là Admin không
  // Đảm bảo rằng thuộc tính `role` trong đối tượng `user` từ store khớp với giá trị 'ADMIN' từ backend
  if (user?.role !== 'ADMIN') {
    // Nếu không phải Admin, chuyển hướng về trang chủ (hoặc trang lỗi 403)
    // Người dùng không có quyền truy cập khu vực này
    console.warn("Access denied: User is not an ADMIN.");
    return <Navigate to="/" replace />; // Chuyển về trang chủ
    // Hoặc return <Navigate to="/unauthorized" replace />; // Nếu có trang báo lỗi riêng
  }

  // 3. Nếu đã đăng nhập và là Admin -> Cho phép truy cập
  // Render các thành phần con (Outlet hoặc children)
  return children ? children : <Outlet />;
};

export default AdminRoute;