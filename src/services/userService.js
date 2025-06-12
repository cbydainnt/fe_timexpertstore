import apiClient from '../config/axiosConfig';

// --- User Functions ---
export const getUserProfile = () => apiClient.get('/users/profile');
export const updateUserProfile = (userData) => apiClient.put('/users/profile', userData);
export const changePassword = (data) => apiClient.put('/users/profile/change-password', data);

// --- Admin/Staff Functions ---

/** [ADMIN/STAFF] Lấy danh sách khách hàng (BUYER) */           
export const getAllCustomersAdmin = (params) => {
    if (params.role === '') {
        delete params.role;
    }
    return apiClient.get('/admin/users', { params });
};

/** [ADMIN] Lấy danh sách nhân viên (STAFF) */
export const getAllStaffAdmin = (params) => {
    console.log("Fetching staff with params:", params);
    return apiClient.get('/admin/users', { params });
};

/**
 * Lấy thông tin chi tiết của người dùng theo ID.
 * @param {number|string} userId - ID của người dùng.
 * @returns {Promise<object>} Promise chứa response từ API (UserDTO).
 */
export const getUserById = (userId) => {
    return apiClient.get(`/users/${userId}`);
  };
  

/** [ADMIN/STAFF] Lấy chi tiết user theo ID */
export const getUserDetailsAdmin = (userId) => {
    console.log("Fetching user details for userId:", userId);
    // *** Backend cần API GET /api/admin/users/{userId} ***
    return apiClient.get(`/admin/users/${userId}`);
};


/** [ADMIN] Tạo user mới (có thể là STAFF hoặc BUYER) */
export const createUserAdmin = (userData, role) => {
    console.log("Creating user (Admin):", userData);
    return apiClient.post(`/admin/users/create?role=${role}`, userData);
};

/** [ADMIN] Cập nhật vai trò user */
export const updateUserRoleAdmin = (userId, newRole) => {
     console.log(`Updating role for user ${userId} to ${newRole}`);
     // *** Backend cần API PUT /api/admin/users/{userId}/role?role=... ***
     return apiClient.put(`/admin/users/${userId}/role`, null, { params: { role: newRole } });
};

/** [ADMIN] Xóa user */
export const deleteUserAdmin = (userId) => {
     console.log(`Deleting user ${userId}`);
     // *** Backend cần API DELETE /api/admin/users/{userId} ***
     return apiClient.delete(`/admin/users/${userId}`);
};
