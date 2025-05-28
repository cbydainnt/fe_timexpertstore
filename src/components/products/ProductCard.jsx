import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Col, Card, Button, Row } from 'react-bootstrap';
import { CartPlus, Heart, HeartFill } from 'react-bootstrap-icons';
import { useCartStore } from '../../store/cartStore';
import StockBadge from '../common/StockBadge';
import { addFavorite, removeFavoriteByProductId } from '../../services/favoriteService';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import '../../styles/product-card.css';
import { useTranslation } from 'react-i18next'; 
function ProductCard({ product, isFavoritePage = false, onRemoveFavorite, favoriteProductIds = [] }) {

  const { t } = useTranslation();

  const { addItem: addItemToCart } = useCartStore();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  const initialFavorite = favoriteProductIds.includes(product.productId);
  const [isFavoriteLocal, setIsFavoriteLocal] = useState(initialFavorite);

  const BASE_IMAGE_URL = 'http://localhost:8080';

  if (!product || !product.productId) return null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info(t('productCard.toasts.loginToAddCart', 'Vui lòng đăng nhập để thêm vào giỏ hàng.'));
      navigate('/login');
      return;
    }
    if (product.stock <= 0) {
      toast.warn(t('productCard.toasts.outOfStock', 'Sản phẩm hiện đã hết hàng.'));
      return;
    }
    addItemToCart({
      productId: product.productId,
      name: product.name,
      price: product.price,
      imageUrl: product.primaryImageUrl || product.imageUrls?.[0],
      stock: product.stock
    }, 1);
    toast.success(t('toastMessages.itemAddedToCart', 'Đã thêm "{{itemName}}" vào giỏ hàng!', { itemName: product.name }));
  };


   const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info(t('productCard.toasts.loginToFavorite', 'Vui lòng đăng nhập để sử dụng chức năng yêu thích.'));
      navigate('/login');
      return;
    }

    setIsFavoriteLoading(true);
    try {
      if (isFavoriteLocal) {
        await removeFavoriteByProductId(product.productId);
        setIsFavoriteLocal(false);
        toast.success(t('productCard.toasts.removedFromFavorites', '"{{productName}}" đã được xoá khỏi yêu thích.', { productName: product.name }));
        if (isFavoritePage && onRemoveFavorite) { // Gọi callback để cập nhật UI trang Favorites
            onRemoveFavorite(product.productId, product.name);
        }
      } else {
        await addFavorite(product.productId);
        setIsFavoriteLocal(true);
        toast.success(t('productCard.toasts.addedToFavorites', '"{{productName}}" đã được thêm vào yêu thích!', { productName: product.name }));
      }
    } catch (err) {
      console.error("Favorite action failed:", err);
      toast.error(t('productCard.toasts.favoriteActionFailed', 'Thao tác yêu thích thất bại.'));
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const rawUrl = (() => {
    if (product?.primaryImageUrl && product.primaryImageUrl.trim()) return product.primaryImageUrl.trim();
    if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
      const fallback = product.imageUrls.find(url => typeof url === 'string' && url.trim());
      return fallback?.trim() || null;
    }
    return null;
  })();

  const getImageUrl = (product) => {
    const raw =
      product?.primaryImageUrl?.trim() ||
      product?.imageUrls?.[0]?.trim() ||
      '';

    if (!raw) return '/fallback-image.png';

    try {
      return new URL(raw, BASE_IMAGE_URL).href;
    } catch (e) {
      console.error("Invalid image URL:", raw);
      return '/fallback-image.png';
    }
  };
  const imageUrl = getImageUrl(product);
  return (
    <Card className="product-card h-100 position-relative border-0">
      <Link to={`/products/${product.productId}`} className="text-decoration-none text-dark">
        <div style={{ height: '200px', overflow: 'hidden' }}>

          <Card.Img
            variant="top"
            src={imageUrl}
            alt={product.name}
            style={{ objectFit: 'contain', height: '100%', width: '100%' }}
            className="product-card-img"

          />


        </div>
      </Link>

      {/* Nút yêu thích hoặc xóa khỏi yêu thích */}
      {isFavoritePage ? (
        <Button
          variant="link"
          className="position-absolute top-0 end-0"
          style={{
            color: 'black',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textDecoration: 'none',
            border: 'none',
            background: 'transparent',
            padding: '0.25rem 0.5rem',
            zIndex: 10
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemoveFavorite?.(product.productId, product.name);
          }}
           title={t('productCard.buttons.removeFromFavoritesTitle', "Xóa khỏi Yêu thích")}
        >
          ✕
        </Button>
      ) : (
        <Button
          variant="light"
          size="sm"
          onClick={handleToggleFavorite}
          className="btn-heart position-absolute top-0 end-0 m-2 rounded-circle"
          disabled={isFavoriteLoading}
          title={isFavoriteLocal ? t('productCard.buttons.unfavoriteTitle', "Bỏ yêu thích") : t('productCard.buttons.favoriteTitle', "Yêu thích")}
        >
          {isFavoriteLocal ? (
            <HeartFill size={20} color="#0675b1" />
          ) : (
            <Heart size={20} color="#0675b1" />
          )}
        </Button>

      )}

      <Card.Body className="d-flex flex-column product-card-body">
        <Card.Title className="h6 mb-1 text-truncate">
          <Link to={`/products/${product.productId}`} className="text-decoration-none text-dark">
            {product.name}
          </Link>
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted small">
          {product.categoryName || 'Chưa phân loại'}
        </Card.Subtitle>
        <div className="mt-2 mb-2 d-flex justify-content-center align-items-center ps-0">
          <StockBadge stock={product.stock} />
        </div>
        <div className="mt-2 text-left fw-bold h5">
          {formatPrice(product.price)}
        </div>
        <div className="add-to-cart-wrapper mt-auto text-center">
          <Button
            variant="danger"
            className="add-to-cart-btn w-75"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            Thêm vào giỏ
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;