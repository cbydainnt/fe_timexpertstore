// src/pages/public/LoginPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore'; // Import store Zustand
import { useForm } from 'react-hook-form'; // Import react-hook-form
// Import các component Bootstrap và icons
import { Form, Button, Container, Row, Col, Card, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { Google, EyeFill, EyeSlashFill } from 'react-bootstrap-icons';
// *** THÊM IMPORT TOASTIFY ***
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};
const pageTransition = { duration: 0.4 };
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasLoggedIn, setHasLoggedIn] = useState(false);

  const { t, i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng); // Thay đổi ngôn ngữ
  };
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { username: '', password: '', rememberMe: false }
  });

  // Redirect nếu đã đăng nhập
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     const from = location.state?.from?.pathname || "/";
  //     navigate(from, { replace: true });
  //   }
  // }, [isAuthenticated, navigate, location.state]);

  // Hàm submit form
  // const onSubmit = async (data) => {
  //   setLoading(true);
  //   console.log("Login attempt with data:", data);
  //   const result = await login(data.username, data.password, data.rememberMe);
  //   setLoading(false);

  //   if (result.success) {
  //   } else {
  //     toast.error(result.error || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
  //   }
  // };
  const onSubmit = async (data) => {
    setLoading(true);
    console.log("Login attempt with data:", data);
    // Hàm login trong authStore sẽ cập nhật user vào state nếu thành công
    const result = await login(data.username, data.password, data.rememberMe);
    setLoading(false);

    if (result.success) {
      toast.success("Đăng nhập thành công");
      // Lấy thông tin user từ authStore sau khi login thành công
      const user = useAuthStore.getState().user;

      if (user && user.role === 'ADMIN') {
        // Nếu là Admin, chuyển hướng đến trang Admin Dashboard
        navigate('/admin/dashboard', { replace: true });
      } else {
        // Nếu không phải Admin (hoặc role khác), chuyển hướng đến trang gốc hoặc trang trước đó
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    } else {
      toast.error(result.error || 'Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };


  const handleGoogleLogin = () => {
    setLoading(true);
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  // useEffect(() => {
  //   if (isAuthenticated && !hasLoggedIn) {
  //     toast.success("Đăng nhập thành công");
  //     setHasLoggedIn(true);
  //     navigate("/");
  //   }
  // }, [isAuthenticated, hasLoggedIn, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="flex flex-col items-center justify-center h-screen"
    >
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <Row className="justify-content-center w-100">
          <Col md={6} lg={5} xl={4}>
            <Card className="p-4 shadow-lg border-0 rounded-3">
              <Card.Body>
                <h2 className="text-center mb-4 fw-bold">Đăng nhập</h2>

                {/* *** BỎ Alert HIỂN THỊ LỖI Ở ĐÂY *** */}
                {/* {error && <Alert variant="danger" ... >{error}</Alert>} */}

                <Form onSubmit={handleSubmit(onSubmit)}>
                  {/* Username */}
                  <Form.Group className="mb-3" controlId="username">
                    <Form.Label>Tên đăng nhập</Form.Label>
                    <Form.Control type="text"
                      placeholder="Nhập tên đăng nhập"
                      isInvalid={!!errors.username}
                      autoComplete="username"
                      {...register("username", { required: "Tên đăng nhập là bắt buộc" })} />
                    <Form.Control.Feedback type="invalid">{errors.username?.message}</Form.Control.Feedback>
                  </Form.Group>

                  {/* Password */}
                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Mật khẩu</Form.Label>
                    <InputGroup hasValidation>
                      <Form.Control type={showPassword ? "text" : "password"}
                        placeholder="Mật khẩu"
                        isInvalid={!!errors.password}
                        autoComplete="current-password"
                        {...register("password", { required: "Mật khẩu là bắt buộc" })} />
                      <Button variant="outline-secondary" onClick={togglePasswordVisibility} title={showPassword ? "Ẩn" : "Hiện"}>
                        {showPassword ? <EyeSlashFill /> : <EyeFill />}
                      </Button>
                      <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  {/* Remember Me và Forgot Password */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Check type="checkbox" id="remember-me" label="Nhớ mật khẩu" {...register("rememberMe")} className="user-select-none" style={{ fontSize: '0.9em' }} />
                    <Link to="/forgot-password" style={{ fontSize: '0.9em' }}>Quên mật khẩu?</Link>
                  </div>

                  {/* Nút Submit */}
                  <div className="d-grid">
                    <Button variant="primary" type="submit" disabled={loading}>
                      {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Đăng nhập'}
                    </Button>
                  </div>
                </Form>

                {/* Divider và Google Login Button */}
                <div className="divider d-flex align-items-center my-4"><hr className="flex-grow-1" /><span className="px-2 text-muted small">OR</span><hr className="flex-grow-1" /></div>
                <Button variant="outline-secondary" className="w-100 d-flex align-items-center justify-content-center" onClick={handleGoogleLogin}> <Google className="me-2" /> Đăng nhập với Google </Button>

                {/* Link tới trang Register */}
                <div className="text-center mt-4" style={{ fontSize: '0.9em' }}> Chưa có tài khoản? <Link to="/register" className="fw-bold fs-6">Đăng ký</Link> </div>

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
}

export default LoginPage;