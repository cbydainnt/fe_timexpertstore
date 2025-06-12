import apiClient from '../config/axiosConfig'; // Sử dụng apiClient đã cấu hình

/**
 * Gửi tin nhắn của người dùng đến ChatBot API và nhận phản hồi.
 * @param {object} messagePayload - Đối tượng chứa tin nhắn: { message: string }
 * @returns {Promise<object>} Promise chứa response từ API backend (ví dụ: { reply: string })
 */
export const sendChatMessage = (messagePayload) => {
  console.log("Sending message to chatbot:", messagePayload);
  // Endpoint API backend sẽ là /api/chatbot/message (sẽ tạo ở backend)
  return apiClient.post('/chatbot/message', messagePayload);
};

// Có thể thêm các hàm khác nếu ChatBot API có endpoint khác (ví dụ: reset session chat)