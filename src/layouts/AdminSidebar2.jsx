// // src/components/layout/AdminSidebar.jsx
// import React from 'react';
// import { Nav } from 'react-bootstrap';
// import { LinkContainer } from 'react-router-bootstrap';
// import { Link, useLocation } from 'react-router-dom'; // Import useLocation
// // Import icons
// import { Speedometer2, BoxSeam, Tags, ReceiptCutoff, PeopleFill, PersonBadgeFill, BarChartLineFill, GearFill, Building } from 'react-bootstrap-icons';
// import { useAuthStore } from '..//store/authStore'; // Import để kiểm tra role

// // Style cho Sidebar (có thể đưa ra file CSS)
// const sidebarStyle = {
//     width: '260px', // Tăng độ rộng một chút
//     backgroundColor: '#2c3e50', // Màu nền tối (ví dụ: xanh đen)
//     color: '#ecf0f1', // Màu chữ sáng
// };

// const logoContainerStyle = {
//     borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
// };

// const navLinkStyle = {
//     color: '#bdc3c7', // Màu chữ hơi xám
//     padding: '0.8rem 1.5rem',
//     display: 'flex',
//     alignItems: 'center',
//     fontSize: '0.95rem',
//     borderLeft: '3px solid transparent', // Border trái để highlight active
//     transition: 'background-color 0.2s ease, border-left-color 0.2s ease, color 0.2s ease',
// };

// const navLinkHoverStyle = { // Style khi hover (dùng :hover trong CSS sẽ tốt hơn)
//     backgroundColor: 'rgba(255, 255, 255, 0.05)',
//     color: '#ffffff',
// };

// const navLinkActiveStyle = {
//     color: '#ffffff', // Màu chữ trắng
//     backgroundColor: 'rgba(255, 255, 255, 0.1)', // Nền sáng hơn chút
//     fontWeight: '500',
//     borderLeftColor: 'var(--bs-primary)', // Màu primary của Bootstrap làm border active
// };

// const iconStyle = {
//     marginRight: '1rem',
//     width: '18px',
//     height: '18px',
//     flexShrink: 0, // Đảm bảo icon không bị co lại
// };

// function AdminSidebar() {
//   const location = useLocation(); // Hook để lấy path hiện tại
//   const { user } = useAuthStore(); // Lấy thông tin user

//   // Hàm kiểm tra xem link có active không (kể cả route con)
//   const isNavLinkActive = (path) => {
//     return location.pathname.startsWith(path);
//   };

//   return (
//     <div style={sidebarStyle} className="d-flex flex-column flex-shrink-0 vh-100 shadow-sm">
//        {/* Logo/Tên trang Admin */}
//        <div style={logoContainerStyle} className="p-3 text-center">
//            <Link to="/admin/dashboard" className="text-white text-decoration-none d-flex align-items-center justify-content-center">
//                <Building size={28} className="me-2"/>
//                <span className="h5 mb-0 fw-bold">ADMIN</span>
//            </Link>
//        </div>

//       {/* Menu điều hướng */}
//       {/* Sử dụng Nav với các LinkContainer */}
//       {/* Thêm overflow-y-auto nếu menu quá dài */}
//       <Nav className="flex-column nav-pills flex-grow-1 pt-2" style={{ overflowY: 'auto' }}>
//         {/* Dùng LinkContainer để tích hợp với React Router */}
//         {/* Áp dụng style active động */}
//         <LinkContainer to="/admin/dashboard">
//           <Nav.Link style={{ ...navLinkStyle, ...(isNavLinkActive('/admin/dashboard') ? navLinkActiveStyle : {}) }}
//                     onMouseEnter={(e) => e.currentTarget.style.backgroundColor = navLinkHoverStyle.backgroundColor}
//                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = (isNavLinkActive('/admin/dashboard') ? navLinkActiveStyle.backgroundColor : 'transparent')}
//           >
//              <Speedometer2 style={iconStyle} /> Dashboard
//           </Nav.Link>
//         </LinkContainer>

