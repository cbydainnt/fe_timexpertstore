import apiClient from '../config/axiosConfig'; // Import apiClient đã cấu hình

/**
 * Tạo đơn hàng mới từ các item đã chọn (từ giỏ hàng hoặc trang khác).
 * Yêu cầu JWT token hợp lệ.
 * Backend sẽ nhận CreateOrderRequestDTO trong request body.
 * @param {object} orderPayload - Payload chứa paymentMethod và danh sách items { paymentMethod: '...', items: [{ productId: ..., quantity: ... }] }
 * @returns {Promise<object>} Promise chứa response từ API.
 * Response có thể chứa OrderDTO và paymentUrl (nếu là VN_PAY).
 */
export const createOrder = (orderPayload) => {
  console.log("Sending create order request with payload:", orderPayload);
  // Gửi payload chứa paymentMethod và items trong body của request POST
  return apiClient.post('/orders/create', orderPayload);
};

/**
 * Lấy tất cả đơn hàng của một người dùng theo userId.
 * Yêu cầu JWT token hợp lệ (kiểm tra quyền ở backend).
 * Lưu ý: Endpoint /orders/user/{userId} có thể dành cho Admin/Staff.
 * Endpoint /orders/me dành cho người dùng tự xem đơn hàng của mình.
 * @param {number|string} userId - ID của người dùng.
 * @param {object} params - Các tham số phân trang (page, size, etc.).
 * @returns {Promise<object>} Promise chứa response từ API (Page<OrderDTO>).
 */
export const findOrdersByUserId = (userId, params) => {
   // Endpoint này có thể cần quyền Admin/Staff tùy thuộc vào cấu hình backend
  return apiClient.get(`/orders/user/${userId}`, { params });
};


/**
 * Lấy thông tin chi tiết của một đơn hàng bằng ID.
 * Người dùng chỉ xem được đơn hàng của mình, Admin xem được mọi đơn hàng (logic kiểm tra quyền ở backend).
 * Yêu cầu JWT token hợp lệ.
 * @param {number|string} orderId - ID của đơn hàng.
 * @returns {Promise<object>} Promise chứa response từ API (OrderDTO).
 */
export const getOrderDetails = (orderId) => {
  // Endpoint này sẽ được sử dụng ở trang kết quả thanh toán và trang chi tiết đơn hàng
  return apiClient.get(`/orders/${orderId}`);
};

/**
 * Gửi yêu cầu hủy một đơn hàng với lý do.
 * Yêu cầu JWT token hợp lệ (kiểm tra quyền ở backend).
 * Backend API nhận 'reason' trong request body POST.
 * @param {number|string} orderId - ID của đơn hàng cần hủy.
 * @param {string} reason - Lý do hủy đơn.
 * @returns {Promise<object>} Promise chứa response từ API.
 */
export const cancelOrder = (orderId, reason) => {
  // Gửi lý do trong request body POST
  return apiClient.post(`/orders/${orderId}/cancel`, { reason });
};

/**
 * Lấy danh sách các đơn hàng của người dùng đang đăng nhập.
 * Yêu cầu JWT token hợp lệ.
 * Endpoint tương ứng ở backend: GET /api/orders/me.
 * @param {object} params - Tham số phân trang (ví dụ: { page: 0, size: 10 }).
 * @returns {Promise<object>} Promise chứa response từ API (Page<OrderDTO> hoặc List<OrderDTO>).
 */
export const getMyOrders = (params) => {
   // Endpoint này dùng cho người dùng tự xem đơn hàng của họ
  return apiClient.get('/orders/me', { params });
};

// =======================================================================
// Các hàm dành cho Admin (Có thể tách ra adminOrderService.js nếu muốn)
// =======================================================================

/**
 * [ADMIN] Lấy danh sách tất cả đơn hàng với bộ lọc và phân trang.
 * Yêu cầu JWT token của Admin.
 * Endpoint tương ứng ở backend: GET /api/admin/orders
 * @param {object} params - Tham số truy vấn (page, size, status, userId, sortBy, sortDir...).
 * @returns {Promise<object>} Promise chứa response từ API (Page<OrderDTO>).
 */
export const getAllOrdersAdmin = (params) => {
  // Gọi API đã tạo trong AdminOrderController (hoặc OrderController nếu endpoint là /admin/orders)
  return apiClient.get('/admin/orders', { params });
};

/**
 * [ADMIN] Cập nhật trạng thái của một đơn hàng.
 * Yêu cầu JWT token của Admin.
 * Endpoint tương ứng ở backend: PUT /api/admin/orders/{orderId}/status
 * @param {number|string} orderId - ID của đơn hàng.
 * @param {string} newStatus - Trạng thái mới ('PENDING'|'PAID'|'PROCESSING'|'SHIPPED'|'COMPLETED'|'CANCELED').
 * @returns {Promise<object>} Promise chứa response từ API (OrderDTO đã cập nhật).
 */
export const updateOrderStatusAdmin = (orderId, newStatus) => {
  // Gọi API đã tạo trong AdminOrderController (hoặc OrderController)
  // backend đang nhận newStatus qua query param
   return apiClient.put(`/admin/orders/${orderId}/status`, null, { params: { newStatus } });
   // Nếu backend nhận newStatus trong body PUT/PATCH, sửa lại dòng trên
   // return apiClient.put(`/admin/orders/${orderId}/status`, { status: newStatus });
};

/**
 * [ADMIN] Lấy danh sách tất cả đơn hàng của một người dùng theo userId cho Admin/Staff.
 * Yêu cầu JWT token của Admin/Staff.
 * Endpoint tương ứng ở backend: GET /api/admin/users/{userId}/orders
 * @param {number|string} userId - ID của người dùng.
 * @param {object} params - Các tham số phân trang, sắp xếp (page, size, sortBy, sortDir etc.).
 * @returns {Promise<object>} Promise chứa response từ API (Page<OrderDTO>).
 */
export const getUserOrdersForAdmin = (userId, params) => {
  console.log(`[ADMIN] Fetching orders for user ${userId} with params:`, params);
  // Gọi đúng endpoint ADMIN
  return apiClient.get(`/admin/users/${userId}/orders`, { params });
};

// Có thể thêm các hàm admin khác nếu cần