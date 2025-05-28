// src/pages/user/OrderDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// Import services
import { getOrderDetails, cancelOrder } from '../../services/orderService'; // Đảm bảo hàm cancelOrder nhận reason
// Import stores
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore'; // Import cart store cho Reorder
// Import Bootstrap components
import { Container, Row, Col, Card, ListGroup, Button, Spinner, Alert, Badge, Image } from 'react-bootstrap';
// Import icons
import { Receipt, ChatText, BagCheckFill, Truck, ArrowLeft, BoxSeam, CalendarWeek, CashCoin, CreditCard2Back, TagFill, Person, GeoAlt, Telephone, ArrowCounterclockwise } from 'react-bootstrap-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CancellationReasonModal from '../../components/orders/CancellationReasonModal'; // Import modal
import { getProductById } from '../../services/productService';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { OrderStatus, getStatusVariant, getStatusLabel } from '../../utils/orderUtils';
const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};
const pageTransition = { duration: 0.4 };

function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore(); // Lấy thông tin user đang đăng nhập
  const { addItem: addItemToCart } = useCartStore(); // Lấy action thêm vào giỏ

  const [order, setOrder] = useState(null); // State lưu OrderDTO
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho modal hủy đơn
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false); // Loading cho việc hủy
  const [cancelError, setCancelError] = useState('');   // Lỗi riêng cho việc hủy

  // State cho việc đặt lại đơn
  const [isReordering, setIsReordering] = useState(false);

  const canViewInvoice = order && (order.status === 'PAID' || order.status === 'COMPLETED');

  // Hàm fetch chi tiết đơn hàng
  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) {
      setError("Invalid Order ID."); setLoading(false); return;
    }
    setLoading(true); setError(null); setCancelError(''); // Reset lỗi hủy khi load lại
    try {
      const response = await getOrderDetails(orderId);
      // Kiểm tra quyền sở hữu
      if (response.data.userId !== user?.userId && user?.role !== 'ADMIN') {
        throw new Error("Permission denied to view this order.");
      }
      setOrder(response.data);
      // Đặt lại trạng thái selectedStatus cho modal nếu cần, khớp với trạng thái hiện tại
      // setSelectedStatus(response.data.status); // Không cần nếu modal chỉ dùng để hủy
    } catch (err) {
      console.error("Error fetching order details:", err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load order details.';
      setError(errorMsg);
      if (err.response?.status === 403 || err.response?.status === 404 || errorMsg.includes("Permission denied")) {
        setTimeout(() => navigate('/orders', { replace: true }), 3000);
      }
    } finally {
      setLoading(false);
    }
  }, [orderId, navigate, user]);

  // Gọi fetch khi component mount hoặc orderId thay đổi
  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // --- Hàm xử lý Hủy đơn (Mở Modal) ---
  const handleCancelOrderClick = () => {
    setCancelError(''); // Reset lỗi cũ
    setShowCancelModal(true); // Chỉ mở modal
  };

  // --- Hàm xử lý Submit Hủy đơn từ Modal ---
  const submitCancellation = async (reason) => {
    if (!order || !reason) return;
    setIsCanceling(true);
    setCancelError('');
    try {
      // Gọi API cancelOrder đã cập nhật với lý do
      // *** Đảm bảo orderService.cancelOrder đã nhận thêm reason ***
      await cancelOrder(order.orderId, reason); // Truyền lý do vào service
      toast.info("Đơn hàng đã được hủy thành công.");
      setShowCancelModal(false); // Đóng modal
      fetchOrderDetails(); // Tải lại chi tiết đơn hàng
    } catch (err) {
      console.error("Error canceling order:", err);
      setCancelError(err.response?.data?.message || err.message || "Failed to cancel order. Please contact support if the problem persists.");
      // Giữ modal mở để người dùng thấy lỗi
    } finally {
      setIsCanceling(false);
    }
  };

  // --- Hàm xử lý Đặt lại đơn hàng ---
  const handleReorder = async () => {
    if (!order || !order.orderItems || order.orderItems.length === 0) {
      alert("Không thể sắp xếp lại, không tìm thấy sản phẩm nào theo thứ tự này.");
      return;
    }
    setIsReordering(true);

    let itemsAddedCount = 0;
    let itemsFailedCount = 0;

    for (const item of order.orderItems) {
      try {
        // Gọi API để lấy thông tin product mới nhất (bao gồm stock)
        const productResp = await getProductById(item.productId);
        const realProduct = productResp.data;
        // realProduct lúc này có full { productId, name, price, imageUrl, stock, ... }

        // quantity = item.quantity cũ (hoặc bạn cho người dùng chọn)
        await addItemToCart(realProduct, item.quantity);
        itemsAddedCount++;
      } catch (err) {
        itemsFailedCount++;
        console.error(`Failed to reorder item for productId=${item.productId}`, err);
      }
    }

    if (itemsAddedCount > 0) {
      alert(`${itemsAddedCount} mặt hàng từ đơn hàng này đã được thêm lại vào giỏ hàng của bạn.${itemsFailedCount > 0 ? ' ' + itemsFailedCount + ' item(s) failed.' : ''}`);
      navigate('/cart');
    } else {
      alert("Không thể thêm bất kỳ sản phẩm nào trở lại giỏ hàng.");
    }
    setIsReordering(false);
  };


  // --- Helper Functions ---
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try { return new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return dateString; }
  };
  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };


  // --- Render UI ---
  if (loading) return (<Container className="text-center py-5"><Spinner animation="border" /></Container>);
  // Hiển thị lỗi fetch chính nếu không load được order
  if (error && !order) return (<Container className="py-5"><Alert variant="danger" className="text-center">{error}</Alert><div className="text-center mt-3"><Link to="/orders" className="btn btn-outline-secondary btn-sm"><ArrowLeft className="me-1" /> Quay lại</Link></div></Container>);
  if (!order) return (<Container className="text-center py-5"><Alert variant="warning">Đơn đặt hàng không được tìm thấy.</Alert><div className="text-center mt-3"><Link to="/orders" className="btn btn-outline-secondary btn-sm"><ArrowLeft className="me-1" /> Quay lại</Link></div></Container>);

  // Xác định xem có thể hủy đơn hàng không
  const canCancel = ['PENDING', 'PAID', 'PROCESSING'].includes(order.status);

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Container className="py-3">
        {/* Nút Back */}
        <Link to="/orders" className="btn btn-outline-secondary btn-sm mb-3">
          <ArrowLeft className="me-1" /> Lịch sử đặt hàng
        </Link>

        {/* Hiển thị lỗi hủy đơn nếu có */}
        {cancelError && <Alert variant="danger" onClose={() => setCancelError('')} dismissible>{cancelError}</Alert>}
        {/* Hiển thị lỗi reorder nếu có */}
        {error && order && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}


        <Card className="shadow-sm">
          <Card.Header className="bg-light p-3">
            <Row className="align-items-center">
              <Col md={6}> <h3 className="mb-1"><BoxSeam className="me-3" />Chi tiết đơn hàng #{order.orderId}</h3> <Card.Text className="text-muted small"><CalendarWeek size={16} className="me-1" /> Thời gian đặt hàng: {formatDate(order.createdAt)}</Card.Text> </Col>
              <Col md={6} className="text-md-end mt-2 mt-md-0 h5"> <span className="fw-bold me-3">Tổng cộng: {formatPrice(order.totalAmount)}</span>
                <Badge bg={getStatusVariant(order.status)} pill>
                  {getStatusLabel(order.status)}
                </Badge> </Col>
            </Row>
          </Card.Header>

          <Card.Body className="p-4">
            {/* Thông tin thanh toán và VẬN CHUYỂN */}
            <Row className="mb-4">
              <Col md={6} className="mb-3 mb-md-0">
                <h5 className="mb-2"><TagFill size={16} className="me-1 text-primary" /> Thông tin thanh toán </h5>
                <Card.Text className="small">
                  <span className="text-muted">Phương thức thanh toán: </span> {order.paymentMethod === 'COD' ? <CashCoin className="me-1" /> : <CreditCard2Back className="me-1" />} {order.paymentMethod} <br />
                  {order.vnpayTransactionId && order.status !== 'PENDING' && order.paymentMethod === 'VN_PAY' &&
                    <> <span className="text-muted">Mã giao dịch: </span> {order.vnpayTransactionId} <br /> </>
                  }
                  <span className="text-muted">Trạng thái: </span>
                  <span className={`fw-medium text-${getStatusVariant(order.status)}`}>{getStatusLabel(order.status)}</span>
                </Card.Text>
              </Col>
              <Col md={6}>
                <h5 className="mb-2"><GeoAlt size={16} className="me-1 text-primary" /> Thông tin người nhận</h5>
                {/* Hiển thị thông tin giao hàng từ order DTO */}
                <Card.Text className="small">
                  <Person size={14} className="me-1" /> {order.fullNameShipping || 'N/A'}<br /> {/* Sử dụng order.fullNameShipping */}
                  <Telephone size={14} className="me-1" /> {order.phoneShipping || 'N/A'}<br /> {/* Sử dụng order.phoneShipping */}
                  <GeoAlt size={14} className="me-1" /> {order.addressShipping || 'N/A'}<br /> {/* Sử dụng order.addressShipping */}
                  <ChatText size={14} className='me-1' /> {order.notes || ' '}<br /> {/* Sử dụng order.notes */}
                </Card.Text>
              </Col>
            </Row>

            {/* Danh sách sản phẩm */}
            <h5 className="mb-3 pt-3 border-top"><BagCheckFill size={16} className="me-2 text-primary" />Sản phẩm</h5>
            <ListGroup variant="flush" className="mb-3">
              {order.orderItems?.map((item) => (
                <ListGroup.Item key={item.orderItemId} className="px-0 d-flex align-items-center">
                  <Image
                    src={
                      item.productImageUrl?.startsWith('http')
                        ? item.productImageUrl
                        : `http://localhost:8080${item.productImageUrl}`
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
                    <Link to={`/products/${item.productId}`} className="text-decoration-none text-dark fw-medium"> {item.productName || `Product ID: ${item.productId}`} </Link>
                    <div className="text-muted small"> <span>Số lượng: {item.quantity}</span> <span className="mx-2">|</span> <span>Giá: {formatPrice(item.price)}</span> </div>
                  </div>
                  <div className="text-end fw-medium"> {formatPrice(item.price * item.quantity)} </div>
                </ListGroup.Item>
              ))}
              {(!order.orderItems || order.orderItems.length === 0) && (<ListGroup.Item className="px-0 text-center text-muted">Không tìm thấy sản phẩm trong đơn hàng này.</ListGroup.Item>)}
            </ListGroup>

            <div className="d-flex justify-content-between align-items-center pt-3 border-top mb-4">
              <h5 className="mb-0 d-flex align-items-center"> <Truck size={16} className="me-2 text-primary" />Phí vận chuyển</h5>
              <div className=" fw-medium">{formatPrice(0)}</div>
            </div>
            {/* Tổng cộng cuối cùng */}
            <div className="text-end mt-3 pt-3 border-top">
              <h5 className="mb-0">Tổng cộng: {formatPrice(order.totalAmount)}</h5>
            </div>

            {/* Các nút Action */}
            <div className="mt-4 pt-4 border-top d-flex justify-content-end gap-2">
              {/* Nút Đặt lại đơn hàng */}
              <Button variant="outline-primary" onClick={handleReorder} disabled={isReordering} size="sm">
                {isReordering ? <Spinner as="span" animation="border" size="sm" /> : <ArrowCounterclockwise className="me-1" />} Đặt lại
              </Button>
              {canViewInvoice && (
                <Link to={`/orders/${order.orderId}/invoice`}>
                  <Button variant="outline-info" size="sm" className="ms-2">
                    <Receipt className="me-1" /> Xem Hóa Đơn
                  </Button>
                </Link>
              )}
              {/* Nút Hủy Đơn Hàng (Mở Modal) */}
              {canCancel && (
                <Button variant="outline-danger" onClick={handleCancelOrderClick} disabled={isCanceling} size="sm"> Hủy đơn hàng </Button>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Modal Hủy Đơn Hàng */}
        <CancellationReasonModal
          show={showCancelModal}
          onHide={() => setShowCancelModal(false)}
          onSubmit={submitCancellation} // Hàm xử lý submit mới
          orderId={order?.orderId}
          isSubmitting={isCanceling} // Truyền trạng thái loading vào modal
        />
      </Container>
    </motion.div>
  );
}

export default OrderDetailPage;