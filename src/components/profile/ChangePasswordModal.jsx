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
import { useTranslation } from 'react-i18next';

function ChangePasswordModal({ show, onHide }) {
    const { t } = useTranslation();
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
            setSuccess(t('changePasswordModal.successMessage')); // Dịch thông báo
            reset();
            setTimeout(() => {
                onHide();
                setSuccess('');
            }, 2000);
        } catch (err) {
            setError(
                err.response?.data?.message || // Ưu tiên lỗi từ backend nếu có
                err.message ||
                t('changePasswordModal.errorMessageDefault') // Dịch thông báo lỗi mặc định
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

    // Hàm renderPasswordField giờ đây sẽ nhận label đã được dịch
    const renderPasswordField = (id, translatedLabel, registerProps, errorMsg, showState, toggleFn) => (
        <Form.Group className="mb-3" controlId={id}>
            <Form.Label>{translatedLabel}</Form.Label>
            <InputGroup>
                <Form.Control
                    type={showState ? 'text' : 'password'}
                    isInvalid={!!errorMsg}
                    {...registerProps}
                />
                <InputGroup.Text style={{ cursor: 'pointer' }} onClick={toggleFn} title={showState ? t('loginPage.tooltips.hidePassword') : t('loginPage.tooltips.showPassword')}>
                    {showState ? <EyeSlashFill /> : <EyeFill />}
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
                <Modal.Title>{t('changePasswordModal.title')}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    {renderPasswordField(
                        'currentPassword',
                        t('changePasswordModal.currentPasswordLabel'),
                        register('currentPassword', { required: t('changePasswordModal.validation.currentPasswordRequired') }),
                        errors.currentPassword?.message,
                        showPassword.current,
                        () => togglePassword('current')
                    )}

                    {renderPasswordField(
                        'newPassword',
                        t('changePasswordModal.newPasswordLabel'),
                        register('newPassword', {
                            required: t('changePasswordModal.validation.newPasswordRequired'),
                            minLength: {
                                value: 6,
                                message: t('changePasswordModal.validation.newPasswordMinLength')
                            }
                        }),
                        errors.newPassword?.message,
                        showPassword.new,
                        () => togglePassword('new')
                    )}

                    {renderPasswordField(
                        'confirmPassword',
                        t('changePasswordModal.confirmPasswordLabel'),
                        register('confirmPassword', {
                            required: t('changePasswordModal.validation.confirmPasswordRequired'),
                            validate: (value) =>
                                value === newPasswordValue || t('changePasswordModal.validation.passwordMismatch')
                        }),
                        errors.confirmPassword?.message,
                        showPassword.confirm,
                        () => togglePassword('confirm')
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={loading}>
                        {t('common.cancel')}
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                <span className="ms-1">{t('common.processing')}</span>
                            </>
                        ) : (
                            t('common.confirm')
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default ChangePasswordModal;