import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// Import services
import { getUserDetailsAdmin } from '../../services/userService'; // Lấy chi tiết user/customer
import { getUserOrdersForAdmin, findOrdersByUserId } from '../../services/orderService'; // Lấy đơn hàng của user này
// Import Bootstrap
import { Container, Row, Col, Card, Button, Spinner, Alert, Table, Tabs, Tab, Badge, Pagination as BsPagination } from 'react-bootstrap';
// Import icons
import { ArrowLeft, PersonFill, EnvelopeFill, TelephoneFill, GeoAltFill, CalendarEvent, BoxArrowUpRight, Eye } from 'react-bootstrap-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { motion } from 'framer-motion';

// Animation variants
const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };
const pageTransition = { duration: 0.3 };

// Helpers
const formatDate = (dateString, options = {}) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', options);
    } catch {
        return dateString;
    }
};

const formatPrice = (price) => { if (price === null || price === undefined) return 'N/A'; return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price); };
const getStatusVariant = (status) => {
    switch (status) {
        case 'COMPLETED': return 'success';
        case 'SHIPPED': return 'info';
        case 'PROCESSING': return 'warning';
        case 'PENDING': return 'secondary';
        case 'PAID': return 'primary';
        case 'CANCELED': return 'danger';
        default: return 'light';
    }
};

const getRoleVariant = (role) => { if (role === 'ADMIN') return 'danger'; if (role === 'STAFF') return 'warning'; return 'secondary'; };

