// src/pages/user/InvoicePage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrCreateInvoiceForOrder } from '../../services/invoiceService';
import { Container, Row, Col, Card, Button, Table, Spinner, Alert } from 'react-bootstrap';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Printer } from 'react-bootstrap-icons';
import '../../styles/invoice-page.css';
import html2pdf from 'html2pdf.js';
import { motion } from 'framer-motion';
import y from '../../assets/images/y.png'; // Giả sử logo của bạn
import { getUserById } from '../../services/userService';
import { useTranslation } from 'react-i18next'; // << THÊM IMPORT

const pageVariants = { initial: { opacity: 0 }, in: { opacity: 1 }, out: { opacity: 0 } };
const pageTransition = { duration: 0.4 };

const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) return 'N/A'; // Giữ lại N/A hoặc dùng t('invoicePage.dataNotAvailable') nếu muốn
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A'; // Giữ lại N/A hoặc dùng t('invoicePage.dataNotAvailable')
    try {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch { return dateString; }
};

function InvoicePage() {
    const { t } = useTranslation(); // << SỬ DỤNG HOOK
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [invoiceData, setInvoiceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const invoiceRef = useRef();
    const [customer, setCustomer] = useState(null); // State cho thông tin khách hàng

    const fetchInvoice = useCallback(async () => {
        if (!orderId) {
            setError(t('invoicePage.errorInvalidOrderId'));
            setLoading(false);
            return;
        }
        setLoading(true); setError('');
        try {
            const response = await getOrCreateInvoiceForOrder(orderId);
            const invoice = response.data;
            setInvoiceData(invoice);

            if (invoice.order?.userId) {
                try {
                    const userResponse = await getUserById(invoice.order.userId);
                    setCustomer(userResponse.data);
                } catch (customerError) {
                    console.error("Error fetching customer for invoice:", customerError);
                    // Không set lỗi chính, có thể hiển thị thông báo phụ hoặc log
                    toast.warn(t('invoicePage.errorFetchingCustomer'));
                }
            }
        } catch (err) {
            console.error("Error fetching invoice:", err);
            setError(err.response?.data?.message || t('invoicePage.errorLoadFailed'));
            if (err.response?.status === 403 || err.response?.status === 404) {
                setTimeout(() => navigate('/orders', { replace: true }), 3000);
            }
        } finally {
            setLoading(false);
        }
    }, [orderId, navigate, t]); // Thêm t

    useEffect(() => {
        fetchInvoice();
    }, [fetchInvoice]);

    const handleDownloadPDF = () => {
        const element = invoiceRef.current;
        const invoiceNumberForFile = invoiceData?.invoiceNumber || orderId;
        const opt = {
            margin: 0.5,
            filename: `invoice_${invoiceNumberForFile}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };
    
    // Sử dụng key dịch cho LoadingSpinner
    if (loading) return <Container className="text-center py-5"><LoadingSpinner text={t('invoicePage.loadingText')} /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert><div className="text-center mt-3"><Link to={`/orders/${orderId || ''}`} className="btn btn-sm btn-outline-secondary">{t('invoicePage.backButton')}</Link></div></Container>;
    if (!invoiceData || !invoiceData.order) return <Container className="py-5"><Alert variant="warning">{t('invoicePage.alertNoInvoiceData')}</Alert><div className="text-center mt-3"><Link to={`/orders/${orderId || ''}`} className="btn btn-sm btn-outline-secondary">{t('invoicePage.backButton')}</Link></div></Container>;

    // Destructure sau khi chắc chắn invoiceData.order tồn tại
    const { invoiceNumber, createdAt: invoiceDate, order } = invoiceData;
    const { orderId: currentOrderId, orderCreatedAt, orderItems, totalAmount, paymentMethod, notes } = order;
    // Thông tin cửa hàng từ DTO hoặc fallback đã dịch
    const storeNameDisplay = invoiceData.storeName || t('invoicePage.storeNameDefault');
    const storeAddressDisplay = invoiceData.storeAddress || t('invoicePage.storeAddressDefault');
    const storePhoneDisplay = invoiceData.storePhone || t('invoicePage.storePhoneDefault');
    const storeEmailDisplay = invoiceData.storeEmail || t('invoicePage.storeEmailDefault');
    // Thông tin khách hàng từ state `customer` hoặc từ `order` nếu có, với fallback đã dịch
    const customerNameDisplay = customer ? `${customer.lastName || ''} ${customer.firstName || ''}`.trim() || t('invoicePage.dataNotAvailable') : order.customerFullName || t('invoicePage.dataNotAvailable');
    const customerAddressDisplay = customer ? customer.address || t('invoicePage.dataNotAvailable') : order.customerAddress || t('invoicePage.dataNotAvailable');
    const customerPhoneDisplay = customer ? customer.phone || t('invoicePage.dataNotAvailable') : order.customerPhone || t('invoicePage.dataNotAvailable');
    const customerEmailDisplay = customer ? customer.email || t('invoicePage.dataNotAvailable') : order.customerEmail || t('invoicePage.dataNotAvailable');


    return (
        <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Container className="invoice-page-container my-4">
                <div className="d-flex justify-content-between align-items-center mb-3 no-print">
                    <Link to={`/orders/${currentOrderId}`} className="btn btn-outline-secondary btn-sm">
                        {t('invoicePage.backToOrderDetailsLink')}
                    </Link>
                    <Button variant="primary" size="sm" onClick={handleDownloadPDF}>
                        <Printer className="me-1" /> {t('invoicePage.downloadPdfButton')}
                    </Button>
                </div>

                <Card className="invoice-card" ref={invoiceRef}>
                    <Card.Header className="bg-light p-4">
                        <Row className="align-items-center">
                            <Col>
                                <h2 className="mb-0">{t('invoicePage.mainTitle')}</h2>
                                <p className="text-muted mb-0">{t('invoicePage.invoiceNumberLabel')} {invoiceNumber}</p>
                            </Col>
                            <Col xs="auto" className="text-end">
                                <img src={y} alt={t('invoicePage.logoAlt')} style={{ maxHeight: '70px' }} className="me-2 pb-3 pe-4"/>
                                <h4 className="mb-0">{storeNameDisplay}</h4>
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Body className="p-4">
                        <Row className="mb-4">
                            <Col md={6}>
                                <h6>{t('invoicePage.storeInfoTitle')}</h6>
                                <address className="small">
                                    <strong>{storeNameDisplay}</strong><br />
                                    {storeAddressDisplay}<br />
                                    {t('invoicePage.customerPhoneLabel')} {storePhoneDisplay}<br />
                                    {t('invoicePage.customerEmailLabel')} {storeEmailDisplay}
                                </address>
                            </Col>
                            <Col md={6} className="text-md-end">
                                <h6>{t('invoicePage.customerInfoTitle')}</h6>
                                <address className="small">
                                    <strong>{customerNameDisplay}</strong><br />
                                    {customerAddressDisplay}<br />
                                    {t('invoicePage.customerPhoneLabel')} {customerPhoneDisplay}<br />
                                    {customerEmailDisplay !== t('invoicePage.dataNotAvailable') && <>{t('invoicePage.customerEmailLabel')} {customerEmailDisplay}<br /></>}
                                </address>
                            </Col>
                        </Row>
                        <Row className="mb-4 small">
                            <Col>
                                <div><strong>{t('invoicePage.invoiceDateLabel')}</strong> {formatDate(invoiceDate)}</div>
                                <div><strong>{t('invoicePage.originalOrderIdLabel')}</strong> #{currentOrderId}</div>
                                <div><strong>{t('invoicePage.orderTimeLabel')}</strong> {formatDate(orderCreatedAt)}</div>
                            </Col>
                        </Row>

                        <Table bordered hover responsive size="sm" className="invoice-table">
                            <thead className="table-light">
                                <tr>
                                    <th className="text-center" style={{ width: '5%' }}>{t('invoicePage.table.headerNumber')}</th>
                                    <th>{t('invoicePage.table.headerProductName')}</th>
                                    <th className="text-center">{t('invoicePage.table.headerQuantity')}</th>
                                    <th className="text-end">{t('invoicePage.table.headerUnitPrice')}</th>
                                    <th className="text-end">{t('invoicePage.table.headerTotalPrice')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderItems?.map((item, index) => (
                                    <tr key={item.orderItemId || index}> {/* Use orderItemId if available */}
                                        <td className="text-center">{index + 1}</td>
                                        <td>{item.productName}</td>
                                        <td className="text-center">{item.quantity}</td>
                                        <td className="text-end">{formatPrice(item.price)}</td>
                                        <td className="text-end">{formatPrice(item.price * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="4" className="text-end fw-bold border-0">{t('invoicePage.grandTotalLabel')}</td>
                                    <td className="text-end fw-bold border-0">{formatPrice(totalAmount)}</td>
                                </tr>
                            </tfoot>
                        </Table>

                        <div className="mt-4 small">
                            <p><strong>{t('invoicePage.paymentMethodLabel')}</strong> {paymentMethod}</p>
                            {notes && <p><strong>{t('invoicePage.orderNotesLabel')}</strong> {notes}</p>}
                        </div>

                        <div className="mt-5 pt-4 border-top text-center text-muted small">
                            {t('invoicePage.footerThanks', { storeName: storeNameDisplay })}
                            <br />{t('invoicePage.footerGeneratedNote')}
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </motion.div>
    );
}
export default InvoicePage;