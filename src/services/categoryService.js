// src/services/categoryService.js

import apiClient from '../config/axiosConfig'; // Import apiClient đã cấu hình

/**
 * Lấy danh sách tất cả các danh mục.
 * API này thường là công khai.
 * @returns {Promise<object>} Promise chứa response từ API (List<CategoryDTO>).
 */
export const getAllCategories = () => {
  // Không cần token vì API này public (theo SecurityConfig)
  return apiClient.get('/categories');
};

/**
 * Lấy thông tin chi tiết của một danh mục bằng ID.
 * API này thường là công khai.
 * @param {number|string} id - ID của danh mục.
 * @returns {Promise<object>} Promise chứa response từ API (CategoryDTO).
 */
export const getCategoryById = (id) => {
  // Không cần token
  return apiClient.get(`/categories/${id}`);
};

export const getAllCategoriesAdmin = () => {
  // API: GET /api/admin/categories
  return apiClient.get('/categories/admin');
};

/**
 * [ADMIN] Tạo một danh mục mới.
 * Yêu cầu JWT token của Admin.
 * @param {object} categoryData - Dữ liệu danh mục mới (thường là { name: string, description?: string }).
 * @returns {Promise<object>} Promise chứa response từ API (CategoryDTO của danh mục đã tạo).
 */
export const createCategory = (categoryData) => {
  // apiClient sẽ tự động thêm token (cần token của Admin)
  return apiClient.post('/categories', categoryData);
};

/**
 * [ADMIN] Cập nhật thông tin một danh mục.
 * Yêu cầu JWT token của Admin.
 * @param {number|string} id - ID của danh mục cần cập nhật.
 * @param {object} categoryData - Dữ liệu cập nhật cho danh mục.
 * @returns {Promise<object>} Promise chứa response từ API (CategoryDTO của danh mục đã cập nhật).
 */
export const updateCategory = (id, categoryData) => {
  // apiClient sẽ tự động thêm token (cần token của Admin)
  return apiClient.put(`/categories/${id}`, categoryData);
};


/**
 * [ADMIN] Thay đổi trạng thái hiển thị (ẩn/hiện) của danh mục.
 */
export const toggleCategoryVisibilityAdmin = (id) => {
  // API: PUT /api/admin/categories/{id}/toggle-visibility (Backend CategoryController.toggleCategoryVisibility)
  return apiClient.put(`/categories/admin/toggle-visibility/${id}`);
};


/**
 * [ADMIN] Xóa một danh mục.
 * Yêu cầu JWT token của Admin.
 * Lưu ý: Backend có thể từ chối xóa nếu danh mục đang được sản phẩm sử dụng.
 * @param {number|string} id - ID của danh mục cần xóa.
 * @returns {Promise<object>} Promise chứa response từ API (thường là response trống với status 204).
 */
export const deleteCategory = (id) => {
  // apiClient sẽ tự động thêm token (cần token của Admin)
  return apiClient.delete(`/categories/${id}`);
};

