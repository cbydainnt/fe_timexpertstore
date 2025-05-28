// src/services/cartService.js

import apiClient from '../config/axiosConfig'; // Import apiClient đã cấu hình

/**
 * Lấy giỏ hàng của người dùng đang đăng nhập.
 * Yêu cầu JWT token hợp lệ.
 * @returns {Promise<object>} Promise chứa response từ API (Đối tượng Cart).
 */
export const getMyCart = () => {
  // Backend sẽ tự xác định userId dựa trên token JWT được gửi bởi apiClient
  return apiClient.get('/carts');
};

/**
 * Thêm một sản phẩm vào giỏ hàng của người dùng đang đăng nhập.
 * Backend sẽ tự xử lý việc cộng dồn số lượng nếu sản phẩm đã có.
 * Yêu cầu JWT token hợp lệ.
 * @param {object} itemData - Dữ liệu item cần thêm.
 * @param {number} itemData.productId - ID của sản phẩm.
 * @param {number} itemData.quantity - Số lượng muốn thêm (phải > 0).
 * @returns {Promise<object>} Promise chứa response từ API (Đối tượng Cart đã cập nhật).
 */
export const addItemToCart = (itemData) => {
  // itemData = { productId, quantity }
  return apiClient.post('/carts/items', itemData);
};

/**
 * Cập nhật số lượng của một sản phẩm trong giỏ hàng.
 * Yêu cầu JWT token hợp lệ.
 * @param {number|string} productId - ID của sản phẩm cần cập nhật.
 * @param {number} quantity - Số lượng mới (phải > 0).
 * @returns {Promise<object>} Promise chứa response từ API (Đối tượng Cart đã cập nhật).
 */
export const updateCartItemQuantity = (productId, quantity) => {
  // Gửi số lượng mới dưới dạng query parameter
  return apiClient.put(`/carts/items/${productId}`, null, { params: { quantity } });
};


export const removeItemFromCart = (productId) => {
  return apiClient.delete(`/carts/items/${productId}`);
};


/**
 * Xóa toàn bộ giỏ hàng của người dùng đang đăng nhập.
 * Yêu cầu JWT token hợp lệ.
 * @returns {Promise<object>} Promise chứa response từ API (thường là response trống với status 204).
 */
export const clearMyCart = () => {
  return apiClient.delete('/carts');
};

/**
 * [AUTH] Xóa nhiều sản phẩm cụ thể khỏi giỏ hàng theo danh sách ID.
 * Yêu cầu JWT token hợp lệ.
 * *** Backend cần có API tương ứng (ví dụ: DELETE /api/carts/items/batch) ***
 * @param {number[]} productIds - Mảng chứa các ID sản phẩm cần xóa.
 * @returns {Promise<object>} Promise chứa response từ API.
 */
export const removeItemsFromCart = (productIds) => {
  if (!productIds || productIds.length === 0) {
    return Promise.resolve(); // Không có gì để xóa
  }
  console.warn("Calling removeItemsFromCart. Ensure backend endpoint like '/api/carts/items/batch' exists and accepts a list of IDs.");
  // Ví dụ cách gửi List ID trong Request Body của DELETE (phổ biến)
  return apiClient.delete('/carts/items/batch', { data: { productIds } });
  // Hoặc nếu backend nhận qua query param (?ids=1,2,3):
  // return apiClient.delete('/carts/items/batch', { params: { ids: productIds.join(',') } });
};