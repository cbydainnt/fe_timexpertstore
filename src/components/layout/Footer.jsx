import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import { Watch } from 'react-bootstrap-icons';
import '../../styles/footer.css'; 

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer
      style={{
        backgroundColor: '#1f1f1f',
        color: '#ddd',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(50px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        paddingTop: '2rem',
        paddingBottom: '1rem',
      }}
      className="mt-auto"
    >
      <Container>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-4">
          {/* Về chúng tôi */}
          <div style={{ maxWidth: '500px' }}>
            <h5 className="text-warning mb-3 d-flex align-items-center">
              <Watch size={24} className="me-2" />
              Về chúng tôi
            </h5>
            <p style={{ color: '#bbb' }}>
              Chúng tôi là cửa hàng đồng hồ uy tín với hơn 10 năm kinh nghiệm, cung cấp đồng hồ chính hãng đa dạng mẫu mã, dịch vụ tận tâm và giá cả hợp lý. Cam kết mang đến trải nghiệm đẳng cấp cho khách hàng.
            </p>
          </div>
          
          {/* Thông tin bản quyền và nút lên đầu */}
          <div className="text-center text-md-end">
            <button
              onClick={scrollToTop}
              className="btn btn-warning text-dark fw-semibold rounded-pill mb-3"
              style={{ transition: 'all 0.3s ease' }}
            >
              ↑ Quay lên đầu
            </button>

            <p className="mb-1" style={{ fontSize: '0.9rem' }}>
              &copy; {currentYear} TimeXpert. Mọi quyền được bảo lưu.
            </p>

            <p className="text-muted small">
              Đồ án tốt nghiệp của <span className="text-warning fw-semibold">Thành</span>
            </p>
          </div>
          <div>
            <h5 className="text-warning mb-3">Địa chỉ cửa hàng</h5>
            <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d586.5594211704706!2d105.85394687733951!3d21.015884016226583!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135abf2e191309d%3A0x12560d29ced0e727!2zMzkgUC4gVGhpIFPDoWNoLCBOZ8O0IFRow6wgTmjhuq1tLCBIYWkgQsOgIFRyxrBuZywgSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1747848722717!5m2!1svi!2s" 
            width="400" 
            height="200" 
            style={{border:0}} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
             title="Địa chỉ cửa hàng Tinh Hoa Thời Gian">
            </iframe>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
