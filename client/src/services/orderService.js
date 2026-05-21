// Frontend Service Layer - Order API Calls
import { API_BASE_URL } from '../constants/appConstants';

class OrderService {
  async createOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  }

  async getOrders() {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  }

  async getOrderDetail(orderId) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch order detail');
    return response.json();
  }

  async cancelOrder(orderId) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) throw new Error('Failed to cancel order');
    return response.json();
  }
}

export default new OrderService();
