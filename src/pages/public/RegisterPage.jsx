// src/pages/public/RegisterPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { registerUser } from '../../services/authService'; // Import API service
// Import các component của React-Bootstrap
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};
const pageTransition = { duration: 0.4 };

function RegisterPage() {
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
          // Thêm các trường khác nếu form đăng ký yêu cầu
          // phone: '',
          // address: '',
          // dateOfBirth: '',
      }
  });

  // Theo dõi giá trị password để validate confirm password
  const passwordValue = watch('password');

  // Hàm xử lý khi submit form đăng ký
  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    // Dữ liệu gửi đi backend (không cần confirmPassword)
    const registrationData = {
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
         // Thêm các trường khác nếu có trong form và RegisterUserDTO
        // phone: data.phone,
        // address: data.address,
        // dateOfBirth: data.dateOfBirth || null,
    };

    try {
      const response = await registerUser(registrationData); // Gọi API đăng ký
      console.log("Đăng ký thành công:", response.data);
      setSuccess('Đăng ký thành công! Bây giờ bạn có thể đăng nhập.');
      // Có thể redirect về trang login sau vài giây
       setTimeout(() => navigate('/login'), 3000);
      // Hoặc hiển thị thông báo thành công và nút bấm về trang login
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.response?.data?.message || err.message || 'Đăng ký không thành công. Vui lòng thử lại.');
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
              <h2 className="text-center mb-4 fw-bold">Đăng ký</h2>

              {/* Hiển thị thông báo */}
              {success && <Alert variant="success">{success}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}

              {/* Chỉ hiển thị form nếu chưa đăng ký thành công */}
              {!success && (
                <Form onSubmit={handleSubmit(onSubmit)}>
                   {/* Username */}
                  <Form.Group className="mb-3" controlId="regUsername">
                    <Form.Label>Tên đăng nhập</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập tên đăng nhập"
                      isInvalid={!!errors.username}
                      {...register("username", {
                          required: "Tên đăng nhập là bắt buộc",
                          minLength: { value: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự" },
                          maxLength: { value: 50, message: "Tên đăng nhập không được vượt quá 50 ký tự" }
                      })}
                    />
                    <Form.Control.Feedback type="invalid">{errors.username?.message}</Form.Control.Feedback>
                  </Form.Group>

                   {/* Email */}
                  <Form.Group className="mb-3" controlId="regEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Nhập email của bạn"
                      isInvalid={!!errors.email}
                      {...register("email", {
                          required: "Email là bắt buộc",
                          pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Địa chỉ email không hợp lệ" }
                      })}
                    />
                     <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                  </Form.Group>

                   {/* Password */}
                  <Form.Group className="mb-3" controlId="regPassword">
                    <Form.Label>Mật khẩu</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Tạo mật khẩu"
                      isInvalid={!!errors.password}
                      {...register("password", {
                          required: "Mật khẩu là bắt buộc",
                          minLength: { value: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
                      })}
                    />
                     <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
                  </Form.Group>

                    {/* Confirm Password */}
                   <Form.Group className="mb-3" controlId="regConfirmPassword">
                    <Form.Label>Xác nhận mật khẩu</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Xác nhận mật khẩu của bạn"
                      isInvalid={!!errors.confirmPassword}
                      {...register("confirmPassword", {
                          required: "Vui lòng xác nhận mật khẩu của bạn",
                          validate: value => value === passwordValue || "Mật khẩu không khớp"
                      })}
                    />
                     <Form.Control.Feedback type="invalid">{errors.confirmPassword?.message}</Form.Control.Feedback>
                  </Form.Group>

                  {/* Optional Fields: First Name, Last Name etc. */}
                   <Row>
                        <Form.Group as={Col} md={6} className="mb-3" controlId="regFirstName">
                          <Form.Label>Tên</Form.Label>
                          <Form.Control type="text" {...register("firstName")} />
                        </Form.Group>
                         <Form.Group as={Col} md={6} className="mb-3" controlId="regLastName">
                           <Form.Label>Họ</Form.Label>
                           <Form.Control type="text" {...register("lastName")} />
                         </Form.Group>
                   </Row>
                    {/* Thêm các trường khác nếu cần */}


                  {/* Submit Button */}
                  <Button variant="primary" type="submit" className="w-100 mt-3" disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : 'Tạo tài khoản'}
                  </Button>
                </Form>
              )}

              {/* Link quay lại Login */}
              <div className="text-center mt-4" style={{ fontSize: '0.9em' }}>
              Đã có tài khoản? <Link to="/login" className="fw-bold fs-6">Đăng nhập</Link>
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