// mzeel-app/src/api/client.js

import axios from 'axios';
import { API_URL } from '../config/constants';
import { storage } from '../utils/storage';

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Token нэмэх
client.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Алдаа шалгах
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server error
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Network error
      return Promise.reject({ message: 'Сүлжээний алдаа. Интернет холболтоо шалгана уу.' });
    } else {
      return Promise.reject({ message: error.message });
    }
  }
);

// API functions
export const api = {
  // Auth
  login: (phone, password) => client.post('/auth/login', { phone, password }),
  register: (data) => client.post('/auth/register', data),
  getMe: () => client.get('/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    client.put('/auth/change-password', { currentPassword, newPassword }),

  // Wallet
  getWallet: () => client.get('/wallet'),
  createDeposit: (amount) => client.post('/wallet/deposit', { amount }),
  checkPayment: (transactionId) => client.post(`/wallet/check-payment/${transactionId}`),
  getWalletHistory: (page = 1) => client.get(`/wallet/history?page=${page}`),

  // Loans
  verifyLoan: () => client.post('/loans/verify'),
  requestLoan: (amount) => client.post('/loans/request', { amount }),
    requestApprovedLoan: (amount) => client.post('/loans/request-approved', { amount }), 

  getMyLoans: (page = 1, status) => {
    let url = `/loans/my-loans?page=${page}`;
    if (status) url += `&status=${status}`;
    return client.get(url);
  },
  getLoanDetails: (id) => client.get(`/loans/${id}`),
  payLoan: (id, amount) => client.post(`/loans/${id}/pay`, { amount }),

  // Profile
  getProfile: () => client.get('/profile'),
  createProfile: (data) => client.post('/profile', data),
// ✅ Profile by user ID
getProfileByUserId: (userId) => client.get(`/admin/profiles/user/${userId}`),
  // Transactions
  getTransactions: (page = 1, type) => {
    let url = `/transactions?page=${page}`;
    if (type) url += `&type=${type}`;
    return client.get(url);
  },

  // Withdrawals
  createWithdrawal: (data) => client.post('/withdrawals', data),
  getMyWithdrawals: (page = 1) => client.get(`/withdrawals?page=${page}`),
  cancelWithdrawal: (id) => client.delete(`/withdrawals/${id}`),
};

export default client;