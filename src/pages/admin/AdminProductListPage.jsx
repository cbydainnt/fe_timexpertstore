// src/pages/admin/AdminProductListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
// Import services
import { getProducts, deleteProduct } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
// Import Bootstrap
import { Container, Modal, Table, Button, Spinner, Alert, Card, InputGroup, FormControl, Form, Row, Col, Image, Pagination as BsPagination } from 'react-bootstrap';
// Import icons
import { PencilSquare, Trash, PlusCircle, Search, Funnel } from 'react-bootstrap-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

// Animation variants
const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };
const pageTransition = { duration: 0.3 };

// Helper format tiền
const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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

    const BASE_IMAGE_URL = 'http://localhost:8080';

    // Hàm fetch products dựa trên searchParams hiện tại
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

    // Fetch categories cho dropdown filter
    useEffect(() => {
        getAllCategories()
            .then(res => setCategories(res.data || []))
            .catch(err => console.error("Failed to load categories for filter:", err));
    }, []);

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


    // Xử lý khi người dùng gõ vào ô tìm kiếm


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
                        <Button variant="outline-secondary" size="sm" className="ms-2" disabled>Xuất Excel</Button>
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
                                <Col xs={6} md={3} lg={2}>
                                    <Form.Select size="sm" value={filterField}
                                        onChange={(e) => setFilterField(e.target.value)}>
                                        <option value="category">Danh mục</option>
                                        <option value="brand">Thương hiệu</option>
                                    </Form.Select>
                                </Col>
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
                                        <th className='text-center' style={{ width: '25%' }}>Tên</th>
                                        <th className='text-center' style={{ width: '15%' }}>Danh mục</th>
                                        <th className="text-end" style={{ width: '15%' }}>Giá</th>
                                        <th className="text-center" style={{ width: '10%' }}>Số lượng</th>
                                        <th className="text-center" style={{ width: '15%' }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length > 0 ? (
                                        products.map((product) => (
                                            <tr key={product.productId} style={{ verticalAlign: 'middle' }}>
                                                <td className='text-center'>{product.productId}</td>
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
                                                    <Link to={`/admin/products/edit/${product.productId}`} className="btn btn-sm btn-outline-primary me-1 px-2 py-1" title="Edit"><PencilSquare /></Link>
                                                    <Button variant="outline-danger" size="sm" className="px-2 py-1" onClick={() => handleDeleteProductClick(product)} title="Delete"><Trash /></Button>
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
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
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
                </Modal>

            </Container>
        </motion.div>
    );
}

export default AdminProductListPage;
