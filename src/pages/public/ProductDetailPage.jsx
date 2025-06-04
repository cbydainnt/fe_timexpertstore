import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Form, Spinner, Alert, Table, Card } from 'react-bootstrap';
import { CartPlus, Heart, HeartFill, ArrowLeft, StarFill } from 'react-bootstrap-icons';
import { getProductById } from '../../services/productService';
import { addFavorite, removeFavoriteByProductId, getFavoriteProductIds } from '../../services/favoriteService';
import { getVisibleProductReviews, submitProductReview } from '../../services/reviewService';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StockBadge from '../../components/common/StockBadge';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

import { useTranslation } from 'react-i18next';

import '../../styles/products-detail.css';

const StarRatingInput = ({ rating, setRating, disabled = false }) => {
  const { t } = useTranslation();
  const [hoverRating, setHoverRating] = useState(0);
  return (
    <div>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarFill
          key={star}
          onClick={() => !disabled && setRating(star)}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => !disabled && setHoverRating(0)}
          style={{
            cursor: disabled ? 'default' : 'pointer',
            color: (hoverRating || rating) >= star ? '#ffc107' : '#e4e5e9',
            fontSize: '1.8rem', // Kích thước sao lớn hơn chút
            marginRight: '4px'
          }}
          title={!disabled ? `${star} ${t(star > 1 ? 'productDetailPage.stars' : 'productDetailPage.star')}` : undefined}
        />
      ))}
    </div>
  );
};

const StarRatingDisplay = ({ rating, size = '1rem', count = 0 }) => {
  const { t } = useTranslation();
  // Nếu không có review count, hiển thị 5 sao rỗng
  // if (count === 0 || count == null) {
  //   return (
  //     <span className="star-rating-display d-flex align-items-center">
  //       {[...Array(5)].map((_, index) => (
  //         <StarFill key={index} style={{ color: '#e0e0e0', fontSize: size, marginRight: '2px' }} />
  //       ))}
  //       <span className="ms-2 text-muted small">{t('productDetailPage.noReviewsYet')}</span>
  //     </span>
  //   );
  // }
  return (
    <span className="star-rating-display d-flex align-items-center">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <StarFill
            key={starValue}
            style={{ color: starValue <= Math.round(rating) ? '#ffc107' : '#e0e0e0', fontSize: size, marginRight: '2px' }}
          />
        );
      })}
      {count > 0 && <span className="ms-2 text-muted small">({rating.toFixed(1)}/5 - {t('productDetailPage.totalReviews', { count })})</span>}
    </span>
  );
};

const pageVariants = { initial: { opacity: 0 }, in: { opacity: 1 }, out: { opacity: 0 } };
const pageTransition = { duration: 0.4 };

