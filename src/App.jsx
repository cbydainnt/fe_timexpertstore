// src/App.jsx

import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Framer Motion imports
import { motion, AnimatePresence } from 'framer-motion';

// Import react-toastify components
import { Bounce, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS

// Import Stores
import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';

// Import Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout'; // Đảm bảo AdminLayout đã được sửa ở Bước 14

// Import Auth Route Guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute'; // Đảm bảo AdminRoute đã được sửa ở Bước 11

// Import Common Components (ví dụ: Loading)
import LoadingSpinner from './components/common/LoadingSpinner';


const pageVariants = {
  initial: {
    opacity: 0,
    // y: 20
  },
  in: {
    opacity: 1,
    // y: 0
  },
  out: {
    opacity: 0,
    // y: -20
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

// Public Pages
const HomePage = lazy(() => import('./pages/public/HomePage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const ProductsPage = lazy(() => import('./pages/public/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/public/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/public/CartPage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/public/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/public/ResetPasswordPage'));
const PaymentResultPage = lazy(() => import('./pages/public/PaymentResultPage'));
const CheckoutPage = lazy(() => import('./pages/public/CheckoutPage'));
const CategoryPage = lazy(() => import('./pages/public/CategoryPage'));
const OAuth2RedirectHandler = lazy(() => import('./pages/public/OAuth2RedirectHandler'));

// User Protected Pages
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const OrderHistoryPage = lazy(() => import('./pages/user/OrderHistoryPage'));
const OrderDetailPage = lazy(() => import('./pages/user/OrderDetailPage'));
const FavoritesPage = lazy(() => import('./pages/user/FavoritesPage'));
const InvoicePage = lazy(() => import('./pages/user/InvoicePage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductListPage = lazy(() => import('./pages/admin/AdminProductListPage'));
const AdminProductFormPage = lazy(() => import('./pages/admin/AdminProductFormPage'));
const AdminCategoryListPage = lazy(() => import('./pages/admin/AdminCategoryListPage'));
const AdminCategoryFormPage = lazy(() => import('./pages/admin/AdminCategoryFormPage'));
const AdminOrderListPage = lazy(() => import('./pages/admin/AdminOrderListPage'));
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetailPage'));
const AdminUserDetailPage = lazy(() => import('./pages/admin/AdminUserDetailPage'));
const AdminStaffListPage = lazy(() => import('./pages/admin/AdminStaffListPage'));
const AdminStaffDetailPage = lazy(() => import('./pages/admin/AdminStaffDetailPage'));
const AdminStatisticsPage = lazy(() => import('./pages/admin/AdminStatisticsPage'));
const AdminUserListPage = lazy(() => import('./pages/admin/AdminUserListPage'));
const AdminUserCreatePage = lazy(() => import('./pages/admin/AdminUserCreatePage'));

// Not Found Page
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Component Fallback cho Suspense
const RouteFallback = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
    <LoadingSpinner />
  </div>
);

function App() {
  // Lấy các action và state cần thiết từ stores
  const fetchCart = useCartStore((state) => state.fetchCart);
  const clearCartLocally = () => useCartStore.setState({ items: [] }); // Chỉ xóa state local

  const location = useLocation();

  // useEffect chạy một lần sau khi App component mount và khi fetchCart thay đổi (ít khi)
  useEffect(() => {
    console.log("App component mounted. Setting up auth listener...");

    // Lấy trạng thái auth ban đầu *sau khi* store đã có thể rehydrate từ localStorage
    const initialAuth = useAuthStore.getState();
    if (initialAuth.isAuthenticated) {
      console.log("User initially authenticated, fetching cart.");
      fetchCart(); // Gọi fetch cart nếu đã đăng nhập sẵn
    } else {
      console.log("User initially not authenticated.");
    }

    // Lắng nghe sự thay đổi trạng thái đăng nhập SAU KHI component đã mount
    const unsubscribeAuth = useAuthStore.subscribe(
      (state, prevState) => {
        // Chỉ xử lý khi trạng thái isAuthenticated thực sự thay đổi
        if (state.isAuthenticated !== prevState.isAuthenticated) {
          if (state.isAuthenticated) {
            console.log("Auth state changed: User logged in, fetching cart.");
            fetchCart(); // Fetch cart khi đăng nhập
          } else {
            console.log("Auth state changed: User logged out, clearing local cart.");
            clearCartLocally(); // Chỉ clear local state khi đăng xuất
          }
        }
      }
    );

    // Cleanup listener khi component unmount
    return () => {
      console.log("App component unmounting. Cleaning up auth listener.");
      unsubscribeAuth();
    };

  }, [fetchCart]); // Dependency là fetchCart


  return (
    // Suspense bao bọc toàn bộ Routes để xử lý fallback khi tải lazy component
    <Suspense fallback={<RouteFallback />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* --- Public và User Routes (dùng MainLayout) --- */}
          {/* Đây là Route cấp cao nhất cho MainLayout */}
          {/* <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} /> */}
          <Route path="/" element={<MainLayout />}>
            {/* Trang chủ */}
            <Route index element={<HomePage />} />

            {/* Các trang Public khác */}
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:productId" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="contact" element={<ContactPage />} />
            {/* Login và Register không cần MainLayout nếu muốn layout riêng cho form */}
            {/* Nhưng trong cấu trúc hiện tại, chúng đang dùng MainLayout */}
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="payment/result" element={<PaymentResultPage />} />
            <Route path="categories" element={<CategoryPage />} />
            {/* <Route path="/login/oauth2/code/google" element={<OAuth2RedirectHandler />} /> */}
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />


            {/* Các trang cần đăng nhập của User (bảo vệ bằng ProtectedRoute) */}
            {/* Các route này vẫn nằm trong MainLayout */}
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="orders" element={<OrderHistoryPage />} />
              <Route path="orders/:orderId" element={<OrderDetailPage />} />
              <Route path='favorites' element={<FavoritesPage />} />
              {/* Checkout thường nằm trong ProtectedRoute vì cần user login */}
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="orders/:orderId/invoice" element={<InvoicePage />} />
              {/* Thêm các route cần đăng nhập khác của user ở đây */}
            </Route>

            {/* Các route không khớp khác trong MainLayout sẽ hiển thị 404 (nếu NotFoundPage không phải Route riêng) */}
            {/* Nếu 404 là Route riêng ở cuối cùng, bỏ dòng này */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}

          </Route> {/* <-- Kết thúc MainLayout Route */}


          {/* --- Admin / Staff Routes (dùng AdminLayout) --- */}
          {/* Đây là Route cấp cao nhất cho AdminLayout */}
          {/* Bảo vệ bằng AdminRoute để chỉ Admin được render AdminLayout */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            {/* Trang mặc định của admin (ví dụ: Dashboard) */}
            <Route index element={<AdminDashboardPage />} />
            {/* Các route con của Admin, sẽ được render trong <Outlet /> của AdminLayout */}
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="categories" element={<AdminCategoryListPage />} />
            <Route path="categories/new" element={<AdminCategoryFormPage />} />
            <Route path="categories/edit/:categoryId" element={<AdminCategoryFormPage />} />
            <Route path="products" element={<AdminProductListPage />} />
            <Route path="products/new" element={<AdminProductFormPage />} />
            <Route path="products/edit/:productId" element={<AdminProductFormPage />} />
            <Route path="orders" element={<AdminOrderListPage />} />
            <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
            <Route path="users/create" element={<AdminUserCreatePage />} />
            <Route path="users" element={<AdminUserListPage />} /> {/* Danh sách tất cả user */}
            <Route path="users/:userId" element={<AdminUserDetailPage />} /> {/* Chi tiết user bất kỳ */}

            {/* Route Staff (nếu tách riêng khỏi Users) */}
            <Route path="staff" element={<AdminStaffListPage />} /> {/* Danh sách Staff */}
            <Route path="staff/:staffId" element={<AdminStaffDetailPage />} /> {/* Chi tiết Staff */}

            <Route path="statistics" element={<AdminStatisticsPage />} />
            {/* Thêm các route admin khác */}

            {/* Route 404 cho các đường dẫn không khớp trong AdminLayout (tùy chọn) */}
            {/* Nếu 404 là Route riêng ở cuối cùng, bỏ dòng này */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}

          </Route> {/* <-- Kết thúc AdminLayout Route */}


          {/* --- Route 404 cuối cùng --- */}
          {/* Route này sẽ khớp nếu không có Route nào ở trên khớp */}
          <Route path="*" element={<NotFoundPage />} />


        </Routes>
      </AnimatePresence>
      {/* ToastContainer nên đặt ở component gốc (như App) để hiển thị trên mọi trang */}
      {/* Đảm bảo bạn đã bỏ ToastContainer trong MainLayout và AdminLayout nếu có */}
      <ToastContainer
        position="top-right" // Vị trí hiển thị (top-right là góc trên bên phải)
        autoClose={3000}     // Tự động đóng sau 3000ms (3 giây)
        hideProgressBar={false} // Hiển thị thanh tiến trình
        newestOnTop={false}     // Toast mới có đè lên toast cũ không
        closeOnClick          // Đóng khi click vào toast
        rtl={false}           // Hỗ trợ Right-to-Left không
        pauseOnFocusLoss    // Tạm dừng khi cửa sổ mất focus
        draggable           // Có thể kéo toast
        pauseOnHover        // Tạm dừng khi di chuột qua
        theme="colored"         // Giao diện (light, dark, colored)
      // transition Flip // Mặc định là Slide, có thể đổi thành Bounce, Zoom, Flip
      />
    </Suspense>

  );
}

export default App;