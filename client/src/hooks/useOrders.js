// Frontend Hooks - useOrders
import { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL } from '../constants/appConstants';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders);
      setError(null);
    } catch (err) {
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single order
  const fetchOrderDetail = useCallback(async (orderId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order detail');
      }

      const data = await response.json();
      return data.order;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel order
  const cancelOrder = useCallback(async (orderId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      const data = await response.json();
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order._id === orderId ? data.order : order))
      );
      return data.order;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    fetchOrderDetail,
    cancelOrder,
  };
};
