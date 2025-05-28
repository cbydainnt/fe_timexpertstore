import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import { PersonCircle, BoxArrowRight, List, GearFill, PersonFill } from 'react-bootstrap-icons';
import { useAuthStore } from '../../store/authStore';
import '../../styles/admin.css';
function AdminHeader({ onToggleSidebar }) {
  const { user, logout } = useAuthStore();

  return (
    <Navbar bg="light" variant="light" className="border-bottom px-3 shadow-sm admin-header-custom">
      <Container fluid>
        {/* Nút Toggle Sidebar và Logo */}
        <div className="d-flex align-items-center">
          <button
            onClick={onToggleSidebar}
            className="btn-toggle-sidebar"
          >
            <List size={24} />
          </button>


          <Link to="/admin/dashboard" className="text-decoration-none d-flex align-items-center">
            <span className="h5 mb-0 fw-bold text-dark">TimeXpert Store</span>
          </Link>
        </div>

        {/* Nav items bên phải */}
        <Navbar.Collapse >
          <Nav className="ms-auto align-items-right">
            {user ? (
              <NavDropdown
                title={<span className="d-inline-flex align-items-center text-dark"><PersonCircle size={20} className="me-1" /><span className="d-none d-sm-inline">{user.firstName || user.username}</span></span>}
                id="admin-user-dropdown"
                align="end"
                autoClose="outside"
                renderMenuOnMount={true}
              >
                <LinkContainer to="/profile">
                  <NavDropdown.Item>
                    <PersonFill size={16} className="me-1" /> Thông tin cá nhân
                  </NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/admin/settings">
                  <NavDropdown.Item>
                    <GearFill size={16} className="me-1" /> Cài đặt
                  </NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout} className="text-danger">
                  <BoxArrowRight size={16} className="me-1" /> Đăng xuất
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link disabled className="text-dark">Chưa đăng nhập</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AdminHeader;