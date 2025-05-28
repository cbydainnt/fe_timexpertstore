// src/pages/admin/AdminOrderDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// Import services
import { getOrderDetails, updateOrderStatusAdmin } from '../../services/orderService';
import { getUserById } from '../../services/userService';
// Import Bootstrap
import { Container, Row, Col, Card, ListGroup, Button, Spinner, Alert, Badge, Form, Image } from 'react-bootstrap';
// Import icons
import { ArrowLeft, BoxSeam, CalendarWeek, CashCoin, CreditCard2Back, TagFill, Person, GeoAlt, Telephone, CheckCircleFill, XCircleFill } from 'react-bootstrap-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { OrderStatus, getStatusVariant, getStatusLabel } from '../../utils/orderUtils';
// Animation variants
const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };
const pageTransition = { duration: 0.3 };

// Các trạng thái Admin/Staff có thể chuyển đến
const allowedNextStatuses = [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.COMPLETED, OrderStatus.CANCELED];

// Helper format
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try { return new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return dateString; }
};
const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};


function AdminOrderDetailPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null); // OrderDTO
    const [customer, setCustomer] = useState(null); // UserDTO của khách hàng
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho cập nhật trạng thái
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Fetch chi tiết đơn hàng và thông tin khách hàng
    const fetchOrderAndCustomer = useCallback(async () => {
        if (!orderId) { setError("Invalid Order ID."); setLoading(false); return; }
        setLoading(true); setError(null);
        try {
            // Lấy chi tiết đơn hàng
            const orderResponse = await getOrderDetails(orderId);
            const orderData = orderResponse.data;
            setOrder(orderData);
            setSelectedStatus(orderData.status); // Set trạng thái ban đầu

            // Lấy thông tin khách hàng dựa vào userId từ đơn hàng
            if (orderData.userId) {
                try {
                    // *** Backend cần API GET /api/admin/users/{userId} ***
                    const userResponse = await getUserById(orderData.userId); // Gọi API lấy user
                    setCustomer(userResponse.data); // Lưu UserDTO
                } catch (userErr) {
                    console.error(`Error fetching customer details for userId ${orderData.userId}:`, userErr);
                    // Không set lỗi chính, chỉ log hoặc hiển thị thông báo nhỏ
                    setCustomer({ userId: orderData.userId, firstName: 'N/A', lastName: '', email: 'N/A', phone: 'N/A', address: 'N/A' }); // Dữ liệu tạm
                }
            }

        } catch (err) {
            console.error("Error fetching order details (admin):", err);
            setError(err.response?.data?.message || 'Failed to load order details.');
            if (err.response?.status === 404) { setTimeout(() => navigate('/admin/orders', { replace: true }), 3000); }
        } finally { setLoading(false); }
    }, [orderId, navigate]);

    useEffect(() => { fetchOrderAndCustomer(); }, [fetchOrderAndCustomer]);

    // Xử lý chọn trạng thái mới
    const handleStatusChange = (event) => { setSelectedStatus(event.target.value); };

    // Xử lý cập nhật trạng thái
    const handleUpdateStatus = async () => {
        if (!order || !selectedStatus || selectedStatus === order.status) return;
        setIsUpdatingStatus(true);
        try {
            await updateOrderStatusAdmin(order.orderId, selectedStatus);
            toast.success("Trạng thái đơn hàng được cập nhật thành công!");
            // Fetch lại để lấy trạng thái mới nhất
            fetchOrderAndCustomer();
        } catch (err) {
            console.error("Error updating order status:", err);
            toast.error(err.response?.data?.message || "Failed to update status.");
            // Reset select về trạng thái cũ nếu lỗi
            setSelectedStatus(order.status);
        } finally { setIsUpdatingStatus(false); }
    };

    // --- Render UI ---
    if (loading) return <LoadingSpinner />;
    if (error && !order) return (<Container><Alert variant="danger">{error}</Alert><Link to="/admin/orders">Quay lại</Link></Container>);
    if (!order) return (<Container><Alert variant="warning">Không tìm thấy đơn hàng.</Alert><Link to="/admin/orders">Quay lại</Link></Container>);

    const canUpdateStatus = order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELED;

    return (
        <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Container fluid>
                <Row className="align-items-center mb-3">
                    <Col xs="auto">
                        <Link to="/admin/orders" className="btn btn-outline-secondary btn-sm"> <ArrowLeft /> Quay lại </Link>
                    </Col>
                    <Col> <h1 className="h4 mb-0 text-gray-800">Chi tiết đơn hàng #{order.orderId}</h1> </Col>
                </Row>

                <Row>
                    {/* Cột Thông tin chính */}
                    <Col lg={8} className="mb-4 mb-lg-0">
                        <Card className="shadow-sm mb-4">
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <span>Đặt hàng vào: {formatDate(order.createdAt)}</span>
                                <Badge bg={getStatusVariant(order.status)} pill>
                                    {getStatusLabel(order.status)}
                                </Badge>
                            </Card.Header>
                            <Card.Body>
                                {/* Thông tin thanh toán và Giao hàng */}
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <h6>Thanh toán</h6>
                                        <p className="small mb-1">Phương thức: {order.paymentMethod}</p>
                                        {order.vnpayTransactionId && <p className="small mb-0 text-muted">Mã giao dịch: {order.vnpayTransactionId}</p>}
                                    </Col>
                                    <Col md={6} className="mt-3 mt-md-0">
                                        <h6>Thông tin người nhận</h6>
                                        <p className="small mb-0">
                                            <Person size={14} className="me-1" /> {order.fullNameShipping || 'N/A'} <br />
                                            <Telephone size={14} className="me-1" /> {order.phoneShipping || 'N/A'} <br />
                                            <GeoAlt size={14} className="me-1" /> {order.addressShipping || 'N/A'} <br />
                                            {order.notes && (<><CalendarWeek size={14} className='me-1' /> {order.notes}</>)}
                                        </p>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Danh sách sản phẩm */}
                        <Card className="shadow-sm">
                            <Card.Header><h6>Sản phẩm</h6></Card.Header>
                            <ListGroup variant="flush">
                                {order.orderItems?.map((item) => (
                                    <ListGroup.Item key={item.orderItemId} className="d-flex align-items-center">
                                        <Image src={item.productImageUrl || '...'} style={{ width: '50px', height: '50px' }} className="me-3 rounded" />
                                        <div className="flex-grow-1">
                                            <Link to={`/products/${item.productId}`} target="_blank">{item.productName}</Link>
                                            <div className="small text-muted">Giá: {formatPrice(item.price)} x {item.quantity}</div>
                                        </div>
                                        <div className="fw-bold">{formatPrice(item.price * item.quantity)}</div>
                                    </ListGroup.Item>
                                ))}
                                {(!order.orderItems || order.orderItems.length === 0) && <ListGroup.Item>Không có sản phẩm.</ListGroup.Item>}
                            </ListGroup>
                            <Card.Footer className="text-end">
                                <strong>Tổng cộng: {formatPrice(order.totalAmount)}</strong>
                            </Card.Footer>
                        </Card>
                    </Col>

                    {/* Cột Thông tin Khách hàng và Cập nhật trạng thái */}
                    <Col lg={4}>
                        {/* Thông tin khách hàng */}
                        <Card className="shadow-sm mb-4">
                            <Card.Header><h6>Thông tin khách hàng</h6></Card.Header>
                            <Card.Body className="small">
                                {customer ? (
                                    <>
                                        <p className="mb-1"><strong>Tên khách hàng:</strong> {customer.firstName} {customer.lastName}</p>
                                        <p className="mb-1"><strong>Email:</strong> {customer.email}</p>
                                        <p className="mb-0"><strong>Điện thoại:</strong> {customer.phone || 'N/A'}</p>
                                        {/* Link đến trang chi tiết khách hàng */}
                                        <Link to={`/admin/users/${order.userId}`} className="d-block mt-2 small">Xem thông tin khách hàng</Link>
                                    </>
                                ) : (<p className="text-muted">Đang tải thông tin khách hàng...</p>)}
                            </Card.Body>
                        </Card>

                        {/* Cập nhật trạng thái */}
                        <Card className="shadow-sm">
                            <Card.Header><h6>Cập nhật trạng thái đơn hàng</h6></Card.Header>
                            <Card.Body>
                                {canUpdateStatus ? (
                                    <Form onSubmit={(e) => { e.preventDefault(); handleUpdateStatus(); }}>
                                        <Form.Group controlId="orderStatusSelect" className="mb-2">
                                            <Form.Label className="visually-hidden">Trạng thái mới</Form.Label>
                                            <Form.Select size="sm" value={selectedStatus} onChange={handleStatusChange} disabled={isUpdatingStatus}>
                                                {/* Hiển thị trạng thái hiện tại trước */}
                                                <option value={order.status} disabled>{getStatusLabel(order.status)} (Hiện tại)</option>
                                                {/* Lọc các trạng thái hợp lệ có thể chuyển đến */}
                                                {allowedNextStatuses
                                                    .filter(status => status !== order.status) // Bỏ trạng thái hiện tại khỏi lựa chọn
                                                    .map(status => <option key={status} value={status}>{getStatusLabel(status)}</option>
)}
                                            </Form.Select>
                                        </Form.Group>
                                        <Button variant="primary" type="submit" size="sm" className="w-100" disabled={isUpdatingStatus || selectedStatus === order.status}>
                                            {isUpdatingStatus ? <Spinner size="sm" /> : 'Cập nhật Trạng thái'}
                                        </Button>
                                    </Form>
                                ) : (
                                    <p className="text-muted small mb-0">Trạng thái đơn hàng ({getStatusLabel(order.status)}) không thể cập nhật thêm.</p>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </motion.div>
    );
}

export default AdminOrderDetailPage;

// Cần import Table nếu dùng trong phần Specifications
// import { Table } from 'react-bootstrap';
