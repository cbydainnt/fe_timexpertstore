import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const AboutPage = () => {
  return (
    <Container className="my-5">
      <h1>Về chúng tôi</h1>
      <Row className="mt-4">
        <Col md={6}>
          <p>
            Chúng tôi là cửa hàng đồng hồ uy tín với hơn 10 năm kinh nghiệm trong lĩnh vực cung cấp các sản phẩm đồng hồ chính hãng, đa dạng mẫu mã và giá cả hợp lý.
          </p>
          <p>
            Với sứ mệnh mang đến cho khách hàng những chiếc đồng hồ chất lượng và dịch vụ chăm sóc tận tâm, chúng tôi luôn cập nhật các xu hướng mới nhất và cam kết về nguồn gốc sản phẩm.
          </p>
          <p>
            Đội ngũ nhân viên chuyên nghiệp, am hiểu sâu sắc về đồng hồ luôn sẵn sàng tư vấn và hỗ trợ bạn tìm được chiếc đồng hồ ưng ý nhất.
          </p>
        </Col>
        <Col md={6}>
          <img 
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=60" 
            alt="Cửa hàng đồng hồ" 
            className="img-fluid rounded" 
          />
        </Col>
      </Row>
    </Container>
  );
};

export default AboutPage;