function AdminCustomerDetailPage() {
    const { userId } = useParams(); // Lấy userId từ URL
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null); // UserDTO
    const [orders, setOrders] = useState([]); // Danh sách OrderDTO của user
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State phân trang cho danh sách đơn hàng
    const [orderCurrentPage, setOrderCurrentPage] = useState(1);
    const [orderTotalPages, setOrderTotalPages] = useState(0);
    const ordersPerPage = 5; // Ít đơn hàng hơn trên trang chi tiết

    // Fetch thông tin khách hàng và đơn hàng
    const fetchData = useCallback(async () => {
        if (!userId) { setError("Invalid Customer ID."); setLoading(false); return; }
        setLoading(true); setError(null);
        try {
            // Lấy thông tin cơ bản của khách hàng
            const customerResponse = await getUserDetailsAdmin(userId);
            setCustomer(customerResponse.data);

            // Lấy danh sách đơn hàng của khách hàng (trang đầu tiên)
            await fetchCustomerOrders(userId, 1); // Gọi hàm fetch order riêng

        } catch (err) {
            console.error("Error fetching customer details:", err);
            setError(err.response?.data?.message || 'Failed to load customer data.');
            if (err.response?.status === 404) { setTimeout(() => navigate('/admin/users', { replace: true }), 3000); }
        } finally { setLoading(false); }
    }, [userId, navigate]); // Bỏ fetchCustomerOrders khỏi dependency ban đầu

    // Hàm fetch đơn hàng của khách hàng theo trang
    const fetchCustomerOrders = useCallback(async (userId, page) => {
        // Có thể thêm loading riêng cho bảng order nếu muốn
        try {
            const params = { page: page - 1, size: ordersPerPage, sort: 'createdAt,desc' };
            // *** Backend cần API GET /api/admin/users/{userId}/orders hoặc dùng lại findOrdersByUserId ***
            // Giả sử dùng lại findOrdersByUserId (cần đảm bảo Staff/Admin có quyền gọi)
            const response = await getUserOrdersForAdmin(userId, params); // Gọi service lấy order theo User ID
            setOrders(response.data?.content || []);
            setOrderTotalPages(response.data?.totalPages || 0);
            setOrderCurrentPage(page); // Cập nhật trang hiện tại
        } catch (orderErr) {
            console.error(`Error fetching orders for user ${userId}:`, orderErr);
            // Set lỗi riêng cho phần order hoặc lỗi chung
            setError(prev => prev ? `${prev}\nFailed to load order history.` : 'Failed to load order history.');
            setOrders([]); setOrderTotalPages(0);
        }
    }, []); // Không phụ thuộc state phân trang để tránh gọi lại khi chưa cần


    useEffect(() => { fetchData(); }, [fetchData]);

    // Xử lý chuyển trang cho bảng đơn hàng
    const handleOrderPageChange = (newPage) => {
        if (customer) {
            fetchCustomerOrders(customer.userId, newPage);
        }
    };

    // --- Pagination Logic for Orders ---
    // --- Pagination Logic for Orders ---
    let orderPaginationItems = [];
    if (orderTotalPages > 1) {
        let startPage = Math.max(1, orderCurrentPage - 2);
        let endPage = Math.min(orderTotalPages, orderCurrentPage + 2);

        if (orderCurrentPage - 2 <= 0) {
            endPage = Math.min(orderTotalPages, endPage + (2 - orderCurrentPage + 1));
        }
        if (orderCurrentPage + 2 >= orderTotalPages) {
            startPage = Math.max(1, startPage - (orderCurrentPage + 2 - orderTotalPages));
        }

        endPage = Math.min(orderTotalPages, startPage + 4);
        startPage = Math.max(1, endPage - 4);

        orderPaginationItems.push(<BsPagination.First key="first" onClick={() => handleOrderPageChange(1)} disabled={orderCurrentPage === 1} />);
        orderPaginationItems.push(<BsPagination.Prev key="prev" onClick={() => handleOrderPageChange(orderCurrentPage - 1)} disabled={orderCurrentPage === 1} />);
        if (startPage > 1) orderPaginationItems.push(<BsPagination.Ellipsis key="start-ellipsis" onClick={() => handleOrderPageChange(startPage - 1)} />);
        for (let number = startPage; number <= endPage; number++) {
            orderPaginationItems.push(
                <BsPagination.Item key={number} active={number === orderCurrentPage} onClick={() => handleOrderPageChange(number)}>{number}</BsPagination.Item>
            );
        }
        if (endPage < orderTotalPages) orderPaginationItems.push(<BsPagination.Ellipsis key="end-ellipsis" onClick={() => handleOrderPageChange(endPage + 1)} />);
        orderPaginationItems.push(<BsPagination.Next key="next" onClick={() => handleOrderPageChange(orderCurrentPage + 1)} disabled={orderCurrentPage === orderTotalPages} />);
        orderPaginationItems.push(<BsPagination.Last key="last" onClick={() => handleOrderPageChange(orderTotalPages)} disabled={orderCurrentPage === orderTotalPages} />);
    }


    // --- Render UI ---
    if (loading) return <LoadingSpinner />;
    if (error && !customer) return (<Container><Alert variant="danger">{error}</Alert><Link to="/admin/users">Quay lại</Link></Container>);
    if (!customer) return (<Container><Alert variant="warning">Không tìm thấy người dùng.</Alert><Link to="/admin/users">Quay lại</Link></Container>);

    return (
        <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Container fluid>
                <Row className="align-items-center mb-3">
                    <Col xs="auto"> <Link to="/admin/users" className="btn btn-outline-secondary btn-sm"><ArrowLeft /> Quay lại</Link> </Col>
                    <Col> <h1 className="h4 mb-0 text-gray-800">Chi tiết người dùng - {customer.firstName} {customer.lastName} (ID: {customer.userId})</h1> </Col>
                    {/* Có thể thêm nút Edit Customer ở đây */}
                </Row>

                {/* Hiển thị lỗi fetch order nếu có */}
                {error && error.includes('order') && <Alert variant="warning" className="mt-2">{error}</Alert>}

                <Row>
                    {/* Cột thông tin chi tiết */}
                    <Col lg={4} className="mb-4 mb-lg-0">
                        <Card className="shadow-sm h-100">
                            <Card.Header> <h6 className="m-0 fw-bold text-primary"> <PersonFill className="me-1" /> Thông tin</h6> </Card.Header>
                            <Card.Body className="small">
                                <p><strong>Tên đăng nhập:</strong> {customer.username}</p>
                                <p><strong>Email:</strong> <a href={`mailto:${customer.email}`}>{customer.email}</a></p>
                                <p><strong>Điện thoại:</strong> {customer.phone || 'N/A'}</p>
                                <p><strong>Địa chỉ:</strong> {customer.address || 'N/A'}</p>
                                <p><strong>Ngày sinh:</strong> {formatDate(customer.dateOfBirth)}</p>
                                <p><strong>Ngày tham gia:</strong> {formatDate(customer.createdAt)}</p>
                                <p><strong>Provider:</strong> <Badge bg="info" text="dark">{customer.provider || 'N/A'}</Badge></p>
                                <p><strong>Role:</strong> <Badge bg={getRoleVariant(customer.role)}>{customer.role || 'N/A'}</Badge></p>
                                {/* Không hiển thị Role cho khách hàng */}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Cột chứa các Tab */}
                    <Col lg={8}>
                        <Tabs defaultActiveKey="orders" id="customer-details-tabs" className="mb-3">
                            {/* Tab Lịch sử đơn hàng */}
                            <Tab eventKey="orders" title="Lịch sử đặt hàng">
                                <Card className="shadow-sm">
                                    <Card.Body className="p-0">
                                        <Table striped hover responsive="sm" size="sm" className="mb-0">
                                            <thead className="table-light">
                                                <tr><th>ID</th><th>Thời gian đặt hàng</th><th className="text-end">Tổng cộng</th><th className="text-center">Trạng thái</th><th className="text-center">Xem</th></tr>
                                            </thead>
                                            <tbody>
                                                {orders.length > 0 ? (
                                                    orders.map(order => (
                                                        <tr key={order.orderId}>
                                                            <td><Link to={`/admin/orders/${order.orderId}`}>#{order.orderId}</Link></td>
                                                            <td>{formatDate((order.createdAt), { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                                            <td className="text-end">{formatPrice(order.totalAmount)}</td>
                                                            <td className="text-center"><Badge bg={getStatusVariant(order.status)}>{order.status}</Badge></td>
                                                            <td className="text-center"><Link to={`/admin/orders/${order.orderId}`} className="btn btn-sm btn-outline-primary p-1"><Eye /></Link></td>
                                                        </tr>
                                                    ))
                                                ) : (<tr><td colSpan="5" className="text-center text-muted py-3">Không tìm thấy đơn hàng nào.</td></tr>)}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                    {/* Phân trang cho đơn hàng */}
                                    {orderTotalPages > 1 && (
                                        <Card.Footer className="d-flex justify-content-center">
                                            <BsPagination size="sm">{orderPaginationItems}</BsPagination>
                                        </Card.Footer>
                                    )}
                                </Card>
                            </Tab>

                            {/* Tab Yêu thích (Placeholder - Cần API backend) */}
                            {/* <Tab eventKey="favorites" title="Favorites">
                                <Card className="shadow-sm"><Card.Body><p className="text-muted">Sản phẩm yêu thích (Feature coming soon).</p></Card.Body></Card>
                            </Tab> */}

                            {/* Tab Đánh giá (Placeholder - Cần API backend) */}
                            {/* <Tab eventKey="reviews" title="Reviews">
                                <Card className="shadow-sm"><Card.Body><p className="text-muted">Đánh giá của khách hàng (Feature coming soon).</p></Card.Body></Card>
                            </Tab> */}
                        </Tabs>
                    </Col>
                </Row>
            </Container>
        </motion.div>
    );
}

export default AdminCustomerDetailPage;

