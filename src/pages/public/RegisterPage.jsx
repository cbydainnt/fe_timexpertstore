import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { registerUser } from '../../services/authService'; // Import API service
// Import các component của React-Bootstrap
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};
const pageTransition = { duration: 0.4 };

function RegisterPage() {

  const { t } = useTranslation();

  const navigate = useNavigate();
  const [error, setError] = useState(''); // State lưu lỗi chung
  const [success, setSuccess] = useState(''); // State lưu thông báo thành công
  const [loading, setLoading] = useState(false);

  // Setup react-hook-form
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { // Giá trị mặc định
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    }
  });

  // Theo dõi giá trị password để validate confirm password
  const passwordValue = watch('password');

  // Hàm xử lý khi submit form đăng ký
const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');
    const registrationData = {
        username: data.username, email: data.email, password: data.password,
        firstName: data.firstName, lastName: data.lastName,
    };
    try {
      await registerUser(registrationData);
      setSuccess(t('registerPage.successMessage', 'Đăng ký thành công! Bây giờ bạn có thể đăng nhập.'));
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('registerPage.errorMessage', 'Đăng ký không thành công. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <Row className="justify-content-center w-100">
          <Col md={8} lg={7} xl={6}> {/* Cho form rộng hơn chút */}
            <Card className="p-4 p-sm-5 shadow-lg border-0 rounded-3">
              <Card.Body>
                  <h2 className="text-center mb-4 fw-bold">{t('registerPage.title', 'Đăng ký')}</h2>
              {success && <Alert variant="success">{success}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}

              {!success && (
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Form.Group className="mb-3" controlId="regUsername">
                    <Form.Label>{t('registerPage.usernameLabel', 'Tên đăng nhập')}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t('registerPage.usernamePlaceholder', 'Nhập tên đăng nhập')}
                      isInvalid={!!errors.username}
                      {...register("username", {
                          required: t('registerPage.validation.usernameRequired', "Tên đăng nhập là bắt buộc"),
                          minLength: { value: 3, message: t('registerPage.validation.usernameMinLength', "Tên đăng nhập phải có ít nhất 3 ký tự") },
                          maxLength: { value: 50, message: t('registerPage.validation.usernameMaxLength', "Tên đăng nhập không được vượt quá 50 ký tự") }
                      })}
                    />
                    <Form.Control.Feedback type="invalid">{errors.username?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="regEmail">
                    <Form.Label>{t('registerPage.emailLabel', 'Email')}</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder={t('registerPage.emailPlaceholder', 'Nhập email của bạn')}
                      isInvalid={!!errors.email}
                      {...register("email", {
                          required: t('registerPage.validation.emailRequired', "Email là bắt buộc"),
                          pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: t('registerPage.validation.emailInvalid', "Địa chỉ email không hợp lệ") }
                      })}
                    />
                     <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="regPassword">
                    <Form.Label>{t('registerPage.passwordLabel', 'Mật khẩu')}</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder={t('registerPage.passwordPlaceholder', 'Tạo mật khẩu')}
                      isInvalid={!!errors.password}
                      {...register("password", {
                          required: t('registerPage.validation.passwordRequired', "Mật khẩu là bắt buộc"),
                          minLength: { value: 6, message: t('registerPage.validation.passwordMinLength', "Mật khẩu phải có ít nhất 6 ký tự") }
                      })}
                    />
                     <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
                  </Form.Group>

                   <Form.Group className="mb-3" controlId="regConfirmPassword">
                    <Form.Label>{t('registerPage.confirmPasswordLabel', 'Xác nhận mật khẩu')}</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder={t('registerPage.confirmPasswordPlaceholder', 'Xác nhận mật khẩu của bạn')}
                      isInvalid={!!errors.confirmPassword}
                      {...register("confirmPassword", {
                          required: t('registerPage.validation.confirmPasswordRequired', "Vui lòng xác nhận mật khẩu của bạn"),
                          validate: value => value === passwordValue || t('registerPage.validation.passwordMismatch', "Mật khẩu không khớp")
                      })}
                    />
                     <Form.Control.Feedback type="invalid">{errors.confirmPassword?.message}</Form.Control.Feedback>
                  </Form.Group>

                   <Row>
                        <Form.Group as={Col} md={6} className="mb-3" controlId="regFirstName">
                          <Form.Label>{t('registerPage.firstNameLabel', 'Tên')}</Form.Label>
                          <Form.Control type="text" placeholder={t('registerPage.firstNamePlaceholder', 'Tên của bạn')} {...register("firstName")} />
                        </Form.Group>
                         <Form.Group as={Col} md={6} className="mb-3" controlId="regLastName">
                           <Form.Label>{t('registerPage.lastNameLabel', 'Họ')}</Form.Label>
                           <Form.Control type="text" placeholder={t('registerPage.lastNamePlaceholder', 'Họ của bạn')} {...register("lastName")} />
                         </Form.Group>
                   </Row>

                  <Button variant="primary" type="submit" className="w-100 mt-3" disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : t('registerPage.submitButton', 'Tạo tài khoản')}
                  </Button>
                </Form>
              )}

                {/* Link quay lại Login */}
                 <div className="text-center mt-4" style={{ fontSize: '0.9em' }}>
              {t('registerPage.hasAccount', 'Đã có tài khoản?')} <Link to="/login" className="fw-bold fs-6">{t('registerPage.loginNow', 'Đăng nhập')}</Link>
              </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
}

export default RegisterPage;