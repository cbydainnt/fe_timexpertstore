import React from 'react';
import { Nav, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { Speedometer2, BoxSeam, Tags, ReceiptCutoff, PeopleFill, BarChartLineFill, GearFill, Building, List } from 'react-bootstrap-icons';
import { useAuthStore } from '../../store/authStore';

/**
 * Component Sidebar cho khu vực Admin.
 * - Hiển thị menu điều hướng.
 * - Hỗ trợ trạng thái thu gọn/mở rộng.
 */
function AdminSidebar({ isCollapsed, onToggle }) {
  const location = useLocation();
  const { user } = useAuthStore();

  // Kiểm tra active link
  const isNavLinkActive = (path) => location.pathname.startsWith(path);

  // Styles
  const sidebarStyle = {
    width: isCollapsed ? '60px' : '260px',
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
    transition: 'width 0.3s ease-in-out',
    overflowX: 'hidden',
    flexShrink: 0,
    paddingTop: '0',
  };
  const logoContainerStyle = {
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: isCollapsed ? '0.75rem' : '1rem 1.5rem',
    transition: 'padding 0.3s ease-in-out',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: isCollapsed ? 'center' : 'flex-start',
  };
  const navLinkStyle = {
    color: '#bdc3c7',
    padding: isCollapsed ? '0.75rem 0.75rem 0.75rem 0.9rem' : '0.8rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    fontSize: isCollapsed ? '0.8rem' : '0.95rem',
    borderLeft: '3px solid transparent',
    transition: 'background-color 0.2s ease, border-left-color 0.2s ease, color 0.2s ease, font-size 0.3s ease, padding 0.3s ease',
  };

  const navLinkHoverStyle = { backgroundColor: 'rgba(255, 255, 255, 0.05)' };
  const navLinkActiveStyle = {
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    fontWeight: '500',
    borderLeftColor: 'var(--bs-primary)',
  };
  const iconStyle = {
    marginRight: isCollapsed ? '0' : '1rem',
    width: '18px',
    height: '18px',
    flexShrink: 0,
    transition: 'margin-right 0.3s ease-in-out',
  };
  const linkTextStyle = {
    opacity: isCollapsed ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  };

  const menuItems = [
    { to: '/admin/dashboard', icon: Speedometer2, text: 'Dashboard', roles: ['ADMIN'] },
    { to: '/admin/categories', icon: Tags, text: 'Danh mục', roles: ['ADMIN'] },
    { to: '/admin/products', icon: BoxSeam, text: 'Sản phẩm', roles: ['ADMIN'] },
    { to: '/admin/orders', icon: ReceiptCutoff, text: 'Đơn hàng', roles: ['ADMIN'] },
    { to: '/admin/users', icon: PeopleFill, text: 'Tài khoản', roles: ['ADMIN'] },
    { to: '/admin/statistics', icon: BarChartLineFill, text: 'Thống kê', roles: ['ADMIN'] },
    { to: '/admin/settings', icon: GearFill, text: 'Cài đặt', roles: ['ADMIN'] },
  ].filter(item => item.roles.includes(user?.role));

  return (
    <div style={sidebarStyle} className="d-flex flex-column flex-shrink-0 shadow-sm admin-sidebar-custom">
      <div style={logoContainerStyle}>
        <Link to="/admin/dashboard" className="text-white text-decoration-none d-flex align-items-center justify-content-center">
          <Building size={24} className="me-2" />
          {!isCollapsed && <span className="h6 mb-0 fw-bold">Quản trị viên</span>}
        </Link>
      </div>
      <Nav className="flex-column nav-pills flex-grow-1 pt-2" style={{ overflowY: 'auto' }}>
        {menuItems.map(item => (
          <OverlayTrigger
            key={item.to}
            placement="right"
            overlay={<Tooltip id={`tooltip-${item.text}`}>{item.text}</Tooltip>}
            delay={{ show: 500, hide: 0 }}
            disabled={!isCollapsed}
          >
            <Nav.Link
              as={Link}
              to={item.to}
              style={{
                ...navLinkStyle,
                ...(isNavLinkActive(item.to) ? navLinkActiveStyle : {}),
                justifyContent: 'flex-start',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = navLinkHoverStyle.backgroundColor}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = isNavLinkActive(item.to) ? navLinkActiveStyle.backgroundColor : 'transparent'}
            >
              <item.icon style={iconStyle} />
              <span style={linkTextStyle}>{item.text}</span>
            </Nav.Link>
          </OverlayTrigger>
        ))}
      </Nav>
      {!isCollapsed && (
        <div className="mt-auto p-3 text-center text-muted small border-top border-secondary border-opacity-25 admin-sidebar-footer">
          <p className="mb-0">v1.0.0</p>
        </div>
      )}
    </div>
  );
}

export default AdminSidebar;