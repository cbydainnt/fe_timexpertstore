import apiClient from '../config/axiosConfig'; // Import apiClient đã cấu hình

/**
 * Lấy hoặc tạo hóa đơn cho một đơn hàng cụ thể bằng Order ID.
 * Yêu cầu JWT token hợp lệ (người dùng phải là chủ đơn hàng hoặc Admin).
 * Backend sẽ kiểm tra quyền truy cập.
 * @param {number|string} orderId - ID của đơn hàng cần lấy/tạo hóa đơn.
 * @returns {Promise<object>} Promise chứa response từ API (Đối tượng Invoice).
 */
export const getOrCreateInvoiceForOrder = (orderId) => {
  // Gọi API endpoint đã định nghĩa trong InvoiceController
  // apiClient sẽ tự động thêm token Authorization
  return apiClient.get(`/invoices/order/${orderId}`);
};

/*
// Nếu bạn có endpoint riêng để chỉ lấy hóa đơn đã tồn tại (ví dụ: GET /api/invoices/order/{orderId}/existing)
// thì có thể thêm hàm tương ứng:
export const getExistingInvoiceForOrder = (orderId) => {
  return apiClient.get(`/invoices/order/${orderId}/existing`);
};
*/

// Có thể thêm các hàm liên quan đến invoice khác nếu backend có hỗ trợ
// Ví dụ: Lấy danh sách hóa đơn của người dùng (cần API backend)
// export const getMyInvoices = (params) => {
//   return apiClient.get('/invoices/me', { params });
// };