// src/pages/public/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <Container className="text-center py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="display-1 fw-bold">404</h1>
          <p className="h2">{t('notFoundPage.title', 'Trang không tồn tại')}</p>
          <p className="lead mb-4">
            {t('notFoundPage.message', 'Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm. Trang có thể đã bị xóa, đổi tên hoặc tạm thời không có sẵn.')}
          </p>
          <Link to="/">
            <Button variant="primary">{t('notFoundPage.backToHome', 'Quay về Trang chủ')}</Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
}
export default NotFoundPage;