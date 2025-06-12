import React, { useState, useEffect, useCallback } from 'react';
import {
  getDailyRevenueStatistics,
  getDailyOrderCountStatistics,
  getRevenueStatisticsByCategory,
  getRevenueStatisticsByCustomer,
  getTopSellingProducts,
  getTopCustomersByCompletedOrders,
  getTopCustomersByCanceledOrders,
  getInventoryStatistics,
} from '../../services/statisticService';
import {
  Container, Row, Col, Card, Form, Button, Spinner, Alert, Table,
} from 'react-bootstrap';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import ChartCard from '../../components/admin/ChartCard';
import { toast } from 'react-toastify';

import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend,
} from 'chart.js';
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend
);

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const generateColors = (length) => Array.from({ length }, (_, i) => `hsl(${i * 360 / length}, 65%, 60%)`);

export default function AdminStatisticsPage() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [fromDate, setFromDate] = useState(startOfMonth.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(endOfMonth.toISOString().split('T')[0]);

  const [dailyRevenueData, setDailyRevenueData] = useState([]);
  const [dailyOrderCountData, setDailyOrderCountData] = useState([]);
  const [categoryRevenueData, setCategoryRevenueData] = useState([]);
  const [customerRevenueData, setCustomerRevenueData] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [topCompletedCustomers, setTopCompletedCustomers] = useState([]);
  const [topCanceledCustomers, setTopCanceledCustomers] = useState([]);
  const [inventoryData, setInventoryData] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [revRes, orderRes, catRes, custRes, topProdRes, topDoneRes, topCancelRes, invRes] = await Promise.all([
        getDailyRevenueStatistics({ from: fromDate, to: toDate }),
        getDailyOrderCountStatistics({ from: fromDate, to: toDate }),
        getRevenueStatisticsByCategory({ from: fromDate, to: toDate }),
        getRevenueStatisticsByCustomer({ from: fromDate, to: toDate, limit: 10 }),
        getTopSellingProducts({ limit: 5 }),
        getTopCustomersByCompletedOrders({ limit: 5 }),
        getTopCustomersByCanceledOrders({ limit: 5 }),
        getInventoryStatistics(),
      ]);
      setDailyRevenueData(revRes.data || []);
      setDailyOrderCountData(orderRes.data || []);
      setCategoryRevenueData(catRes.data || []);
      setCustomerRevenueData(custRes.data || []);
      setTopSellingProducts(topProdRes.data || []);
      setTopCompletedCustomers(topDoneRes.data || []);
      setTopCanceledCustomers(topCancelRes.data || []);
      setInventoryData(invRes.data || {});
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu thống kê.");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      toast.error("Vui lòng chọn đầy đủ khoảng thời gian.");
      return;
    }
    fetchData();
  };

  const revenueChart = {
    labels: dailyRevenueData.map(i => formatDate(i.date)),
    datasets: [{
      label: 'Doanh thu (VND)',
      data: dailyRevenueData.map(i => i.revenue || 0),
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)',
    }]
  };

  const orderChart = {
    labels: dailyOrderCountData.map(i => formatDate(i.date)),
    datasets: [{
      label: 'Số đơn hàng',
      data: dailyOrderCountData.map(i => i.orderCount || 0),
      backgroundColor: generateColors(dailyOrderCountData.length),
    }]
  };

  const categoryChart = {
    labels: categoryRevenueData.map(i => i.categoryName),
    datasets: [{
      label: 'Doanh thu theo danh mục',
      data: categoryRevenueData.map(i => i.totalRevenue),
      backgroundColor: generateColors(categoryRevenueData.length),
    }]
  };

  const inventoryChart = {
    labels: Object.keys(inventoryData),
    datasets: [{
      label: 'Tồn kho',
      data: Object.values(inventoryData),
      backgroundColor: generateColors(Object.keys(inventoryData).length),
    }]
  };

  const customerChart = {
    labels: customerRevenueData.map(i => i.customerName || 'Khách'),
    datasets: [{
      label: 'Doanh thu khách hàng',
      data: customerRevenueData.map(i => i.totalRevenue),
      backgroundColor: generateColors(customerRevenueData.length)
    }]
  };

  return (
    <Container fluid className="mt-0">
      <h3 className="mb-3">Thống kê</h3>
      <Form onSubmit={handleSubmit} className="mb-3">
        <Row className="g-2 align-items-end">
          <Col xs="auto">
            <Form.Label>Từ ngày</Form.Label>
            <Form.Control type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </Col>
          <Col xs="auto">
            <Form.Label>Đến ngày</Form.Label>
            <Form.Control type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
          </Col>
          <Col xs="auto">
            <Button type="submit" disabled={loading}>{loading ? <Spinner size="sm" animation="border" /> : 'Xem thống kê'}</Button>
          </Col>
        </Row>
      </Form>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-4">
        <Col>
          <ChartCard
            title="Doanh thu theo ngày"
            chart={
              <Line
                data={revenueChart}
                options={{ maintainAspectRatio: false }}
                height={400} 
              />
            }
            height={400} 
          />
        </Col>
      </Row>

      <Row xs={1} md={2} xl={2} className="g-4">
        <Col><ChartCard title="Số lượng đơn hàng" chart={<Bar data={orderChart} />} /></Col>
        <Col><ChartCard title="Doanh thu theo danh mục" chart={<Pie data={categoryChart} />} /></Col>
        <Col><ChartCard title="Tồn kho" chart={<Bar data={inventoryChart} />} /></Col>
        <Col><ChartCard title="Doanh thu theo khách hàng" chart={<Bar data={customerChart} />} /></Col>
      </Row>

      <Row className="mt-4 g-4">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header><Card.Title as="h6">Top khách hàng hoàn thành đơn</Card.Title></Card.Header>
            <Card.Body className="p-0">
              <Table striped bordered responsive size="sm" className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Tên khách</th>
                    <th className="text-center">Số đơn hoàn thành</th>
                  </tr>
                </thead>
                <tbody>
                  {topCompletedCustomers.slice(0, 5).map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.customerName || 'Khách'} (ID: {item.userId})</td>
                      <td className="text-center fw-semibold">{item.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header><Card.Title as="h6">Top khách hàng hủy đơn</Card.Title></Card.Header>
            <Card.Body className="p-0">
              <Table striped bordered responsive size="sm" className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Tên khách</th>
                    <th className="text-center">Số đơn bị hủy</th>
                  </tr>
                </thead>
                <tbody>
                  {topCanceledCustomers.slice(0, 5).map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.customerName || 'Khách'} (ID: {item.userId})</td>
                      <td className="text-center fw-semibold">{item.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}