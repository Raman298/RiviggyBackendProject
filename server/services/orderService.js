// Backend Service Layer - Order Business Logic
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { HTTP_STATUS, ERRORS } = require('../constants/httpStatus');

class OrderService {
  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Object} Created order
   */
  async createOrder(userId, orderData) {
    try {
      const { restaurantId, items, deliveryAddress, totalPrice } = orderData;

      // Validate restaurant exists
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: ERRORS.RESTAURANT.NOT_FOUND,
        };
      }

      // Validate items exist
      const menuItems = await MenuItem.find({
        _id: { $in: items.map((item) => item.menuItemId) },
      });
      if (menuItems.length !== items.length) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Some menu items not found',
        };
      }

      // Create order
      const order = new Order({
        userId,
        restaurantId,
        items,
        deliveryAddress,
        totalPrice,
        status: 'pending',
      });

      await order.save();
      return { success: true, order };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get orders for a user
   * @param {string} userId
   * @returns {Array} User orders
   */
  async getUserOrders(userId) {
    try {
      const orders = await Order.find({ userId }).populate('restaurantId').sort({ createdAt: -1 });
      return { success: true, orders };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update order status
   * @param {string} orderId
   * @param {string} newStatus
   * @returns {Object} Updated order
   */
  async updateOrderStatus(orderId, newStatus) {
    try {
      const order = await Order.findByIdAndUpdate(orderId, { status: newStatus }, { new: true });
      if (!order) {
        throw {
          status: HTTP_STATUS.NOT_FOUND,
          message: ERRORS.ORDER.NOT_FOUND,
        };
      }
      return { success: true, order };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OrderService();
