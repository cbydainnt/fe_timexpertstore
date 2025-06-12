import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap'; // Bỏ Col, Row
import { Heart, HeartFill } from 'react-bootstrap-icons'; // Bỏ CartPlus nếu không dùng icon trực tiếp
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

  // Sử dụng VITE_API_URL_IMAGES hoặc fallback
  const BASE_IMAGE_URL = import.meta.env.VITE_API_URL_IMAGES || 'http://localhost:8080';

  const [isFavoriteLocal, setIsFavoriteLocal] = useState(
    () => product && product.productId ? favoriteProductIds.includes(product.productId) : false
  );

  useEffect(() => {
    if (product && product.productId) {
      setIsFavoriteLocal(favoriteProductIds.includes(product.productId));
    }
  }, [favoriteProductIds, product]);

  if (!product || !product.productId) return null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info(t('productCard.toasts.loginToAddCart'));
      navigate('/login');
      return;
    }
    if (product.stock <= 0) {
      toast.warn(t('productCard.toasts.outOfStock'));
      return;
    }
    addItemToCart({
      productId: product.productId,
      name: product.name,
      price: product.price,
      imageUrl: getImageUrl(product),
      stock: product.stock
    }, 1);
    toast.success(t('toastMessages.itemAddedToCart', { itemName: product.name }));
  };

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info(t('productCard.toasts.loginToFavorite'));
      navigate('/login');
      return;
    }
    setIsFavoriteLoading(true);
    try {
      if (isFavoriteLocal) {
        await removeFavoriteByProductId(product.productId);
        setIsFavoriteLocal(false);
        toast.success(t('productCard.toasts.removedFromFavorites', { productName: product.name }));
        if (isFavoritePage && typeof onRemoveFavorite === 'function') {
          onRemoveFavorite(product.productId, product.name);
        }
      } else {
        await addFavorite(product.productId);
        setIsFavoriteLocal(true);
        toast.success(t('productCard.toasts.addedToFavorites', { productName: product.name }));
      }
    } catch (err) {
      console.error("Favorite action failed:", err);
      toast.error(t('productCard.toasts.favoriteActionFailed'));
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }

  const getImageUrl = (prod) => {
    const raw =
      prod?.primaryImageUrl?.trim() ||
      (Array.isArray(prod?.imageUrls) && prod.imageUrls.length > 0 ? prod.imageUrls[0]?.trim() : '') ||
      '';
    if (!raw) return '/fallback-image.png';
    try {
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        return raw;
      }
      return new URL(raw, BASE_IMAGE_URL).href;
    } catch (e) {
      console.error("Invalid image URL in ProductCard:", raw, e);
      return '/fallback-image.png';
    }
  };
  const imageUrlToDisplay = getImageUrl(product);

  return (
    <Card className="product-card h-100 position-relative border-0">
      <Link to={`/products/${product.productId}`} className="text-decoration-none text-dark product-card-link">
        <div className="product-card-img-wrapper" style={{ height: '200px', overflow: 'hidden' }}> {/* Giữ style gốc nếu có */}
          <Card.Img
            variant="top"
            src={imageUrlToDisplay}
            alt={t('common.productImageAlt', { productName: product.name })}
            style={{ objectFit: 'contain', height: '100%', width: '100%' }} // Giữ style gốc
            className="product-card-img"
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.src = '/fallback-image.png';
            }}
          />
        </div>
      </Link>

      {isFavoritePage ? (
        <Button
          variant="link"
          className="position-absolute top-0 end-0" // Giữ class gốc
          style={{ // Giữ style gốc
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
            if (typeof onRemoveFavorite === 'function') {
              onRemoveFavorite(product.productId, product.name);
            }
          }}
          title={t('productCard.buttons.removeFromFavoritesTitle')}
        >
          ✕
        </Button>
      ) : (
        <Button
          variant="light" // Giữ variant gốc
          size="sm"
          onClick={handleToggleFavorite}
          className="btn-heart position-absolute top-0 end-0 m-2 rounded-circle" // Giữ class gốc
          disabled={isFavoriteLoading}
          title={isFavoriteLocal ? t('productCard.buttons.unfavoriteTitle') : t('productCard.buttons.favoriteTitle')}
        >
          {isFavoriteLocal ? (
            <HeartFill size={20} color="#0675b1" /> // Giữ màu gốc
          ) : (
            <Heart size={20} color="#0675b1" /> // Giữ màu gốc
          )}
        </Button>
      )}

      <Card.Body className="d-flex flex-column product-card-body">
        <Card.Title className="h6 mb-1 text-truncate product-card-title"> {/* Giữ class gốc */}
          <Link to={`/products/${product.productId}`} className="text-decoration-none text-dark">
            {product.name}
          </Link>
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted small product-card-category"> {/* Giữ class gốc */}
          {product.categoryName || t('productCard.defaultCategoryName')}
        </Card.Subtitle>
        {/* Giữ nguyên div và class của StockBadge như file gốc của bạn */}
        <div className="mt-2 mb-2 d-flex justify-content-center align-items-center ps-0">
          <StockBadge stock={product.stock} />
        </div>
        {/* Giữ nguyên div và class của giá như file gốc */}
        <div className="mt-2 text-left fw-bold h5"> {/* Đảm bảo text-left nếu bạn muốn */}
          {formatPrice(product.price)}
        </div>
        <div className="add-to-cart-wrapper mt-auto text-center">
          <Button
            variant="danger" // Giữ variant gốc
            className="add-to-cart-btn w-75" // Giữ class gốc
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            {t('productCard.buttons.addToCart')}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;