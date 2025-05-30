// src/pages/user/OrderDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderDetails, cancelOrder } from '../../services/orderService';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Container, Row, Col, Card, ListGroup, Button, Spinner, Alert, Badge, Image } from 'react-bootstrap';
import { Receipt, ChatText, BagCheckFill, Truck, ArrowLeft, BoxSeam, CalendarWeek, CashCoin, CreditCard2Back, TagFill, Person, GeoAlt, Telephone, ArrowCounterclockwise } from 'react-bootstrap-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CancellationReasonModal from '../../components/orders/CancellationReasonModal';
import { getProductById } from '../../services/productService';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { OrderStatus, getStatusVariant, getStatusLabel } from '../../utils/orderUtils'; // Giữ lại cái này vì getStatusLabel có thể cần fallback
import { useTranslation } from 'react-i18next';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};
const pageTransition = { duration: 0.4 };

function OrderDetailPage() {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addItem: addItemToCart } = useCartStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [isReordering, setIsReordering] = useState(false);

  const canViewInvoice = order && (order.status === OrderStatus.PAID || order.status === OrderStatus.COMPLETED);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) {
      setError(t('orderDetailPage.alerts.invalidOrderId')); setLoading(false); return;
    }
    setLoading(true); setError(null); setCancelError('');
    try {
      const response = await getOrderDetails(orderId);
      if (response.data.userId !== user?.userId && user?.role !== 'ADMIN') {
        throw new Error(t('orderDetailPage.alerts.permissionDenied'));
      }
      setOrder(response.data);
    } catch (err) {
      console.error("Error fetching order details:", err);
      const errorMsg = err.response?.data?.message || err.message || t('orderDetailPage.alerts.loadFailed');
      setError(errorMsg);
      if (err.response?.status === 403 || err.response?.status === 404 || errorMsg.includes("Permission denied")) {
        setTimeout(() => navigate('/orders', { replace: true }), 3000);
      }
    } finally {
      setLoading(false);
    }
  }, [orderId, navigate, user, t]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleCancelOrderClick = () => {
    setCancelError('');
    setShowCancelModal(true);
  };

  const submitCancellation = async (reason) => {
    if (!order || !reason) return;
    setIsCanceling(true);
    setCancelError('');
    try {
      await cancelOrder(order.orderId, reason);
      toast.info(t('orderDetailPage.alerts.cancelSuccess'));
      setShowCancelModal(false);
      fetchOrderDetails();
    } catch (err) {
      console.error("Error canceling order:", err);
      setCancelError(err.response?.data?.message || err.message || t('orderDetailPage.alerts.cancelFailed'));
    } finally {
      setIsCanceling(false);
    }
  };

  const handleReorder = async () => {
    if (!order || !order.orderItems || order.orderItems.length === 0) {
      toast.warn(t('orderDetailPage.alerts.reorderNoItems'));
      return;
    }
    setIsReordering(true);
    let itemsAddedCount = 0;
    let itemsFailedCount = 0;

    for (const item of order.orderItems) {
      try {
        const productResp = await getProductById(item.productId);
        const realProduct = productResp.data;
        await addItemToCart(realProduct, item.quantity);
        itemsAddedCount++;
      } catch (err) {
        itemsFailedCount++;
        console.error(`Failed to reorder item for productId=${item.productId}`, err);
      }
    }

    if (itemsAddedCount > 0) {
      if (itemsFailedCount > 0) {
        toast.info(t('orderDetailPage.alerts.reorderPartialSuccess', { successCount: itemsAddedCount, failCount: itemsFailedCount }));
      } else {
        toast.success(t('orderDetailPage.alerts.reorderSuccess', { count: itemsAddedCount }));
      }
      navigate('/cart');
    } else {
      toast.error(t('orderDetailPage.alerts.reorderFailed'));
    }
    setIsReordering(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try { return new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return dateString; }
  };
  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Sử dụng t() cho getStatusLabel, nhưng vẫn giữ lại getStatusVariant cho màu sắc
  const translatedStatusLabel = (statusKey) => {
    return t(`orderStatus.${statusKey}`, getStatusLabel(statusKey)); // Fallback về getStatusLabel nếu key không có
  };

  if (loading) return (<Container className="text-center py-5"><LoadingSpinner text={t('common.loading')} /></Container>);
  if (error && !order) return (<Container className="py-5"><Alert variant="danger" className="text-center">{error}</Alert><div className="text-center mt-3"><Link to="/orders" className="btn btn-outline-secondary btn-sm"><ArrowLeft className="me-1" /> {t('common.back')}</Link></div></Container>);
  if (!order) return (<Container className="text-center py-5"><Alert variant="warning">{t('orderDetailPage.alerts.notFound')}</Alert><div className="text-center mt-3"><Link to="/orders" className="btn btn-outline-secondary btn-sm"><ArrowLeft className="me-1" /> {t('common.back')}</Link></div></Container>);

  const canCancel = [OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.PROCESSING].includes(order.status);

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Container className="py-3">
        <Link to="/orders" className="btn btn-outline-secondary btn-sm mb-3">
          <ArrowLeft className="me-1" /> {t('orderDetailPage.backToHistory')}
        </Link>

        {cancelError && <Alert variant="danger" onClose={() => setCancelError('')} dismissible>{cancelError}</Alert>}
        {error && order && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

        <Card className="shadow-sm">
          <Card.Header className="bg-light p-3">
            <Row className="align-items-center">
              <Col md={6}>
                <h3 className="mb-1"><BoxSeam className="me-3" />{t('orderDetailPage.title', { orderId: order.orderId })}</h3>
                <Card.Text className="text-muted small"><CalendarWeek size={16} className="me-1" /> {t('orderDetailPage.orderTime', { time: formatDate(order.createdAt) })}</Card.Text>
              </Col>
              <Col md={6} className="text-md-end mt-2 mt-md-0 h5">
                <span className="fw-bold me-3">{t('orderDetailPage.totalAmount', { amount: formatPrice(order.totalAmount) })}</span>
                <Badge bg={getStatusVariant(order.status)} pill>
                  {translatedStatusLabel(order.status)}
                </Badge>
              </Col>
            </Row>
          </Card.Header>

          <Card.Body className="p-4">
            <Row className="mb-4">
              <Col md={6} className="mb-3 mb-md-0">
                <h5 className="mb-2"><TagFill size={16} className="me-1 text-primary" /> {t('orderDetailPage.paymentInfoTitle')}</h5>
                <Card.Text className="small">
                  <span className="text-muted">{t('orderDetailPage.paymentMethodLabel')} </span> {order.paymentMethod === 'COD' ? <CashCoin className="me-1" /> : <CreditCard2Back className="me-1" />} {order.paymentMethod} <br />
                  {order.vnpayTransactionId && order.status !== OrderStatus.PENDING && order.paymentMethod === 'VN_PAY' &&
                    <> <span className="text-muted">{t('orderDetailPage.transactionIdLabel')} </span> {order.vnpayTransactionId} <br /> </>
                  }
                  <span className="text-muted">{t('orderDetailPage.statusLabel')} </span>
                  <span className={`fw-medium text-${getStatusVariant(order.status)}`}>{translatedStatusLabel(order.status)}</span>
                </Card.Text>
              </Col>
              <Col md={6}>
                <h5 className="mb-2"><GeoAlt size={16} className="me-1 text-primary" /> {t('orderDetailPage.shippingInfoTitle')}</h5>
                <Card.Text className="small">
                  <Person size={14} className="me-1" /> {order.fullNameShipping || 'N/A'}<br />
                  <Telephone size={14} className="me-1" /> {order.phoneShipping || 'N/A'}<br />
                  <GeoAlt size={14} className="me-1" /> {order.addressShipping || 'N/A'}<br />
                  {order.notes && (<><ChatText size={14} className='me-1' /> {order.notes}<br /></>)}
                </Card.Text>
              </Col>
            </Row>

            <h5 className="mb-3 pt-3 border-top"><BagCheckFill size={16} className="me-2 text-primary" />{t('orderDetailPage.productsTitle')}</h5>
            <ListGroup variant="flush" className="mb-3">
              {order.orderItems?.map((item) => (
                <ListGroup.Item key={item.orderItemId} className="px-0 d-flex align-items-center">
                  <Image
                    src={
                      item.productImageUrl?.startsWith('http')
                        ? item.productImageUrl
                        : `${import.meta.env.VITE_API_URL_IMAGES || 'http://localhost:8080'}${item.productImageUrl}`
                    }
                    alt={item.productName}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/60?text=Image+Error';
                    }}
                    style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                    className="me-3 border rounded flex-shrink-0"
                  />
                  <div className="flex-grow-1">
                    <Link to={`/products/${item.productId}`} className="text-decoration-none text-dark fw-medium"> {item.productName || `${t('common.product')} ID: ${item.productId}`} </Link>
                    <div className="text-muted small"> <span>{t('orderDetailPage.quantityColumn')}: {item.quantity}</span> <span className="mx-2">|</span> <span>{t('orderDetailPage.priceColumn')}: {formatPrice(item.price)}</span> </div>
                  </div>
                  <div className="text-end fw-medium"> {formatPrice(item.price * item.quantity)} </div>
                </ListGroup.Item>
              ))}
              {(!order.orderItems || order.orderItems.length === 0) && (<ListGroup.Item className="px-0 text-center text-muted">{t('orderDetailPage.noProducts')}</ListGroup.Item>)}
            </ListGroup>

            <div className="d-flex justify-content-between align-items-center pt-3 border-top mb-4">
              <h5 className="mb-0 d-flex align-items-center"> <Truck size={16} className="me-2 text-primary" />{t('orderDetailPage.shippingFeeTitle')}</h5>
              <div className=" fw-medium">{formatPrice(0)}</div>
            </div>
            <div className="text-end mt-3 pt-3 border-top">
              <h5 className="mb-0">{t('orderDetailPage.finalTotal', { amount: formatPrice(order.totalAmount) })}</h5>
            </div>

            <div className="mt-4 pt-4 border-top d-flex justify-content-end gap-2">
              <Button variant="outline-primary" onClick={handleReorder} disabled={isReordering} size="sm">
                {isReordering ? <Spinner as="span" animation="border" size="sm" /> : <ArrowCounterclockwise className="me-1" />} {t('orderDetailPage.reorderButton')}
              </Button>
              {canViewInvoice && (
                <Link to={`/orders/${order.orderId}/invoice`}>
                  <Button variant="outline-info" size="sm" className="ms-2">
                    <Receipt className="me-1" /> {t('orderDetailPage.viewInvoiceButton')}
                  </Button>
                </Link>
              )}
              {canCancel && (
                <Button variant="outline-danger" onClick={handleCancelOrderClick} disabled={isCanceling} size="sm"> {t('orderDetailPage.cancelOrderButton')} </Button>
              )}
            </div>
          </Card.Body>
        </Card>

        <CancellationReasonModal
          show={showCancelModal}
          onHide={() => setShowCancelModal(false)}
          onSubmit={submitCancellation}
          orderId={order?.orderId}
          isSubmitting={isCanceling}
        />
      </Container>
    </motion.div>
  );
}

export default OrderDetailPage;