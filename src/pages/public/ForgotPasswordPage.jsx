// src/pages/public/ForgotPasswordPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { useForm } from 'react-hook-form';
import { forgotPassword } from '../../services/authService';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

function ForgotPasswordPage() {
  const navigate = useNavigate(); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await forgotPassword(data.email);
      // Chuyển hướng đến trang reset-password và truyền email qua state
      navigate('/reset-password', { state: { email: data.email } });
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.response?.data?.message || err.message || 'Failed to send OTP. Please check the email address.');
      setLoading(false); // Chỉ tắt loading khi có lỗi ở đây
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <Row className="justify-content-center w-100">
        <Col md={6} lg={5} xl={4}>
          <Card className="p-4 shadow-lg border-0 rounded-3">
            <Card.Body>
              <h2 className="text-center mb-4 fw-bold">Quên mật khẩu</h2>
              {error && <Alert variant="danger" className="text-center small py-2">{error}</Alert>}

              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Nhập Email đã đăng ký của bạn.</Form.Label>
                  <Form.Control
                    type="email" placeholder="Địa chỉ Email" isInvalid={!!errors.email}
                    {...register("email", { required: "Email là bắt buộc", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" } })}
                  />
                  <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mt-3" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : 'Gửi mã OTP'}
                </Button>
              </Form>

              <div className="text-center mt-4" style={{ fontSize: '0.9em' }}>
                <Link to="/login">Quay lại Đăng nhập</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ForgotPasswordPage;