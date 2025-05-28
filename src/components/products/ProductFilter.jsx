// src/components/products/ProductFilter.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Card, Accordion, Spinner, ListGroup, Row, Col } from 'react-bootstrap';
import { getAllCategories } from '../../services/categoryService';
import { useSearchParams } from 'react-router-dom';
import { FunnelFill } from 'react-bootstrap-icons'; // Đổi icon nếu muốn
import '../../styles/product-filter.css';

function ProductFilter() {
    // Hook để đọc và cập nhật URL search params
    const [searchParams, setSearchParams] = useSearchParams();

    // State lưu danh sách categories lấy từ API
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);  

    // Danh sách các key filter sẽ quản lý
    const filterKeys = [
        'categoryId', 'minPrice', 'maxPrice', 'brand',
        'movement', 'caseMaterial', 'strapMaterial',
        'dialColor', 'waterResistance'
        // Không bao gồm sortBy, sortDir vì chúng được quản lý bởi SortOptionsBar
    ];

    // Hàm helper để lấy giá trị filter hiện tại từ URL
    const getFiltersFromParams = useCallback(() => {
        return filterKeys.reduce((acc, key) => {
            acc[key] = searchParams.get(key) || ''; // Lấy giá trị hoặc chuỗi rỗng
            return acc;
        }, {});
    }, [searchParams]); // Phụ thuộc vào searchParams

    // State cục bộ để lưu các lựa chọn filter của người dùng trong form
    // Khởi tạo bằng giá trị từ URL params
    const [localFilters, setLocalFilters] = useState(getFiltersFromParams);

    // Effect để cập nhật state cục bộ khi URL thay đổi từ bên ngoài
    // (ví dụ: người dùng bấm back/forward, hoặc click link category từ header)
    useEffect(() => {
        setLocalFilters(getFiltersFromParams());
    }, [searchParams, getFiltersFromParams]); // Chạy lại khi searchParams thay đổi

    // Effect để fetch danh sách categories khi component mount
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const response = await getAllCategories();
                setCategories(response.data || []);
            } catch (error) {
                console.error("Failed to fetch categories for filter:", error);
                // Có thể set lỗi vào state nếu muốn hiển thị
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []); // Chỉ chạy 1 lần

    // Hàm xử lý khi người dùng thay đổi giá trị trong các input/select filter
    const handleLocalFilterChange = (e) => {
        const { name, value } = e.target;
        // Kiểm tra hợp lệ cho input giá (chỉ cho phép số nguyên không âm hoặc rỗng)
        if ((name === 'minPrice' || name === 'maxPrice') && value !== '' && !/^\d*$/.test(value)) {
            console.warn("Invalid price input:", value);
            return; // Không cập nhật state nếu không hợp lệ
        }
        // Cập nhật state cục bộ
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    // Hàm xử lý khi nhấn nút "Apply Filters"
    const handleApplyFilters = () => {
        const newParams = new URLSearchParams(searchParams); // Bắt đầu với params hiện tại (giữ lại name, sort)
        // Duyệt qua các filter cục bộ và cập nhật URL params
        filterKeys.forEach(key => {
            const value = localFilters[key];
            if (value) {
                newParams.set(key, value); // Set nếu có giá trị
            } else {
                newParams.delete(key); // Xóa khỏi URL nếu giá trị rỗng
            }
        });
        newParams.set('page', '0'); // Luôn reset về trang 1 khi áp dụng filter mới
        setSearchParams(newParams); // Cập nhật URL -> trigger ProductsPage fetch lại
    };

    // Hàm xử lý khi nhấn nút "Reset Filters"
    const handleResetFilters = () => {
        const newParams = new URLSearchParams(); // Tạo params mới hoàn toàn
        // Chỉ giữ lại các tham số không thuộc filter sidebar (ví dụ: name, sortBy, sortDir)
        const preservedParams = ['name', 'sortBy', 'sortDir'];
        preservedParams.forEach(key => {
            const value = searchParams.get(key);
            if (value) newParams.set(key, value);
        });
        setSearchParams(newParams); // Cập nhật URL
        // Reset state cục bộ về giá trị rỗng
        setLocalFilters(filterKeys.reduce((acc, key) => ({ ...acc, [key]: '' }), {}));
    };

    // --- Các tùy chọn lọc ví dụ (Nên lấy từ API nếu có thể) ---
    const movements = ['Automatic', 'Quartz', 'Manual Winding', 'Eco-Drive', 'Solar'];
    const materials = ['Stainless Steel', 'Titanium', 'Gold Plated', 'Ceramic', 'Leather', 'Rubber', 'Silicone', 'Nylon', 'Resin'];
    const colors = ['Black', 'White', 'Blue', 'Silver', 'Gray', 'Green', 'Brown', 'Gold', 'Rose Gold'];
    const waterResistances = ['30m (3ATM)', '50m (5ATM)', '100m (10ATM)', '200m (20ATM)', '300m+', 'Không được chỉ định'];
    // ---

    return (
        // Card chứa bộ lọc, thêm class để style và sticky-top
        <Card className="filter-sidebar border h-100 sticky-top" style={{ top: '80px' }}>
            <Card.Header className="filter-header border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                <Card.Title as="h6" className="mb-0 fw-semibold">
                    <FunnelFill className="me-1 custom-filter" /> Bộ lọc
                </Card.Title>
                {/* Nút reset nhỏ ở header */}
                <Button variant="link" size="sm" className="p-0 text-muted" onClick={handleResetFilters}>Đặt lại</Button>
            </Card.Header>
            {/* Body cho phép cuộn nếu nội dung filter dài */}
            <Card.Body className="p-3 filter-accordion-container" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 150px)' }}> {/* Giới hạn chiều cao và cho phép cuộn */}
                <Accordion defaultActiveKey={['0', '1', '2']} alwaysOpen flush>

                    {/* Filter Category */}
                    <Accordion.Item eventKey="0" className="filter-accordion-item">
                        <Accordion.Header className="filter-accordion-header">Danh mục</Accordion.Header>
                        <Accordion.Body className="filter-accordion-body p-0">
                            {loadingCategories ? (
                                <div className="p-3 text-center"><Spinner size="sm" /></div>
                            ) : (
                                <ListGroup variant="flush" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                    <ListGroup.Item
                                        action active={localFilters.categoryId === ''}
                                        onClick={(e) => { e.preventDefault(); setLocalFilters(prev => ({ ...prev, categoryId: '' })); }}
                                        className="filter-list-item"
                                    >
                                        Tất cả Danh mục
                                    </ListGroup.Item>
                                    {categories.map(cat => (
                                        <ListGroup.Item
                                            key={cat.categoryId} action
                                            active={localFilters.categoryId === String(cat.categoryId)}
                                            onClick={(e) => { e.preventDefault(); setLocalFilters(prev => ({ ...prev, categoryId: String(cat.categoryId) })); }}
                                            className="filter-list-item"
                                        >
                                            {cat.name}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Accordion.Body>
                    </Accordion.Item>

                    {/* Filter Price Range */}
                    <Accordion.Item eventKey="1" className="filter-accordion-item">
                        <Accordion.Header className="filter-accordion-header">Khoảng giá (VND)</Accordion.Header>
                        <Accordion.Body className="filter-accordion-body">
                            <Row className="g-2">
                                <Col>
                                    <Form.Label htmlFor="minPrice" className="visually-hidden">Tối thiểu</Form.Label>
                                    <Form.Control id="minPrice" type="number" name="minPrice" size="sm" min="0" step="1000" value={localFilters.minPrice} onChange={handleLocalFilterChange} placeholder="Tối thiểu" aria-label="Giá tối thiểu" />
                                </Col>
                                <Col>
                                    <Form.Label htmlFor="maxPrice" className="visually-hidden">Tối đa</Form.Label>
                                    <Form.Control id="maxPrice" type="number" name="maxPrice" size="sm" min="0" step="1000" value={localFilters.maxPrice} onChange={handleLocalFilterChange} placeholder="Tối đa" aria-label="Giá tối đa" />
                                </Col>
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>

                    {/* Filter Brand */}
                    <Accordion.Item eventKey="2" className="filter-accordion-item">
                        <Accordion.Header className="filter-accordion-header">Thương hiệu</Accordion.Header>
                        <Accordion.Body className="filter-accordion-body">
                            <Form.Control type="text" name="brand" size="sm" value={localFilters.brand} onChange={handleLocalFilterChange} placeholder="Rolex, Seiko" aria-label="Lọc theo thương hiệu" />
                            {/* TODO: Thay bằng Select/Checkbox nếu có API lấy list brands */}
                        </Accordion.Body>
                    </Accordion.Item>

                    {/* Other Dropdown Filters */}
                    {[
                        { label: 'Loại máy', key: 'movement', options: movements },
                        { label: 'Chất liệu vỏ', key: 'caseMaterial', options: materials },
                        { label: 'Chất liệu dây', key: 'strapMaterial', options: materials },
                        { label: 'Màu mặt số', key: 'dialColor', options: colors },
                        { label: 'Khả năng chống nước', key: 'waterResistance', options: waterResistances }
                    ].map((filter, idx) => (
                        <Accordion.Item key={filter.key} eventKey={`${idx + 3}`} className="filter-accordion-item">
                            <Accordion.Header className="filter-accordion-header">{filter.label}</Accordion.Header>
                            <Accordion.Body className="filter-accordion-body">
                                <Form.Select size="sm" name={filter.key} value={localFilters[filter.key]} onChange={handleLocalFilterChange} aria-label={`Filter by ${filter.label}`}>
                                    <option value="">Tất cả</option>
                                    {filter.options.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                                </Form.Select>
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </Card.Body>
            {/* Footer với nút Apply Filters */}
            <Card.Footer className="bg-light border-top p-2">
                <div className="d-grid"> {/* d-grid để nút chiếm hết chiều rộng */}
                    <Button
                        variant="custom"
                        size="m"
                        className="custom-filter-button"
                        onClick={handleApplyFilters}
                    >
                        Lọc
                    </Button>
                </div>
            </Card.Footer>
        </Card>
    );
}
export default ProductFilter;