function ProductDetailPage() {

  const { t } = useTranslation();

  const { productId } = useParams();
  const navigate = useNavigate();
  const { addItem: addItemToCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [stockWarning, setStockWarning] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // States cho đánh giá
  const [reviews, setReviews] = useState([]);
  const [reviewCurrentPage, setReviewCurrentPage] = useState(0); // API dùng 0-based
  const [reviewTotalPages, setReviewTotalPages] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0); // Điểm sao người dùng chọn (0-5)
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const BASE_IMAGE_URL = import.meta.env.VITE_BASE_IMAGE_URL || 'http://localhost:8080';

  //  const fetchProduct = useCallback(async () => {
  //     if (!productId) { setError("Invalid product ID."); setLoading(false); return; }
  //     setLoading(true); setError(null);
  //     try {
  //       const response = await getProductById(productId);
  //       setProduct(response.data);
  //       const primaryImage = response.data.primaryImageUrl
  //         ? (response.data.primaryImageUrl.startsWith('http')
  //           ? response.data.primaryImageUrl
  //           : `${BASE_IMAGE_URL}${response.data.primaryImageUrl}`)
  //         : '';
  //       setSelectedImage(primaryImage);
  //     } catch (err) {
  //       const errorMsg = err.response?.data?.message || err.message || 'Failed to load product details.';
  //       setError(errorMsg);
  //       if (err.response?.status === 404) {
  //         setTimeout(() => navigate('/products', { replace: true }), 3000);
  //       }
  //     } finally {
  //       setLoading(false);
  //     }
  //   }, [productId, navigate, BASE_IMAGE_URL]);

  const fetchProduct = useCallback(async () => {
    if (!productId) { setError(t('productDetailPage.invalidId', "Mã sản phẩm không hợp lệ.")); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const response = await getProductById(productId);
      setProduct(response.data); // ProductDTO đã có averageRating, reviewCount
      const primaryImg = response.data.primaryImageUrl ? getFullImageUrl(response.data.primaryImageUrl) : (response.data.imageUrls?.[0] ? getFullImageUrl(response.data.imageUrls[0]) : '');
      setSelectedImage(primaryImg);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || t('toastMessages.errorFetchingProductDetail');
      setError(errorMsg);
      if (err.response?.status === 404) {
        setTimeout(() => navigate('/products', { replace: true }), 3000);
      }
    } finally {
      setLoading(false);
    }
  }, [productId, navigate, t]);

  const fetchReviewsForPage = useCallback(async (pageToFetch) => {
    if (!productId) return;
    setLoadingReviews(true);
    try {
      const response = await getVisibleProductReviews(productId, { page: pageToFetch, size: 5 }); // Lấy 5 review mỗi trang
      setReviews(response.data.content || []);
      setReviewCurrentPage(response.data.currentPage); // API trả về currentPage (0-based)
      setReviewTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      toast.error(t('toastMessages.errorFetchingReviews', "Lỗi tải đánh giá!"));
    } finally {
      setLoadingReviews(false);
    }
  }, [productId, t]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchReviewsForPage(0);
    }
  }, [productId, fetchProduct]);


  const handleReviewPageChange = (page) => {
    fetchReviewsForPage(page - 1);
  };

  useEffect(() => {
    const fetchFavs = async () => {
      if (!isAuthenticated || !productId) return;
      try {
        const ids = await getFavoriteProductIds();
        setIsFavorite(ids.includes(Number(productId)));
      } catch (err) { console.error('Lỗi tải yêu thích:', err); }
    };
    fetchFavs();
  }, [isAuthenticated, productId]);


  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info(t('productDetailPage.loginToReview'));
      navigate('/login');
      return;
    }
    if (reviewRating === 0) {
      setReviewError(t('productDetailPage.validation.ratingRequired'));
      return;
    }
    if (reviewComment.trim().length < 5) {
      setReviewError(t('productDetailPage.validation.commentMinLength', { count: 5 }));
      return;
    }
    if (reviewComment.trim().length > 1000) {
      setReviewError(t('productDetailPage.validation.commentMaxLength', { count: 1000 }));
      return;
    }

    setSubmittingReview(true); setReviewError('');
    try {
      const reviewData = {
        productId: parseInt(productId),
        rating: reviewRating,
        comment: reviewComment.trim()
        // orderId sẽ được backend tự xử lý
      };
      await submitProductReview(reviewData);
      toast.success(t('productDetailPage.reviewSuccessToast'));
      setReviewRating(0);
      setReviewComment('');
      setShowReviewForm(false); // Đóng form sau khi gửi
      fetchReviewsForPage(0); // Tải lại trang đầu của reviews
      fetchProduct();   // Tải lại thông tin sản phẩm để cập nhật điểm trung bình
    } catch (err) {
      console.error("Lỗi khi gửi đánh giá (chi tiết):", err); // Log toàn bộ lỗi
      if (err.response) {
        console.error("Backend response data:", err.response.data);
        console.error("Backend response status:", err.response.status);
      }
      const errMsgFromServer = err.response?.data?.message; // Đây là message từ ErrorDetails
      const fallbackMsg = t('toastMessages.errorGeneric', 'Lỗi không xác định khi gửi đánh giá.');

      const finalErrMsg = errMsgFromServer || fallbackMsg;

      setReviewError(finalErrMsg);
      toast.error(t('productDetailPage.reviewErrorToast', { message: finalErrMsg }, `Gửi đánh giá thất bại: ${finalErrMsg}`));

    } finally {
      setSubmittingReview(false);
    }
  };

  // const fetchFavorites = useCallback(async () => {
  //   if (!isAuthenticated || !productId) return;
  //   try {
  //     const ids = await getFavoriteProductIds();
  //     setIsFavorite(ids.includes(Number(productId)));
  //   } catch (err) {
  //     console.error('Lỗi khi lấy yêu thích:', err);
  //   }
  // }, [isAuthenticated, productId]);

  // useEffect(() => { fetchProduct(); }, [fetchProduct]);
  // useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setStockWarning('');
    if (value === '') { setQuantity(''); return; }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1) {
      if (product && numValue > product.stock) {
        setStockWarning(t('productDetailPage.stockWarning', 'Chỉ còn {{stock}} sản phẩm.', { stock: product.stock }));
        setQuantity(product.stock);
      } else { setQuantity(numValue); }
    } else if (numValue < 1) { setQuantity(1); }
  };

  const handleQuantityBlur = () => {
    if (quantity === '' || quantity <= 0) setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) {
      toast.warning(t('productDetailPage.outOfStockToast', "Sản phẩm đã hết hàng."));
      return; //
    }
    const finalQuantity = quantity <= 0 ? 1 : parseInt(quantity);
    if (finalQuantity > product.stock) {
      toast.warning(t('productDetailPage.stockWarningToast', 'Chỉ còn {{stock}} sản phẩm.', { stock: product.stock }));
      setQuantity(product.stock);
      return;
    }
    const productToAdd = {
      productId: product.productId,
      name: product.name,
      price: product.price,
      imageUrl: product.primaryImageUrl || product.imageUrls?.[0],
      stock: product.stock
    };
    addItemToCart(productToAdd, finalQuantity);
    toast.success(t('toastMessages.itemAddedToCart', 'Đã thêm "{{itemName}}" vào giỏ hàng!', { itemName: product.name }));
    setQuantity(1);
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.info(t('productDetailPage.loginForFavorite', "Vui lòng đăng nhập để sử dụng chức năng yêu thích."));
      navigate('/login');
      return;
    }
    try {
      if (isFavorite) {
        await removeFavoriteByProductId(product.productId);
        toast.success(t('productDetailPage.removedFromFavorites', "Đã xoá khỏi sản phẩm yêu thích."));
        setIsFavorite(false);
      } else {
        await addFavorite(product.productId);
        toast.success(t('productDetailPage.addedToFavorites', "Đã thêm vào sản phẩm yêu thích!"));
        setIsFavorite(true);
      }
    } catch (error) {
      toast.error(t('productDetailPage.favoriteActionFailed', "Thao tác yêu thích thất bại."));
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  const getFullImageUrl = (url) => (!url ? '' : url.startsWith('http') ? url : `${BASE_IMAGE_URL}${url}`);
  const processedImages = product?.imageUrls?.map(url => getFullImageUrl(url)) || [];
  const primaryImageUrl = getFullImageUrl(product?.primaryImageUrl);
  const allImages = primaryImageUrl ? [primaryImageUrl, ...processedImages.filter(url => url !== primaryImageUrl)] : processedImages;

  if (loading) return <Container className="text-center py-5"><LoadingSpinner text={t('common.loading', "Đang tải...")} /></Container>; //
  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert><div className="text-center mt-3"><Link to="/products" className="btn btn-sm btn-outline-secondary"><ArrowLeft /> {t('productDetailPage.backToList', 'Quay lại danh sách')}</Link></div></Container>; //
  if (!product) return <Container className="text-center py-5"><Alert variant="warning">{t('productDetailPage.notFound', 'Không tìm thấy sản phẩm.')}</Alert><div className="text-center mt-3"><Link to="/products" className="btn btn-sm btn-outline-secondary"><ArrowLeft /> {t('productDetailPage.backToList', 'Quay lại danh sách')}</Link></div></Container>; //

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
      <Container className="py-4">
        <Link to="/products" className="btn btn-outline-secondary btn-sm mb-3">
          <ArrowLeft className="me-1" /> {t('productDetailPage.backToList', 'Quay lại danh sách')}
        </Link>

        <Row className="g-4 g-lg-5">
          <Col md={6} className="text-center">
            <div className="mb-3 border rounded position-relative bg-light shadow-sm" style={{ aspectRatio: '1 / 1', overflow: 'hidden', minHeight: '400px', borderRadius: '12px' }}>
              {imageLoading && (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                  <Spinner animation="border" variant="secondary" />
                </div>
              )}
              <Image
                src={selectedImage || 'https://via.placeholder.com/600x600?text=No+Image'}
                alt={product.name}
                className="d-block w-100 h-100"
                style={{ objectFit: 'contain', opacity: imageLoading ? 0 : 1, transition: 'opacity 0.3s ease-in-out' }}
                onLoad={() => setImageLoading(false)}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x600?text=Image+Error'; setImageLoading(false); }}
              />
            </div>

            {allImages.length > 1 && (
              <Row xs={5} sm={6} md={4} lg={5} className="g-2">
                {allImages.map((url, index) => (
                  <Col key={index}>
                    <Image
                      src={url}
                      alt={`${product.name} thumb ${index + 1}`}
                      fluid
                      thumbnail
                      onClick={() => { setImageLoading(true); setSelectedImage(url); }}
                      style={{ cursor: 'pointer', border: selectedImage === url ? '2px solid var(--bs-primary)' : '1px solid #ddd', borderRadius: '8px', height: '80px', objectFit: 'cover', transition: 'border 0.2s ease-in-out' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/80x80?text=Image+Error'; }}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Col>

          <Col md={6}>
            {product.categoryName && product.categoryId && (
              <Link to={`/products?categoryId=${product.categoryId}`} className="text-muted small d-block mb-1">
                {product.categoryName}
              </Link>
            )}

            <h1 className="h3 fw-semibold mb-2 text-dark">{product.name}</h1>
            {product.reviewCount != null && product.reviewCount > 0 && product.averageRating != null && (
              <div className="mb-2 d-flex align-items-center product-average-rating">
                <StarRatingDisplay
                  rating={product.averageRating} // Sẽ là null hoặc 0 nếu chưa có review
                  count={product.reviewCount}
                  size="1.1rem"
                />
                <span className="ms-2 text-muted small">
                  ({product.averageRating.toFixed(1)}/5 - {t('productDetailPage.totalReviews', { count: product.reviewCount })})
                </span>
              </div>
            )}
            <p className="h4 mb-3 fw-bold text-primary">{formatPrice(product.price)}</p>
            <div className="mb-3"><StockBadge stock={product.stock} /></div>
            <p className="text-muted mb-4" style={{ lineHeight: '1.6', textAlign: 'justify' }}>{product.description || t('productDetailPage.noDescription', 'No description available.')}</p>

            {product.stock > 0 ? (
              <Form onSubmit={(e) => { e.preventDefault(); handleAddToCart(); }} className="mb-3">
                <Row className="g-2 align-items-end">
                  <Col xs="auto" style={{ flexBasis: '100px' }}>
                    <Form.Group controlId="quantityInput">
                      <Form.Label className="small mb-1">{t('productDetailPage.quantityLabel', 'Số lượng')}</Form.Label>
                      <Form.Control type="number" value={quantity} onChange={handleQuantityChange} onBlur={handleQuantityBlur} min="1" max={product.stock} size="sm" />
                    </Form.Group>
                  </Col>
                  <Col xs="auto" className="flex-grow-1">
                    <Button variant="primary" type="submit" className="w-100 rounded-pill" disabled={quantity <= 0}>
                      <CartPlus size={20} className="me-1" /> {t('productDetailPage.addToCart', 'Thêm vào giỏ')}
                    </Button>
                  </Col>
                  <Col xs="auto">
                    <Button
                      variant="link"
                      className="favorite-icon-btn p-0"
                      onClick={handleToggleFavorite}
                      title={t('productDetailPage.toggleFavorite', 'Thêm vào yêu thích')}
                    >
                      {isFavorite ? (
                        <HeartFill className="favorite-icon active" size={22} />
                      ) : (
                        <Heart className="favorite-icon" size={22} />
                      )}
                    </Button>
                  </Col>
                </Row>
                {stockWarning && <Alert variant="warning" className="mt-2 py-1 px-2 small">{stockWarning}</Alert>}
              </Form>
            ) : (
              <Alert variant="danger" className="mt-3">{t('productDetailPage.outOfStockAlert', 'Sản phẩm này hiện đang hết hàng.')}</Alert>
            )}

            {product && (
              <div className="mt-4 pt-3 border-top">
                <h5 className="mb-3">{t('productDetailPage.specsTitle', 'Thông số kỹ thuật')}</h5>
                <Table striped bordered size="sm">
                  <tbody>
                    {product.brand && <tr><td><strong>{t('productDetailPage.brand', 'Thương hiệu')}</strong></td><td>{product.brand}</td></tr>}
                    {product.model && <tr><td><strong>{t('productDetailPage.model', 'Mẫu mã')}</strong></td><td>{product.model}</td></tr>}
                    {product.movement && <tr><td><strong>{t('productDetailPage.movement', 'Loại máy')}</strong></td><td>{product.movement}</td></tr>}
                    {product.caseMaterial && <tr><td><strong>{t('productDetailPage.caseMaterial', 'Chất liệu vỏ')}</strong></td><td>{product.caseMaterial}</td></tr>}
                    {product.strapMaterial && <tr><td><strong>{t('productDetailPage.strapMaterial', 'Chất liệu dây đeo')}</strong></td><td>{product.strapMaterial}</td></tr>}
                    {product.dialColor && <tr><td><strong>{t('productDetailPage.dialColor', 'Màu mặt số')}</strong></td><td>{product.dialColor}</td></tr>}
                    {product.waterResistance && <tr><td><strong>{t('productDetailPage.waterResistance', 'Khả năng chống nước')}</strong></td><td>{product.waterResistance}</td></tr>}
                    {product.barcode && <tr><td><strong>{t('productDetailPage.barcode', 'Barcode')}</strong></td><td>{product.barcode}</td></tr>}
                  </tbody>
                </Table>
              </div>
            )}

          </Col>
        </Row>
        <Row className="mt-5">
          <Col>
            <Card className="product-reviews-section shadow-sm">
              <Card.Header>
                <h4 className="mb-0">{t('productDetailPage.reviewsSectionTitle')}</h4>
              </Card.Header>
              <Card.Body>
                {/* Nút/Form để viết đánh giá */}
                {isAuthenticated ? (
                  !showReviewForm ? (
                    <Button variant="primary" onClick={() => { setShowReviewForm(true); setReviewError(''); setReviewRating(0); setReviewComment(''); }} className="mb-4">
                      {t('productDetailPage.writeYourReviewTitle')}
                    </Button>
                  ) : (
                    <Card className="mb-4 shadow-sm review-form-card">
                      <Card.Body>
                        <h5 className="mb-3">{t('productDetailPage.writeYourReviewTitle')}</h5>
                        {reviewError && <Alert variant="danger" onClose={() => setReviewError('')} dismissible className="py-2 small">{reviewError}</Alert>}
                        <Form onSubmit={handleReviewSubmit}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-medium">{t('productDetailPage.yourRatingLabel')}</Form.Label>
                            <div><StarRatingInput rating={reviewRating} setRating={setReviewRating} disabled={submittingReview} /></div>
                            {/* Có thể thêm error message cho rating nếu cần, ví dụ khi reviewError chứa lỗi rating */}
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-medium">{t('productDetailPage.yourCommentLabel')}</Form.Label>
                            <Form.Control
                              as="textarea" rows={4}
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder={t('productDetailPage.commentPlaceholder')}
                              disabled={submittingReview}
                              isInvalid={!!reviewError.includes("Bình luận")}
                            />
                            <Form.Control.Feedback type="invalid">{reviewError.includes("Bình luận") ? reviewError : ""}</Form.Control.Feedback>
                          </Form.Group>
                          <Button type="submit" disabled={submittingReview || reviewRating === 0}>
                            {submittingReview ?
                              <><Spinner as="span" animation="border" size="sm" /> {t('productDetailPage.submittingReviewButton')}</> :
                              t('productDetailPage.submitReviewButton')}
                          </Button>
                          <Button variant="outline-secondary" onClick={() => { setShowReviewForm(false); setReviewError(''); }} className="ms-2" disabled={submittingReview}>
                            {t('common.cancel')}
                          </Button>
                        </Form>
                      </Card.Body>
                    </Card>
                  )
                ) : (
                  <Alert variant="info" className="mb-4">
                    <Link to="/login" state={{ from: location }}>{t('productDetailPage.loginToReview')}</Link>
                  </Alert>
                )}

                {/* Danh sách đánh giá */}
                {loadingReviews && reviews.length === 0 && <div className="text-center"><Spinner animation="border" size="sm" /></div>}
                {!loadingReviews && reviews.length === 0 && product.reviewCount === 0 && (
                  <p className="text-muted fst-italic">{t('productDetailPage.noReviewsYet')}</p>
                )}

                {reviews.map((review) => (
                  <Card key={review.reviewId} className="mb-3 review-item">
                    <Card.Body className="py-2 px-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <Card.Title as="h6" className="mb-0 review-user">
                          {review.userFirstName || t('common.anonymousUser', 'Người dùng ẩn danh')} {review.userLastName || ''}
                        </Card.Title>
                        <StarRatingDisplay rating={review.rating} size="0.9rem" />
                      </div>
                      <Card.Subtitle className="mb-2 text-muted small review-date">
                        {new Date(review.reviewDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </Card.Subtitle>
                      <Card.Text className="review-comment" style={{ whiteSpace: 'pre-line' }}>{review.comment}</Card.Text>
                    </Card.Body>
                  </Card>
                ))}

                {/* Phân trang cho reviews */}
                {reviewTotalPages > 1 && (
                  <div className="d-flex justify-content-center mt-3">
                    <BsPagination size="sm">
                      {[...Array(reviewTotalPages).keys()].map(pageNumber => (
                        <BsPagination.Item
                          key={pageNumber + 1}
                          active={pageNumber === reviewCurrentPage}
                          onClick={() => handleReviewPageChange(pageNumber + 1)}
                          disabled={loadingReviews}
                        >
                          {pageNumber + 1}
                        </BsPagination.Item>
                      ))}
                    </BsPagination>
                  </div>
                )}
                {reviewCurrentPage < reviewTotalPages - 1 && !loadingReviews && reviews.length > 0 && ( // Nút "Load more" đơn giản hơn
                  <div className="text-center mt-3 d-none"> {/* Tạm ẩn nếu dùng Pagination đầy đủ */}
                    <Button variant="outline-secondary" size="sm" onClick={() => fetchReviewsForPage(reviewCurrentPage + 1)} disabled={loadingReviews}>
                      {loadingReviews ? <Spinner size="sm" /> : t('productDetailPage.loadMoreReviews')}
                    </Button>
                  </div>
                )}

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
}

export default ProductDetailPage;
