/**
 * models/Order.js  — extended with coupon support
 * Drop-in replacement for the existing Order model.
 */
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
  image: String,
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 30 },
    tax: { type: Number },
    total: { type: Number, required: true },

    // ── Coupon fields ──────────────────────────────────────────────────────
    couponCode:     { type: String, default: null },
    couponDiscount: { type: Number, default: 0 },
    // ──────────────────────────────────────────────────────────────────────

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'upi', 'online'],
      default: 'cod',
    },
    deliveryAddress: String,
    isGroupOrder: { type: Boolean, default: false },
    groupOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupOrder' },
    estimatedDelivery: Date,
    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);