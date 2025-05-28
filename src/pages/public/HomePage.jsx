// src/pages/public/HomePage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getFavoriteProductIds } from '../../services/favoriteService';
import { useAuthStore } from '../../store/authStore';
import { Container, Row, Col, Button, Spinner, Alert, Card, Image, Badge } from 'react-bootstrap';
import Carousel from 'react-bootstrap/Carousel';
import { getProducts } from '../../services/productService';
import ProductCard from '../../components/products/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ShieldCheck, Truck, Award } from 'react-bootstrap-icons';
import { motion } from 'framer-motion';

import '../../styles/banner.css';
import banner1 from '../../assets/images/banner1.png';
import banner2 from '../../assets/images/banner2.png';
import banner3 from '../../assets/images/banner3.png';
import banner from '../../assets/images/banner.jpg';
import bannerRight1 from '../../assets/images/banner-right1.jpg';
import bannerRight2 from '../../assets/images/banner-right2.jpg';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};
const pageTransition = { duration: 0.4 };

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteProductIds, setFavoriteProductIds] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const { isAuthenticated } = useAuthStore();

  const fetchFeaturedProducts = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = { page: 0, size: 5, sortBy: 'createdAt', sortDir: 'desc' };
      const response = await getProducts(params);
      setFeaturedProducts(response.data?.content || []);
    } catch (err) {
      console.error("Error fetching featured products:", err);
      setError("Could not load featured products.");
    } finally { setLoading(false); }
  }, []);

  const bannerSlides = [
    {
      image: banner,
      title: 'TINH HOA THỜI GIAN',
      subtitle: 'Khám phá những mẫu đồng hồ đẳng cấp và tinh xảo',
      link: '/products',
      buttonText: 'Khám Phá Bộ Sưu Tập'
    },
    {
      image: banner2,
      title: 'BỘ SƯU TẬP MỚI',
      subtitle: 'Phong cách hiện đại, đẳng cấp vượt thời gian',
      link: '/collections/new',
      buttonText: 'Xem Bộ Sưu Tập'
    },
    {
      image: banner3,
      title: 'SALE CUỐI NĂM',
      subtitle: 'Thời gian tạo nên đẳng cấp – Định hình phong cách với từng chiếc đồng hồ',
      link: '/products',
      buttonText: 'Mua Ngay'
    }
  ];

  useEffect(() => { fetchFeaturedProducts(); }, [fetchFeaturedProducts]);
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated) return;
      try {
        const ids = await getFavoriteProductIds();
        setFavoriteProductIds(ids);
      } catch (err) {
        console.error("Không thể tải sản phẩm yêu thích:", err);
      }
    };
    fetchFavorites();
  }, [isAuthenticated]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000); // mỗi 5 giây đổi slide

    return () => clearInterval(timer);
  }, [bannerSlides.length]);
  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
      <section className="custom-banner-wrapper mb-5">
        <Container fluid>
          <Row className="gx-4 align-items-stretch">
            <Col md={8} className="position-relative">
              <div className="custom-carousel-container h-100 d-flex flex-column">
                <Carousel
                  activeIndex={activeSlide}
                  onSelect={(selectedIndex) => setActiveSlide(selectedIndex)}
                  controls={false}
                  indicators={false}
                  interval={5000}
                  fade
                  className="flex-grow-1"
                >
                  {bannerSlides.map((slide, idx) => (
                    <Carousel.Item key={idx} className="h-100">
                      <div className="hero-banner-container no-radius h-100" style={{ backgroundImage: `url('${slide.image}')` }}>
                        <div className="hero-banner-overlay"></div>
                        {/* <div className="hero-banner-content">
                          <h1>{slide.title}</h1>
                          <p>{slide.subtitle}</p>
                          <Link to={slide.link}><Button>{slide.buttonText}</Button></Link>
                        </div> */}
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel>
                <div className="slide-description-tabs d-flex mt-3">
                  {bannerSlides.map((slide, idx) => (
                    <div
                      key={idx}
                      className={`slide-tab flex-fill px-3 py-2 text-center ${activeSlide === idx ? 'active' : ''}`}
                      onClick={() => setActiveSlide(idx)}
                      style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      {slide.subtitle}
                    </div>
                  ))}
                </div>
              </div>
            </Col>
            <Col md={4} className="d-flex flex-column justify-content-between">
              <div className="h-50">
                <img src={bannerRight1} className="img-fluid w-100 h-100 object-fit-cover" alt="Banner 1" />
              </div>
              <div className="h-50 mt-3">
                <img src={bannerRight2} className="img-fluid w-100 h-100 object-fit-cover" alt="Banner 2" />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Container thường cho các section khác */}
      <Container className="py-4">

        {/* --- Phần Sản phẩm nổi bật / Mới nhất --- */}
        <section className="featured-products-section mb-5 pb-3">
          <h2 className="text-center fw-bold mb-4 section-title">SẢN PHẨM NỔI BẬT</h2>
          {/* Hiển thị Loading hoặc Lỗi */}
          {loading && <LoadingSpinner />}
          {error && <Alert variant="warning" className="text-center">{error}</Alert>}
          {/* Hiển thị danh sách sản phẩm */}
          {!loading && !error && (
            <>
              {featuredProducts.length > 0 ? (
                <Row xs={1} sm={2} lg={5} className="g-4">
                  {featuredProducts.map((product) => (
                    <Col key={product.productId}>
                      <ProductCard product={product} favoriteProductIds={favoriteProductIds} />
                    </Col>
                  ))}
                </Row>
              ) : (<p className="text-center text-muted">Hiện chưa có sản phẩm nổi bật.</p>)}
              {/* Nút xem thêm sản phẩm */}
              <div className="text-center mt-5">
                <Link to="/products"> <Button variant="outline-dark">Xem tất cả sản phẩm</Button> </Link>
              </div>
            </>
          )}
        </section>
        {/* --- Kết thúc Sản phẩm nổi bật --- */}


        {/* --- Phần Tại sao chọn chúng tôi --- */}
        <section className="why-choose-us-section mb-5 py-5 bg-light rounded"> {/* Thêm nền nhạt và bo góc */}
          <Container> {/* Container con để căn giữa nội dung */}
            <h2 className="text-center fw-bold mb-5 section-title">TẠI SAO CHỌN CHÚNG TÔI</h2>
            <Row className="text-center g-4">
              <Col md={4}>
                <Card className="border-0 bg-transparent"> {/* Bỏ viền và nền Card */}
                  <Card.Body>
                    <ShieldCheck size={40} className="text-primary mb-3" />
                    <Card.Title as="h5" className="fw-semibold mb-2">Chính Hãng</Card.Title>
                    <Card.Text className="small text-muted">
                      Cam kết 100% sản phẩm chính hãng, nguồn gốc rõ ràng.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 bg-transparent">
                  <Card.Body>
                    <Award size={40} className="text-primary mb-3" />
                    <Card.Title as="h5" className="fw-semibold mb-2">Bảo Hành 2 Năm</Card.Title>
                    <Card.Text className="small text-muted">
                      An tâm sử dụng với chính sách bảo hành dài hạn, uy tín.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 bg-transparent">
                  <Card.Body>
                    <Truck size={40} className="text-primary mb-3" />
                    <Card.Title as="h5" className="fw-semibold mb-2">Miễn Phí Vận Chuyển</Card.Title>
                    <Card.Text className="small text-muted">
                      Giao hàng nhanh chóng, miễn phí trên toàn quốc.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>
        {/* --- Kết thúc Tại sao chọn chúng tôi --- */}


        {/* --- Phần Quảng cáo khác (Ví dụ) --- */}
        <section className="promo-section mb-5">
          <Row className="align-items-center g-4 bg-white p-4 p-md-5 rounded shadow-sm"> {/* Thêm nền trắng, padding, shadow */}
            <Col md={6}>
              <h2 className="h1 fw-bold mb-3">ĐẶC QUYỀN SANG TRỌNG</h2>
              <p className="text-muted mb-4">
                Những ưu đãi đặc biệt và bộ sưu tập giới hạn dành riêng cho khách hàng thân thiết của TimeXpert.
              </p>
              <Link to="/collections/special"> {/* Đường dẫn ví dụ */}
                <Button variant="dark">Xem Ngay</Button>
              </Link>
            </Col>
            <Col md={6} className="text-center">
              <Image src="https://via.placeholder.com/500x350?text=Luxury+Promo" fluid rounded alt="Luxury Collection" />
            </Col>
          </Row>
        </section>
        {/* --- Kết thúc Quảng cáo --- */}

      </Container>
    </motion.div>
  );
}

export default HomePage;

// Cần import thêm các component này nếu bạn dùng chúng