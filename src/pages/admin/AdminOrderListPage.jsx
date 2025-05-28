import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllOrdersAdmin } from '../../services/orderService';
import {
    Container, Table, Button, Alert, Badge, Card,
    InputGroup, FormControl, Form, Row, Col, Pagination as BsPagination
} from 'react-bootstrap';
import { Eye, Search } from 'react-bootstrap-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { OrderStatus, getStatusVariant, getStatusLabel } from '../../utils/orderUtils';

// Animation
const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
};
const pageTransition = { duration: 0.3 };

// Helpers
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch {
        return dateString;
    }
};
const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

function AdminOrderListPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 15;

    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
    const [userIdFilter, setUserIdFilter] = useState(searchParams.get('userId') || '');

    const fetchAdminOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const page = parseInt(searchParams.get('page') || '0');
            const currentStatus = searchParams.get('status') || undefined;
            const currentUserId = searchParams.get('userId') || undefined;

            setCurrentPage(page + 1);

            const params = {
                page: page,
                size: itemsPerPage,
                sortBy: searchParams.get('sortBy') || 'createdAt',
                sortDir: searchParams.get('sortDir') || 'desc',
                ...(currentStatus && { status: currentStatus }),
                ...(currentUserId && { userId: currentUserId }),
            };
            const filteredParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v));

            const response = await getAllOrdersAdmin(filteredParams);
            setOrders(response.data?.content || []);
            setTotalPages(response.data?.totalPages || 0);
        } catch (err) {
            console.error("Error fetching admin orders:", err);
            setError(err.response?.data?.message || 'Failed to load orders.');
            setOrders([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchAdminOrders();
    }, [fetchAdminOrders]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(name, value);
        } else {
            newParams.delete(name);
        }
        newParams.set('page', '0');
        setSearchParams(newParams);

        if (name === 'status') setStatusFilter(value);
        if (name === 'userId') setUserIdFilter(value);
    };

    const handlePageChange = (newPage) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', String(newPage - 1));
        setSearchParams(newParams);
    };

    // Pagination logic
    let paginationItems = [];
    if (totalPages > 1) {
        for (let page = 1; page <= totalPages; page++) {
            paginationItems.push(
                <BsPagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => handlePageChange(page)}
                >
                    {page}
                </BsPagination.Item>
            );
        }
    }

    return (
        <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Container fluid>
                <h1 className="h3 mb-4 text-gray-800">Quản lý đơn hàng</h1>

                {/* Filter */}
                <Card className="shadow-sm mb-4">
                    <Card.Body className="p-2">
                        <Form>
                            <Row className="g-2 align-items-end">
                                <Col xs={12} sm={6} md={4} lg={3}>
                                    <Form.Group controlId="statusFilter">
                                        <Form.Label className="small mb-1">Trạng thái</Form.Label>
                                        <Form.Select size="sm" name="status" value={statusFilter} onChange={handleFilterChange}>
                                            <option value="">Tất cả trạng thái</option>
                                            {Object.values(OrderStatus).map(status => (
                                                <option key={status} value={status}>{getStatusLabel(status)}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col xs={12} sm={6} md={4} lg={3}>
                                    <Form.Group controlId="userIdFilter">
                                        <Form.Label className="small mb-1">Mã khách hàng</Form.Label>
                                        <Form.Control
                                            size="sm"
                                            type="number"
                                            name="userId"
                                            placeholder="Lọc theo Mã khách hàng"
                                            value={userIdFilter}
                                            onChange={handleFilterChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={4} lg={3}>
                                    <Form.Group controlId="orderSearch">
                                        <Form.Label className="small mb-1">Tìm kiếm</Form.Label>
                                        <InputGroup size="sm">
                                            <FormControl placeholder="Mã đơn hàng, Khách hàng..." name="search" />
                                            <Button variant="outline-secondary"><Search /></Button>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md="auto">
                                    <Button variant="outline-secondary" size="sm" className="w-100" onClick={() => setSearchParams({})}>Đặt lại</Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>

                {loading && <LoadingSpinner />}
                {error && !loading && <Alert variant="danger">{error}</Alert>}

                {!loading && !error && (
                    <Card className="shadow-sm">
                        <Card.Body className="p-0">
                            <Table striped bordered hover responsive="md" size="sm" className="mb-0 admin-table">
                                <thead className="table-light">
                                    <tr>
                                        <th>Mã đơn hàng</th>
                                        <th>Khách hàng</th>
                                        <th>Thời gian đặt hàng</th>
                                        <th className="text-end">Tổng</th>
                                        <th className="text-center">Thanh toán</th>
                                        <th className="text-center">Trạng thái</th>
                                        <th className="text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length > 0 ? (
                                        orders.map(order => (
                                            <tr key={order.orderId}>
                                                <td className="fw-medium">
                                                    <Link to={`/admin/orders/${order.orderId}`}>#{order.orderId}</Link>
                                                </td>
                                                <td>
                                                    Mã khách hàng: {order.userId}
                                                </td>
                                                <td>{formatDate(order.createdAt)}</td>
                                                <td className="text-end">{formatPrice(order.totalAmount)}</td>
                                                <td className="text-center">{order.paymentMethod}</td>
                                                <td className="text-center">
                                                    <Badge bg={getStatusVariant(order.status)} pill>
                                                        {getStatusLabel(order.status)}
                                                    </Badge>
                                                </td>
                                                <td className="text-center">
                                                    <Link to={`/admin/orders/${order.orderId}`} className="btn btn-sm btn-outline-primary px-2 py-1" title="Chi tiết">
                                                        <Eye />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center text-muted py-4">Không tìm thấy đơn hàng.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                )}

                {totalPages > 1 && !loading && (
                    <div className="d-flex justify-content-center mt-4">
                        <BsPagination>{paginationItems}</BsPagination>
                    </div>
                )}
            </Container>
        </motion.div>
    );
}

export default AdminOrderListPage;
