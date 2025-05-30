import React, { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
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
const { t } = useTranslation();

  const [otherReason, setOtherReason] = useState('');
const cancellationReasonsList = [
    t('cancellationReasonModal.reasons.changeMind', "Thay đổi ý định"),
    t('cancellationReasonModal.reasons.betterPrice', "Tìm thấy nơi khác giá tốt hơn"),
    t('cancellationReasonModal.reasons.longDelivery', "Thời gian giao hàng dự kiến quá lâu"),
    t('cancellationReasonModal.reasons.wrongInfo', "Nhập sai thông tin (địa chỉ, SĐT,...)"),
    t('cancellationReasonModal.reasons.wrongProduct', "Đặt nhầm sản phẩm"),
    t('cancellationReasonModal.reasons.other', "Khác (ghi rõ)")
  ];
   const otherReasonKey = t('cancellationReasonModal.reasons.other', "Khác (ghi rõ)");
  const handleReasonChange = (e) => {
    setSelectedReason(e.target.value);
    if (e.target.value !== otherReasonKey) { 
        setOtherReason('');
    }
  };

  const handleSubmit = () => {
    let finalReason = selectedReason;
    if (selectedReason === otherReasonKey) { // So sánh với key đã dịch
        finalReason = otherReason.trim() || t('cancellationReasonModal.reasons.other', "Khác"); // Dùng key dịch cho default
    }
    if (!finalReason) {
        // Sử dụng toast thay vì alert cho nhất quán
        toast.warn(t('cancellationReasonModal.validation.reasonRequired', "Vui lòng chọn hoặc cung cấp lý do hủy."));
        return;
    }
    onSubmit(finalReason);
  };


  // Reset state khi modal ẩn đi
  const handleExited = () => {
      setSelectedReason('');
      setOtherReason('');
  }

   return (
    <Modal show={show} onHide={onHide} centered onExited={handleExited}>
      <Modal.Header closeButton>
        {/* Dịch title modal */}
        <Modal.Title>{t('cancellationReasonModal.title', { orderId: orderId })}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Dịch prompt */}
        <p>{t('cancellationReasonModal.prompt')}</p>
        <Form>
          {cancellationReasonsList.map((reason) => ( // Sử dụng list đã dịch
            <Form.Check
              key={reason} type="radio"
              id={`reason-${reason.replace(/\s+/g, '-')}`}
              label={reason} value={reason}
              checked={selectedReason === reason}
              onChange={handleReasonChange}
              name="cancellationReason" className="mb-2"
            />
          ))}

          {selectedReason === otherReasonKey && ( // So sánh với key đã dịch
            <Form.Group controlId="otherReason" className="mt-2">
              <Form.Control
                as="textarea" rows={2}
                placeholder={t('cancellationReasonModal.otherReasonPlaceholder', "Vui lòng nêu rõ lý do của bạn...")}
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
              />
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
          {t('cancellationReasonModal.cancelButton', "Không, quay lại")}
        </Button>
        <Button variant="danger" onClick={handleSubmit} disabled={!selectedReason || isSubmitting}>
          {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : t('cancellationReasonModal.submitButton', 'Xác nhận hủy')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CancellationReasonModal;