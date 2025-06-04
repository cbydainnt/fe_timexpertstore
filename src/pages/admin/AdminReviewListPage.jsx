import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Table, Button, Spinner, Alert, Card, Pagination as BsPagination, Badge, Modal } from 'react-bootstrap';
import { Eye, Trash, EyeSlashFill, EyeFill, StarFill} from 'react-bootstrap-icons';
import { getAllReviewsAdmin, setReviewVisibilityAdmin, deleteReviewAdmin } from '../../services/reviewService';
import { getProductById } from '../../services/productService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../styles/admin-review-page.css';
const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };
const pageTransition = { duration: 0.3 };

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    } catch { return dateString; }
};

function AdminReviewListPage() {
    const { t } = useTranslation();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    const fetchAdminReviews = useCallback(async (page = 0) => {
        setLoading(true);
        setError(null);
        try {
            const params = { page: page, size: itemsPerPage, sortBy: 'reviewDate', sortDir: 'desc' };
            const response = await getAllReviewsAdmin(params);
            setReviews(response.data?.content || []);
            setTotalPages(response.data?.totalPages || 0);
            setCurrentPage(response.data?.currentPage + 1 || 1);
        } catch (err) {
            console.error("Error fetching admin reviews:", err);
            setError(t('adminReviewListPage.errorLoadingReviews'));
            toast.error(t('adminReviewListPage.errorLoadingReviews'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchAdminReviews(currentPage - 1);
    }, [fetchAdminReviews, currentPage]);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleDeleteClick = (review) => {
        setReviewToDelete(review);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!reviewToDelete) return;
        try {
            await deleteReviewAdmin(reviewToDelete.reviewId);
            toast.success(t('adminReviewListPage.deleteSuccessToast'));
            setShowDeleteModal(false);
            setReviewToDelete(null);
            fetchAdminReviews(currentPage - 1); // Tải lại trang hiện tại
        } catch (err) {
            toast.error(err.response?.data?.message || t('adminReviewListPage.errorDeletingReview'));
            setShowDeleteModal(false);
        }
    };

    const handleToggleVisibility = async (reviewId, currentVisibility) => {
        try {
            await setReviewVisibilityAdmin(reviewId, !currentVisibility);
            toast.success(t('adminReviewListPage.visibilityUpdateSuccessToast'));
            // Cập nhật lại list review mà không cần fetch lại toàn bộ nếu muốn tối ưu
            // Hoặc đơn giản là fetch lại:
            fetchAdminReviews(currentPage - 1);
        } catch (err) {
            toast.error(err.response?.data?.message || t('adminReviewListPage.errorUpdatingVisibility'));
        }
    };

    // Pagination Logic
    let paginationItems = [];
    if (totalPages > 1) {
        // ... (Logic phân trang tương tự như các trang Admin khác, ví dụ AdminOrderListPage)
        // (Bạn có thể tạo một component Pagination dùng chung)
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


    if (loading) return <Container fluid className="text-center py-5"><LoadingSpinner text={t('common.loading')} /></Container>;

    return (
        <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Container fluid>
                <h1 className="h3 mb-4 text-gray-800">{t('adminReviewListPage.title')}</h1>
                {error && <Alert variant="danger">{error}</Alert>}

                <Card className="shadow-sm">
                    <Card.Body className="p-0">
                        <Table striped bordered hover responsive="md" size="sm" className="mb-0 admin-table">
                            <thead className="table-light">
                                <tr>
                                    <th>{t('adminReviewListPage.table.reviewId')}</th>
                                    <th>{t('adminReviewListPage.table.product')}</th>
                                    <th>{t('adminReviewListPage.table.user')}</th>
                                    <th className="text-center">{t('adminReviewListPage.table.rating')}</th>
                                    <th>{t('adminReviewListPage.table.comment')}</th>
                                    <th>{t('adminReviewListPage.table.date')}</th>
                                    <th className="text-center">{t('adminReviewListPage.table.visibility')}</th>
                                    <th className="text-center">{t('adminReviewListPage.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <tr key={review.reviewId}>
                                            <td>{review.reviewId}</td>
                                            <td>
                                                <Link to={`/products/${review.productId}`} target="_blank" title={review.productName || `ID: ${review.productId}`}>
                                                    {review.productName || `Sản phẩm ID: ${review.productId}`}
                                                </Link>
                                            </td>
                                            <td>{review.userFirstName} {review.userLastName} (ID: {review.userId})</td>
                                            <td className="text-center">{review.rating} <StarFill color="#ffc107" size={14} /></td>
                                            <td className="text-truncate" style={{ maxWidth: '200px' }} title={review.comment}>
                                                {review.comment}
                                            </td>
                                            <td>{formatDate(review.reviewDate)}</td>
                                            <td className="text-center">
                                                <Badge bg={review.visible ? "success" : "secondary"}>
                                                    {review.visible ? t('adminReviewListPage.visible') : t('adminReviewListPage.hidden')}
                                                </Badge>
                                            </td>
                                            <td className="text-center">
                                                <Button
                                                    variant={review.visible ? "outline-warning" : "outline-success"}
                                                    size="sm"
                                                    className="me-1 px-2 py-1"
                                                    onClick={() => handleToggleVisibility(review.reviewId, review.visible)}
                                                    title={review.visible ? t('adminReviewListPage.toggleVisibilityHide') : t('adminReviewListPage.toggleVisibilityShow')}
                                                >
                                                    {review.visible ? <EyeSlashFill /> : <EyeFill />}
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    className="px-2 py-1"
                                                    onClick={() => handleDeleteClick(review)}
                                                    title={t('adminReviewListPage.deleteButton')}
                                                >
                                                    <Trash />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center text-muted py-4">{t('adminReviewListPage.noReviews')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                        <BsPagination>{paginationItems}</BsPagination>
                    </div>
                )}

                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{t('adminReviewListPage.confirmDeleteTitle')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {reviewToDelete ? (
                            <p>{t('adminReviewListPage.confirmDeleteMessage')}</p>
                        ) : (<p>{t('common.loading')}</p>)}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>{t('common.cancel')}</Button>
                        <Button variant="danger" onClick={confirmDelete}>{t('common.delete')}</Button>
                    </Modal.Footer>
                </Modal>

            </Container>
        </motion.div>
    );
}

export default AdminReviewListPage;