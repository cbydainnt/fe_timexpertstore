// src/pages/admin/AdminProductListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
// Import services
import { getProducts, deleteProduct, getAllProductsAdmin, toggleProductVisibilityAdmin } from '../../services/productService';
import { getAllCategories, getAllCategoriesAdmin } from '../../services/categoryService';
import { getAllReviewsAdmin, getAllReviewsByProductIdForAdmin, setReviewVisibilityAdmin, deleteReviewAdmin } from '../../services/reviewService';
import {
    Container, Modal, Table, Button, Spinner, Alert, Card, InputGroup,
    FormControl, Form, Row, Col, Image, Pagination as BsPagination, Badge, ListGroup, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import { PencilSquare, Trash, PlusCircle, Search, Funnel, StarFill, Eye, EyeSlashFill, EyeFill } from 'react-bootstrap-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';

// Animation variants
const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };
const pageTransition = { duration: 0.3 };

// Helper format tiền
const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const StarRatingDisplay = ({ rating, size = '1em' }) => {
    if (rating == null || rating === 0) return <span className="text-muted small">-</span>;
    return (
        <span className="star-rating-display">
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <StarFill
                        key={starValue}
                        style={{
                            color: starValue <= Math.round(rating) ? '#ffc107' : '#e0e0e0',
                            fontSize: size,
                            marginRight: '1px',
                        }}
                    />
                );
            })}
        </span>
    );
};
// Hàm tiện ích debounce
// Nó sẽ trả về một hàm mới, chỉ gọi hàm gốc sau khi hết thời gian delay
const debounce = (func, delay) => {
    let timer;
    return function (...args) {
        const context = this;
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
};

function AdminProductListPage() {
    const { t } = useTranslation();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]); // Danh sách category cho filter

    // State cho phân trang và lọc/sắp xếp (đọc từ URL)
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10; // Số sản phẩm mỗi trang

    // State cho filter cục bộ (để người dùng nhập/chọn trước khi apply)
    const [localSearchTerm, setLocalSearchTerm] = useState(searchParams.get('name') || '');
    const [localCategoryFilter, setLocalCategoryFilter] = useState(searchParams.get('categoryId') || '');
    const [filterField, setFilterField] = useState(searchParams.get('filterField') || 'category');
    const [localBrandFilter, setLocalBrandFilter] = useState(searchParams.get('brand') || '');

    // State cho modal xác nhận xoá
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const [showHideConfirmModal, setShowHideConfirmModal] = useState(false);
    const [productToToggle, setProductToToggle] = useState(null);
    const [actionToConfirm, setActionToConfirm] = useState('');

    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [selectedProductForReviews, setSelectedProductForReviews] = useState(null);
    const [productReviews, setProductReviews] = useState([]);

    const [loadingProductReviews, setLoadingProductReviews] = useState(false);
    const [reviewModalCurrentPage, setReviewModalCurrentPage] = useState(1);
    const [reviewModalTotalPages, setReviewModalTotalPages] = useState(0);
    const reviewsModalItemsPerPage = 5;

    const BASE_IMAGE_URL = 'http://localhost:8080';

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try { return new Date(dateString).toLocaleString('vi-VN'); }
        catch { return dateString; }
    };

    // Hàm fetch products dựa trên searchParams hiện tại
    // const fetchAdminProducts = useCallback(async () => {
    //     setLoading(true);
    //     setError(null);
    //     try {

    //         const page = parseInt(searchParams.get('page') || '0');
    //         const params = {
    //             page: page,
    //             size: itemsPerPage,
    //             name: searchParams.get('name') || undefined,
    //             categoryId: searchParams.get('categoryId') || undefined,
    //             // Thêm các filter khác nếu cần lấy từ searchParams
    //             sortBy: searchParams.get('sortBy') || 'createdAt', // Mặc định
    //             sortDir: searchParams.get('sortDir') || 'desc',
    //         };
    //         const filteredParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== ''));

    //         const response = await getAllProductsAdmin(filteredParams); // Gọi API getProducts đã cập nhật
    //         setProducts(response.data?.content || []);
    //         setTotalPages(response.data?.totalPages || 0);
    //         // setCurrentPage(page + 1); // Cập nhật trang hiện tại (UI từ 1)
    //         setCurrentPage(response.data?.currentPage + 1 || 1);
    //     } catch (err) {
    //         console.error("Error fetching admin products:", err);
    //         setError(err.response?.data?.message || 'Failed to load products.');
    //         setProducts([]); setTotalPages(0);
    //     } finally { setLoading(false); }
    // }, [searchParams]); // Phụ thuộc vào searchParams

     const fetchAdminProducts = useCallback(async () => {
            setLoading(true);
            setError(null);
            try {
    
                const page = parseInt(searchParams.get('page') || '0');
                const params = {
                    page: page,
                    size: itemsPerPage,
                    name: searchParams.get('name') || undefined,
                    categoryId: searchParams.get('categoryId') || undefined,
                    // Thêm các filter khác nếu cần lấy từ searchParams
                    sortBy: searchParams.get('sortBy') || 'productId', // Sắp xếp theo ID mặc định cho admin
                    sortDir: searchParams.get('sortDir') || 'asc',
                };
                const filteredParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== ''));
    
                const response = await getProducts(filteredParams); // Gọi API getProducts đã cập nhật
                setProducts(response.data?.content || []);
                setTotalPages(response.data?.totalPages || 0);
                setCurrentPage(page + 1); // Cập nhật trang hiện tại (UI từ 1)
    
            } catch (err) {
                console.error("Error fetching admin products:", err);
                setError(err.response?.data?.message || 'Failed to load products.');
                setProducts([]); setTotalPages(0);
            } finally { setLoading(false); }
        }, [searchParams]); // Phụ thuộc vào searchParams

    const applyFiltersAndSearch = () => {
        const newParams = new URLSearchParams();
        if (localSearchTerm.trim()) newParams.set('name', localSearchTerm.trim());
        if (localCategoryFilter) newParams.set('categoryId', localCategoryFilter);
        // if (filterField === 'brand' && localBrandFilter.trim()) newParams.set('brand', localBrandFilter.trim());
        newParams.set('page', '0'); // Luôn reset về trang đầu khi lọc/tìm kiếm
        setSearchParams(newParams);
    };
    // Fetch categories cho dropdown filter
    useEffect(() => {
        getAllCategoriesAdmin().then(res => setCategories(res.data || [])).catch(err => console.error("Lỗi tải danh mục cho admin:", err));
        fetchAdminProducts();
    }, [fetchAdminProducts]);

    // Fetch products khi searchParams thay đổi
    useEffect(() => {
        fetchAdminProducts();
    }, [fetchAdminProducts]);


    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            const newParams = new URLSearchParams(searchParams);
            if (localSearchTerm) newParams.set('name', localSearchTerm);
            else newParams.delete('name');
            newParams.set('page', '0');
            setSearchParams(newParams);
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [localSearchTerm]);

    const handleToggleVisibilityClick = (product) => {
        setProductToToggle(product);
        setActionToConfirm(product.visible ? 'hide' : 'show');
        setShowHideConfirmModal(true);
    };

    const confirmToggleVisibility = async () => {
        if (!productToToggle) return;
        try {
            await toggleProductVisibilityAdmin(productToToggle.productId);
            toast.success(t(productToToggle.visible ? ('adminProductListPage.hideSuccessToast', 'Ẩn sản phẩm thành công') : ('adminProductListPage.showSuccessToast', 'Hiện sản phẩm thành công'),
                { productName: productToToggle.name })
            );
            setShowHideConfirmModal(false);
            setProductToToggle(null);
            fetchAdminProducts(); // Tải lại danh sách sản phẩm
        } catch (err) {
            toast.error(err.response?.data?.message || t('adminProductListPage.errorUpdatingVisibility', 'Lỗi cập nhật trạng thái sản phẩm'));
            setShowHideConfirmModal(false);
        }
    };

    const handleViewReviewsClick = async (product, page = 0) => {
        setSelectedProductForReviews(product);
        setLoadingProductReviews(true);
        setShowReviewsModal(true);
        setReviewModalCurrentPage(page + 1); // page là 0-based từ API
        try {
            const params = { page, size: reviewsModalItemsPerPage, sortBy: 'reviewDate', sortDir: 'desc' };
            // API này lấy TẤT CẢ reviews (cả ẩn và hiện) cho Admin
            const response = await getAllReviewsByProductIdForAdmin(product.productId, params);
            setProductReviews(response.data?.content || []);
            setReviewModalTotalPages(response.data?.totalPages || 0);
        } catch (err) {
            toast.error(t('adminReviewListPage.errorLoadingReviews'));
            console.error("Error fetching product reviews for admin:", err);
        } finally {
            setLoadingProductReviews(false);
        }
    };

    const handleReviewModalPageChange = (pageNumber) => {
        if (selectedProductForReviews) {
            handleViewReviewsClick(selectedProductForReviews, pageNumber - 1);
        }
    };
    const toggleReviewVisibility = async (reviewId, currentVisibility) => {
        try {
            await setReviewVisibilityAdmin(reviewId, !currentVisibility);
            toast.success(t('adminReviewListPage.visibilityUpdateSuccessToast'));
            // Tải lại reviews trong modal
            if (selectedProductForReviews) {
                handleViewReviewsClick(selectedProductForReviews, reviewModalCurrentPage - 1);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || t('adminReviewListPage.errorUpdatingVisibility'));
        }
    };

    const deleteReviewFromModal = async (reviewId) => {
        if (window.confirm(t('adminReviewListPage.confirmDeleteMessage'))) {
            try {
                await deleteReviewAdmin(reviewId);
                toast.success(t('adminReviewListPage.deleteSuccessToast'));
                // Tải lại reviews trong modal
                if (selectedProductForReviews) {
                    handleViewReviewsClick(selectedProductForReviews, reviewModalCurrentPage - 1);
                    // Cần tải lại cả danh sách sản phẩm để cập nhật reviewCount/averageRating nếu cần
                    fetchAdminProducts();
                }
            } catch (err) {
                toast.error(err.response?.data?.message || t('adminReviewListPage.errorDeletingReview'));
            }
        }
    };



    // Xử lý khi nhấn nút Search hoặc Apply Filters
    const handleFilterApply = () => {
        const newParams = new URLSearchParams(searchParams);
        if (filterField === 'category') {
            if (localCategoryFilter) newParams.set('categoryId', localCategoryFilter);
            else newParams.delete('categoryId');
            newParams.delete('brand');
        } else if (filterField === 'brand') {
            if (localBrandFilter) newParams.set('brand', localBrandFilter);
            else newParams.delete('brand');
            newParams.delete('categoryId');
        }
        newParams.set('filterField', filterField);
        newParams.set('page', '0');
        setSearchParams(newParams);
    };

    // Xử lý khi nhấn nút Reset Filters
    const handleFilterReset = () => {
        setLocalSearchTerm('');
        setLocalCategoryFilter('');
        setLocalBrandFilter('');
        setFilterField('category');
        setSearchParams(new URLSearchParams());
    };

    // Xử lý phân trang
    const handlePageChange = (newPage) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', String(newPage - 1));
        setSearchParams(newParams);
    };

    // Xử lý xóa sản phẩm
    const handleDeleteProductClick = (product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const confirmDeleteProduct = async () => {
        if (!productToDelete) return;
        try {
            await deleteProduct(productToDelete.productId);
            toast.success(`Sản phẩm "${productToDelete.name}" đã được xóa!`);
            setShowDeleteModal(false);
            setProductToDelete(null);
            fetchAdminProducts();
        } catch (err) {
            console.error("Error deleting product:", err);
            toast.error(err.response?.data?.message || 'Không xóa được sản phẩm.');
        }
    };


    // --- Pagination Logic ---
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
        for (let number = startPage; number <= endPage; number++) { paginationItems.push(<BsPagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>{number}</BsPagination.Item>); }
        if (endPage < totalPages) paginationItems.push(<BsPagination.Ellipsis key="end-ellipsis" onClick={() => handlePageChange(endPage + 1)} />);
        paginationItems.push(<BsPagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />);
        paginationItems.push(<BsPagination.Last key="last" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />);
    }

    return (
        <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Container fluid>
                {/* Header của trang */}
                <Row className="align-items-center mb-4">
                    <Col xs={12} md> <h1 className="h3 mb-0 text-gray-800">Quản lý Sản phẩm</h1> </Col>
                    <Col xs={12} md="auto" className="mt-2 mt-md-0">
                        <Link to="/admin/products/new"> <Button variant="primary" size="sm"><PlusCircle className="me-1" /> Thêm sản phẩm mới</Button> </Link>
                        {/* TODO: Thêm nút Export Excel */}
                        {/* <Button variant="outline-secondary" size="sm" className="ms-2" disabled>Xuất Excel</Button> */}
                    </Col>
                </Row>

                {/* Filter và Search */}
                <Card className="shadow-sm mb-4">
                    <Card.Body className="p-2">
                        <Form onSubmit={(e) => { e.preventDefault(); handleFilterApply(); }}>
                            {/* onSubmit={(e) => { e.preventDefault(); handleFilterApply(); }} */}
                            <Row className="g-2 align-items-end">
                                <Col xs={12} md={5} lg={4}>
                                    <Form.Group controlId="productSearch">
                                        <Form.Label className="small mb-1 visually-hidden">Tìm kiếm</Form.Label>
                                        <InputGroup size="sm">
                                            <InputGroup.Text><Search /></InputGroup.Text>
                                            <FormControl placeholder="Tìm theo tên, thương hiệu, phiên bản..."
                                                value={localSearchTerm}
                                                onChange={(e) => setLocalSearchTerm(e.target.value)} />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                {/* <Col xs={6} md={3} lg={2}>
                                    <Form.Select size="sm" value={filterField}
                                        onChange={(e) => setFilterField(e.target.value)}>
                                        <option value="category">Danh mục</option>
                                        <option value="brand">Thương hiệu</option>
                                    </Form.Select>
                                </Col> */}
                                <Col xs={6} md={4} lg={3}>
                                    {filterField === 'category' ? (
                                        <Form.Select size="sm" value={localCategoryFilter} onChange={(e) => setLocalCategoryFilter(e.target.value)}>
                                            <option value="">Tất cả danh mục</option>
                                            {categories.map(cat => (
                                                <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                                            ))}
                                        </Form.Select>
                                    ) : (
                                        <FormControl size="sm" placeholder="Nhập tên thương hiệu..." value={localBrandFilter} onChange={(e) => setLocalBrandFilter(e.target.value)} />
                                    )}
                                </Col>
                                {/* TODO: Thêm các filter khác nếu cần */}
                                <Col xs={6} md="auto">
                                    <Button type="submit" variant="primary" size="sm" className="w-100" onClick={handleFilterApply}>Áp dụng</Button>
                                </Col>
                                <Col xs={6} md="auto">
                                    <Button variant="outline-secondary" size="sm" className="w-100" onClick={handleFilterReset}>Đặt lại</Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>

                {/* Loading / Error */}
                {loading && <LoadingSpinner />}
                {error && !loading && <Alert variant="danger">{error}</Alert>}

                {/* Bảng sản phẩm */}
                {!loading && !error && (
                    <Card className="shadow-sm">
                        <Card.Body className="p-0">
                            <Table striped bordered hover responsive="md" size="sm" className="mb-0 admin-table">
                                <thead className="table-light">
                                    <tr>
                                        <th className='text-center' style={{ width: '5%' }}>ID</th>
                                        <th className='text-center' style={{ width: '10%' }}>Ảnh</th>
                                        <th className='text-center' style={{ width: '20%' }}>Tên</th>
                                        <th className='text-center' style={{ width: '15%' }}>Danh mục</th>
                                        <th className="text-center" style={{ width: '10%' }}>Giá</th>
                                        <th className="text-center" style={{ width: '10%' }}>Số lượng</th>
                                        <th className="text-center" style={{ width: '10%' }}>{t('adminProductListPage.table.rating', 'Đánh giá')}</th>
                                        <th className="text-center" style={{ width: '10%' }}>{t('adminProductListPage.table.visibility', 'Trạng thái')}</th>
                                        <th className="text-center" style={{ width: '10%' }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length > 0 ? (
                                        products.map((product) => (
                                            <tr key={product.productId} style={{ verticalAlign: 'middle' }}>
                                                <td className='text-center' >{product.productId}</td>
                                                <td>
                                                    {(() => {

                                                        const fullImageUrl = product.primaryImageUrl
                                                            ? `${BASE_IMAGE_URL}${product.primaryImageUrl}`
                                                            : 'https://via.placeholder.com/50?text=N/A';

                                                        return (
                                                            <Image
                                                                src={fullImageUrl}
                                                                alt={product.name}
                                                                thumbnail
                                                                style={{ width: '100px', height: 'auto' }}
                                                            />
                                                        );
                                                    })()}
                                                </td>
                                                <td>
                                                    <Link to={`/admin/products/edit/${product.productId}`} className="fw-medium text-dark text-decoration-none">{product.name}</Link>
                                                    <div className="small text-muted">{product.brand} - {product.model}</div>
                                                </td>
                                                <td>{product.categoryName || '-'}</td>
                                                <td className="text-end">{formatPrice(product.price)}</td>
                                                <td className="text-center">{product.stock}</td>
                                                <td className="text-center">
                                                    {product.reviewCount > 0 ? (
                                                        <Button variant="link" size="sm" className="p-0" onClick={() => handleViewReviewsClick(product, 0)} title={t('adminProductListPage.viewReviewsTitle', 'Xem đánh giá')}>
                                                            <StarRatingDisplay rating={product.averageRating} size="0.9em" /> ({product.reviewCount})
                                                        </Button>
                                                    ) : (
                                                        <span className="text-muted small">-</span>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    <Badge bg={product.visible ? "success" : "secondary"}>
                                                        {product.visible ? t('adminProductListPage.status.visible', 'Hiện') : t('adminProductListPage.status.hidden', 'Ẩn')}
                                                    </Badge>
                                                </td>
                                                <td className="text-center">
                                                    <Link to={`/admin/products/edit/${product.productId}`} className="btn btn-sm btn-outline-primary me-1 px-2 py-1" title={t('common.edit')}><PencilSquare /></Link>
                                                    {/* << NÚT ẨN/HIỆN MỚI >> */}
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={<Tooltip id={`tooltip-toggle-${product.productId}`}>{product.visible ? t('adminProductListPage.actions.hide', 'Ẩn sản phẩm') : t('adminProductListPage.actions.show', 'Hiện sản phẩm')}</Tooltip>}
                                                    >
                                                        <Button
                                                            variant={product.visible ? "outline-warning" : "outline-success"}
                                                            size="sm" className="px-2 py-1"
                                                            onClick={() => handleToggleVisibilityClick(product)}
                                                        >
                                                            {product.visible ? <EyeSlashFill /> : <EyeFill />}
                                                        </Button>
                                                    </OverlayTrigger>
                                                    {/* Bạn có thể giữ nút xóa vật lý ở đây nếu vẫn cần và có API riêng, hoặc bỏ đi */}
                                                    {/* <Button variant="outline-danger" size="sm" className="px-2 py-1 ms-1" onClick={() => handleDeleteProductClick(product)} title={t('common.delete')}><Trash /></Button> */}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="7" className="text-center text-muted py-4">Không tìm thấy sản phẩm.</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                )}

                {/* Phân trang */}
                {totalPages > 1 && !loading && (
                    <div className="d-flex justify-content-center mt-4">
                        <BsPagination>{paginationItems}</BsPagination>
                    </div>
                )}
                {/* <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Xác nhận xoá</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {productToDelete ? (
                            <p>Bạn có chắc chắn muốn xoá sản phẩm <strong>{productToDelete.name}</strong> (ID: {productToDelete.productId}) không?</p>
                        ) : (
                            <p>Đang xử lý...</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Huỷ</Button>
                        <Button variant="danger" onClick={confirmDeleteProduct}>Ok</Button>
                    </Modal.Footer>
                </Modal> */}
                <Modal show={showHideConfirmModal} onHide={() => setShowHideConfirmModal(false)} centered size="sm">
                    <Modal.Header closeButton>
                        <Modal.Title>{t(actionToConfirm === 'hide' ? ('adminProductListPage.confirmHideTitle', 'Ẩn sản phẩm') : 'adminProductListPage.confirmShowTitle', 'Hiện sản phẩm')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {productToToggle && (
                            <p>
                                {t(actionToConfirm === 'hide' ?
                                    ('adminProductListPage.confirmHideMessage', 'Xác nhận Ẩn') :
                                    ('adminProductListPage.confirmShowMessage', 'Xác nhận Hiện'),
                                    { productName: productToToggle.name }
                                )}
                            </p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowHideConfirmModal(false)}>{t('common.cancel')}</Button>
                        <Button variant={actionToConfirm === 'hide' ? "warning" : "success"} onClick={confirmToggleVisibility}>
                            {t(actionToConfirm === 'hide' ? ('adminProductListPage.hideButton', 'Ẩn') : ('adminProductListPage.showButton', 'Hiện'))}
                        </Button>
                    </Modal.Footer>
                </Modal>
                {selectedProductForReviews && (
                    <Modal show={showReviewsModal} onHide={() => setShowReviewsModal(false)} size="lg" centered scrollable>
                        <Modal.Header closeButton>
                            <Modal.Title>{t('adminReviewListPage.reviewModal.title', 'Đánh giá cho: {{productName}}', { productName: selectedProductForReviews.name })}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {loadingProductReviews && <div className="text-center py-3"><Spinner /></div>}
                            {!loadingProductReviews && productReviews.length === 0 && (
                                <p className="text-muted">{t('adminReviewListPage.reviewModal.noReviews', 'Sản phẩm này chưa có đánh giá nào.')}</p>
                            )}
                            {!loadingProductReviews && productReviews.length > 0 && (
                                <ListGroup variant="flush">
                                    {productReviews.map(review => (
                                        <ListGroup.Item key={review.reviewId} className="mb-2 border rounded p-2">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <strong>{review.userFirstName} {review.userLastName}</strong> (ID: {review.userId})
                                                    <div className="mt-1"><StarRatingDisplay rating={review.rating} size="0.9em" /></div>
                                                </div>
                                                <small className="text-muted">{formatDate(review.reviewDate)}</small>
                                            </div>
                                            <p className="mt-2 mb-2" style={{ whiteSpace: 'pre-line' }}>{review.comment}</p>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <Badge bg={review.visible ? "success" : "secondary"}>
                                                    {review.visible ? t('adminReviewListPage.visible') : t('adminReviewListPage.hidden')}
                                                </Badge>
                                                <div>
                                                    <Button
                                                        variant={review.visible ? "outline-warning" : "outline-success"}
                                                        size="sm" className="me-2 px-2 py-1"
                                                        onClick={() => toggleReviewVisibility(review.reviewId, review.visible)}
                                                        title={review.visible ? t('adminReviewListPage.toggleVisibilityHide') : t('adminReviewListPage.toggleVisibilityShow')}
                                                    >
                                                        {review.visible ? <EyeSlashFill /> : <EyeFill />} {review.visible ? t('adminReviewListPage.hideButton', 'Ẩn') : t('adminReviewListPage.showButton', 'Hiện')}
                                                    </Button>
                                                    {/* <Button variant="outline-danger" size="sm" className="px-2 py-1" onClick={() => deleteReviewFromModal(review.reviewId)} title={t('common.delete')}>
                                                        <Trash /> {t('common.delete', 'Xóa')}
                                                    </Button> */}
                                                </div>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                            {/* Phân trang cho Review Modal */}
                            {reviewModalTotalPages > 1 && !loadingProductReviews && (
                                <div className="d-flex justify-content-center mt-3">
                                    <BsPagination size="sm">
                                        {[...Array(reviewModalTotalPages).keys()].map(num => (
                                            <BsPagination.Item key={num + 1} active={num + 1 === reviewModalCurrentPage} onClick={() => handleReviewModalPageChange(num + 1)}>
                                                {num + 1}
                                            </BsPagination.Item>
                                        ))}
                                    </BsPagination>
                                </div>
                            )}
                        </Modal.Body>
                    </Modal>
                )}
            </Container>
        </motion.div>
    );
}

export default AdminProductListPage;
