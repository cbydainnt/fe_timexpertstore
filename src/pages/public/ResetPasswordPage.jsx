// src/pages/public/ResetPasswordPage.jsx

import React, { useState, useEffect } from 'react';
// *** THÊM useLocation ***
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { resetPassword } from '../../services/authService'; // API service này nhận { email, otp, newPassword }
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Eye, EyeSlash } from 'react-bootstrap-icons';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};
const pageTransition = { duration: 0.4 };

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation(); // *** Hook để lấy state từ navigate ***

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Lấy token từ URL (vẫn cần để xác thực ban đầu nếu backend yêu cầu)
  // Mặc dù luồng chính là OTP, backend có thể vẫn dùng token trong link email ban đầu (nếu logic cũ chưa bỏ hẳn)
  // Hoặc có thể bỏ hẳn việc dùng token trên URL nếu chỉ dùng OTP
  // const tokenFromUrl = searchParams.get('token');

  // Lấy email được truyền qua state từ ForgotPasswordPage
  const emailFromState = location.state?.email;

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Thêm state để lưu email (nếu cần hiển thị hoặc dùng lại)
  const [email, setEmail] = useState(emailFromState || '');

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: { otp: '', newPassword: '', confirmPassword: '' }
  });
  const newPasswordValue = watch('newPassword');

  // Kiểm tra xem có email không khi component mount
  useEffect(() => {
    if (!email) {
      setError('Truy cập không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu.');
      // Có thể redirect về trang forgot password
      setTimeout(() => navigate('/forgot-password', { replace: true }), 4000);
    }
  }, [email, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      // Gọi API resetPassword với email từ state và dữ liệu form
      await resetPassword({
        email: email, // Lấy email từ state (đã nhận qua navigate)
        otp: data.otp,
        newPassword: data.newPassword
      });
      setMessage('Mật khẩu của bạn đã được đặt lại thành công! Đang chuyển hướng đến đăng nhập...');
      reset(); // Xóa form
      // Redirect về trang login sau vài giây
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.response?.data?.message || err.message || 'Không đặt lại được mật khẩu. OTP có thể không hợp lệ hoặc đã hết hạn.');
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
          <Col md={6} lg={5} xl={4}>
            <Card className="p-4 shadow-lg border-0 rounded-3">
              <Card.Body>
                <h2 className="text-center mb-4 fw-bold">Đặt lại mật khẩu</h2>

                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                {/* Chỉ hiển thị form nếu có email và chưa thành công */}
                {email && !message && (
                  <Form onSubmit={handleSubmit(onSubmit)}>
                    {/* Hiển thị email (không cho sửa) */}
                    <Form.Group className="mb-3" controlId="resetEmail">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" value={email} readOnly disabled />
                    </Form.Group>

                    {/* OTP Input */}
                    <Form.Group className="mb-3" controlId="otp">
                      <Form.Label>Mã OTP</Form.Label>
                      <Form.Control
                        type="text" // Hoặc "number" nhưng text linh hoạt hơn
                        placeholder="Nhập OTP 6 chữ số"
                        isInvalid={!!errors.otp}
                        {...register("otp", {
                          required: "Mã OTP là bắt buộc",
                          minLength: { value: 6, message: "OTP phải có 6 chữ số" },
                          maxLength: { value: 6, message: "OTP phải có 6 chữ số" },
                          pattern: { value: /^\d{6}$/, message: "OTP phải có 6 chữ số" }
                        })}
                        inputMode="numeric"
                      />
                      <Form.Control.Feedback type="invalid">{errors.otp?.message}</Form.Control.Feedback>
                    </Form.Group>

                    {/* New Password */}
                    <Form.Group className="mb-3" controlId="newPassword">
                      <Form.Label>Mật khẩu mới</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu mới"
                          isInvalid={!!errors.newPassword}
                          {...register("newPassword", {
                            required: "Mật khẩu mới là bắt buộc",
                            minLength: { value: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
                          })}
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          tabIndex={-1}
                        >
                          {showNewPassword ? <EyeSlash /> : <Eye />}
                        </Button>
                        <Form.Control.Feedback type="invalid">
                          {errors.newPassword?.message}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>


                    {/* Confirm New Password */}
                    <Form.Group className="mb-3" controlId="confirmPassword">
                      <Form.Label>Nhập lại mật khẩu mới</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Nhập lại mật khẩu mới"
                          isInvalid={!!errors.confirmPassword}
                          {...register("confirmPassword", {
                            required: "Vui lòng xác nhận mật khẩu của bạn",
                            validate: value => value === newPasswordValue || "Mật khẩu không khớp"
                          })}
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeSlash /> : <Eye />}
                        </Button>
                        <Form.Control.Feedback type="invalid">
                          {errors.confirmPassword?.message}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>



                    <Button variant="primary" type="submit" className="w-100 mt-3" disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : 'Đặt lại mật khẩu'}
                    </Button>
                  </Form>
                )}
                {/* Hiển thị nếu không có email (bị truy cập trực tiếp sai cách) */}
                {!email && !error && (
                  <Alert variant="warning">Truy cập không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu trước.</Alert>
                )}

                {/* Link quay lại Login chỉ hiển thị khi chưa thành công */}
                {!message && (
                  <div className="text-center mt-4" style={{ fontSize: '0.9em' }}>
                    <Link to="/login">Quay lại Đăng nhập</Link>
                  </div>
                )}
                {/* Hoặc luôn hiển thị link Back to Login */}
                {message && ( // Hiển thị khi thành công
                  <div className="text-center mt-4">
                    <Link to="/login">Đi tới Đăng nhập</Link>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
}

export default ResetPasswordPage;