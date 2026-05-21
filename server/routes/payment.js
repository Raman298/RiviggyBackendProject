const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment, handlePaymentFailure } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// All payment routes require authentication
router.post('/create-razorpay-order', protect, createRazorpayOrder);
router.post('/verify-payment', protect, verifyRazorpayPayment);
router.post('/payment-failed', protect, handlePaymentFailure);

module.exports = router;
