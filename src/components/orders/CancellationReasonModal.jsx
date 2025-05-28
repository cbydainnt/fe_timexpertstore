// src/components/orders/CancellationReasonModal.jsx

import React, { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

// Các lý do hủy đơn ví dụ
const cancellationReasons = [
  "Thay đổi ý định",
  "Tìm thấy nơi khác giá tốt hơn",
  "Thời gian giao hàng dự kiến quá lâu",
  "Nhập sai thông tin (địa chỉ, SĐT,...)",
  "Đặt nhầm sản phẩm",
  "Khác (ghi rõ)"
];

function CancellationReasonModal({ show, onHide, onSubmit, orderId, isSubmitting }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  const handleReasonChange = (e) => {
    setSelectedReason(e.target.value);
    // Xóa nội dung other reason nếu chọn lý do khác
    if (e.target.value !== "Khác (ghi rõ)") {
        setOtherReason('');
    }
  };

  const handleSubmit = () => {
    let finalReason = selectedReason;
    if (selectedReason === "Khác (ghi rõ)") {
        finalReason = otherReason.trim() || "Khác"; // Lấy lý do khác hoặc mặc định là "Khác"
    }
    if (!finalReason) {
        alert("Vui lòng chọn hoặc cung cấp lý do hủy.");
        return;
    }
    onSubmit(finalReason); // Gọi callback onSubmit với lý do đã chọn/nhập
  };

  // Reset state khi modal ẩn đi
  const handleExited = () => {
      setSelectedReason('');
      setOtherReason('');
  }

  return (
    <Modal show={show} onHide={onHide} centered onExited={handleExited}>
      <Modal.Header closeButton>
        <Modal.Title>Hủy đơn hàng #{orderId}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này:</p>
        <Form>
          {cancellationReasons.map((reason) => (
            <Form.Check
              key={reason}
              type="radio"
              id={`reason-${reason.replace(/\s+/g, '-')}`} // Tạo ID duy nhất
              label={reason}
              value={reason}
              checked={selectedReason === reason}
              onChange={handleReasonChange}
              name="cancellationReason"
              className="mb-2"
            />
          ))}
         
          {selectedReason === "Khác (ghi rõ)" && (
            <Form.Group controlId="otherReason" className="mt-2">
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Vui lòng nêu rõ lý do của bạn..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
              />
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
          Hủy hành động
        </Button>
        <Button variant="danger" onClick={handleSubmit} disabled={!selectedReason || isSubmitting}>
          {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : 'Xác nhận hủy'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CancellationReasonModal;