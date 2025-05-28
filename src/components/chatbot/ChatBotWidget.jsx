// src/components/chatbot/ChatBotWidget.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Button, Offcanvas, Form, InputGroup, Spinner } from 'react-bootstrap'; // Sử dụng Offcanvas để làm popup
import { ChatLeftText, Send } from 'react-bootstrap-icons'; // Icons
import './ChatBotWidget.css'; // Tạo file CSS riêng cho widget này
import { sendChatMessage } from '../../services/chatBotService'; // Sẽ tạo service này sau
import { useTranslation } from 'react-i18next';
function ChatBotWidget() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false); // State để mở/đóng Offcanvas
  const [message, setMessage] = useState(''); // State cho nội dung input
  const [conversation, setConversation] = useState([]); // State lưu lịch sử hội thoại [{ sender: 'user' | 'bot', text: '...' }]
  const [loading, setLoading] = useState(false); // State loading khi chờ phản hồi bot

  const messagesEndRef = useRef(null); // Ref để cuộn xuống cuối tin nhắn

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Cuộn xuống cuối tin nhắn mỗi khi conversation thay đổi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Hàm gửi tin nhắn
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() === '') return;

    const userMessage = { sender: 'user', text: message.trim() };
    // Thêm tin nhắn của người dùng vào cuộc hội thoại
    setConversation(prev => [...prev, userMessage]);
    const userQuestion = message.trim(); // Lưu lại câu hỏi để gửi đi
    setMessage(''); // Xóa nội dung input

    setLoading(true); // Bật loading

    try {
      // Gửi tin nhắn đến backend API
      // Sẽ tạo hàm sendChatMessage trong chatBotService.js
      const response = await sendChatMessage({ message: userQuestion }); // API nhận { message: "..." }
      const botReply = response.data?.reply || "Xin lỗi, tôi không hiểu câu hỏi của bạn."; // API trả về { reply: "..." }

      // Thêm phản hồi của bot vào cuộc hội thoại
      setConversation(prev => [...prev, { sender: 'bot', text: botReply }]);

    } catch (error) {
      console.error("Error sending message to chatbot:", error);
      setConversation(prev => [...prev, { sender: 'bot', text: "Đã xảy ra lỗi khi kết nối với ChatBot." }]);
    } finally {
      setLoading(false); // Tắt loading
    }
  };

  return (
    <>
      {/* Nút mở Chat Widget */}
      <Button variant="primary" onClick={handleShow} className="chat-toggle-button">
        <ChatLeftText size={24} /> <span className="ms-2">{t('chatWidget.toggleButton', 'Chat')}</span>
      </Button>

      <Offcanvas show={show} onHide={handleClose} placement="end" backdrop={false} scroll={true} className="chat-offcanvas">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t('chatWidget.title', 'Hỗ trợ trực tuyến')}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column p-0">
          <div className="chat-messages flex-grow-1 p-3 overflow-auto mb-3">
            {conversation.map((msg, index) => (
              <div className="chat-message bot">
                <div className="message-bubble border rounded p-2 mb-2">
                  <Spinner animation="border" size="sm" className="me-1" /> {t('chatWidget.botTyping', 'Bot đang trả lời...')}
                </div>
              </div>
            ))}
            {loading && ( // Hiển thị loading khi bot đang gõ
              <div className="chat-message bot">
                <div className="message-bubble border rounded p-2 mb-2">
                  <Spinner animation="border" size="sm" className="me-1" /> Bot đang trả lời...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} /> {/* Element dùng để cuộn xuống */}
          </div>

          {/* Input và nút gửi */}
          <Form onSubmit={handleSendMessage} className="p-3 border-top">
            <InputGroup>
              <Form.Control
                type="text"
                placeholder={t('chatWidget.inputPlaceholder', 'Nhập tin nhắn của bạn...')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
              />
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner as="span" animation="border" size="sm" /> : <Send />}
              </Button>
            </InputGroup>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default ChatBotWidget;