//         <LinkContainer to="/admin/categories">
//           <Nav.Link style={{ ...navLinkStyle, ...(isNavLinkActive('/admin/categories') ? navLinkActiveStyle : {}) }}
//                     onMouseEnter={(e) => e.currentTarget.style.backgroundColor = navLinkHoverStyle.backgroundColor}
//                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = (isNavLinkActive('/admin/categories') ? navLinkActiveStyle.backgroundColor : 'transparent')}
//           >
//             <Tags style={iconStyle} /> Danh mục
//           </Nav.Link>
//         </LinkContainer>

//         <LinkContainer to="/admin/products">
//           <Nav.Link style={{ ...navLinkStyle, ...(isNavLinkActive('/admin/products') ? navLinkActiveStyle : {}) }}
//                     onMouseEnter={(e) => e.currentTarget.style.backgroundColor = navLinkHoverStyle.backgroundColor}
//                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = (isNavLinkActive('/admin/products') ? navLinkActiveStyle.backgroundColor : 'transparent')}
//           >
//             <BoxSeam style={iconStyle} /> Sản phẩm
//           </Nav.Link>
//         </LinkContainer>

//         <LinkContainer to="/admin/orders">
//           <Nav.Link style={{ ...navLinkStyle, ...(isNavLinkActive('/admin/orders') ? navLinkActiveStyle : {}) }}
//                     onMouseEnter={(e) => e.currentTarget.style.backgroundColor = navLinkHoverStyle.backgroundColor}
//                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = (isNavLinkActive('/admin/orders') ? navLinkActiveStyle.backgroundColor : 'transparent')}
//           >
//              <ReceiptCutoff style={iconStyle} /> Đơn hàng
//           </Nav.Link>
//         </LinkContainer>

//         <LinkContainer to="/admin/customers">
//            <Nav.Link style={{ ...navLinkStyle, ...(isNavLinkActive('/admin/users') ? navLinkActiveStyle : {}) }}
//                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = navLinkHoverStyle.backgroundColor}
//                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = (isNavLinkActive('/admin/users') ? navLinkActiveStyle.backgroundColor : 'transparent')}
//            >
//               <PeopleFill style={iconStyle} /> Người dùng
//            </Nav.Link>
//         </LinkContainer>

//          {/* Chỉ Admin thấy mục Staff */}
//          {user?.role === 'ADMIN' && (
//             <LinkContainer to="/admin/staff">
//                <Nav.Link style={{ ...navLinkStyle, ...(isNavLinkActive('/admin/staff') ? navLinkActiveStyle : {}) }}
//                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = navLinkHoverStyle.backgroundColor}
//                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = (isNavLinkActive('/admin/staff') ? navLinkActiveStyle.backgroundColor : 'transparent')}
//                >
//                   <PersonBadgeFill style={iconStyle} /> Nhân viên
//                </Nav.Link>
//             </LinkContainer>
//          )}

//          <LinkContainer to="/admin/statistics">
//            <Nav.Link style={{ ...navLinkStyle, ...(isNavLinkActive('/admin/statistics') ? navLinkActiveStyle : {}) }}
//                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = navLinkHoverStyle.backgroundColor}
//                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = (isNavLinkActive('/admin/statistics') ? navLinkActiveStyle.backgroundColor : 'transparent')}
//            >
//              <BarChartLineFill style={iconStyle} /> Thống kê
//            </Nav.Link>
//          </LinkContainer>

//          {/* Thêm các mục khác nếu cần */}
//           {/* <LinkContainer to="/admin/reviews">...</LinkContainer> */}
//           {/* <LinkContainer to="/admin/settings">...</LinkContainer> */}
//       </Nav>

//        {/* Footer của Sidebar (ví dụ: nút cài đặt hoặc thông tin user) */}
//        <div className="mt-auto p-3 border-top border-secondary border-opacity-25">
//            {/* Có thể thêm link cài đặt hoặc thông tin khác */}
//            <Link to="/profile" className="d-flex align-items-center text-white text-decoration-none">
//                 <GearFill size={18} className="me-2"/> Cài đặt
//            </Link>
//        </div>
//     </div>
//   );
// }

// export default AdminSidebar;