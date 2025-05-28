import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Modal,
    Button,
    Form,
    Spinner,
    Alert,
    InputGroup
} from 'react-bootstrap';
import { EyeFill, EyeSlashFill } from 'react-bootstrap-icons';
import { changePassword } from '../../services/authService';

function ChangePasswordModal({ show, onHide }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm();

    const newPasswordValue = watch('newPassword');

    const togglePassword = (field) => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            setSuccess('Đổi mật khẩu thành công!');
            reset();
            setTimeout(() => {
                onHide();
                setSuccess('');
            }, 2000);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                'Đổi mật khẩu thất bại. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleExited = () => {
        reset();
        setError('');
        setSuccess('');
        setShowPassword({ current: false, new: false, confirm: false });
    };

    const renderPasswordField = (id, label, registerProps, errorMsg, show, toggleFn) => (
        <Form.Group className="mb-3" controlId={id}>
            <Form.Label>{label}</Form.Label>
            <InputGroup>
                <Form.Control
                    type={show ? 'text' : 'password'}
                    isInvalid={!!errorMsg}
                    {...registerProps}
                />
                <InputGroup.Text style={{ cursor: 'pointer' }} onClick={toggleFn}>
                    {show ? <EyeSlashFill /> : <EyeFill />}
                </InputGroup.Text>
                <Form.Control.Feedback type="invalid">
                    {errorMsg}
                </Form.Control.Feedback>
            </InputGroup>
        </Form.Group>
    );

    return (
        <Modal show={show} onHide={onHide} centered onExited={handleExited}>
            <Modal.Header closeButton>
                <Modal.Title>Đổi mật khẩu</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    {renderPasswordField(
                        'currentPassword',
                        'Mật khẩu hiện tại',
                        register('currentPassword', { required: 'Mật khẩu hiện tại là bắt buộc' }),
                        errors.currentPassword?.message,
                        showPassword.current,
                        () => togglePassword('current')
                    )}

                    {renderPasswordField(
                        'newPassword',
                        'Mật khẩu mới',
                        register('newPassword', {
                            required: 'Cần có mật khẩu mới',
                            minLength: {
                                value: 6,
                                message: 'Mật khẩu phải có ít nhất 6 ký tự'
                            }
                        }),
                        errors.newPassword?.message,
                        showPassword.new,
                        () => togglePassword('new')
                    )}

                    {renderPasswordField(
                        'confirmPassword',
                        'Nhập lại mật khẩu mới',
                        register('confirmPassword', {
                            required: 'Vui lòng xác nhận mật khẩu mới',
                            validate: (value) =>
                                value === newPasswordValue || 'Mật khẩu mới không khớp'
                        }),
                        errors.confirmPassword?.message,
                        showPassword.confirm,
                        () => togglePassword('confirm')
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={loading}>
                        Hủy
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Xác nhận'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default ChangePasswordModal;
