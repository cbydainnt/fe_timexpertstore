import apiClient from '../config/axiosConfig';

/**
 * [ADMIN] Lấy dữ liệu tóm tắt nhanh cho Dashboard.
 * Yêu cầu JWT token của Admin.
 * @returns {Promise<object>} Promise chứa response (DashboardSummaryDTO).
 */
export const getDashboardSummary = () => {
    console.log("Fetching dashboard summary");
    // Gọi endpoint backend mới
    return apiClient.get('/admin/statistics/summary');
};


/**
 * [ADMIN] Lấy dữ liệu thống kê doanh thu theo ngày trong một khoảng thời gian.
 * Yêu cầu JWT token của Admin.
 * @param {object} params - { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
 * @returns {Promise<object>} Promise chứa response (List<DailyRevenueDTO>).
 */
export const getDailyRevenueStatistics = (params) => {
  console.log("Fetching daily revenue stats with params:", params);
  // Gọi endpoint backend mới
  return apiClient.get('/admin/statistics/revenue/daily', { params });
};

/**
 * [ADMIN] Lấy dữ liệu thống kê số lượng đơn hàng theo ngày trong một khoảng thời gian.
 * Yêu cầu JWT token của Admin.
 * @param {object} params - { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
 * @returns {Promise<object>} Promise chứa response (List<DailyOrderCountDTO>).
 */
export const getDailyOrderCountStatistics = (params) => {
  console.log("Fetching daily order count stats with params:", params);
  // Gọi endpoint backend mới
  return apiClient.get('/admin/statistics/orders/daily', { params });
};


/**
 * [ADMIN] Lấy thống kê doanh thu theo danh mục trong một khoảng thời gian.
 * Yêu cầu JWT token của Admin.
 * @param {object} params - { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
 * @returns {Promise<object>} Promise chứa response (List<CategoryRevenueDTO>).
 */
export const getRevenueStatisticsByCategory = (params) => {
    console.log("Fetching category revenue stats with params:", params);
    // Gọi endpoint backend mới
    return apiClient.get('/admin/statistics/revenue/category', { params });
};

/**
 * [ADMIN] Lấy thống kê doanh thu theo khách hàng trong một khoảng thời gian.
 * Yêu cầu JWT token của Admin.
 * @param {object} params - { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD', limit?: number }
 * @returns {Promise<object>} Promise chứa response (List<CustomerRevenueDTO>).
 */
export const getRevenueStatisticsByCustomer = (params) => {
    console.log("Fetching customer revenue stats with params:", params);
    // Gọi endpoint backend mới
    return apiClient.get('/admin/statistics/revenue/customer', { params });
};


/**
 * [ADMIN] Lấy Top N sản phẩm bán chạy nhất (theo số lượng).
 * Yêu cầu JWT token của Admin.
 * @param {object} params - { limit?: number }
 * @returns {Promise<object>} Promise chứa response (List<TopProductDTO>).
 */
export const getTopSellingProducts = (params) => {
    console.log("Fetching top selling products with params:", params);
     // Endpoint backend mới: /api/admin/statistics/products/top-selling
    return apiClient.get('/admin/statistics/products/top-selling', { params });
};


/**
 * [ADMIN] Lấy Top N khách hàng có số lượng đơn hoàn thành nhiều nhất.
 * Yêu cầu JWT token của Admin.
 * @param {object} params - { limit?: number }
 * @returns {Promise<object>} Promise chứa response (List<CustomerStatisticDTO>).
 */
export const getTopCustomersByCompletedOrders = (params) => {
    console.log("Fetching top customers by completed orders with params:", params);
     // Endpoint backend mới: /api/admin/statistics/customers/top-completed-orders
    return apiClient.get('/admin/statistics/customers/top-completed-orders', { params });
};

/**
 * [ADMIN] Lấy Top N khách hàng có số lượng đơn BỊ HỦY nhiều nhất.
 * Yêu cầu JWT token của Admin.
 * @param {object} params - { limit?: number }
 * @returns {Promise<object>} Promise chứa response (List<CustomerStatisticDTO>).
 */
export const getTopCustomersByCanceledOrders = (params) => {
    console.log("Fetching top customers by canceled orders with params:", params);
     // Endpoint backend mới: /api/admin/statistics/customers/top-canceled-orders
    return apiClient.get('/admin/statistics/customers/top-canceled-orders', { params });
};


/**
 * [ADMIN] Lấy dữ liệu thống kê tồn kho.
 * Yêu cầu JWT token của Admin.
 * @returns {Promise<object>} Promise chứa response (Map<String, Integer>).
 */
export const getInventoryStatistics = () => {
  console.log("Fetching inventory stats");
  // Endpoint backend mới: /api/admin/statistics/inventory
  return apiClient.get('/admin/statistics/inventory');
};