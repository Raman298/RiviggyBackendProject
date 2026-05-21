// Frontend Hooks - useRestaurants
import { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL } from '../constants/appConstants';

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all restaurants
  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/restaurants`);

      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }

      const data = await response.json();
      setRestaurants(data.restaurants);
      setError(null);
    } catch (err) {
      setError(err.message);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single restaurant
  const fetchRestaurantDetail = useCallback(async (restaurantId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch restaurant');
      }

      const data = await response.json();
      return data.restaurant;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search restaurants by name or cuisine
  const searchRestaurants = useCallback(
    (query) => {
      return restaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
          (restaurant.cuisine && restaurant.cuisine.some((c) => c.toLowerCase().includes(query.toLowerCase())))
      );
    },
    [restaurants]
  );

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return {
    restaurants,
    loading,
    error,
    fetchRestaurants,
    fetchRestaurantDetail,
    searchRestaurants,
  };
};
