// src/pages/admin/AdminCategoryListPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
// Import services
import { getAllCategories, deleteCategory } from '../../services/categoryService';
// Import Bootstrap components
import { Container, Table, Modal, Button, Spinner, Alert, Card, InputGroup, FormControl, Row, Col } from 'react-bootstrap';
// Import icons
import { PencilSquare, Trash, PlusCircle, Search } from 'react-bootstrap-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion'; // Animation
import '../../styles/cate-admin.css';

// Animation variants
const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };
const pageTransition = { duration: 0.3 };

function AdminCategoryListPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // State cho tìm kiếm

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // Hàm fetch danh sách category
    const fetchAdminCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllCategories(); // API này có thể public
            setCategories(response.data || []);
        } catch (err) {
            console.error("Error fetching admin categories:", err);
            setError(err.response?.data?.message || 'Failed to load categories.');
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Gọi fetch khi component mount
    useEffect(() => {
        fetchAdminCategories();
    }, [fetchAdminCategories]);

    // Hàm xử lý xóa category
    const handleDeleteCategoryClick = (category) => {
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    const confirmDeleteCategory = async () => {
        if (!categoryToDelete) return;
        try {
            await deleteCategory(categoryToDelete.categoryId);
            toast.success(`Danh mục "${categoryToDelete.name}" xóa thành công!`);
            setShowDeleteModal(false);
            setCategoryToDelete(null);
            fetchAdminCategories();
        } catch (err) {
            console.error("Lỗi xóa danh mục:", err);
            toast.error(err.response?.data?.message || 'Không xóa được danh mục.');
        }
    };

    // Lọc danh sách categories dựa trên searchTerm
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );


    // --- Render UI ---
    return (
        <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Container fluid> {/* Container fluid trong AdminLayout */}
                <Row className="align-items-center mb-4">
                    <Col xs={12} md>
                        <h1 className="h3 mb-0 text-gray-800">Quản lý Danh mục</h1>
                    </Col>
                    <Col xs={12} md="auto" className="mt-2 mt-md-0">
                        <Link to="/admin/categories/new" className="btn-add-category-custom">
                            <PlusCircle className="me-1" /> Thêm Danh mục mới
                        </Link>
                    </Col>
                </Row>

                {/* Thanh tìm kiếm */}
                <Card className="shadow-sm mb-4">
                    <Card.Body className="p-2">
                        <InputGroup size="sm">
                            <InputGroup.Text><Search /></InputGroup.Text>
                            <FormControl
                                placeholder="Tìm theo tên hoặc mô tả..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Card.Body>
                </Card>


                {loading && <LoadingSpinner />}
                {error && !loading && <Alert variant="danger">{error}</Alert>}

                {!loading && !error && (
                    <Card className="shadow-sm">
                        <Card.Body className="p-0"> {/* Bỏ padding để table sát viền */}
                            <Table striped bordered hover responsive="sm" size="sm" className="mb-0 admin-table"> {/* Thêm class nếu cần style */}
                                <thead className="table-light">
                                    <tr>
                                        <th className='text-center' style={{ width: '5%' }}>ID</th>
                                        <th style={{ width: '15%' }}>Tên</th>
                                        <th style={{ width: '50%' }}>Mô tả</th>
                                        <th style={{ width: '10%' }} className="text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCategories.length > 0 ? (
                                        filteredCategories.map((category) => (
                                            <tr key={category.categoryId} style={{ verticalAlign: 'middle' }}>
                                                <td className='text-center'>{category.categoryId}</td>
                                                <td className="fw-medium">{category.name}</td>
                                                <td className="text-muted small">{category.description || '-'}</td>
                                                <td className="text-center">
                                                    <Link
                                                        to={`/admin/categories/edit/${category.categoryId}`}
                                                        className="category-action-button edit"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <PencilSquare size={18} />
                                                    </Link>
                                                    <Link
                                                        className="category-action-button delete"
                                                        onClick={() => handleDeleteCategoryClick(category)}
                                                        title="Xoá"
                                                    >
                                                        <Trash size={18} />
                                                    </Link>

                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center text-muted py-4">
                                                {searchTerm ? 'Không tìm thấy danh mục nào phù hợp với tìm kiếm của bạn.' : 'Không có danh mục nào có sẵn.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                )}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Xác nhận xoá</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {categoryToDelete ? (
                            <p>Bạn có chắc chắn muốn xoá danh mục <strong>{categoryToDelete.name}</strong> (ID: {categoryToDelete.categoryId}) không?</p>
                        ) : (
                            <p>Đang xử lý...</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Huỷ</Button>
                        <Button variant="danger" onClick={confirmDeleteCategory}>Ok</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </motion.div>
    );
}

export default AdminCategoryListPage;
