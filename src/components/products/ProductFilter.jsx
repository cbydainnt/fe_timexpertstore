// src/components/products/ProductFilter.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Card, Accordion, Spinner, ListGroup, Row, Col } from 'react-bootstrap';
import { getAllCategories } from '../../services/categoryService';
import { useSearchParams } from 'react-router-dom';
import { FunnelFill } from 'react-bootstrap-icons';
import '../../styles/product-filter.css';
import { useTranslation } from 'react-i18next';

function ProductFilter() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    const filterKeys = [
        'categoryId', 'minPrice', 'maxPrice', 'brand',
        'movement', 'caseMaterial', 'strapMaterial',
        'dialColor', 'waterResistance'
    ];

    const getFiltersFromParams = useCallback(() => {
        return filterKeys.reduce((acc, key) => {
            acc[key] = searchParams.get(key) || '';
            return acc;
        }, {});
    }, [searchParams]);

    const [localFilters, setLocalFilters] = useState(getFiltersFromParams);

    useEffect(() => {
        setLocalFilters(getFiltersFromParams());
    }, [searchParams, getFiltersFromParams]);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const response = await getAllCategories();
                setCategories(response.data || []);
            } catch (error) {
                console.error(t('productFilter.consoleErrorLoadingCategories'), error);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, [t]);

    const handleLocalFilterChange = (e) => {
        const { name, value } = e.target;
        if ((name === 'minPrice' || name === 'maxPrice') && value !== '' && !/^\d*$/.test(value)) {
            console.warn(t('productFilter.consoleWarnInvalidPrice'), value);
            return;
        }
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyFilters = () => {
        const newParams = new URLSearchParams(searchParams);
        filterKeys.forEach(key => {
            const value = localFilters[key];
            if (value) {
                newParams.set(key, value);
            } else {
                newParams.delete(key);
            }
        });
        newParams.set('page', '0');
        setSearchParams(newParams);
    };

    const handleResetFilters = () => {
        const newParams = new URLSearchParams();
        const preservedParams = ['name', 'sortBy', 'sortDir'];
        preservedParams.forEach(key => {
            const value = searchParams.get(key);
            if (value) newParams.set(key, value);
        });
        setSearchParams(newParams);
        setLocalFilters(filterKeys.reduce((acc, key) => ({ ...acc, [key]: '' }), {}));
    };

    // Giữ nguyên các mảng tùy chọn như file gốc của bạn
    // Các giá trị này sẽ hiển thị trực tiếp trong dropdown, trừ waterResistanceNotSpecified
    const movements = ['Automatic', 'Quartz', 'Manual Winding', 'Eco-Drive', 'Solar'];
    const materials = ['Stainless Steel', 'Titanium', 'Gold Plated', 'Ceramic', 'Leather', 'Rubber', 'Silicone', 'Nylon', 'Resin'];
    const colors = ['Black', 'White', 'Blue', 'Silver', 'Gray', 'Green', 'Brown', 'Gold', 'Rose Gold'];
    // Đối với waterResistances, bạn đã có một mục dùng t()
    const waterResistances = ['30m (3ATM)', '50m (5ATM)', '100m (10ATM)', '200m (20ATM)', '300m+', t('productFilter.waterResistanceNotSpecified')];


    // otherFilterSections sẽ sử dụng key dịch cho nhãn của section (Accordion.Header)
    // nhưng options sẽ được hiển thị trực tiếp.
    const otherFilterSections = [
        { sectionLabelKey: 'productFilter.sections.movement', filterKey: 'movement', options: movements },
        { sectionLabelKey: 'productFilter.sections.caseMaterial', filterKey: 'caseMaterial', options: materials },
        { sectionLabelKey: 'productFilter.sections.strapMaterial', filterKey: 'strapMaterial', options: materials },
        { sectionLabelKey: 'productFilter.sections.dialColor', filterKey: 'dialColor', options: colors },
        { sectionLabelKey: 'productFilter.sections.waterResistance', filterKey: 'waterResistance', options: waterResistances }
    ];

    return (
        <Card className="filter-sidebar border h-100 sticky-top" style={{ top: '80px' }}>
            <Card.Header className="filter-header border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                <Card.Title as="h6" className="mb-0 fw-semibold">
                    <FunnelFill className="me-1 custom-filter" /> {t('productFilter.title')}
                </Card.Title>
                <Button variant="link" size="sm" className="p-0 text-muted" onClick={handleResetFilters}>{t('productFilter.resetButton')}</Button>
            </Card.Header>
            <Card.Body className="p-3 filter-accordion-container" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 150px)' }}>
                <Accordion defaultActiveKey={['0', '1', '2']} alwaysOpen flush>
                    <Accordion.Item eventKey="0" className="filter-accordion-item">
                        <Accordion.Header className="filter-accordion-header">{t('productFilter.sections.category')}</Accordion.Header>
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
                                        {t('productFilter.allCategoriesOption')}
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

                    <Accordion.Item eventKey="1" className="filter-accordion-item">
                        <Accordion.Header className="filter-accordion-header">{t('productFilter.sections.priceRange')}</Accordion.Header>
                        <Accordion.Body className="filter-accordion-body">
                            <Row className="g-2">
                                <Col>
                                    <Form.Label htmlFor="minPrice" className="visually-hidden">{t('productFilter.minPricePlaceholder')}</Form.Label>
                                    <Form.Control id="minPrice" type="number" name="minPrice" size="sm" min="0" step="1000" value={localFilters.minPrice} onChange={handleLocalFilterChange} placeholder={t('productFilter.minPricePlaceholder')} aria-label={t('productFilter.minPriceAriaLabel')} />
                                </Col>
                                <Col>
                                    <Form.Label htmlFor="maxPrice" className="visually-hidden">{t('productFilter.maxPricePlaceholder')}</Form.Label>
                                    <Form.Control id="maxPrice" type="number" name="maxPrice" size="sm" min="0" step="1000" value={localFilters.maxPrice} onChange={handleLocalFilterChange} placeholder={t('productFilter.maxPricePlaceholder')} aria-label={t('productFilter.maxPriceAriaLabel')} />
                                </Col>
                            </Row>
                        </Accordion.Body>
                    </Accordion.Item>

                    <Accordion.Item eventKey="2" className="filter-accordion-item">
                        <Accordion.Header className="filter-accordion-header">{t('productFilter.sections.brand')}</Accordion.Header>
                        <Accordion.Body className="filter-accordion-body">
                            <Form.Control type="text" name="brand" size="sm" value={localFilters.brand} onChange={handleLocalFilterChange} placeholder={t('productFilter.brandPlaceholder')} aria-label={t('productFilter.brandAriaLabel')} />
                        </Accordion.Body>
                    </Accordion.Item>
                    
                    {otherFilterSections.map((filterSection, idx) => (
                        <Accordion.Item key={filterSection.filterKey} eventKey={`${idx + 3}`} className="filter-accordion-item">
                            <Accordion.Header className="filter-accordion-header">{t(filterSection.sectionLabelKey)}</Accordion.Header>
                            <Accordion.Body className="filter-accordion-body">
                                <Form.Select 
                                    size="sm" 
                                    name={filterSection.filterKey} 
                                    value={localFilters[filterSection.filterKey]} 
                                    onChange={handleLocalFilterChange} 
                                    aria-label={t('productFilter.filterByAriaLabel', { label: t(filterSection.sectionLabelKey) })}
                                >
                                    <option value="">{t('productFilter.allOptionDefault')}</option>
                                    {/* Hiển thị trực tiếp các giá trị trong options, ngoại trừ trường hợp đặc biệt nếu bạn muốn xử lý riêng */}
                                    {filterSection.options.map(opt => (
                                        <option key={opt} value={opt}>
                                            {opt} 
                                        </option>
                                    ))}
                                </Form.Select>
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </Card.Body>
            <Card.Footer className="bg-light border-top p-2">
                <div className="d-grid">
                    <Button
                        variant="custom"
                        size="m"
                        className="custom-filter-button"
                        onClick={handleApplyFilters}
                    >
                        {t('productFilter.applyButton')}
                    </Button>
                </div>
            </Card.Footer>
        </Card>
    );
}
export default ProductFilter;