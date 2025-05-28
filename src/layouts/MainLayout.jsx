import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header'; // Header sẽ dùng react-bootstrap components
import Footer from '../components/layout/Footer';
import Container from 'react-bootstrap/Container'; // Sử dụng Container của react-bootstrap
import 'react-toastify/dist/ReactToastify.css'; // Import CSS
import { Bounce, ToastContainer } from 'react-toastify';

const MainLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100"> {/* Sử dụng class Bootstrap */}
    <ToastContainer
            position="top-right"
            autoClose={3000} // Tự động đóng sau 3 giây
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light" // Hoặc "dark", "colored"
      />
      <Header />
      {/* Thêm style minHeight vào thẻ main */}
      <main className="flex-grow-1 py-1" style={{ minHeight: 'calc(100vh - 130px + 200px)' }}>
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
      {/* <ChatBotWidget /> */}
    </div>
  );
};

export default MainLayout;