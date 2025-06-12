import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllCustomersAdmin, deleteUserAdmin } from '../../services/userService';
import {
    Container, Table, Button, Spinner, Alert, Card, InputGroup, FormControl, Badge,
    Form, Row, Col, Pagination as BsPagination, Modal
} from 'react-bootstrap';
import { PersonPlus, Search, Eye, Trash } from 'react-bootstrap-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
};
const pageTransition = { duration: 0.3 };

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try { return new Date(dateString).toLocaleDateString('vi-VN'); }
    catch { return dateString; }
};
const getRoleVariant = (role) => {
    if (role === 'ADMIN') return 'danger';
    if (role === 'STAFF') return 'warning';
    return 'secondary';
};
function AdminCustomerListPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const { user: adminUser } = useAuthStore();


    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 15;

    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage - 1, // backend 0-based
                size: itemsPerPage,
                sortBy: 'userId',
                sortDir: 'asc',
                ...(searchTerm && { search: searchTerm.trim() }),
                ...(roleFilter && { role: roleFilter })
            };

            const response = await getAllCustomersAdmin(params);
            setCustomers(response.data?.content || []);
            setTotalPages(response.data?.totalPages || 0);
        } catch (err) {
            console.error("Error fetching customers:", err);
            setError(err.response?.data?.message || 'Failed to load customers.');
            setCustomers([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, roleFilter]);



    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleSearch = (e) => {
        e.preventDefault();
        const newParams = new URLSearchParams();
        if (searchTerm.trim()) newParams.set('search', searchTerm.trim());
        if (roleFilter) newParams.set('role', roleFilter);
        newParams.set('page', '0');
        setSearchParams(newParams);
    };

    const handleReset = () => {
        setSearchTerm('');
        setRoleFilter('');
        setSearchParams({});
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // scroll lên khi đổi trang
        }
    };

    const handleDeleteCustomer = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };
    const confirmDeleteCustomer = async () => {
        if (!userToDelete) return;
        try {
            await deleteUserAdmin(userToDelete.userId);
            toast.success(`Người dùng "${userToDelete.username}" đã được xóa thành công!`);
            setShowDeleteModal(false);
            setUserToDelete(null);
            fetchCustomers();
        } catch (err) {
            console.error("Error deleting customer:", err);
            toast.error(err.response?.data?.message || 'Failed to delete customer.');
            setShowDeleteModal(false);
        }
    };


    let paginationItems = [];
    if (totalPages > 1) {
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);
        if (currentPage - 2 <= 0) { endPage = Math.min(totalPages, endPage + (2 - currentPage + 1)); }
        if (currentPage + 2 >= totalPages) { startPage = Math.max(1, startPage - (currentPage + 2 - totalPages)); }
        endPage = Math.min(totalPages, startPage + 4);
        startPage = Math.max(1, endPage - 4);

        paginationItems.push(<BsPagination.First key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1} />);
        paginationItems.push(<BsPagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />);
        if (startPage > 1) paginationItems.push(<BsPagination.Ellipsis key="start-ellipsis" onClick={() => handlePageChange(startPage - 1)} />);
        for (let number = startPage; number <= endPage; number++) {
            paginationItems.push(<BsPagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>{number}</BsPagination.Item>);
        }
        if (endPage < totalPages) paginationItems.push(<BsPagination.Ellipsis key="end-ellipsis" onClick={() => handlePageChange(endPage + 1)} />);
        paginationItems.push(<BsPagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />);
        paginationItems.push(<BsPagination.Last key="last" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />);
    }

    const isAdmin = adminUser?.role === 'ADMIN';

    return (
        <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Container fluid>
                <Row className="align-items-center mb-4">
                    <Col xs={12} md><h1 className="h3 mb-0 text-gray-800">Quản lý tài khoản</h1></Col>
                    {isAdmin && (
                        <Col xs={12} md="auto" className="mt-2 mt-md-0">
                            <Link to="/admin/users/create">
                                <Button variant="primary" size="sm"><PersonPlus className="me-1" /> Tạo tài khoản mới</Button>
                            </Link>
                        </Col>
                    )}
                </Row>

                {/* Search Bar + Role Filter */}
                <Card className="shadow-sm mb-4">
                    <Card.Body className="p-2">
                        <Form onSubmit={handleSearch}>
                            <Row className="g-2 align-items-end">
                                <Col md>
                                    <InputGroup size="sm">
                                        <InputGroup.Text><Search /></InputGroup.Text>
                                        <FormControl
                                            placeholder="Tìm kiếm bằng tên hoặc email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md="auto">
                                    <Form.Select
                                        size="sm"
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                    >
                                        <option value="">Tất cả vai trò</option>
                                        {/* <option value="STAFF">Nhân viên</option> */}
                                        <option value="BUYER">Khách hàng</option>

                                    </Form.Select>
                                </Col>
                                <Col xs="auto">
                                    <Button type="submit" variant="primary" size="sm">Tìm kiếm</Button>
                                </Col>
                                <Col xs="auto">
                                    <Button variant="outline-secondary" size="sm" onClick={handleReset}>Đặt lại</Button>
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
                                        <th>ID</th>
                                        <th>Tên</th>
                                        <th>Email</th>
                                        <th>Điện thoại</th>
                                        <th>Địa chỉ</th>
                                        <th>Vai trò</th>
                                        <th>Đã tham gia</th>
                                        <th className="text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.length > 0 ? (
                                        customers.map((customer) => (
                                            <tr key={customer.userId}>
                                                <td>{customer.userId}</td>
                                                <td>{`${customer.firstName || ''} ${customer.lastName || ''}`.trim()}</td>
                                                <td>{customer.email}</td>
                                                <td>{customer.phone || '-'}</td>
                                                <td className="text-truncate" style={{ maxWidth: '200px' }} title={customer.address}>{customer.address || '-'}</td>
                                                <td><Badge bg={getRoleVariant(customer.role)}>{customer.role}</Badge></td>
                                                <td>{formatDate(customer.createdAt)}</td>
                                                <td className="text-center">
                                                    <Link to={`/admin/users/${customer.userId}`} className="btn btn-sm btn-outline-info me-1 px-2 py-1" title="Xem chi tiết"><Eye /></Link>
                                                    {isAdmin && (
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            className="px-2 py-1"
                                                            onClick={() => handleDeleteCustomer(customer)}
                                                            title="Xóa"
                                                        >
                                                            <Trash />
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="7" className="text-center text-muted py-4">Không tìm thấy người dùng nào.</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                )}

                {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                        <BsPagination size="sm">
                            <BsPagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                            <BsPagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => Math.abs(currentPage - p) <= 2)
                                .map(p => (
                                    <BsPagination.Item key={p} active={p === currentPage} onClick={() => handlePageChange(p)}>{p}</BsPagination.Item>
                                ))}
                            <BsPagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                            <BsPagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                        </BsPagination>
                    </div>
                )}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Xác nhận xóa</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {userToDelete ? (
                            <>
                                Bạn có chắc chắn muốn xóa người dùng <strong>{userToDelete.username}</strong> (ID: <strong>{userToDelete.userId}</strong>)?
                                <br />Hành động này <strong>không thể hoàn tác</strong>!
                            </>
                        ) : 'Đang xử lý...'}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>
                            Hủy
                        </Button>
                        <Button variant="danger" size="sm" onClick={confirmDeleteCustomer}>
                            Xác nhận xóa
                        </Button>
                    </Modal.Footer>
                </Modal>

            </Container>
        </motion.div>
    );
}

export default AdminCustomerListPage;
