import React, { useState } from 'react'; // Import useState
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/layout/AdminSidebar'; // Đảm bảo AdminSidebar đã có prop isCollapsed, onToggle
import AdminHeader from '../components/layout/AdminHeader'; // Đảm bảo AdminHeader đã có prop onToggleSidebar
import { ToastContainer } from 'react-toastify'; // Thêm ToastContainer cho admin area nếu cần thông báo riêng
import 'react-toastify/dist/ReactToastify.css';

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Hàm toggle trạng thái sidebar
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    // Thêm class dựa vào state isSidebarCollapsed để CSS có thể điều chỉnh layout
    <div className={`d-flex vh-100 admin-layout ${isSidebarCollapsed ? 'admin-layout--collapsed' : ''}`} style={{ overflow: 'hidden' }}>

      <AdminSidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />

      {/* Vùng nội dung chính */}
      {/* Margin trái được điều khiển bởi class CSS trong index.css */}
      {/* Style minHeight để đảm bảo trang có thể cuộn */}
      <div
        className="d-flex flex-column flex-grow-1 admin-content-wrapper"
        style={{ overflow: 'hidden', minHeight: '100vh' }} /* minHeight: '100vh' hoặc tính toán (100vh - header_height - footer_height) */
      >
        {/* Header riêng cho Admin */}
        {/* Truyền action toggleSidebar cho Header */}
        <AdminHeader onToggleSidebar={toggleSidebar} />

        {/* Nội dung của các trang admin con */}
        {/* overflow-auto cho phép cuộn nội dung */}
        {/* p-3 hoặc p-4 để thêm padding */}
        <main className="flex-grow-1 overflow-auto p-3 p-md-4 admin-main-content" style={{ backgroundColor: '#f4f7f6' }}> {/* Màu nền khác */}
          <Outlet /> {/* Render component trang admin tương ứng */}
        </main>

        {/* Footer đơn giản cho Admin */}
        {/* Thêm class admin-sidebar-footer để ẩn khi sidebar thu gọn */}
        <footer className="bg-light text-muted text-center p-2 border-top admin-footer-custom">
           <small>&copy; 2025 Admin Panel</small>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;