import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { createOrder } from '../../services/orderService';

import {
  Container, Row, Col, Card, ListGroup, Button,
  Form, Spinner, Alert, Image
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next'; // << THÊM IMPORT

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};
const pageTransition = { duration: 0.4 };

function CheckoutPage() {
  const { t } = useTranslation(); // << KHỞI TẠO t
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    getTotalSelectedPrice,
    getSelectedItems,
    removeOrderedItems
  } = useCartStore();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const selectedItems = getSelectedItems();
  const totalSelectedPrice = getTotalSelectedPrice();
  // Giữ nguyên logic phí ship của bạn
  const SHIPPING_FEE = (totalSelectedPrice > 500000 || selectedItems.length === 0) ? 0 : 0;
  const grandTotal = totalSelectedPrice + SHIPPING_FEE;

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      fullNameShipping: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      phoneShipping: user?.phone || '',
      addressShipping: user?.address || '',
      notes: ''
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    } else {
      setValue('fullNameShipping', `${user.firstName || ''} ${user.lastName || ''}`.trim());
      setValue('phoneShipping', user.phone || '');
      setValue('addressShipping', user.address || '');
    }
  }, [user, setValue, navigate]);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handlePlaceOrder = async (formData) => {
    if (selectedItems.length === 0) {
      setError(t('checkoutPage.validation.selectProductsError', "Vui lòng chọn sản phẩm để thanh toán..."));
      return;
    }

    setLoading(true);
    setError('');

    const orderPayload = {
      paymentMethod: selectedPaymentMethod,
      fullNameShipping: formData.fullNameShipping,
      phoneShipping: formData.phoneShipping,
      addressShipping: formData.addressShipping,
      notes: formData.notes || '',
      items: selectedItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    try {
      const response = await createOrder(orderPayload);
      const responseData = response.data;

      if (selectedPaymentMethod === 'VN_PAY') {
        const paymentUrl = responseData.paymentInfo;
        if (paymentUrl) {
          toast.info(t('checkoutPage.toasts.redirectingToVNPay', "Đang chuyển sang VNPay..."));
          window.location.href = paymentUrl;
        } else {
          const vnpayErrorMsg = t('checkoutPage.toasts.vnPayUrlError', "Không thể lấy URL thanh toán VNPay từ hệ thống.");
          toast.error(vnpayErrorMsg);
          setError(vnpayErrorMsg);
          setLoading(false);
        }
      } else { // Xử lý COD
        const createdOrderDTO = responseData?.order;
        const orderId = createdOrderDTO?.orderId;

        if (orderId && typeof orderId === 'number') {
          toast.success(t('checkoutPage.toasts.orderSuccessCOD', 'Đơn hàng #{{orderId}} đã được đặt thành công!', { orderId: orderId }));
          const orderedProductIds = selectedItems.map(item => item.productId);
          await removeOrderedItems(orderedProductIds);
          setOrderPlaced(true);
          navigate(`/payment/result?method=COD&orderId=${orderId}`); 
        }
        else {
          console.error("Thiếu orderId trong phản hồi:", responseData);
          setError(t('checkoutPage.toasts.orderCreatedNoRedirectError', 'Đơn hàng đã được tạo nhưng không thể chuyển hướng đến trang chi tiết.'));
          navigate('/orders');
        }
        setLoading(false);
      }
    } catch (err) {
      console.error("Lỗi đặt hàng:", err);
      const message = err.response?.data?.message || err.message || t('checkoutPage.toasts.orderGenericError', 'Đã xảy ra lỗi khi đặt hàng.');
      toast.error(message);
      setError(message);
      setLoading(false);
    } finally {
      if (selectedPaymentMethod !== 'VN_PAY') {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Container className="py-4">
        <h1 className="mb-4 h3">{t('checkoutPage.title', 'Thanh toán')}</h1>
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

        <Row className="g-4">
          <Col lg={7}>
            <Card className="shadow-sm mb-4">
              <Card.Header><Card.Title as="h5">{t('checkoutPage.shippingInfo.title', 'Thông tin giao hàng')}</Card.Title></Card.Header>
              <Card.Body>
                <Form id="checkout-form" onSubmit={handleSubmit(handlePlaceOrder)}>
                  <Row>
                    <Form.Group as={Col} md={12} className="mb-3">
                      <Form.Label>{t('checkoutPage.shippingInfo.nameLabel', 'Tên khách hàng')}</Form.Label>
                      <Form.Control type="text" isInvalid={!!errors.fullNameShipping} {...register("fullNameShipping", { required: t('checkoutPage.validation.nameRequired', "Vui lòng nhập họ tên") })} />
                      <Form.Control.Feedback type="invalid">{errors.fullNameShipping?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                  <Row>
                    <Form.Group as={Col} md={6} className="mb-3"> {/* Giữ nguyên md={6} của bạn */}
                      <Form.Label>{t('checkoutPage.shippingInfo.phoneLabel', 'Số điện thoại')}</Form.Label>
                      <Form.Control type="tel" isInvalid={!!errors.phoneShipping} {...register("phoneShipping", { required: t('checkoutPage.validation.phoneRequired', "Vui lòng nhập số điện thoại") })} />
                      <Form.Control.Feedback type="invalid">{errors.phoneShipping?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('checkoutPage.shippingInfo.addressLabel', 'Địa chỉ')}</Form.Label>
                    <Form.Control type="text" isInvalid={!!errors.addressShipping} {...register("addressShipping", { required: t('checkoutPage.validation.addressRequired', "Vui lòng nhập địa chỉ") })} />
                    <Form.Control.Feedback type="invalid">{errors.addressShipping?.message}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('checkoutPage.shippingInfo.notesLabel', 'Ghi chú')}</Form.Label>
                    <Form.Control as="textarea" rows={3} {...register("notes")} />
                  </Form.Group>
                  <button type="submit" style={{ display: 'none' }} aria-hidden="true"></button>
                </Form>
              </Card.Body>
            </Card>

            <Card className="shadow-sm">
              <Card.Header><Card.Title as="h5">{t('checkoutPage.paymentMethod.title', 'Phương thức thanh toán')}</Card.Title></Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Check type="radio" id="payment-cod" label={t('checkoutPage.paymentMethod.cod', 'Thanh toán khi nhận hàng (COD)')} value="COD" checked={selectedPaymentMethod === 'COD'} onChange={(e) => setSelectedPaymentMethod(e.target.value)} className="mb-2" />
                  <Form.Check type="radio" id="payment-vnpay" label={t('checkoutPage.paymentMethod.vnpay', 'Thanh toán qua VNPay')} value="VN_PAY" checked={selectedPaymentMethod === 'VN_PAY'} onChange={(e) => setSelectedPaymentMethod(e.target.value)} className="mb-2" />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="shadow-sm position-sticky" style={{ top: '20px' }}>
              <Card.Header><Card.Title as="h5">{t('checkoutPage.orderSummary.title', 'Tóm tắt đơn hàng')}</Card.Title></Card.Header>
              <Card.Body>
                <div className="fw-medium mb-2">{t('checkoutPage.orderSummary.productsLabel', 'Sản phẩm ({{count}}):', { count: selectedItems.length })}</div>
                <ListGroup variant="flush" style={{ maxHeight: '250px', overflowY: 'auto' }} className="mb-3 border-top border-bottom">
                  {selectedItems.map(item => (
                    <ListGroup.Item key={item.productId} className="d-flex justify-content-between align-items-center px-0 py-2 text-sm">
                      <div className="d-flex align-items-center">
                        <Image
                          src={
                            item.imageUrl?.startsWith('http')
                              ? item.imageUrl
                              : `http://localhost:8080${item.imageUrl}`
                          }
                          alt={item.name} // Để trống alt hoặc dùng t() nếu cần
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/40?text=No+Image'; // Có thể dịch "No Image"
                          }}
                          style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                          className="me-2 border rounded"
                        />
                        <span className="flex-grow-1 me-2 text-truncate">
                          {item.name} <span className="text-muted">x{item.quantity}</span>
                        </span>
                      </div>
                      <span className="fw-medium text-nowrap">{formatPrice(item.price * item.quantity)}</span>
                    </ListGroup.Item>
                  ))}
                  {selectedItems.length === 0 && <ListGroup.Item className="text-center text-muted py-3 px-0 small">{t('checkoutPage.orderSummary.noItemsSelected', 'Không có sản phẩm nào được chọn')}</ListGroup.Item>}
                </ListGroup>

                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">{t('checkoutPage.orderSummary.subtotal', 'Tổng')}</span>
                  <span className="fw-medium">{formatPrice(totalSelectedPrice)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">{t('checkoutPage.orderSummary.shippingFee', 'Phí giao hàng')}</span>
                  <span className="fw-medium">{formatPrice(SHIPPING_FEE)}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold fs-5 pt-3 border-top">
                  <span>{t('checkoutPage.orderSummary.grandTotal', 'Tổng cộng')}</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>

                <div className="d-grid mt-4">
                  <Button variant="success" size="lg" type="submit" form="checkout-form" disabled={loading || selectedItems.length === 0}>
                    {loading ? <Spinner size="sm" /> : t('checkoutPage.orderSummary.placeOrderButton', 'Đặt hàng')}
                  </Button>
                </div>
                <div className="text-center mt-3">
                  <Link to="/cart" className="text-primary small">{t('checkoutPage.orderSummary.backToCartLink', 'Quay lại giỏ hàng')}</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
}

export default CheckoutPage;