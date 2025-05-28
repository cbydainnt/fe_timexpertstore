// src/components/common/Pagination.jsx

import React from 'react';
import { Pagination as BsPagination } from 'react-bootstrap'; // Import component Pagination của React-Bootstrap
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};
const pageTransition = { duration: 0.4 };
/**
 * Component hiển thị phân trang.
 * Sử dụng component Pagination của React-Bootstrap.
 * Lưu ý: React-Bootstrap Pagination thường làm việc với số trang bắt đầu từ 1.
 * Trong khi API Spring Data Pageable thường dùng số trang bắt đầu từ 0.
 * Component cha cần xử lý việc chuyển đổi này khi truyền props và xử lý callback.
 *
 * @param {object} props - Props của component.
 * @param {number} props.currentPage - Số trang hiện tại (BẮT ĐẦU TỪ 1).
 * @param {number} props.totalPages - Tổng số trang.
 * @param {function(number): void} props.onPageChange - Callback function được gọi khi người dùng chọn trang mới, truyền vào số trang mới (BẮT ĐẦU TỪ 1).
 * @param {number} [props.maxDisplayedPages=5] - Số lượng nút trang tối đa hiển thị xung quanh trang hiện tại.
 */
function Pagination({ currentPage, totalPages, onPageChange, maxDisplayedPages = 5 }) {

  // Không hiển thị gì nếu chỉ có 1 trang hoặc không có trang nào
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = [];
  const halfDisplayed = Math.floor(maxDisplayedPages / 2);

  let startPage = Math.max(1, currentPage - halfDisplayed);
  let endPage = Math.min(totalPages, currentPage + halfDisplayed);

  // Điều chỉnh startPage và endPage để luôn hiển thị đủ số lượng nút (nếu có thể)
  if (currentPage - halfDisplayed <= 0) {
    endPage = Math.min(totalPages, endPage + (halfDisplayed - currentPage + 1));
  }
  if (currentPage + halfDisplayed >= totalPages) {
    startPage = Math.max(1, startPage - (currentPage + halfDisplayed - totalPages));
  }
  // Đảm bảo endPage không vượt quá totalPages sau khi điều chỉnh startPage
  endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1);
  // Đảm bảo startPage không nhỏ hơn 1 sau khi điều chỉnh endPage
  startPage = Math.max(1, endPage - maxDisplayedPages + 1);


  // Tạo các nút số trang
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(
      <BsPagination.Item key={i} active={i === currentPage} onClick={() => onPageChange(i)}>
        {i}
      </BsPagination.Item>
    );
  }

  return (

    <div className="d-flex justify-content-center mt-4"> {/* Dùng class Bootstrap để căn giữa */}
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <BsPagination>
          {/* Nút Trang Đầu */}
          <BsPagination.First onClick={() => onPageChange(1)} disabled={currentPage === 1} />

          {/* Nút Trang Trước */}
          <BsPagination.Prev onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />

          {/* Dấu "..." ở đầu nếu cần */}
          {startPage > 1 && <BsPagination.Ellipsis onClick={() => onPageChange(startPage - 1)} />}
          {/* Nếu muốn nhảy về trang 1 khi bấm "..." đầu: */}
          {/* {startPage > 1 && <BsPagination.Item key="start-dot" onClick={() => onPageChange(1)}>1</BsPagination.Item>}
        {startPage > 2 && <BsPagination.Ellipsis key="start-ellipsis" onClick={() => onPageChange(startPage - 1)} />} */}


          {/* Các nút số trang */}
          {pageNumbers}

          {/* Dấu "..." ở cuối nếu cần */}
          {endPage < totalPages && <BsPagination.Ellipsis onClick={() => onPageChange(endPage + 1)} />}
          {/* Nếu muốn nhảy về trang cuối khi bấm "..." cuối: */}
          {/* {endPage < totalPages -1 && <BsPagination.Ellipsis key="end-ellipsis" onClick={() => onPageChange(endPage + 1)} />}
         {endPage < totalPages && <BsPagination.Item key="end-dot" onClick={() => onPageChange(totalPages)}>{totalPages}</BsPagination.Item>} */}


          {/* Nút Trang Sau */}
          <BsPagination.Next onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />

          {/* Nút Trang Cuối */}
          <BsPagination.Last onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} />
        </BsPagination>
      </motion.div>
    </div>
  );
}

export default Pagination;