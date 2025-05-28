import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Navbar,
  Nav,
  NavDropdown,
  Container,
  Badge,
  Form,
  FormControl,
  Button,
} from 'react-bootstrap';
import {
  Cart4,
  Person,
  BoxArrowRight,
  Wrench,
  Search,
  Heart,
  Translate, // Thêm icon Translate
} from 'react-bootstrap-icons';
import '../../styles/header.css'; // Giữ lại CSS của bạn
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import x from '../../assets/images/x.png'; // Giữ lại logo của bạn
import { useTranslation } from 'react-i18next'; // Import useTranslation

const navLinkBaseClass = 'nav-link position-relative site-nav-link';
const iconNavLinkClass = 'nav-link d-inline-flex align-items-center p-2 site-icon-link';

const Header = () => {
  const { t, i18n } = useTranslation(); // Khởi tạo hook i18n
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const distinctItemCount = useCartStore((s) => s.getDistinctItemCount());
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => { 
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?name=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const getNavLinkClass = ({ isActive }) =>
    `${navLinkBaseClass} ${isActive ? 'active' : ''}`;

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      <Navbar bg="white" variant="light" expand="lg" sticky="top" className="site-header border-bottom mb-3">
        <Container>
          {/* Logo */}
          <Navbar.Brand
            as={Link}
            to="/"
            className="fw-bolder me-4"
            style={{ fontSize: '1.5rem', color: '#333' }}
          >
            <img
              src={x} // Logo của bạn
              alt="Logo"
              style={{ height: '50px', objectFit: 'contain' }}
              className="me-2"
            />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto align-items-center main-nav">
              <NavLink to="/" className={getNavLinkClass} end>
                {t('header.home', 'TRANG CHỦ')} 
              </NavLink>

              {/* Tạm thời bỏ link Danh mục nếu không có mega menu hoặc dùng key khác */}
              <NavLink to="/categories" className={getNavLinkClass}>
                {t('header.categories', 'DANH MỤC')}
              </NavLink>
             

              <NavLink to="/products" className={getNavLinkClass}>
                {t('header.products', 'SẢN PHẨM')}
              </NavLink>
              <NavLink to="/contact" className={getNavLinkClass}>
                {t('header.contact', 'LIÊN HỆ')}
              </NavLink>
            </Nav>

            <Form
              className="d-none d-lg-flex ms-auto me-2 search-form"
              style={{ width: '250px' }}
              onSubmit={handleSearchSubmit}
            >
              <FormControl
                type="search"
                placeholder={t('header.searchPlaceholder', 'Tìm kiếm...')}
                className="form-control-sm search-input"
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline-secondary" type="submit" size="sm" className="ms-1">
                <Search color="#0675b1" />
              </Button>
            </Form>

            <Nav className="align-items-center right-nav">
              
              <NavDropdown 
                title={<Translate size={18} color="#0675b1" title={t('header.language', 'Ngôn ngữ')}/>} 
                id="language-switcher-dropdown" 
                align="end"
                className="site-icon-link p-2" 
              >
                <NavDropdown.Item onClick={() => changeLanguage('vi')} active={i18n.language === 'vi'}>
                  Tiếng Việt
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => changeLanguage('en')} active={i18n.language === 'en'}>
                  English
                </NavDropdown.Item>
              </NavDropdown>

              <Nav.Link href="#search-mobile" className="d-lg-none p-2 site-icon-link">
                <Search size={18} color="#0675b1" />
              </Nav.Link>

              {isAuthenticated && (
                <Nav.Link
                  as={Link}
                  to="/favorites"
                  className={iconNavLinkClass}
                  title={t('header.favorites', 'Sản phẩm yêu thích của tôi')}
                >
                  <Heart size={18} color="#0675b1" />
                </Nav.Link>
              )}

              <Nav.Link
                as={Link}
                to="/cart"
                className={`${iconNavLinkClass} position-relative`}
                title={t('header.cart', 'Giỏ hàng')}
              >
                <Cart4 size={20} color="#0675b1" />
                {distinctItemCount > 0 && (
                  <Badge
                    pill
                    bg="danger"
                    className="position-absolute top-0 start-100 translate-middle"
                    style={{ fontSize: '0.6em', padding: '0.3em 0.5em' }}
                  >
                    {distinctItemCount > 9 ? '9+' : distinctItemCount}
                  </Badge>
                )}
              </Nav.Link>

              {isAuthenticated ? (
                <NavDropdown
                  title={<Person size={24} color="#0675b1" />}
                  id="user-nav-dropdown"
                  align="end"
                  className="user-dropdown"
                >
                  <NavDropdown.Header className="small text-muted">
                    {t('header.loggedInAs', 'Đã đăng nhập với tư cách')}<br /> {/* Thêm key mới */}
                    <strong>{user?.firstName + " " + user?.lastName || user?.username}</strong>
                  </NavDropdown.Header>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/profile">
                    {t('header.profile', 'Hồ sơ của tôi')}
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/orders">
                    {t('header.myOrders', 'Đơn hàng của tôi')} {/* Thêm key mới */}
                  </NavDropdown.Item>
                  {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                    <>
                      <NavDropdown.Divider />
                      <NavDropdown.Item as={Link} to="/admin/dashboard">
                        <Wrench size={16} className="me-1" /> {t('header.adminDashboard', 'Admin Panel')}
                      </NavDropdown.Item>
                    </>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout} className="text-danger">
                    <BoxArrowRight size={16} className="me-1" /> {t('header.logout', 'Đăng xuất')}
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Nav.Link as={Link} to="/login" className={iconNavLinkClass}>
                   {/* Sử dụng text thay vì icon nếu muốn, hoặc cả hai */}
                  <Person size={24} color="#0675b1" /> <span className="d-lg-none ms-2">{t('header.login', 'Đăng Nhập')}</span>
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;