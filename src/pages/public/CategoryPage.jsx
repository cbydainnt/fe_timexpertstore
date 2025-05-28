// src/pages/public/CategoryPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories } from '../../services/categoryService';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import { Grid3x3GapFill } from 'react-bootstrap-icons';
import '../../styles/category-page.css';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};
const pageTransition = { duration: 0.4 };

function CategoryPage() {
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
        a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
      );
      setCategories(sortedCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Không thể tải danh mục.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndSortCategories();
  }, [fetchAndSortCategories]);

  if (loading) return <LoadingSpinner />;

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
          <Grid3x3GapFill size={28} className="me-2 text-primary" />
          <h1 className="h3 fw-bold mb-0">Khám phá danh mục sản phẩm</h1>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {categories.length === 0 ? (
          <Alert variant="info">Không có danh mục nào.</Alert>
        ) : (
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
                          {category.name}
                        </Link>
                      </Card.Title>
                      <Card.Text className="small text-muted">
                        {category.description || 'Danh mục sản phẩm'}
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
                        Xem sản phẩm
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
