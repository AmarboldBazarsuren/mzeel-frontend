// mzeel-app/src/config/constants.js

// Backend API хаяг (Таны компьютерын IP хаягийг оруулна)
// АНХААР: Port заавал оруулах! :5000
// WiFi IP хаяг олох: 
// - Mac/Linux: ifconfig | grep "inet " 
// - Windows: ipconfig
// - Эсвэл утсаараа Wi-Fi Settings -> Connected network -> IP address харах

export const API_URL = 'http://172.20.10.2:5000/api';  // ✅ PORT нэмсэн!

// Хэрэв локал компьютер дээрээ туршиж байгаа бол:
// export const API_URL = 'http://localhost:5000/api';

// Хэрэв Android Emulator ашиглаж байгаа бол:
// export const API_URL = 'http://10.0.2.2:5000/api';

// App тохиргоо
export const APP_NAME = 'ZeelX';
export const VERIFICATION_FEE = 3000;
export const MIN_LOAN_AMOUNT = 10000;
export const MAX_LOAN_AMOUNT = 500000;

// Colors (UI/UX-аас)
export const COLORS = {
  primary: '#E53935', // Улаан
  secondary: '#1E3A5F', // Хар цэнхэр
  dark: '#1A1A2E',
  darkGray: '#2A2A3E',
  gray: '#4A4A5E',
  lightGray: '#6A6A7E',
  green: '#4CAF50',
  white: '#FFFFFF',
  background: '#16213E',
  cardBg: '#0F3460',
};