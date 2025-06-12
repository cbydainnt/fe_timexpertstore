import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Container, Spinner, Alert } from 'react-bootstrap';

function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken); // ✅ Dùng đúng hàm
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setError(`Đăng nhập Google thất bại: ${decodeURIComponent(oauthError)}`);
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Không nhận được token từ server.");
      setLoading(false);
      return;
    }

    // ✅ GỌI setToken CHUẨN để lưu token và fetch profile
    setToken(token, false)
      .then(() => {
        const user = useAuthStore.getState().user;
        if (user?.role === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      })
      .catch((err) => {
        console.error("Lỗi khi fetch profile:", err);
        setError("Đăng nhập thành công nhưng không thể lấy thông tin người dùng.");
      })
      .finally(() => setLoading(false));
  }, [searchParams, navigate, setToken]);

  return (
    <Container className="text-center py-5">
      {loading && (
        <>
          <Spinner />
          <p>Đang xử lý đăng nhập Google...</p>
        </>
      )}
      {error && (
        <>
          <Alert variant="danger">{error}</Alert>
          <Link to="/login">Quay lại trang đăng nhập</Link>
        </>
      )}
    </Container>
  );
}

export default OAuth2RedirectHandler;
