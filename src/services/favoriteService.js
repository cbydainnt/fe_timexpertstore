import apiClient from '../config/axiosConfig'; // Import apiClient đã cấu hình

/**
 * Lấy danh sách các sản phẩm yêu thích của người dùng đang đăng nhập.
 * Yêu cầu JWT token hợp lệ.
 * @returns {Promise<object>} Promise chứa response từ API (List<FavoriteDTO>).
 */
export const getMyFavorites = () => {
  // API endpoint này lấy danh sách yêu thích của user đang đăng nhập (dựa vào token)
  // Backend controller: @GetMapping trong FavoriteController (đã sửa để lấy userId từ Principal)
  return apiClient.get('/favorites');
};
/**
 * Lấy danh sách productId từ các sản phẩm yêu thích của người dùng.
 * @returns {Promise<number[]>}
 */
export const getFavoriteProductIds = async () => {
  const response = await apiClient.get('/favorites');
  return response.data.map(fav => fav.product.productId);
};

/**
 * Thêm một sản phẩm vào danh sách yêu thích của người dùng đang đăng nhập.
 * Yêu cầu JWT token hợp lệ.
 * @param {number|string} productId - ID của sản phẩm cần thêm vào yêu thích.
 * @returns {Promise<object>} Promise chứa response từ API (FavoriteDTO của bản ghi vừa tạo).
 */
export const addFavorite = (productId) => {
  // Backend controller: @PostMapping trong FavoriteController (đã sửa để lấy userId từ Principal)
  // Gửi productId dưới dạng query parameter
  return apiClient.post('/favorites', null, { params: { productId } });
};

/**
 * Xóa một bản ghi yêu thích bằng ID của chính bản ghi đó.
 * Yêu cầu JWT token hợp lệ và người dùng phải sở hữu bản ghi yêu thích này.
 * @param {number|string} favoriteId - ID của bản ghi 'favorite' cần xóa.
 * @returns {Promise<object>} Promise chứa response từ API (thường là response trống với status 204).
 */
export const removeFavoriteById = (favoriteId) => {
  // Backend controller: @DeleteMapping("/{favoriteId}") trong FavoriteController
  return apiClient.delete(`/favorites/${favoriteId}`);
};

/**
 * Xóa một sản phẩm khỏi danh sách yêu thích dựa trên ID của sản phẩm đó.
 * Yêu cầu JWT token hợp lệ.
 * @param {number|string} productId - ID của sản phẩm cần xóa khỏi danh sách yêu thích.
 * @returns {Promise<object>} Promise chứa response từ API (thường là response trống với status 204).
 */
export const removeFavoriteByProductId = (productId) => {
    // Backend controller: @DeleteMapping("/product/{productId}") trong FavoriteController
    return apiClient.delete(`/favorites/product/${productId}`);
};