import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { getMyFavorites, removeFavoriteByProductId } from '../../services/favoriteService';
import ProductCard from '../../components/products/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next'; // << THÊM IMPORT

const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };
const pageTransition = { duration: 0.4 };

function FavoritesPage() {
  const { t } = useTranslation(); // << SỬ DỤNG HOOK
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sử dụng VITE_API_URL_IMAGES từ biến môi trường, hoặc fallback
  const BASE_IMAGE_URL = import.meta.env.VITE_API_URL_IMAGES || 'http://localhost:8080';

  const getFullImageUrl = useCallback((product) => {
    const raw =
      product?.primaryImageUrl?.trim() ||
      (product?.imageUrls?.find(url => url?.trim()) || '');

    if (!raw) return '/fallback-image.png'; // Ảnh fallback mặc định

    try {
      // Nếu URL đã là tuyệt đối (bắt đầu bằng http), dùng trực tiếp
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        return raw;
      }
      // Ngược lại, ghép với BASE_IMAGE_URL
      return new URL(raw, BASE_IMAGE_URL).href;
    } catch (e) {
      console.error("Invalid image URL:", raw, e);
      return '/fallback-image.png';
    }
  }, [BASE_IMAGE_URL]);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyFavorites();
      const processed = (response.data || []).map(fav => ({
        ...fav,
        product: {
          ...fav.product,
          // getFullImageUrl cần được định nghĩa hoặc import nếu nó ở ngoài
          primaryImageUrl: getFullImageUrl(fav.product)
        }
      }));
      setFavorites(processed);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError(err.response?.data?.message || t('favoritesPage.loadingError')); // Dịch lỗi
    } finally {
      setLoading(false);
    }
  }, [t, getFullImageUrl]); // Thêm t và getFullImageUrl vào dependencies

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (productId, productName) => {
    // Dịch thông báo xác nhận
    if (window.confirm(t('favoritesPage.confirmRemoveMessage', { productName: productName || t('common.thisProduct') }))) {
      try {
        await removeFavoriteByProductId(productId);
        // Dịch toast thành công
        toast.success(t('favoritesPage.removedSuccessToast', { productName: productName || t('common.thisProduct') }));
        fetchFavorites(); // Tải lại danh sách yêu thích
      } catch (err) {
        console.error("Error removing favorite:", err);
        // Dịch toast lỗi
        toast.error(err.response?.data?.message || t('favoritesPage.removeErrorToast', { productName: productName || t('common.thisProduct') }));
      }
    }
  };

  if (loading) return <LoadingSpinner text={t('common.loading')} />; // Dịch text loading
  if (error) return <Container className="py-4"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
      <Container className="py-4">
        {/* Dịch tiêu đề trang */}
        <h1 className="mb-4">{t('favoritesPage.title')}</h1>

        {!loading && !error && (
          <>
            {favorites.length === 0 ? (
              <Alert variant="info">
                {/* Dịch thông báo không có sản phẩm */}
                {t('favoritesPage.noFavoritesMessage')}{' '}
                <Link to="/products">{t('favoritesPage.exploreProductsLinkText')}</Link>
              </Alert>
            ) : (
              <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {favorites.map((fav) => (
                  <Col
                    // Key nên là duy nhất, favoriteId là tốt nhất
                    key={fav.id || fav.product.productId} // Sử dụng fav.id nếu có từ DTO, nếu không dùng tạm productId
                  >
                    <ProductCard
                      product={{
                        ...fav.product,
                        // Đảm bảo primaryImageUrl được xử lý đúng
                        primaryImageUrl: getFullImageUrl(fav.product)
                      }}
                      isFavoritePage={true}
                      onRemoveFavorite={handleRemoveFavorite}
                      // favoriteProductIds không cần thiết cho ProductCard khi isFavoritePage=true vì nó sẽ hiển thị nút xóa
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