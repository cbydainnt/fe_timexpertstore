import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
// Import services
import { getDashboardSummary, getDailyRevenueStatistics } from '../../services/statisticService';
// Import Bootstrap components
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
// Import icons
import { CheckCircleFill, ClockHistory, CashCoin, BoxSeam, ReceiptCutoff, PeopleFill, BarChartLineFill, TagsFill, PersonBadgeFill, Building } from 'react-bootstrap-icons';
// Import Chart component (cần cài đặt: npm install react-chartjs-2 chart.js)
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'; // Import Filler
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { motion } from 'framer-motion'; // Thêm animation
import '../../styles/admin.css';

// Đăng ký các thành phần ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler); // Đăng ký Filler

// Animation variants
const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };
const pageTransition = { duration: 0.4 };

// Helper format tiền
const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

function AdminDashboardPage() {
    // State cho dữ liệu tóm tắt
    const [summaryData, setSummaryData] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        totalRevenue: 0
    });
    const [loadingSummary, setLoadingSummary] = useState(true);
    // State cho dữ liệu biểu đồ doanh thu
    const [revenueChartData, setRevenueChartData] = useState({ labels: [], datasets: [] });
    const [loadingRevenue, setLoadingRevenue] = useState(true);
    // State cho lỗi chung
    const [error, setError] = useState(null);

    // Fetch dữ liệu tóm tắt
    const fetchSummary = useCallback(async () => {
        setLoadingSummary(true);
        try {
            // *** API Backend /api/admin/statistics/summary cần được tạo ***
            // Dòng này đang gọi API hoặc dùng mock data
            const response = await getDashboardSummary(); // Sử dụng hàm service mới

            // Cập nhật state với dữ liệu thực tế từ response
            setSummaryData(response.data || {
                totalOrders: 'N/A', // Cập nhật tên trường theo DashboardSummaryDTO
                pendingOrders: 'N/A',
                completedOrders: 'N/A',
                totalCustomers: 'N/A',
                totalProducts: 'N/A',
                totalRevenue: 'N/A'
            });

        } catch (err) {
            console.error("Error fetching dashboard summary:", err);
            setError("Could not load summary data.");
            // Đảm bảo set các trường về trạng thái lỗi/N/A
            setSummaryData({
                totalOrders: 'Err',
                pendingOrders: 'Err',
                completedOrders: 'Err',
                totalCustomers: 'Err',
                totalProducts: 'Err',
                totalRevenue: 'Err'
            });
        } finally {
            setLoadingSummary(false);
        }
    }, []);

    // Fetch dữ liệu doanh thu theo ngày (ví dụ: 7 ngày qua)
    const fetchRevenue = useCallback(async () => {
        setLoadingRevenue(true);
        try {
            // Tính khoảng ngày (ví dụ 7 ngày qua)
            const today = new Date();
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            const fromDate = sevenDaysAgo.toISOString().split('T')[0]; // Định dạng YYYY-MM-DD
            const toDate = today.toISOString().split('T')[0]; // Định dạng YYYY-MM-DD

            // *** API Backend /api/admin/statistics/revenue/daily cần được tạo ***
            // Gọi API mới để lấy dữ liệu doanh thu theo ngày
            const response = await getDailyRevenueStatistics({ from: fromDate, to: toDate });
            const rawData = response.data || []; // API trả về List<DailyRevenueDTO>

            // Chuyển đổi List<DailyRevenueDTO> sang định dạng cho ChartJS
            // Cần sắp xếp theo ngày trước khi tạo label và data points
            const sortedData = rawData.sort((a, b) => new Date(a.date) - new Date(b.date)); // Sắp xếp theo ngày

            const labels = sortedData.map(item => new Date(item.date).toLocaleDateString('vi-VN')); // Format ngày cho label
            const dataPoints = sortedData.map(item => parseFloat(item.revenue || 0));

            setRevenueChartData({
                labels: labels,
                datasets: [{
                    label: 'Doanh thu (VND)', // Sửa label biểu đồ
                    data: dataPoints,
                    borderColor: 'rgb(54, 162, 235)', // Màu xanh dương
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    fill: true,
                    tension: 0.2
                }],
            });

        } catch (err) {
            console.error("Error fetching revenue statistics:", err);
            setError("Could not load daily revenue chart data.");
            setRevenueChartData({ labels: [], datasets: [] }); // Reset chart data khi lỗi
        } finally {
            setLoadingRevenue(false);
        }
    }, []);

    // Fetch dữ liệu khi component mount
    useEffect(() => {
        fetchSummary();
        fetchRevenue();
    }, [fetchSummary, fetchRevenue]);

    // Cấu hình cho biểu đồ
    const chartOptions = {
        responsive: true, maintainAspectRatio: false, // Cho phép đặt chiều cao tùy ý
        plugins: { legend: { display: false }, title: { display: true, text: 'Doanh thu (7 ngày qua)' } },
        scales: { y: { ticks: { callback: value => formatPrice(value) } } } // Format trục Y
    };

    return (
        <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <Container fluid> {/* Container fluid trong AdminLayout */}
                <h1 className="h3 mb-4 text-gray-800">Dashboard</h1>
                {error && <Alert variant="danger">{error}</Alert>}

                {/* Hàng các Card tóm tắt */}
                <Row className="mb-4">
                    {/* Card Tổng đơn hàng */}
                    <Col xl={3} md={6} className="mb-4">
                        <Card border="left-primary" className="shadow h-100 py-2"> {/* Sử dụng màu primary cho Tổng đơn */}
                            <Card.Body> <Row className="align-items-center"> <Col className="mr-2">
                                <div className="text-xs fw-bold text-primary text-uppercase mb-1">Tổng đơn hàng</div> {/* Sửa tiêu đề */}
                                <div className="h5 mb-0 fw-bold text-gray-800">{loadingSummary ? <Spinner size="sm" /> : summaryData.totalOrders}</div> {/* Sử dụng totalOrders */}
                            </Col><Col xs="auto"><ReceiptCutoff size={32} className="text-gray-300" /></Col> </Row> </Card.Body> {/* Icon ReceiptCutoff hoặc icon khác */}
                        </Card>
                    </Col>
                    {/* Card Đơn hàng đang chờ */}
                    <Col xl={3} md={6} className="mb-4">
                        <Card border="left-warning" className="shadow h-100 py-2"> {/* Màu warning cho đơn chờ */}
                            <Card.Body> <Row className="align-items-center"> <Col className="mr-2">
                                <div className="text-xs fw-bold text-warning text-uppercase mb-1">Đơn hàng đang chờ</div> {/* Sửa tiêu đề */}
                                <div className="h5 mb-0 fw-bold text-gray-800">{loadingSummary ? <Spinner size="sm" /> : summaryData.pendingOrders}</div> {/* Sử dụng pendingOrders */}
                            </Col><Col xs="auto"><ClockHistory size={32} className="text-gray-300" /></Col> </Row> </Card.Body> {/* Icon ClockHistory */}
                        </Card>
                    </Col>
                    {/* Card Đơn hàng hoàn thành */}
                    <Col xl={3} md={6} className="mb-4">
                        <Card border="left-success" className="shadow h-100 py-2"> {/* Màu success cho đơn hoàn thành */}
                            <Card.Body> <Row className="align-items-center"> <Col className="mr-2">
                                <div className="text-xs fw-bold text-success text-uppercase mb-1">Đơn hàng hoàn thành</div> {/* Sửa tiêu đề */}
                                <div className="h5 mb-0 fw-bold text-gray-800">{loadingSummary ? <Spinner size="sm" /> : summaryData.completedOrders}</div> {/* Sử dụng completedOrders */}
                            </Col><Col xs="auto"><CheckCircleFill size={32} className="text-gray-300" /></Col> </Row> </Card.Body> {/* Icon CheckCircleFill */}
                        </Card>
                    </Col>
                    {/* Card Tổng khách hàng */}
                    <Col xl={3} md={6} className="mb-4">
                        <Card border="left-info" className="shadow h-100 py-2"> {/* Màu info cho Tổng khách hàng */}
                            <Card.Body> <Row className="align-items-center"> <Col className="mr-2">
                                <div className="text-xs fw-bold text-info text-uppercase mb-1">Tổng khách hàng</div> {/* Sửa tiêu đề */}
                                <div className="h5 mb-0 fw-bold text-gray-800">{loadingSummary ? <Spinner size="sm" /> : summaryData.totalCustomers}</div> {/* Sử dụng totalCustomers */}
                            </Col><Col xs="auto"><PeopleFill size={32} className="text-gray-300" /></Col> </Row> </Card.Body> {/* Icon PeopleFill */}
                        </Card>
                    </Col>
                    {/* Card Tổng sản phẩm */}
                    <Col xl={3} md={6} className="mb-4">
                        <Card border="left-secondary" className="shadow h-100 py-2"> {/* Màu secondary cho Tổng sản phẩm */}
                            <Card.Body> <Row className="align-items-center"> <Col className="mr-2">
                                <div className="text-xs fw-bold text-secondary text-uppercase mb-1">Tổng sản phẩm</div> {/* Sửa tiêu đề */}
                                <div className="h5 mb-0 fw-bold text-gray-800">{loadingSummary ? <Spinner size="sm" /> : summaryData.totalProducts}</div> {/* Sử dụng totalProducts */}
                            </Col><Col xs="auto"><BoxSeam size={32} className="text-gray-300" /></Col> </Row> </Card.Body> {/* Icon BoxSeam */}
                        </Card>
                    </Col>
                    {/* Card Tổng doanh thu */}
                    <Col xl={3} md={6} className="mb-4">
                        <Card border="left-primary" className="shadow h-100 py-2"> {/* Màu primary cho Tổng doanh thu */}
                            <Card.Body> <Row className="align-items-center"> <Col className="mr-2">
                                <div className="text-xs fw-bold text-primary text-uppercase mb-1">Tổng doanh thu</div> {/* Sửa tiêu đề */}
                                <div className="h5 mb-0 fw-bold text-gray-800">{loadingSummary ? <Spinner size="sm" /> : formatPrice(summaryData.totalRevenue)}</div> {/* Sử dụng totalRevenue */}
                            </Col><Col xs="auto"><CashCoin size={32} className="text-gray-300" /></Col> </Row> </Card.Body> {/* Icon CashCoin */}
                        </Card>
                    </Col>
                </Row>

                {/* Hàng chứa Biểu đồ và Link nhanh */}
                <Row>
                    {/* Cột Biểu đồ Doanh thu */}
                    <Col xl={8} lg={7} className="mb-4">
                        <Card className="shadow">
                            <Card.Header className="py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 className="m-0 fw-bold text-primary">Tổng quan về doanh thu (7 ngày qua)</h6>
                                {/* Có thể thêm Dropdown chọn khoảng thời gian khác */}
                            </Card.Header>
                            <Card.Body>
                                <div className="chart-area" style={{ height: '320px' }}> {/* Đặt chiều cao cố định */}
                                    {loadingRevenue ? <LoadingSpinner /> : <Line options={chartOptions} data={revenueChartData} />}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Cột Link nhanh */}
                    <Col xl={4} lg={5} className="mb-4">
                        <Card className="shadow">
                            <Card.Header className="py-3">
                                <h6 className="m-0 fw-bold text-primary">Thao tác nhanh</h6>
                            </Card.Header>
                            <Card.Body>
                                <div className="d-grid gap-2">
                                    <Link to="/admin/products/new" className="btn btn-sm btn-custom-add-product">
                                        Thêm sản phẩm mới
                                    </Link>
                                    <Link to="/admin/categories/new" className="btn btn-sm btn-custom-add-category">
                                        Thêm danh mục mới
                                    </Link>
                                    <Link to="/admin/orders" className="btn btn-sm btn-custom-view-orders">
                                        Xem tất cả đơn hàng 
                                    </Link>
                                </div>

                                <p className="small text-muted">Truy cập nhanh vào các tác vụ quản lý chung.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

            </Container>
        </motion.div>
    );
}

export default AdminDashboardPage;