// src/pages/public/CheckoutPage.jsx

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

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};
const pageTransition = { duration: 0.4 };

function CheckoutPage() {
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
  const SHIPPING_FEE = (totalSelectedPrice > 500000 || selectedItems.length === 0) ? 0 : 0;
  const grandTotal = totalSelectedPrice + SHIPPING_FEE;

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      // Tên trường mặc định đã đúng
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
      setError("Vui lòng chọn sản phẩm để thanh toán...");
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
      // const orderedProductIds = selectedItems.map(item => item.productId); // Không cần nữa nếu backend xóa

      if (selectedPaymentMethod === 'VN_PAY') {
        const paymentUrl = responseData.paymentInfo; // Backend trả về paymentInfo
        if (paymentUrl) {
          toast.info("Đang chuyển sang VNPay...");
          window.location.href = paymentUrl;
          // Không dừng loading ở đây, trình duyệt sẽ chuyển trang
        } else {
          toast.error("Không thể lấy URL thanh toán VNPay từ hệ thống.");
          setError("Không lấy được URL thanh toán VNPay từ hệ thống.");
          setLoading(false); // Dừng loading nếu không redirect
        }
      } else { // Xử lý COD
        const createdOrderDTO = responseData?.order;
        const orderId = createdOrderDTO?.orderId;

        if (orderId && typeof orderId === 'number') {
          toast.success(`Đơn hàng #${orderId} đã được đặt thành công!`);
          const orderedProductIds = selectedItems.map(item => item.productId);
          await removeOrderedItems(orderedProductIds);
          setOrderPlaced(true);
          navigate(`/payment/result?method=COD&orderId=${orderId}`);
        }
        else {
          console.error("Thiếu orderId trong phản hồi:", responseData);
          setError('Đơn hàng đã được tạo nhưng không thể chuyển hướng đến trang chi tiết.');
          // Có thể redirect đến trang lịch sử đơn hàng nếu không có orderId
          navigate('/orders');
        }
        setLoading(false);
      }
    } catch (err) {
      console.error("Lỗi đặt hàng:", err);
      const message = err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi đặt hàng.';

      toast.error(message);
      setError(message);
      setLoading(false);

    } finally {
      // Chỉ dừng loading spinner nếu không redirect sang VNPay
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
        <h1 className="mb-4 h3">Thanh toán</h1>
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

        <Row className="g-4">
          <Col lg={7}>
            <Card className="shadow-sm mb-4">
              <Card.Header><Card.Title as="h5">Thông tin giao hàng</Card.Title></Card.Header>
              <Card.Body>
                {/* FORM SỬ DỤNG TÊN TRƯỜNG ĐÚNG: fullNameShipping, phoneShipping, addressShipping */}
                <Form id="checkout-form" onSubmit={handleSubmit(handlePlaceOrder)}>
                  <Row>
                    <Form.Group as={Col} md={12} className="mb-3">
                      <Form.Label>Tên khách hàng</Form.Label>
                      {/* REGISTER SỬ DỤNG TÊN TRƯỜNG ĐÚNG */}
                      <Form.Control type="text" isInvalid={!!errors.fullNameShipping} {...register("fullNameShipping", { required: "Vui lòng nhập họ tên" })} />
                      {/* Sửa lại validation message */}
                      <Form.Control.Feedback type="invalid">{errors.fullNameShipping?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                  <Row>
                    <Form.Group as={Col} md={6} className="mb-3">
                      <Form.Label>Số điện thoại</Form.Label>
                      {/* REGISTER SỬ DỤNG TÊN TRƯỜNG ĐÚNG */}
                      <Form.Control type="tel" isInvalid={!!errors.phoneShipping} {...register("phoneShipping", { required: "Vui lòng nhập số điện thoại" })} />
                      {/* Sửa lại validation message */}
                      <Form.Control.Feedback type="invalid">{errors.phoneShipping?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Địa chỉ</Form.Label>
                    {/* REGISTER SỬ DỤNG TÊN TRƯỜNG ĐÚNG */}
                    <Form.Control type="text" isInvalid={!!errors.addressShipping} {...register("addressShipping", { required: "Vui lòng nhập địa chỉ" })} />
                    {/* Sửa lại validation message */}
                    <Form.Control.Feedback type="invalid">{errors.addressShipping?.message}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Ghi chú</Form.Label>
                    {/* REGISTER SỬ DỤNG TÊN TRƯỜNG ĐÚNG */}
                    <Form.Control as="textarea" rows={3} {...register("notes")} />
                  </Form.Group>
                  <button type="submit" style={{ display: 'none' }} aria-hidden="true"></button>
                </Form>
              </Card.Body>
            </Card>

            <Card className="shadow-sm">
              <Card.Header><Card.Title as="h5">Phương thức thanh toán</Card.Title></Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Check type="radio" id="payment-cod" label="Thanh toán khi nhận hàng (COD)" value="COD" checked={selectedPaymentMethod === 'COD'} onChange={(e) => setSelectedPaymentMethod(e.target.value)} className="mb-2" />
                  <Form.Check type="radio" id="payment-vnpay" label="Thanh toán qua VNPay" value="VN_PAY" checked={selectedPaymentMethod === 'VN_PAY'} onChange={(e) => setSelectedPaymentMethod(e.target.value)} className="mb-2" />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="shadow-sm position-sticky" style={{ top: '20px' }}>
              <Card.Header><Card.Title as="h5">Tóm tắt đơn hàng</Card.Title></Card.Header>
              <Card.Body>
                <div className="fw-medium mb-2">Sản phẩm ({selectedItems.length}):</div>
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
                          alt={item.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/40?text=No+Image';
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
                  {selectedItems.length === 0 && <ListGroup.Item className="text-center text-muted py-3 px-0 small">Không có sản phẩm nào được chọn</ListGroup.Item>}
                </ListGroup>

                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Tổng</span>
                  <span className="fw-medium">{formatPrice(totalSelectedPrice)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Phí giao hàng</span>
                  <span className="fw-medium">{formatPrice(SHIPPING_FEE)}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold fs-5 pt-3 border-top">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>

                <div className="d-grid mt-4">
                  <Button variant="success" size="lg" type="submit" form="checkout-form" disabled={loading || selectedItems.length === 0}>
                    {loading ? <Spinner size="sm" /> : 'Đặt hàng'}
                  </Button>
                </div>
                <div className="text-center mt-3">
                  <Link to="/cart" className="text-primary small">Quay lại giỏ hàng</Link>
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