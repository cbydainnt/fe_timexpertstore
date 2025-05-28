import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next'; 
const ContactPage = () => {
  const { t } = useTranslation();
  return (
    <Container className="my-5">
      <h1>{t('contactPage.title', 'Liên hệ với chúng tôi')}</h1>
      <p>{t('contactPage.intro', 'Nếu bạn có bất kỳ thắc mắc hay cần hỗ trợ, hãy điền thông tin bên dưới hoặc liên hệ trực tiếp qua:')}</p>
      <ul>
        <li>{t('contactPage.addressLabel', 'Địa chỉ')}: {t('contactPage.addressValue', '39 Phố Thi Sách, P. Phạm Đình Hổ, Q. Hai Bà Trưng, TP Hà Nội')}</li>
        <li>{t('contactPage.phoneLabel', 'Điện thoại')}: {t('contactPage.phoneValue', '028 3456 8899')}</li>
        <li>{t('contactPage.emailLabel', 'Email')}: {t('contactPage.emailValue', 'support@timexpert.vn')}</li>
      </ul>

      <Row className="mt-4">
        <Col md={6}>
          <Form>
            <Form.Group controlId="formName" className="mb-3">
              <Form.Label>{t('contactPage.form.nameLabel', 'Họ và tên')}</Form.Label>
              <Form.Control type="text" placeholder={t('contactPage.form.namePlaceholder', 'Nhập họ và tên')} />
            </Form.Group>

            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>{t('contactPage.form.emailLabel', 'Email')}</Form.Label>
              <Form.Control type="email" placeholder={t('contactPage.form.emailPlaceholder', 'Nhập email')} />
            </Form.Group>

            <Form.Group controlId="formMessage" className="mb-3">
              <Form.Label>{t('contactPage.form.messageLabel', 'Nội dung')}</Form.Label>
              <Form.Control as="textarea" rows={4} placeholder={t('contactPage.form.messagePlaceholder', 'Nhập nội dung liên hệ')} />
            </Form.Group>

            <Button variant="primary" type="submit">
              {t('contactPage.form.submitButton', 'Gửi')}
            </Button>
          </Form>
        </Col>
        <Col md={6}>
          <img
            src="https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=600&q=60"
            alt={t('contactPage.imageAlt', 'Đồng hồ sang trọng')} // Dịch cả alt text
            className="img-fluid rounded"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ContactPage;
