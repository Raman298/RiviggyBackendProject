/**
 * routes/coupons.js
 * REST endpoints for coupon validation and listing.
 *
 * Mount in index.js:
 *   app.use('/api/coupons', require('./routes/coupons'));
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const { COUPONS, calculateDiscount, findCoupon } = require('./Coupandata');

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Determine whether the authenticated user has ever placed an order.
 * Used to gate new-user-only coupons (WELCOME50, etc.)
 */
async function isNewUser(userId) {
  try {
    const orderCount = await Order.countDocuments({ user: userId });
    return orderCount === 0;
  } catch {
    return false;
  }
}

// ── GET /api/coupons ─────────────────────────────────────────────────────────
/**
 * Returns all active coupons, annotated with eligibility info for the
 * current user (if authenticated) and the provided subtotal.
 *
 * Query params:
 *   subtotal  (number, optional) — current cart subtotal for savings preview
 */
router.get('/', async (req, res) => {
  try {
    const subtotal = parseFloat(req.query.subtotal) || 0;
    let newUser = false;

    // Optionally resolve auth from cookie/header without hard-blocking
    if (req.cookies && req.cookies.token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        newUser = await isNewUser(decoded.id);
      } catch {
        // unauthenticated — treat as existing user for safety
      }
    }

    const activeCoupons = COUPONS.filter((c) => c.active).map((c) => {
      const discount = calculateDiscount(c, subtotal, newUser);
      return {
        code: c.code,
        label: c.label,
        description: c.description,
        badge: c.badge,
        type: c.type,
        value: c.value,
        minOrder: c.minOrder,
        maxDiscount: c.maxDiscount || null,
        forNewUser: c.forNewUser,
        expiryLabel: c.expiryLabel,
        // Dynamic fields based on current cart
        discount,
        eligible: discount > 0 || (c.forNewUser && !newUser ? false : subtotal >= c.minOrder),
        savingsLabel: discount > 0 ? `Saves ₹${discount}` : null,
      };
    });

    res.json({ success: true, coupons: activeCoupons, isNewUser: newUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching coupons' });
  }
});

// ── POST /api/coupons/validate ────────────────────────────────────────────────
/**
 * Validates a coupon code against the user's cart.
 *
 * Body: { code: string, subtotal: number }
 * Returns: { success, discount, coupon } | { success: false, message }
 */
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const parsedSubtotal = parseFloat(subtotal) || 0;
    const coupon = findCoupon(code);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    const newUser = await isNewUser(req.user._id);

    if (coupon.forNewUser && !newUser) {
      return res.status(400).json({
        success: false,
        message: `"${coupon.code}" is only valid for your first order.`,
      });
    }

    if (parsedSubtotal < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum cart value of ₹${coupon.minOrder} required for "${coupon.code}".`,
      });
    }

    const discount = calculateDiscount(coupon, parsedSubtotal, newUser);

    return res.json({
      success: true,
      message: `"${coupon.code}" applied — you save ₹${discount}!`,
      discount,
      coupon: {
        code: coupon.code,
        label: coupon.label,
        description: coupon.description,
        badge: coupon.badge,
        type: coupon.type,
        value: coupon.value,
        expiryLabel: coupon.expiryLabel,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error validating coupon' });
  }
});

// ── POST /api/coupons/apply ───────────────────────────────────────────────────
/**
 * Applies a coupon to an existing pending order.
 * Updates the order's total and records the coupon code.
 *
 * Body: { orderId: string, code: string }
 */
router.post('/apply', protect, async (req, res) => {
  try {
    const { orderId, code } = req.body;
    if (!orderId || !code) {
      return res.status(400).json({ success: false, message: 'orderId and code are required' });
    }

    const Order = require('../models/Order');
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Coupon can only be applied to pending orders' });
    }

    const coupon = findCoupon(code);
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });

    const newUser = await isNewUser(req.user._id);
    if (coupon.forNewUser && !newUser) {
      return res.status(400).json({ success: false, message: 'This coupon is for first-time orders only' });
    }

    if (order.subtotal < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order of ₹${coupon.minOrder} required`,
      });
    }

    const discount = calculateDiscount(coupon, order.subtotal, newUser);

    order.couponCode    = coupon.code;
    order.couponDiscount = discount;
    order.total         = Math.max(0, order.subtotal + order.deliveryFee + (order.tax || 0) - discount);
    await order.save();

    res.json({
      success: true,
      message: `Coupon applied — ₹${discount} discount!`,
      discount,
      newTotal: order.total,
      order,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error applying coupon' });
  }
});

// ── DELETE /api/coupons/remove/:orderId ───────────────────────────────────────
/**
 * Removes a coupon from a pending order and recalculates the total.
 */
router.delete('/remove/:orderId', protect, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    order.couponCode     = undefined;
    order.couponDiscount = 0;
    order.total          = order.subtotal + order.deliveryFee + (order.tax || 0);
    await order.save();

    res.json({ success: true, message: 'Coupon removed', newTotal: order.total, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error removing coupon' });
  }
});

module.exports = router;