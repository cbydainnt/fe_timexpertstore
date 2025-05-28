import React, { useState } from 'react';
import { Container, Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { createUserAdmin } from '../../services/userService';
import { ArrowLeft } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

function AdminUserCreatePage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        role: 'BUYER',
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const validRoles = ["BUYER", "STAFF", "ADMIN"];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Kiểm tra tính hợp lệ của email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.email)) {
            setError("Email không hợp lệ.");
            setLoading(false);
            return;
        }

        // Kiểm tra mật khẩu đủ mạnh (đặt yêu cầu tối thiểu)
        if (formData.password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự.");
            setLoading(false);
            return;
        }

        // Kiểm tra role hợp lệ
        if (!validRoles.includes(formData.role)) {
            setError("Role không hợp lệ.");
            setLoading(false);
            return;
        }

        try {
            await createUserAdmin(formData, formData.role);
            setSuccess("Tạo người dùng thành công!");
            setTimeout(() => navigate('/admin/users'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tạo người dùng.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-4">
            <Row className="mb-3">
                <Col>
                    <Link to="/admin/users" className="btn btn-outline-secondary btn-sm">
                        <ArrowLeft /> Quay lại
                    </Link>
                </Col>
            </Row>

            <Card className="shadow-sm">
                <Card.Header><h5 className="mb-0">Tạo tài khoản mới</h5></Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tên đăng nhập</Form.Label>
                                    <Form.Control name="username" value={formData.username} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mật khẩu</Form.Label>
                                    <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Điện thoại</Form.Label>
                                    <Form.Control name="phone" value={formData.phone} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Họ</Form.Label>
                                    <Form.Control name="lastName" value={formData.lastName} onChange={handleChange} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tên</Form.Label>
                                    <Form.Control name="firstName" value={formData.firstName} onChange={handleChange} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Địa chỉ</Form.Label>
                                    <Form.Control name="address" value={formData.address} onChange={handleChange} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Ngày sinh</Form.Label>
                                    <Form.Control type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Chọn vai trò</Form.Label>
                                    <Form.Control as="select" name="role" value={formData.role} onChange={handleChange} required>
                                        <option value="BUYER">Khách hàng</option>
                                        {/* <option value="STAFF">Nhân viên</option> */}
                                        <option value="ADMIN">Quản trị viên</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Đang tạo...' : 'Tạo mới'}</Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default AdminUserCreatePage;
