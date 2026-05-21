// Frontend Utility Functions
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculateDeliveryTime = (baseTime = 30) => {
  return baseTime + Math.floor(Math.random() * 15);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const getOrderStatusColor = (status) => {
  const statusColors = {
    pending: '#FFA500',
    confirmed: '#4169E1',
    preparing: '#FF6347',
    ready: '#32CD32',
    out_for_delivery: '#1E90FF',
    delivered: '#228B22',
    cancelled: '#DC143C',
  };
  return statusColors[status] || '#808080';
};

export const getOrderStatusLabel = (status) => {
  const statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready for Pickup',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return statusLabels[status] || status;
};
