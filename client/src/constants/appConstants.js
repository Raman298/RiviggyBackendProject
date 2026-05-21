// Frontend Constants
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  RESTAURANTS: '/restaurants',
  RESTAURANT_DETAIL: '/restaurant/:id',
  CART: '/cart',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  GROUP_ORDERS: '/group-orders',
  GROUP_ORDER_DETAIL: '/group-orders/:id',
  JOIN_GROUP: '/join-group/:code',
  SPLIT_BILL: '/split-bill/:id',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const PAYMENT_METHODS = {
  CARD: 'card',
  UPI: 'upi',
  WALLET: 'wallet',
  COD: 'cod',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized. Please login.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

export const SUCCESS_MESSAGES = {
  ORDER_PLACED: 'Order placed successfully!',
  PAYMENT_SUCCESS: 'Payment successful!',
  PROFILE_UPDATED: 'Profile updated successfully!',
};
