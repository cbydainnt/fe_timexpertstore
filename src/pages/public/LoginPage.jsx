// src/pages/public/LoginPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useForm } from 'react-hook-form';
import { Form, Button, Container, Row, Col, Card, Spinner, InputGroup } from 'react-bootstrap'; // Bỏ Alert nếu không dùng trực tiếp
import { Google, EyeFill, EyeSlashFill } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const pageVariants = {
  initial: { opacity: 0, y: -20 }, // Thay đổi animation một chút cho khác biệt
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: 20 }
};
const pageTransition = { type: "tween", ease: "anticipate", duration: 0.4 };

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user: currentUser } = useAuthStore(); // Lấy thêm user để check role
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { t } = useTranslation();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { username: '', password: '', rememberMe: false }
  });

  // Redirect nếu đã đăng nhập, kiểm tra role ở đây luôn
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const from = location.state?.from?.pathname || (currentUser.role === 'ADMIN' ? '/admin/dashboard' : '/');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate, location.state]);

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await login(data.username, data.password, data.rememberMe);
    setLoading(false);

    if (result.success) {
      toast.success(t('toastMessages.loginSuccess'));
      // Không cần navigate ở đây nữa vì useEffect ở trên sẽ xử lý sau khi state isAuthenticated và user cập nhật
    } else {
      toast.error(result.error || t('toastMessages.loginErrorGeneric'));
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
   const googleLoginUrl = `http://localhost:8080/oauth2/authorization/google`; 
    window.location.href = googleLoginUrl;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 120px)' }}> {/* Giảm padding/margin nếu cần */}
        <Row className="justify-content-center w-100">
          <Col md={6} lg={5} xl={4}>
            <Card className="p-4 shadow-lg border-0 rounded-3">
              <Card.Body>
                <h2 className="text-center mb-4 fw-bold">{t('loginPage.title')}</h2>

                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Form.Group className="mb-3" controlId="username">
                    <Form.Label>{t('loginPage.usernameLabel')}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t('loginPage.usernamePlaceholder')}
                      isInvalid={!!errors.username}
                      autoComplete="username"
                      {...register("username", { required: t('loginPage.validation.usernameRequired') })}
                    />
                    <Form.Control.Feedback type="invalid">{errors.username?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>{t('loginPage.passwordLabel')}</Form.Label>
                    <InputGroup hasValidation>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder={t('loginPage.passwordPlaceholder')}
                        isInvalid={!!errors.password}
                        autoComplete="current-password"
                        {...register("password", { required: t('loginPage.validation.passwordRequired') })}
                      />
                      <Button variant="outline-secondary" onClick={togglePasswordVisibility} title={showPassword ? t('loginPage.tooltips.hidePassword') : t('loginPage.tooltips.showPassword')}>
                        {showPassword ? <EyeSlashFill /> : <EyeFill />}
                      </Button>
                      <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Check
                      type="checkbox"
                      id="remember-me"
                      label={t('loginPage.rememberMeLabel')}
                      {...register("rememberMe")}
                      className="user-select-none" style={{ fontSize: '0.9em' }}
                    />
                    <Link to="/forgot-password" style={{ fontSize: '0.9em' }}>{t('loginPage.forgotPasswordLink')}</Link>
                  </div>

                  <div className="d-grid">
                    <Button variant="primary" type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                          <span className="ms-1">{t('loginPage.loadingButtonText')}</span>
                        </>
                      ) : (
                        t('loginPage.loginButtonText')
                      )}
                    </Button>
                  </div>
                </Form>

                <div className="divider d-flex align-items-center my-4">
                  <hr className="flex-grow-1" />
                  <span className="px-2 text-muted small">{t('loginPage.orDividerText')}</span>
                  <hr className="flex-grow-1" />
                </div>

                <Button
                  variant="outline-secondary"
                  className="w-100 d-flex align-items-center justify-content-center"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  {loading && <Spinner as="span" animation="border" size="sm" className="me-2"/>}
                  {!loading && <Google className="me-2" />}
                  {t('loginPage.loginWithGoogleButtonText')}
                </Button>

                <div className="text-center mt-4" style={{ fontSize: '0.9em' }}>
                  {t('loginPage.noAccountPrompt')} <Link to="/register" className="fw-bold fs-6">{t('loginPage.registerLinkText')}</Link>
                </div>

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
}

export default LoginPage;