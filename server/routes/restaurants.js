
const express = require('express');
const router = express.Router();
const {
  getRestaurants, getRestaurant, createRestaurant,
  updateRestaurant, deleteRestaurant, addMenuItem,
  updateMenuItem, deleteMenuItem
} = require('../controllers/restaurantController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getRestaurants);
router.get('/:id', getRestaurant);
router.post('/', protect, adminOnly, createRestaurant);
router.put('/:id', protect, adminOnly, updateRestaurant);
router.delete('/:id', protect, adminOnly, deleteRestaurant);

// Menu item routes
router.post('/:id/menu', protect, adminOnly, addMenuItem);
router.put('/:id/menu/:itemId', protect, adminOnly, updateMenuItem);
router.delete('/:id/menu/:itemId', protect, adminOnly, deleteMenuItem);

module.exports = router;
