// src/pages/user/InvoicePage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrCreateInvoiceForOrder } from '../../services/invoiceService'; // Sử dụng service đã có
import { Container, Row, Col, Card, Button, Table, Spinner, Alert } from 'react-bootstrap';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Printer } from 'react-bootstrap-icons';
import '../../styles/invoice-page.css';
import html2pdf from 'html2pdf.js';
import { motion } from 'framer-motion';
import y from '../../assets/images/y.png';
import { getUserById } from '../../services/userService';

const pageVariants = { initial: { opacity: 0 }, in: { opacity: 1 }, out: { opacity: 0 } };
const pageTransition = { duration: 0.4 };

const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch { return dateString; }
};

function InvoicePage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [invoiceData, setInvoiceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const invoiceRef = useRef();
    const [customer, setCustomer] = useState(null);

    const fetchInvoice = useCallback(async () => {
        if (!orderId) {
            setError("Mã đơn hàng không hợp lệ.");
            setLoading(false);
            return;
        }
        setLoading(true); setError('');
        try {
            const response = await getOrCreateInvoiceForOrder(orderId);
            const invoice = response.data;
            setInvoiceData(invoice);
            console.log('Invoice data:', invoice);
            console.log('Invoice order:', invoice.order);

            if (invoice.order?.userId) {
                console.log(invoice.order.userId);
                const userResponse = await getUserById(invoice.order.userId);
                setCustomer(userResponse.data);

                console.log('Customer data:', userResponse.data);
            }
        } catch (err) {
            console.error("Error fetching invoice:", err);
            setError(err.response?.data?.message || "Không thể tải dữ liệu hóa đơn.");
            if (err.response?.status === 403 || err.response?.status === 404) {
                setTimeout(() => navigate('/orders', { replace: true }), 3000);
            }
        } finally {
            setLoading(false);
        }

    }, [orderId, navigate]);
    const handleDownloadPDF = () => {
        const element = invoiceRef.current;
        const opt = {
            margin: 0.5,
            filename: `invoice_${invoiceNumber || orderId}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };
    useEffect(() => {
        fetchInvoice();
    }, [fetchInvoice]);

    if (loading) return <Container className="text-center py-5"><LoadingSpinner text="Đang tải hóa đơn..." /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert><div className="text-center mt-3"><Link to={`/orders/${orderId || ''}`} className="btn btn-sm btn-outline-secondary">Quay lại</Link></div></Container>;
    if (!invoiceData || !invoiceData.order) return <Container className="py-5"><Alert variant="warning">Không có dữ liệu hóa đơn cho đơn hàng này.</Alert><div className="text-center mt-3"><Link to={`/orders/${orderId || ''}`} className="btn btn-sm btn-outline-secondary">Quay lại</Link></div></Container>;

    const { invoiceNumber, createdAt: invoiceDate, order, storeName, storeAddress, storePhone, storeEmail } = invoiceData;
    const { orderId: currentOrderId, orderCreatedAt, customerFullName, customerAddress, customerPhone, customerEmail, orderItems, totalAmount, paymentMethod, notes } = order;

    return (
        <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Container className="invoice-page-container my-4">
                <div className="d-flex justify-content-between align-items-center mb-3 no-print">
                    <Link to={`/orders/${currentOrderId}`} className="btn btn-outline-secondary btn-sm">
                        Quay lại Chi tiết Đơn hàng
                    </Link>
                    {/* <Button variant="primary" size="sm" onClick={() => window.print()}>
                        <Printer className="me-1" /> In Hóa Đơn
                    </Button> */}
                    <Button variant="primary" size="sm" onClick={handleDownloadPDF}>
                        <Printer className="me-1" /> Tải Hóa Đơn (PDF)
                    </Button>
                </div>

                <Card className="invoice-card" ref={invoiceRef}>
                    <Card.Header className="bg-light p-4">
                        <Row className="align-items-center">
                            <Col>
                                <h2 className="mb-0">HÓA ĐƠN BÁN HÀNG</h2>
                                <p className="text-muted mb-0">Số hóa đơn: {invoiceNumber}</p>
                            </Col>
                            <Col xs="auto" className="text-end">
                                {/* Logo cửa hàng (nếu có) */}
                                <img
                                    src={y}
                                    alt="Logo"
                                    style={{ maxHeight: '70px' }}
                                    className="me-2 pb-3 pe-4"
                                />
                                <h4 className="mb-0">{storeName || "TimeXpert Store"}</h4>
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Body className="p-4">
                        <Row className="mb-4">
                            <Col md={6}>
                                <h6>Thông tin Cửa hàng:</h6>
                                <address className="small">
                                    <strong>{storeName || "TimeXpert Store"}</strong><br />
                                    {storeAddress || "123 Đường ABC, Quận XYZ, TP. HCM"}<br />
                                    Điện thoại: {storePhone || "0909123456"}<br />
                                    Email: {storeEmail || "contact@timexpert.com"}
                                </address>
                            </Col>
                            <Col md={6} className="text-md-end">
                                <h6>Thông tin Khách hàng:</h6>
                                <address className="small">
                                    <strong> {customer?.lastName + " " + customer?.firstName || 'N/A'}</strong><br />
                                    {customer?.address || 'N/A'}<br />
                                    Điện thoại: {customer?.phone || 'N/A'}<br />
                                    {customer?.email && <>Email: {customer.email}<br /></>}
                                </address>

                            </Col>
                        </Row>
                        <Row className="mb-4 small">
                            <Col>
                                <div><strong>Ngày xuất hóa đơn:</strong> {formatDate(invoiceDate)}</div>
                                <div><strong>Mã đơn hàng gốc:</strong> #{currentOrderId}</div>
                                <div><strong>Thời gian đặt hàng:</strong> {formatDate(orderCreatedAt)}</div>
                            </Col>
                        </Row>

                        <Table bordered hover responsive size="sm" className="invoice-table">
                            <thead className="table-light">
                                <tr>
                                    <th className="text-center" style={{ width: '5%' }}>#</th>
                                    <th>Tên sản phẩm</th>
                                    <th className="text-center">Số lượng</th>
                                    <th className="text-end">Đơn giá</th>
                                    <th className="text-end">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderItems?.map((item, index) => (
                                    <tr key={index}>
                                        <td className="text-center">{index + 1}</td>
                                        <td>{item.productName}</td>
                                        <td className="text-center">{item.quantity}</td>
                                        <td className="text-end">{formatPrice(item.price)}</td>
                                        <td className="text-end">{formatPrice(item.price * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                {/* Tính toán tổng phụ, phí ship, giảm giá nếu có */}
                                {/* Hiện tại chỉ có totalAmount từ Order */}
                                <tr>
                                    <td colSpan="4" className="text-end fw-bold border-0">TỔNG CỘNG THANH TOÁN:</td>
                                    <td className="text-end fw-bold border-0">{formatPrice(totalAmount)}</td>
                                </tr>
                            </tfoot>
                        </Table>

                        <div className="mt-4 small">
                            <p><strong>Phương thức thanh toán:</strong> {paymentMethod}</p>
                            {notes && <p><strong>Ghi chú đơn hàng:</strong> {notes}</p>}
                        </div>

                        {/* Điều khoản, chữ ký (nếu cần) */}
                        <div className="mt-5 pt-4 border-top text-center text-muted small">
                            Cảm ơn quý khách đã tin tưởng và mua sắm tại {storeName || "TimeXpert Store"}!
                            <br />(Đây là hóa đơn điện tử được tạo tự động)
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </motion.div>
    );
}
export default InvoicePage;