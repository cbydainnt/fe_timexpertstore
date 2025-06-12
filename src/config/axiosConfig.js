import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Tạo một instance Axios với cấu hình cơ bản
const apiClient = axios.create({
  // Nếu VITE_API_URL không có /api thì mặc định bạn đặt luôn base là http://localhost:8080/api
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---- Request Interceptor ----
// Tự động thêm token Authorization vào header cho mỗi request
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response Interceptor ----
// Bắt lỗi 401 để tự động logout và redirect về login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401) {
      console.error("Unauthorized (401):", error.response.data);
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(new Error("Phiên đã hết hạn. Vui lòng đăng nhập lại."));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
