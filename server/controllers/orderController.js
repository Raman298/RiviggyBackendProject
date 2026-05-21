
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// @desc Create order (individual)
exports.createOrder = async (req, res, next) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod, couponCode } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    // Validate items and calculate subtotal
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) return res.status(404).json({ success: false, message: `Item ${item.menuItemId} not found` });
      subtotal += menuItem.price * item.quantity;
      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        image: menuItem.image
      });
    }

    const deliveryFee = restaurant.deliveryFee || 30;
    const tax = Math.round(subtotal * 0.05);
    let couponDiscount = 0;
    let total = subtotal + deliveryFee + tax;

    // If coupon code is provided, validate and calculate discount
    if (couponCode) {
      try {
        const { COUPONS, calculateDiscount, findCoupon } = require('../routes/Coupandata');
        const coupon = findCoupon(couponCode);
        if (coupon && coupon.active) {
          const isNewUser = await Order.countDocuments({ user: req.user._id }) === 0;
          if (!coupon.forNewUser || isNewUser) {
            if (subtotal >= coupon.minOrder) {
              couponDiscount = calculateDiscount(coupon, subtotal, isNewUser);
              total = Math.max(0, total - couponDiscount);
            }
          }
        }
      } catch (err) {
        console.error('Error applying coupon:', err);
        // Continue without coupon if there's an error
      }
    }

    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurantId,
      items: orderItems,
      subtotal,
      deliveryFee,
      tax,
      total,
      couponCode: couponCode || null,
      couponDiscount,
      deliveryAddress,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'online' ? 'pending' : 'pending',
      status: paymentMethod === 'online' ? 'pending' : 'pending',
      estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000)
    });

    await order.populate('restaurant', 'name image');
    res.status(201).json({ success: true, order });
  } catch (error) { next(error); }
};

// @desc Get user orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('restaurant', 'name image')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) { next(error); }
};

// @desc Get single order
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name image address')
      .populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, order });
  } catch (error) { next(error); }
};

// @desc Update order status (admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`order_${order._id}`).emit('orderStatusUpdate', { orderId: order._id, status: order.status });
    res.json({ success: true, order });
  } catch (error) { next(error); }
};

// @desc Get all orders (admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('restaurant', 'name')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) { next(error); }
};
