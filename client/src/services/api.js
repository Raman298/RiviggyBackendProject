
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL
  || (process.env.NODE_ENV === 'production'
    ? 'https://riviggybackendproject.onrender.com/api'
    : '/api');

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Handle 401 globally (but allow components to handle it)
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      // Only redirect if it's a getMe request (session validation)
      // Components will handle 401 for other requests
      if (error.config?.url?.includes('/auth/me')) {
        window.location.hash = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

// ─── Restaurants ─────────────────────────────────────────
export const restaurantAPI = {
  getAll: (params) => API.get('/restaurants', { params }),
  getById: (id) => API.get(`/restaurants/${id}`),
  create: (data) => API.post('/restaurants', data),
  update: (id, data) => API.put(`/restaurants/${id}`, data),
  delete: (id) => API.delete(`/restaurants/${id}`),
  addMenuItem: (id, data) => API.post(`/restaurants/${id}/menu`, data),
  updateMenuItem: (id, itemId, data) => API.put(`/restaurants/${id}/menu/${itemId}`, data),
  deleteMenuItem: (id, itemId) => API.delete(`/restaurants/${id}/menu/${itemId}`),
};

// ─── Orders ──────────────────────────────────────────────
export const orderAPI = {
  create: (data) => API.post('/orders', data),
  getMyOrders: () => API.get('/orders/my'),
  getById: (id) => API.get(`/orders/${id}`),
  updateStatus: (id, status) => API.put(`/orders/${id}/status`, { status }),
  getAll: () => API.get('/orders/admin/all'),
};

// ─── Group Orders ─────────────────────────────────────────
export const groupAPI = {
  create: (data) => API.post('/group-orders', data),
  getById: (id) => API.get(`/group-orders/${id}`),
  joinByCode: (code) => API.get(`/group-orders/join/${code}`),
  addItem: (id, data) => API.post(`/group-orders/${id}/items`, data),
  removeItem: (id, itemIndex) => API.delete(`/group-orders/${id}/items/${itemIndex}`),
  setSplitMode: (id, splitMode) => API.put(`/group-orders/${id}/split-mode`, { splitMode }),
  getSplitBill: (id) => API.get(`/group-orders/${id}/split-bill`),
  finalize: (id, data) => API.post(`/group-orders/${id}/finalize`, data),
  createMemberPaymentOrder: (id) => API.post(`/group-orders/${id}/member-payment-order`),
  verifyMemberPayment: (id, razorpayOrderId, razorpayPaymentId, razorpaySignature) =>
    API.post(`/group-orders/${id}/verify-member-payment`, { razorpayOrderId, razorpayPaymentId, razorpaySignature }),
  getMyGroupOrders: () => API.get('/group-orders/my'),
};

// ─── Payments ────────────────────────────────────────────
export const paymentAPI = {
  createRazorpayOrder: (orderId) => API.post('/payments/create-razorpay-order', { orderId }),
  verifyPayment: (orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature) => 
    API.post('/payments/verify-payment', { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }),
  handlePaymentFailure: (orderId) => API.post('/payments/payment-failed', { orderId }),
};

// ─── Coupons ─────────────────────────────────────────────
export const couponAPI = {
  getAll: (subtotal) => API.get('/coupons', { params: { subtotal } }),
  validate: (code, subtotal) => API.post('/coupons/validate', { code, subtotal }),
  apply: (orderId, code) => API.post('/coupons/apply', { orderId, code }),
  remove: (orderId) => API.delete(`/coupons/remove/${orderId}`),
};

// ─── File Upload ──────────────────────────────────────────
export const uploadAPI = {
  uploadAvatar: (formData) => {
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    return API.post('/upload/avatar', formData, config);
  },
  uploadRestaurantImage: (restaurantId, formData) => {
    formData.append('restaurantId', restaurantId);
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    return API.post('/upload/restaurant-image', formData, config);
  },
  uploadAttachments: (formData) => {
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    return API.post('/upload/attachments', formData, config);
  },
  deleteFile: (filename) => API.delete(`/upload/${filename}`),
};

export default API;
