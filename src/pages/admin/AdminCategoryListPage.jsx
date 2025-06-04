// src/pages/admin/AdminCategoryListPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
// Import services
import { getAllCategories, getAllCategoriesAdmin, toggleCategoryVisibilityAdmin, deleteCategory } from '../../services/categoryService';
// Import Bootstrap components
import { Container, Table, Modal, Button, Spinner, Alert, Card, InputGroup, FormControl, Row, Col, Badge, OverlayTrigger, Tooltip  } from 'react-bootstrap';
// Import icons
import { PencilSquare, Trash, PlusCircle, Search, EyeSlashFill, EyeFill   } from 'react-bootstrap-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion'; // Animation
import '../../styles/cate-admin.css';

import { useTranslation } from 'react-i18next';

// Animation variants
const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };
const pageTransition = { duration: 0.3 };

function AdminCategoryListPage() {

    const { t } = useTranslation();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // State cho tìm kiếm

    const [showToggleModal, setShowToggleModal] = useState(false);
    const [categoryToToggle, setCategoryToToggle] = useState(null);
    const [actionToConfirm, setActionToConfirm] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // Hàm fetch danh sách category
    const fetchAdminCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllCategoriesAdmin(); // API này có thể public
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

     const handleToggleVisibilityClick = (category) => {
        setCategoryToToggle(category);
        setActionToConfirm(category.visible ? 'hide' : 'show');
        setShowToggleModal(true);
    };

    const confirmToggleVisibility = async () => {
        if (!categoryToToggle) return;
        try {
            await toggleCategoryVisibilityAdmin(categoryToToggle.categoryId);
            toast.success(t(categoryToToggle.visible ? 'adminCategoryListPage.hideSuccessToast' : 'adminCategoryListPage.showSuccessToast', 
                            { categoryName: categoryToToggle.name })
            );
            setShowToggleModal(false);
            setCategoryToToggle(null);
            fetchAdminCategories(); // Tải lại danh sách
        } catch (err) {
            toast.error(err.response?.data?.message || t('adminCategoryListPage.errorUpdatingVisibility'));
            setShowToggleModal(false);
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
                                placeholder="Tìm theo tên danh mục..."
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
                                        <th style={{ width: '10%', textAlign: 'center' }}>Trạng thái</th>
                                        <th style={{ width: '30%' }} className="text-center">Thao tác</th>
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
                                                    <Badge bg={category.visible ? "success" : "secondary"}>
                                                        {category.visible ? t('adminCategoryListPage.status.visible', 'Hiện') : t('adminCategoryListPage.status.hidden', 'Ẩn')}
                                                    </Badge>
                                                </td>
                                                <td className="text-center">
                                                    <Link
                                                        to={`/admin/categories/edit/${category.categoryId}`}
                                                        className="btn btn-sm btn-outline-primary me-1 px-2 py-1" // Sử dụng class Bootstrap chuẩn
                                                        title={t('common.edit')}
                                                    >
                                                        <PencilSquare />
                                                    </Link>
                                                    {/* << NÚT ẨN/HIỆN MỚI >> */}
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={
                                                            <Tooltip id={`tooltip-cat-toggle-${category.categoryId}`}>
                                                                {category.visible ? t('adminCategoryListPage.actions.hide', 'Ẩn danh mục') : t('adminCategoryListPage.actions.show', 'Hiện danh mục')}
                                                            </Tooltip>
                                                        }
                                                    >
                                                        <Button 
                                                            variant={category.visible ? "outline-warning" : "outline-success"} 
                                                            size="sm" className="px-2 py-1" 
                                                            onClick={() => handleToggleVisibilityClick(category)}
                                                        >
                                                            {category.visible ? <EyeSlashFill /> : <EyeFill />}
                                                        </Button>
                                                    </OverlayTrigger>
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
                <Modal show={showToggleModal} onHide={() => setShowToggleModal(false)} centered size="sm">
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {actionToConfirm === 'hide' ? 
                                t('adminCategoryListPage.confirmHideTitle', 'Xác nhận Ẩn Danh mục') : 
                                t('adminCategoryListPage.confirmShowTitle', 'Xác nhận Hiện Danh mục')}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {categoryToToggle && (
                            <p>
                                {actionToConfirm === 'hide' ? 
                                    t('adminCategoryListPage.confirmHideMessage', 'Bạn có chắc muốn ẩn danh mục "{{categoryName}}"? Các sản phẩm thuộc danh mục này có thể không còn hiển thị với người dùng.', { categoryName: categoryToToggle.name }) : 
                                    t('adminCategoryListPage.confirmShowMessage', 'Bạn có chắc muốn hiện lại danh mục "{{categoryName}}"?', { categoryName: categoryToToggle.name })
                                }
                            </p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowToggleModal(false)}>{t('common.cancel')}</Button>
                        <Button 
                            variant={actionToConfirm === 'hide' ? "warning" : "success"} 
                            onClick={confirmToggleVisibility}>
                            {actionToConfirm === 'hide' ? t('adminCategoryListPage.hideButton', 'Ẩn') : t('adminCategoryListPage.showButton', 'Hiện')}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </motion.div>
    );
}

export default AdminCategoryListPage;
