import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Row, Col, Pagination as BsPagination, Alert, Container, Button
} from 'react-bootstrap';
import { getProducts } from '../../services/productService';
import { getCategoryById } from '../../services/categoryService';
import { getFavoriteProductIds } from '../../services/favoriteService';
import { useAuthStore } from '../../store/authStore';
import ProductCard from '../../components/products/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductFilter from '../../components/products/ProductFilter';
import SortOptionsBar from '../../components/products/SortOptionsBar';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterCircle, XCircle } from 'react-bootstrap-icons';
import '../../styles/products-page.css';
import { useTranslation } from 'react-i18next';

const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };
const pageTransition = { duration: 0.3 };
const MotionCol = motion(Col);

function ProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(true);

  const itemsPerPage = 12;
  const { isAuthenticated } = useAuthStore();
  const [favoriteProductIds, setFavoriteProductIds] = useState([]);

  const categoryIdFromUrl = searchParams.get('categoryId');
  const searchTermFromUrl = searchParams.get('name');
  const pageApiIndex = parseInt(searchParams.get('page') || '0');
  const currentPage = pageApiIndex + 1;

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated) return;
      try {
        const ids = await getFavoriteProductIds();
        setFavoriteProductIds(ids);
      } catch (err) {
        console.error(t('productsPage.errorLoadingFavorites'), err);
      }
    };
    fetchFavorites();
  }, [isAuthenticated, t]);

  const fetchCategoryName = useCallback(async () => {
    const catId = searchParams.get('categoryId');
    if (catId && !isNaN(parseInt(catId))) {
      setLoadingCategory(true); setSelectedCategory(null);
      try {
        const response = await getCategoryById(parseInt(catId));
        setSelectedCategory(response.data);
      } catch (err) {
        console.error(`Error fetching category ${catId}:`, err);
        setError(t('productsPage.errorLoadingCategory', { categoryId: catId }));
        setSelectedCategory(null);
      } finally {
        setLoadingCategory(false);
      }
    } else {
      setSelectedCategory(null);
    }
  }, [searchParams, t]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const sortBy = searchParams.get('sortBy') || 'createdAt';
      const sortDir = searchParams.get('sortDir') || 'desc';

      const params = {
        page: pageApiIndex, size: itemsPerPage,
        name: searchParams.get('name') || undefined,
        categoryId: searchParams.get('categoryId') || undefined,
        minPrice: searchParams.get('minPrice') || undefined,
        maxPrice: searchParams.get('maxPrice') || undefined,
        brand: searchParams.get('brand') || undefined,
        movement: searchParams.get('movement') || undefined,
        caseMaterial: searchParams.get('caseMaterial') || undefined,
        strapMaterial: searchParams.get('strapMaterial') || undefined,
        dialColor: searchParams.get('dialColor') || undefined,
        waterResistance: searchParams.get('waterResistance') || undefined,
        sortBy, sortDir,
      };
      const filteredParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== ''));

      const response = await getProducts(filteredParams);
      setProducts(response.data?.content || []);
      setTotalPages(response.data?.totalPages || 0);
      if (error && !error.toLowerCase().includes(t('productsPage.errorLoadingCategory', { categoryId: '' }).substring(0, 10)))
        setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      if (!error || !error.toLowerCase().includes(t('productsPage.errorLoadingCategory', { categoryId: '' }).substring(0, 10))) {
        setError(err.response?.data?.message || t('productsPage.errorLoadingProducts'));
      }
      setProducts([]); setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [searchParams, error, t]);

  useEffect(() => { fetchCategoryName(); }, [fetchCategoryName]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage - 1));
    if (!newParams.get('sortBy')) newParams.set('sortBy', 'createdAt');
    if (!newParams.get('sortDir')) newParams.set('sortDir', 'desc');
    setSearchParams(newParams);
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
      paginationItems.push(
        <BsPagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>{number}</BsPagination.Item>
      );
    }
    if (endPage < totalPages) paginationItems.push(<BsPagination.Ellipsis key="end-ellipsis" onClick={() => handlePageChange(endPage + 1)} />);
    paginationItems.push(<BsPagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />);
    paginationItems.push(<BsPagination.Last key="last" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />);
  }

  let pageTitle = t('productsPage.titleDefault');
  if (searchTermFromUrl) {
    pageTitle = t('productsPage.titleSearchResults', { searchTerm: searchTermFromUrl });
  } else if (selectedCategory) {
    pageTitle = t('productsPage.titleByCategory', { categoryName: selectedCategory.name });
  } else if (categoryIdFromUrl && loadingCategory) {
    pageTitle = t('productsPage.loadingCategoryName');
  } else if (categoryIdFromUrl && !selectedCategory && !error?.includes(t('productsPage.errorLoadingCategory', { categoryId: '' }).substring(0, 10))) {
    pageTitle = t('productsPage.titleByCategoryId', { categoryId: categoryIdFromUrl });
  }

  const toggleFilterSidebar = () => setIsFilterVisible(!isFilterVisible);

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
      <Container fluid className="px-md-5 py-4">
        <Row>
          <AnimatePresence initial={false}>
            {isFilterVisible && (
              <MotionCol
                key="filter-sidebar" md={4} lg={3}
                initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.25 }}
                className="filter-column"
                style={{ position: 'sticky', top: '70px', height: 'calc(100vh - 70px)', overflowY: 'auto', zIndex: 2 }}
              >
                <ProductFilter />
              </MotionCol>
            )}
          </AnimatePresence>

          <Col md={isFilterVisible ? 8 : 12} lg={isFilterVisible ? 9 : 12} className="content-column">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h1 className="h3 mb-0">{pageTitle}</h1>
              <Button
                variant="outline-secondary" size="sm"
                className="d-md-inline-block"
                onClick={toggleFilterSidebar}
                title={isFilterVisible ? t('productsPage.toggleFilterHideTooltip') : t('productsPage.toggleFilterShowTooltip')}
              >
                {isFilterVisible ? <XCircle /> : <FilterCircle />}
                <span className="ms-1 d-none d-lg-inline">
                  {isFilterVisible ? t('productsPage.filterButtonTextHide') : t('productsPage.filterButtonTextShow')}
                </span>
              </Button>
            </div>

            <SortOptionsBar />

            {loading && <LoadingSpinner text={t('common.loading')} />}
            {error && !loading && <Alert variant="danger">{error}</Alert>}

            {!loading && !error && (
              <>
                {products.length === 0 ? (
                  <Alert variant="info" className="text-center">
                    {t('productsPage.noProductsFound')} <br />
                    <Button variant="link" size="sm" onClick={() => setSearchParams({})}>
                      {t('productsPage.clearFiltersButton')}
                    </Button>
                    {t('loginPage.orDividerText').toLowerCase()}{' '}
                    <Link to="/">{t('productsPage.backToHomeLink')}</Link>.
                  </Alert>
                ) : (
                  <Row xs={1} sm={2} lg={isFilterVisible ? 3 : 4} className="g-4 mb-4">
                    {products.map((product) => (
                      <Col key={product.productId}>
                        <ProductCard product={product} favoriteProductIds={favoriteProductIds} />
                      </Col>
                    ))}
                  </Row>
                )}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center">
                    <BsPagination>{paginationItems}</BsPagination>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
}

export default ProductsPage;
