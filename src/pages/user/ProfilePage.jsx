import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore'; // Import store Zustand
import { getUserProfile, updateUserProfile } from '../../services/authService'; // Import API service
// Import các component của React-Bootstrap
import { Container, Card, Form, Button, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import ChangePasswordModal from '../../components/profile/ChangePasswordModal';
import { Person, GeoAlt, Telephone, PencilSquare, Lock } from 'react-bootstrap-icons';
// Import component loading (bạn cần tự tạo hoặc dùng Spinner trực tiếp)
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};
const pageTransition = { duration: 0.4 };

function ProfilePage() {

  const { t } = useTranslation();

  // Lấy user hiện tại và action updateUser từ store
  // updateUserInStore dùng để cập nhật lại thông tin user trong store sau khi API thành công
  const { user: currentUser, updateUser: updateUserInStore } = useAuthStore();
  const [loading, setLoading] = useState(false); // State cho lúc submit form
  const [loadingProfile, setLoadingProfile] = useState(true); // State cho lúc tải profile ban đầu
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false); // State quản lý chế độ xem/sửa
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  // Sử dụng react-hook-form
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: { // Load default values từ currentUser hoặc fetch API
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      // Không nên cho sửa username, email, role ở đây
    }
  });

  // Hàm fetch profile data (dùng useCallback để tránh tạo lại hàm)
  const fetchProfile = useCallback(() => {
    setLoadingProfile(true);
    setError('');
    setSuccess('');
    getUserProfile()
      .then(response => {
        const profileData = response.data;
        reset({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          dateOfBirth: profileData.dateOfBirth || '',
        });
        setLoadingProfile(false);
      })
      .catch(err => {
        console.error("Error fetching profile:", err);
        setError(t('profilePage.errorLoadingProfile', "Không thể tải dữ liệu hồ sơ."));
        setLoadingProfile(false);
      });
  }, [reset, t]);

  // Load profile khi component mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]); // Gọi fetchProfile

  // Hàm xử lý khi submit form chỉnh sửa
  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Chỉ gửi các trường cho phép chỉnh sửa
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        dateOfBirth: data.dateOfBirth || null, // Gửi null nếu date rỗng
      };
      const response = await updateUserProfile(updateData); //
      updateUserInStore(response.data); //
      setSuccess(t('profilePage.updateSuccess', 'Cập nhật thông tin thành công!')); //
      setIsEditing(false); //
      reset({ //
        firstName: response.data.firstName || '', //
        lastName: response.data.lastName || '', //
        phone: response.data.phone || '', //
        address: response.data.address || '', //
        dateOfBirth: response.data.dateOfBirth || '', //
      });
    } catch (err) {
      console.error("Error updating profile:", err); //
      setError(err.response?.data?.message || t('profilePage.updateError', 'Cập nhật thông tin thất bại.')); //
    } finally {
      setLoading(false); //
    }
  };

  // Hàm để định dạng ngày tháng hiển thị (ví dụ)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Input type="date" trả về YYYY-MM-DD
      const [year, month, day] = dateString.split('-');
      if (year && month && day) {
        return `${day}/${month}/${year}`; // Định dạng dd/MM/yyyy
      }
      // Thử parse nếu là định dạng khác từ store
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('vi-VN');
      }
      return dateString; // Trả về gốc nếu không parse được
    } catch {
      return dateString;
    }
  };


  // Render UI
  if (loadingProfile)
    return <Container className="text-center py-5">
      <LoadingSpinner text={t('common.loading', "Đang tải...")} />
    </Container>;
  if (!currentUser && !loadingProfile)
    return <Container className="py-5">
      <Alert variant="warning" className="text-center">
        {t('profilePage.errorLoadingProfileRetry', 'Không thể tải hồ sơ người dùng. Vui lòng thử đăng nhập lại.')}
      </Alert>
    </Container>;


  // Lấy dữ liệu hiển thị từ form state (đã được reset bằng data API) hoặc từ currentUser nếu form chưa load kịp
  const displayUser = {
    username: currentUser?.username,
    email: currentUser?.email,
    role: currentUser?.role,
    // Lấy các trường còn lại từ giá trị của form (sau khi đã reset)
    ...reset // Đây không phải cách lấy giá trị, cần dùng getValues() hoặc state riêng
    // --> Sửa lại: Dùng trực tiếp giá trị từ currentUser để hiển thị ở chế độ view
  };


  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {/* <LoadingSpinner loading={loadingProfile} message="Loading profile..." /> Hiển thị loading nếu cần */}
      <Container className="py-1" style={{ maxWidth: '800px' }}>
        <h1 className="mb-4 h3">{t('profilePage.title', 'Hồ sơ của tôi')}</h1>
        {error && <Alert variant="danger" className="text-center mb-3">{error}</Alert>}
        {success && <Alert variant="success" className="text-center mb-3">{success}</Alert>}
        <Card className="shadow-sm">
          <Card.Body className="p-4">
            {!isEditing ? (
              <div className="profile-view">
                <Row className="mb-3"><Col sm={4} className="text-muted fw-medium">{t('profilePage.usernameLabel', 'Tên đăng nhập')}:</Col><Col sm={8}>{currentUser?.username}</Col></Row>
                <Row className="mb-3"><Col sm={4} className="text-muted fw-medium">{t('profilePage.emailLabel', 'Email')}:</Col><Col sm={8}>{currentUser?.email}</Col></Row>
                <Row className="mb-3"><Col sm={4} className="text-muted fw-medium">{t('profilePage.firstNameLabel', 'Tên')}:</Col><Col sm={8}>{currentUser?.firstName || 'N/A'}</Col></Row>
                <Row className="mb-3"><Col sm={4} className="text-muted fw-medium">{t('profilePage.lastNameLabel', 'Họ')}:</Col><Col sm={8}>{currentUser?.lastName || 'N/A'}</Col></Row>
                <Row className="mb-3"><Col sm={4} className="text-muted fw-medium">{t('profilePage.phoneLabel', 'Số điện thoại')}:</Col><Col sm={8}>{currentUser?.phone || 'N/A'}</Col></Row>
                <Row className="mb-3"><Col sm={4} className="text-muted fw-medium">{t('profilePage.addressLabel', 'Địa chỉ')}:</Col><Col sm={8}>{currentUser?.address || 'N/A'}</Col></Row>
                <Row className="mb-3"><Col sm={4} className="text-muted fw-medium">{t('profilePage.dobLabel', 'Ngày sinh')}:</Col><Col sm={8}>{formatDate(currentUser?.dateOfBirth)}</Col></Row>
                <div className="mt-2 pt-4 border-top d-flex gap-3">
                  <Button variant="outline-success" onClick={() => {
                    // Reset form về giá trị hiện tại trước khi bật edit
                    reset({
                      firstName: currentUser?.firstName || '',
                      lastName: currentUser?.lastName || '',
                      phone: currentUser?.phone || '',
                      address: currentUser?.address || '',
                      dateOfBirth: currentUser?.dateOfBirth || '',
                    });
                    setIsEditing(true);
                    setError(''); // Xóa lỗi cũ khi bắt đầu edit
                    setSuccess('');// Xóa success cũ
                  }} className="custom-password-button">
                    <PencilSquare className="me-1" /> {t('profilePage.updateButton', 'Cập nhật thông tin')}
                  </Button>
                  <Button
                    variant="outline-primary"
                    className="custom-password-button"
                    onClick={() => setShowChangePasswordModal(true)}
                  >
                    <Lock className="me-1" /> {t('profilePage.changePasswordButton', 'Đổi mật khẩu')}
                  </Button>
                </div>
              </div>
            ) : (
              // --- Chế độ sửa ---
              <Form onSubmit={handleSubmit(onSubmit)}>
                <p><strong className="text-muted fw-medium">{t('profilePage.usernameLabel', 'Tên đăng nhập')}:</strong> {currentUser?.username}</p>
                <p><strong className="text-muted fw-medium">{t('profilePage.emailLabel', 'Email')}:</strong> {currentUser?.email}</p>
                <hr className="my-3" />
                <Row>
                  <Form.Group as={Col} md={6} className="mb-3" controlId="profileFirstName">
                    <Form.Label>{t('profilePage.firstNameLabel', 'Tên')}</Form.Label>
                    <Form.Control type="text" {...register("firstName")} isInvalid={!!errors.firstName} />
                    <Form.Control.Feedback type="invalid">{errors.firstName?.message}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} md={6} className="mb-3" controlId="profileLastName">
                    <Form.Label>{t('profilePage.lastNameLabel', 'Họ')}</Form.Label>
                    <Form.Control type="text" {...register("lastName")} isInvalid={!!errors.lastName} />
                    <Form.Control.Feedback type="invalid">{errors.lastName?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <Form.Group className="mb-3" controlId="profilePhone"><Form.Label>{t('profilePage.phoneLabel', 'Số điện thoại')}</Form.Label><Form.Control type="tel" {...register("phone")} isInvalid={!!errors.phone} /></Form.Group>
                <Form.Group className="mb-3" controlId="profileAddress"><Form.Label>{t('profilePage.addressLabel', 'Địa chỉ')}</Form.Label><Form.Control type="text" {...register("address")} isInvalid={!!errors.address} /></Form.Group>
                <Form.Group className="mb-3" controlId="profileDateOfBirth"><Form.Label>{t('profilePage.dobLabel', 'Ngày sinh')}</Form.Label><Form.Control type="date" {...register("dateOfBirth")} isInvalid={!!errors.dateOfBirth} /></Form.Group>
                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <Button variant="secondary" type="button" onClick={() => { setIsEditing(false); setError(''); setSuccess(''); fetchProfile(); }}>{t('common.cancel', 'Hủy')}</Button>
                  <Button variant="success" type="submit" disabled={loading || !isDirty}>
                    {loading ? <Spinner as="span" animation="border" size="sm" /> : t('common.save', 'Lưu')}
                  </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
        <ChangePasswordModal
          show={showChangePasswordModal}
          onHide={() => setShowChangePasswordModal(false)}
        />

      </Container>
    </motion.div>
  );
}

export default ProfilePage;