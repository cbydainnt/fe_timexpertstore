// src/pages/user/OrderHistoryPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
// Import service để gọi API
import { getMyOrders } from '../../services/orderService';
// Import các component Bootstrap (Đã thêm Card)
import { Container, Table, Button, Spinner, Alert, Badge, Card, Pagination as BsPagination } from 'react-bootstrap';
// Import component Pagination đã tạo (Hoặc dùng BsPagination trực tiếp)
// import Pagination from '../../components/common/Pagination';
// Import icons (ví dụ)
import { Eye } from 'react-bootstrap-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner'; // Import nếu dùng
import { OrderStatus, getStatusVariant, getStatusLabel } from '../../utils/orderUtils';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};
const pageTransition = { duration: 0.4 };

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]); // State lưu danh sách OrderDTO
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State cho phân trang (API: 0-based, Component: 1-based)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10; // Số đơn hàng mỗi trang

  // Hàm fetch danh sách đơn hàng của tôi
  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage - 1, // API dùng trang từ 0
        size: itemsPerPage,
        sortBy: 'createdAt',
        sortDir: 'desc'
      };
      // *** QUAN TRỌNG: Đảm bảo bạn đã tạo API GET /api/orders/me ở backend ***
      const response = await getMyOrders(params);

      if (response.data && response.data.content) {
        setOrders(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        setOrders([]);
        setTotalPages(0);
        console.warn("Received unexpected data structure from getMyOrders API:", response.data);
      }

    } catch (err) {
      console.error("Error fetching my orders:", err);
      if (err.response && err.response.status === 404 && err.config.url.includes('/me')) {
        setError("The 'My Orders' feature requires a specific backend API (/api/orders/me) which might be missing.");
      } else if (err.response && err.response.status === 403) {
        setError("You do not have permission to view orders.");
      }
      else {
        setError(err.response?.data?.message || err.message || 'Failed to load order history.');
      }
      setOrders([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage]); // Dependency là currentPage

  // Gọi fetchOrders khi component mount hoặc currentPage thay đổi
  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  // --- Helper Functions ---
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try { return new Date(dateString).toLocaleString('vi-VN'); }
    catch { return dateString; }
  };
  const formatPrice = (price) => {
    if (price === null || price === undefined) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // --- Pagination Logic for Bootstrap ---
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
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
  // --- End Pagination Logic ---


  // --- Render UI ---
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Container className="py-2">
        <h1 className="mb-4 h3">Lịch sử đặt hàng</h1>

        {loading && (
          <div className="text-center py-5">
            <LoadingSpinner animation="border" role="status"><span className="visually-hidden">Đang tải...</span></LoadingSpinner>
          </div>
        )}
        {error && !loading && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && (
          <>
            {orders.length === 0 ? (
              <Alert variant="info">Bạn chưa đặt đơn hàng nào. <Link to="/products">Đặt hàng ngay!</Link></Alert>
            ) : (
              <Card className="shadow-sm">
                <Card.Body className="p-0 position-relative">
                  {loading && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)', // Lớp phủ mờ
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 10 // Hiện trên table
                    }}>
                      <Spinner animation="border" size="sm" />
                    </div>
                  )}

                  <Table striped bordered hover responsive="sm" size="sm" className="mb-0"
                    style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s ease-in-out' }} // Làm mờ khi loading
                  >
                    <thead className="table-light">
                      <tr>
                        {/* <th>Order ID</th> */}
                        <th className='text-center'>STT</th>
                        <th className='ps-5'>Thời gian đặt hàng</th>
                        <th className='text-center'>Giá trị đơn hàng</th>
                        <th className='text-center'>Trạng thái</th>
                        <th className='text-center'>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && orders.length === 0 && (
                        <tr><td colSpan="5" className="text-center text-muted py-5"><Spinner animation="border" size="sm" /> Loading...</td></tr>
                      )}
                      {/* Render thông báo nếu không có data và không lỗi */}
                      {!loading && orders.length === 0 && !error && (
                        <tr><td colSpan="5" className="text-center text-muted py-5">Bạn chưa đặt đơn hàng nào. <Link to="/products">Đặt hàng ngay!</Link></td></tr>
                      )}
                      {/* Render các dòng order */}
                      {orders.map((order, index) => (
                        <tr key={order.orderId} style={{ verticalAlign: 'middle' }}>
                          {/* <td className="fw-medium">#{order.orderId}</td> */}
                          <td className="fw-medium text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td className='ps-5'>{formatDate(order.createdAt)}</td>
                          <td className='text-center'>{formatPrice(order.totalAmount)}</td>
                          <td className='text-center'>
                            <Badge bg={getStatusVariant(order.status)} pill>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </td>
                          <td className='text-center'>
                            <Link to={`/orders/${order.orderId}`} className="btn btn-outline-primary btn-sm" title="View Details">
                              <Eye className="me-1" /> Xem chi tiết
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}

            {/* Hiển thị Pagination nếu có nhiều hơn 1 trang */}
            {totalPages > 1 && !loading && (
              <div className="d-flex justify-content-center mt-4">
                <BsPagination>{paginationItems}</BsPagination>
              </div>
            )}
          </>
        )}
      </Container>
    </motion.div>
  );
}

export default OrderHistoryPage;