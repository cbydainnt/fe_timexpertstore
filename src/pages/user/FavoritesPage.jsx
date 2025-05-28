import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { getMyFavorites, removeFavoriteByProductId } from '../../services/favoriteService';
import ProductCard from '../../components/products/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const pageVariants = { initial: { opacity: 0 }, in: { opacity: 1 }, out: { opacity: 0 } };
const pageTransition = { duration: 0.4 };

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyFavorites();
      const processed = (response.data || []).map(fav => ({
        ...fav,
        product: {
          ...fav.product,
          primaryImageUrl: getFullImageUrl(fav.product)
        }
      }));
      setFavorites(processed);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError(err.response?.data?.message || "Failed to load favorites.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (productId, productName) => {
    if (window.confirm(`Xóa "${productName}" khỏi Sản phẩm yêu thích của bạn?`)) {
      try {
        await removeFavoriteByProductId(productId);
        toast.success(`"${productName}" đã được xóa khỏi Sản phẩm yêu thích.`);
        fetchFavorites();
      } catch (err) {
        console.error("Error removing favorite:", err);
        toast.error(err.response?.data?.message || "Lỗi xóa Sản phẩm yêu thích.");
      }
    }
  };

  const getFullImageUrl = (product) => {
    const BASE = "http://localhost:8080";

    // Kiểm tra cả primaryImageUrl và imageUrls
    const raw =
      product?.primaryImageUrl?.trim() ||
      (product?.imageUrls?.find(url => url?.trim()) || '');

    if (!raw) return '/fallback-image.png';

    try {
      return new URL(raw, BASE).href;
    } catch (e) {
      console.error("Invalid URL:", raw, e);
      return '/fallback-image.png';
    }
  };


  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
      <Container className="py-4">
        <h1 className="mb-4">Sản phẩm yêu thích của tôi</h1>

        {loading && <LoadingSpinner />}
        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && (
          <>
            {favorites.length === 0 ? (
              <Alert variant="info">
                Bạn chưa thêm bất kỳ sản phẩm nào vào mục yêu thích của mình. <Link to="/products">Khám phá sản phẩm!</Link>
              </Alert>
            ) : (
              <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {favorites.map((fav) => (
                  <Col
                    key={fav.favoriteId ? `fav_${fav.favoriteId}` : `product_${fav.product.productId}`}
                  >
                    <ProductCard
                      product={{
                        ...fav.product,
                        primaryImageUrl: getFullImageUrl(fav.product)
                      }}
                      isFavoritePage={true}
                      onRemoveFavorite={handleRemoveFavorite}
                    />
                  </Col>
                ))}
              </Row>

            )}
          </>
        )}
      </Container>
    </motion.div>
  );
}

export default FavoritesPage;
