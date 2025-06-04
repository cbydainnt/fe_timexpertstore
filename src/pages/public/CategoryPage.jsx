// src/pages/public/CategoryPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories } from '../../services/categoryService';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap'; // Spinner không dùng trực tiếp ở đây nữa
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import { Grid3x3GapFill } from 'react-bootstrap-icons';
import '../../styles/category-page.css';
import { useTranslation } from 'react-i18next'; 

const pageVariants = {
  initial: { opacity: 0, y: 20 }, // Thêm y để có hiệu ứng trượt nhẹ
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};
const pageTransition = { duration: 0.4 };

function CategoryPage() {
  const { t, i18n } = useTranslation(); 
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAndSortCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllCategories();
      const fetchedCategories = response.data || [];
      const sortedCategories = fetchedCategories.sort((a, b) =>
        a.name.localeCompare(b.name, i18n.language, { sensitivity: 'base' }) 
      );
      setCategories(sortedCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(t('categoryPage.loadingError')); // Sử dụng key dịch
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [t, i18n.language]); // Thêm t và i18n.language vào dependencies

  useEffect(() => {
    fetchAndSortCategories();
  }, [fetchAndSortCategories]);

  // Truyền text đã dịch cho LoadingSpinner
  if (loading) return <LoadingSpinner text={t('common.loading')} />;

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Container className="py-4">
        <div className="d-flex align-items-center mb-4">
          <Grid3x3GapFill size={28} className="me-2 text grd3" />
          {/* Dịch tiêu đề trang */}
          <h1 className="h3 fw-bold mb-0">{t('categoryPage.title')}</h1>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && categories.length === 0 ? (
          // Dịch thông báo khi không có danh mục
          <Alert variant="info">{t('categoryPage.noCategoriesFound')}</Alert>
        ) : !loading && !error && (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {categories.map((category) => (
              <Col key={category.categoryId}>
                <Card className="h-100 border-0 shadow-sm category-card-hover">
                  <Card.Body className="d-flex flex-column justify-content-between text-center category-card-body">
                    <div>
                      <Card.Title className="h6 fw-bold mb-2 text-truncate category-title">
                        <Link
                          to={`/products?categoryId=${category.categoryId}`}
                          className="stretched-link text-decoration-none text-dark"
                        >
                          {category.name} {/* Tên category thường lấy từ API, có thể đã đa ngôn ngữ từ backend */}
                        </Link>
                      </Card.Title>
                      <Card.Text className="small text-muted">
                        {/* Dịch mô tả mặc định nếu category.description rỗng */}
                        {category.description || t('categoryPage.defaultCategoryDescription')}
                      </Card.Text>
                    </div>
                    <div className="category-button-wrapper mt-3">
                      <Button
                        as={Link}
                        to={`/products?categoryId=${category.categoryId}`}
                        size="sm"
                        variant="outline-primary"
                        className="category-button"
                      >
                        {/* Dịch nút xem sản phẩm */}
                        {t('categoryPage.viewProductsButton')}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </motion.div>
  );
}

export default CategoryPage;