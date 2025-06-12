import apiClient from '../config/axiosConfig';

/**
 * Lấy các đánh giá hiển thị cho một sản phẩm (có phân trang).
 * @param {number|string} productId ID của sản phẩm.
 * @param {object} params Tham số phân trang (page, size).
 * @returns {Promise<object>} Page<ProductReviewDTO>.
 */
export const getVisibleProductReviews = (productId, params) => {
  // Endpoint này đã được tạo trong ProductReviewController: GET /api/reviews/products/{productId}
  return apiClient.get(`/reviews/products/${productId}`, { params });
};

/**
 * Gửi một đánh giá mới.
 * Yêu cầu người dùng đã đăng nhập.
 * @param {object} reviewData Dữ liệu đánh giá { productId, rating, comment }.
 * @returns {Promise<object>} ProductReviewDTO.
 */
export const submitProductReview = (reviewData) => {
  // Endpoint này đã được tạo trong ProductReviewController: POST /api/reviews
  return apiClient.post('/reviews', reviewData);
};


/**
 * [ADMIN] Lấy tất cả đánh giá (có phân trang và sắp xếp).
 * @param {object} params - { page, size, sortBy, sortDir }
 * @returns {Promise<object>} Page<ProductReviewDTO>
 */
export const getAllReviewsAdmin = (params) => {
  return apiClient.get('reviews/admin/reviews', { params });
};

export const getAllReviewsByProductIdForAdmin = (productId, params) => {
  // API endpoint này đã được tạo trong ProductReviewController: GET /api/admin/products/{productId}/reviews
  return apiClient.get(`reviews/admin/products/${productId}/reviews`, { params }); 
};

/**
 * [ADMIN] Thay đổi trạng thái hiển thị của một đánh giá.
 * @param {number|string} reviewId ID của đánh giá.
 * @param {boolean} isVisible Trạng thái mới.
 * @returns {Promise<object>} ProductReviewDTO đã cập nhật.
 */
export const setReviewVisibilityAdmin = (reviewId, isVisible) => {
  return apiClient.put(`/reviews/admin/reviews/visibility/${reviewId}`, null, { params: { isVisible } });
};

/**
 * [ADMIN] Xóa một đánh giá.
 * @param {number|string} reviewId ID của đánh giá.
 * @returns {Promise<void>}
 */
export const deleteReviewAdmin = (reviewId) => {
  return apiClient.delete(`/admin/reviews/${reviewId}`);
};