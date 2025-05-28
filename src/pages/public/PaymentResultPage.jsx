// src/pages/public/PaymentResultPage.jsx

import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { Container, Card, Alert, Button, Spinner, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { getOrderDetails } from '../../services/orderService'; // Cần service để lấy chi tiết order
import { toast } from 'react-toastify';
import { getStatusLabel, getStatusVariant } from '../../utils/orderUtils';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};
const pageTransition = { duration: 0.4 };

function PaymentResultPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams(); // Hook để lấy query params
  const [orderId, setOrderId] = useState(null);
  const [status, setStatus] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const method = searchParams.get('method') || 'VN_PAY';

  useEffect(() => {
    // Thay đổi từ 'orderId' thành 'vnp_TxnRef'
    const method = searchParams.get('method') || 'VN_PAY';
    let orderIdParam = searchParams.get('vnp_TxnRef') || searchParams.get('orderId');
    let statusParam = 'info'; // mặc định

    if (method === 'COD') {
      statusParam = 'success'; // COD luôn thành công
    } else {
      statusParam = searchParams.get('vnp_ResponseCode') === '00' ? 'success' : 'failed';
    }

    const errorCodeParam = searchParams.get('vnp_ResponseCode');

    setOrderId(orderIdParam);
    setStatus(statusParam);
    setErrorCode(errorCodeParam);

    if (orderIdParam && /^\d+$/.test(orderIdParam)) {
      const fetchOrder = async () => {
        setLoading(true);
        setError('');
        console.log("orId: ", orderIdParam);
        try {
          const response = await getOrderDetails(orderIdParam);
          setOrder(response.data);
        } catch (err) {
          console.error("Error fetching order details:", err);
          setError("Không thể tải thông tin chi tiết đơn hàng.");
          if (err.response?.status === 404 || err.response?.status === 403) {
            setError("Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn hàng.");
          }
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    } else {
      // ✅ Nếu orderId không hợp lệ
      console.log("orId: ", orderIdParam);
      setError("ID đơn hàng không hợp lệ hoặc bị thiếu trong URL kết quả thanh toán.");
    }
  }, [searchParams]);


  // Helper để hiển thị thông báo dựa trên trạng thái
  const renderStatusMessage = () => {
    switch (status) {
      case 'success':
        return (
          <Alert variant="success" className="text-center">
            <Alert.Heading>Đặt hàng thành công!</Alert.Heading>
            <p>
              {method === 'VN_PAY'
                ? 'Đơn hàng của bạn đã được thanh toán thành công qua VNPay.'
                : 'Đơn hàng của bạn đã được đặt thành công. Vui lòng thanh toán khi nhận hàng.'}
            </p>

          </Alert>
        );
      case 'failed':
        return (
          <Alert variant="danger" className="text-center">
            <Alert.Heading>Thanh toán thất bại!</Alert.Heading>
            <p>Giao dịch thanh toán qua VNPay đã thất bại.</p>
            {errorCode && <p>Mã lỗi VNPay: <strong>{errorCode}</strong></p>}
            <p>Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>
          </Alert>
        );
      case 'error':
        return (
          <Alert variant="warning" className="text-center">
            <Alert.Heading>Có lỗi xảy ra!</Alert.Heading>
            <p>Đã có lỗi xảy ra trong quá trình xử lý kết quả thanh toán.</p>
            {errorCode && <p>Mã lỗi: <strong>{errorCode}</strong></p>} {/* Có thể dùng errorCode cho lỗi backend */}
            <p>Vui lòng liên hệ bộ phận hỗ trợ nếu vấn đề tiếp diễn.</p>
          </Alert>
        );
      default:
        return (
          <Alert variant="info" className="text-center">
            <Alert.Heading>Đang xử lý kết quả...</Alert.Heading>
            <p>Đang chờ kết quả thanh toán từ hệ thống.</p>
          </Alert>
        );
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Container className="py-4">
        <Card className="shadow-sm p-4">
          <Card.Body>
            <h3 className="text-center mb-4">
              {method === 'COD' ? 'Kết quả đặt hàng' : 'Kết quả thanh toán VNPay'}
            </h3>
            {loading ? (
              <div className="text-center"><Spinner animation="border" /></div>
            ) : (
              <>
                {error && <Alert variant="danger">{error}</Alert>}
                {!error && renderStatusMessage()}

                {/* Hiển thị thông tin order tóm tắt nếu fetch thành công */}
                {order && (
                  <div className="mt-4 border-top pt-3">
                    <h5>Thông tin đơn hàng: #{order.orderId}</h5>
                    <p>Tổng tiền: <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</strong></p>
                    <p>
                      Trạng thái đơn hàng:{" "}
                      <Badge bg={getStatusVariant(order.status)} pill>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </p>
                  </div>
                )}

                <div className="text-center mt-4">
                  {status === 'success' && orderId && /^\d+$/.test(orderId) && (
                    <Link to={`/orders/${orderId}`}>
                      <Button variant="primary" className="me-2">Xem chi tiết đơn hàng</Button>
                    </Link>
                  )}
                  {status === 'failed' && (
                    <Link to="/cart"> {/* Hoặc trang thanh toán */}
                      <Button variant="warning" className="me-2">Quay lại giỏ hàng</Button>
                    </Link>
                  )}
                  <Link to="/">
                    <Button variant="secondary">Về trang chủ</Button>
                  </Link>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      </Container>
    </motion.div>
  );
}

export default PaymentResultPage;