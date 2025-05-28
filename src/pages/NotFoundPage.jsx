// src/pages/NotFoundPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
// Import Bootstrap components
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
// Optional: Import an icon or image
import { ExclamationTriangle } from 'react-bootstrap-icons';

function NotFoundPage() {
  return (
    // Sử dụng Container để căn giữa nội dung
    <Container className="d-flex align-items-center justify-content-center text-center" style={{ minHeight: 'calc(100vh - 120px)' }}>{/* Giả sử header/footer cao 120px */}
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          {/* Có thể thêm ảnh minh họa 404 nếu muốn */}
          {/* <Image src="/path/to/your/404-image.svg" fluid className="mb-4" style={{ maxHeight: '200px' }}/> */}

          {/* Icon Lỗi */}
          <ExclamationTriangle size={64} className="text-warning mb-3" />

          <h1 className="display-4 fw-bold">404 - Page Not Found</h1>
          <p className="lead text-muted mt-3 mb-4">
            Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          {/* Nút quay về trang chủ */}
          <Link to="/">
            <Button variant="primary" size="lg">
              Go to Homepage
            </Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
}

export default NotFoundPage;