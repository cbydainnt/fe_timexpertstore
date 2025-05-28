// src/services/authService.js

import apiClient from '../config/axiosConfig'; // Import apiClient đã cấu hình

/**
 * Gửi yêu cầu đăng nhập đến backend.
 * @param {object} credentials - Đối tượng chứa username và password.
 * @param {string} credentials.username - Tên đăng nhập.
 * @param {string} credentials.password - Mật khẩu.
 * @returns {Promise<object>} Promise chứa response từ API (bao gồm token và user nếu thành công).
 */
export const loginUser = (credentials) => {
  // Gọi trực tiếp từ store hoặc gọi qua đây nếu cần xử lý thêm
  // Hàm login trong authStore đã bao gồm gọi API này và xử lý state
  return apiClient.post('/users/login', credentials);
};

/**
 * Gửi yêu cầu đăng ký tài khoản mới.
 * @param {object} userData - Dữ liệu đăng ký từ RegisterUserDTO (username, password, email,...)
 * @returns {Promise<object>} Promise chứa response từ API (thông tin UserDTO nếu thành công).
 */
export const registerUser = (userData) => {
  return apiClient.post('/users/register', userData);
};

/**
 * Gửi yêu cầu lấy lại mật khẩu (gửi OTP qua email).
 * @param {string} email - Địa chỉ email của người dùng.
 * @returns {Promise<object>} Promise chứa response từ API (thường là thông báo thành công).
 */
export const forgotPassword = (email) => {
  // Gửi email dưới dạng query parameter
  return apiClient.post('/password/forgot', null, { params: { email } });
};

/**
 * Gửi yêu cầu đặt lại mật khẩu bằng mã OTP.
 * @param {object} data - Dữ liệu từ OtpPasswordResetDTO.
 * @param {string} data.email - Email người dùng.
 * @param {string} data.otp - Mã OTP người dùng nhập.
 * @param {string} data.newPassword - Mật khẩu mới.
 * @returns {Promise<object>} Promise chứa response từ API (thường là thông báo thành công).
 */
export const resetPassword = (data) => {
  // data = { email, otp, newPassword }
  return apiClient.post('/password/reset-otp', data);
};

/**
 * Lấy thông tin hồ sơ (profile) của người dùng đang đăng nhập.
 * Yêu cầu JWT token hợp lệ trong header Authorization.
 * @returns {Promise<object>} Promise chứa response từ API (UserDTO).
 */
export const getUserProfile = () => {
   // apiClient sẽ tự động thêm token từ authStore
  return apiClient.get('/users/profile');
};

/**
 * Cập nhật thông tin hồ sơ (profile) của người dùng đang đăng nhập.
 * Yêu cầu JWT token hợp lệ.
 * @param {object} userData - Dữ liệu cập nhật từ UserDTO (chỉ các trường được phép sửa).
 * @returns {Promise<object>} Promise chứa response từ API (UserDTO đã cập nhật).
 */
export const updateUserProfile = (userData) => {
   // apiClient sẽ tự động thêm token
  return apiClient.put('/users/profile', userData);
};

/**
 * [AUTH] Gửi yêu cầu thay đổi mật khẩu cho người dùng đang đăng nhập.
 * Yêu cầu JWT token hợp lệ.
 * *** Backend cần có API tương ứng (ví dụ: PUT /api/users/profile/change-password) ***
 * @param {object} data - Dữ liệu đổi mật khẩu.
 * @param {string} data.currentPassword - Mật khẩu hiện tại.
 * @param {string} data.newPassword - Mật khẩu mới.
 * @returns {Promise<object>} Promise chứa response từ API (thường là thông báo thành công).
 */
export const changePassword = (data) => {
  // apiClient sẽ tự động thêm token
  // Giả sử API là PUT /api/users/profile/change-password
  return apiClient.put('/users/profile/change-password', data);
};

// Có thể thêm các hàm gọi API liên quan đến auth khác nếu cần