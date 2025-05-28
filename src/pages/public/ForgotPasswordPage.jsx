import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { forgotPassword } from '../../services/authService';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await forgotPassword(data.email);
      navigate('/reset-password', { state: { email: data.email } });
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('forgotPasswordPage.errorMessage', 'Gửi OTP thất bại. Vui lòng kiểm tra lại địa chỉ email.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <Row className="justify-content-center w-100">
        <Col md={6} lg={5} xl={4}>
          <Card className="p-4 shadow-lg border-0 rounded-3">
            <Card.Body>
              <h2 className="text-center mb-4 fw-bold">{t('forgotPasswordPage.title', 'Quên mật khẩu')}</h2>
              {error && <Alert variant="danger" className="text-center small py-2">{error}</Alert>}
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>{t('forgotPasswordPage.emailLabel', 'Nhập Email đã đăng ký của bạn.')}</Form.Label>
                  <Form.Control
                    type="email" placeholder={t('forgotPasswordPage.emailPlaceholder', 'Địa chỉ Email')}
                    isInvalid={!!errors.email}
                    {...register("email", {
                      required: t('forgotPasswordPage.validation.emailRequired', "Email là bắt buộc"),
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: t('forgotPasswordPage.validation.emailInvalid', "Địa chỉ email không hợp lệ") }
                    })}
                  />
                  <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 mt-3" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : t('forgotPasswordPage.submitButton', 'Gửi mã OTP')}
                </Button>
              </Form>
              <div className="text-center mt-4" style={{ fontSize: '0.9em' }}>
                <Link to="/login">{t('forgotPasswordPage.backToLogin', 'Quay lại Đăng nhập')}</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ForgotPasswordPage;