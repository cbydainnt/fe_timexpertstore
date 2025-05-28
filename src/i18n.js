// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import các file translation JSON
import translationVI from './locales/vi/translation.json';
import translationEN from './locales/en/translation.json';

// Các tài nguyên ngôn ngữ
const resources = {
  en: {
    translation: translationEN
  },
  vi: {
    translation: translationVI
  }
};

i18n
  // Phát hiện ngôn ngữ người dùng (ví dụ: từ localStorage, trình duyệt)
  .use(LanguageDetector)
  // Kết nối i18n instance với react-i18next
  .use(initReactI18next)
  // Khởi tạo i18next
  .init({
    resources, // Các bản dịch
    fallbackLng: 'vi', // Ngôn ngữ sử dụng nếu ngôn ngữ hiện tại không có key hoặc không phát hiện được
    debug: process.env.NODE_ENV === 'development', // true ở môi trường dev, false ở production

    interpolation: {
      escapeValue: false // React đã tự bảo vệ khỏi XSS rồi
    },

    // Cấu hình cho LanguageDetector
    detection: {
      // Thứ tự ưu tiên phát hiện ngôn ngữ:
      // 1. localStorage (nếu người dùng đã từng chọn)
      // 2. navigator (ngôn ngữ trình duyệt)
      // 3. htmlTag (thuộc tính lang trên thẻ <html>)
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'], // Nơi lưu trữ lựa chọn ngôn ngữ của người dùng
      // lookupLocalStorage: 'i18nextLng', // Tên key trong localStorage (mặc định là 'i18nextLng')
    }
  });

export default i18n;