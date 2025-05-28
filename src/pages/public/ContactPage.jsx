import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

const ContactPage = () => {
  return (
    <Container className="my-5">
      <h1>Liên hệ với chúng tôi</h1>
      <p>Nếu bạn có bất kỳ thắc mắc hay cần hỗ trợ, hãy điền thông tin bên dưới hoặc liên hệ trực tiếp qua:</p>
      <ul>
        <li>Địa chỉ: 39 Phố Thi Sách, P. Phạm Đình Hổ, Q. Hai Bà Trưng, TP Hà Nội</li>
        <li>Điện thoại: 028 3456 8899</li>
        <li>Email: support@timexpert.vn</li>
      </ul>

      <Row className="mt-4">
        <Col md={6}>
          <Form>
            <Form.Group controlId="formName" className="mb-3">
              <Form.Label>Họ và tên</Form.Label>
              <Form.Control type="text" placeholder="Nhập họ và tên" />
            </Form.Group>

            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="Nhập email" />
            </Form.Group>

            <Form.Group controlId="formMessage" className="mb-3">
              <Form.Label>Nội dung</Form.Label>
              <Form.Control as="textarea" rows={4} placeholder="Nhập nội dung liên hệ" />
            </Form.Group>

            <Button variant="primary" type="submit">
              Gửi
            </Button>
          </Form>
        </Col>
        <Col md={6}>
          <img 
            src="https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=600&q=60" 
            alt="Đồng hồ sang trọng" 
            className="img-fluid rounded" 
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ContactPage;
