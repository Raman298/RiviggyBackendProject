# Razorpay Integration Guide

## Overview
This document explains how to integrate Razorpay for online payments in your Riviggy application.

## Prerequisites
- Razorpay account (create one at https://razorpay.com)
- Node.js and npm installed
- React application running

## Setup Instructions

### 1. Get Your Razorpay API Credentials

1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings** → **API Keys**
3. Copy your **Key ID** and **Key Secret**
   - Keep these credentials safe and never commit them to version control

### 2. Configure Environment Variables

#### Server Setup (.env)
Update `server/.env` with your Razorpay credentials:

```env
RAZORPAY_KEY_ID=your_actual_key_id_here
RAZORPAY_KEY_SECRET=your_actual_key_secret_here
```

Replace the placeholder values with your actual Razorpay API credentials.

### 3. Implementation Details

#### Backend Endpoints

**1. Create Razorpay Order**
- **Endpoint**: `POST /api/payments/create-razorpay-order`
- **Description**: Creates a payment order in Razorpay system
- **Body**: `{ orderId: "order_id_from_riviggy" }`
- **Returns**: `{ razorpayOrderId, amount, currency, key }`

**2. Verify Payment**
- **Endpoint**: `POST /api/payments/verify-payment`
- **Description**: Verifies the payment signature and updates order status
- **Body**: `{ orderId, razorpayPaymentId, razorpaySignature }`
- **Returns**: `{ success: true, message: "Payment verified", order }`

**3. Handle Payment Failure**
- **Endpoint**: `POST /api/payments/payment-failed`
- **Description**: Updates order payment status to failed
- **Body**: `{ orderId }`
- **Returns**: `{ success: true, order }`

#### Frontend Flow

1. User selects "Online" payment method on CartPage
2. User places order → Order is created with `paymentStatus: 'pending'`
3. Frontend requests Razorpay order creation
4. Razorpay checkout modal opens
5. Upon successful payment:
   - Payment signature is verified on backend
   - Order `paymentStatus` changes to `'paid'`
   - Order `status` changes to `'confirmed'`
   - User is redirected to order details page
6. On payment failure:
   - Order `paymentStatus` is marked as `'failed'`
   - User can retry the payment

### 4. Database Fields

The Order model includes these payment-related fields:
- `paymentMethod`: 'cod' (Cash on Delivery) or 'online' (Online Payment)
- `paymentStatus`: 'pending', 'paid', or 'failed'
- `razorpayOrderId`: Razorpay order ID
- `razorpayPaymentId`: Razorpay payment ID (after successful payment)

### 5. Testing

#### Test Card Details (Sandbox Mode)
Razorpay provides test card numbers for testing:
- **Success**: `4111 1111 1111 1111` (Visa)
- **Failure**: `4444 3333 2222 1111`
- **Any future date** for expiry (e.g., 12/25)
- **Any CVC** (e.g., 123)

#### Testing Steps
1. Select "Online" payment method
2. Fill in delivery address
3. Click "Place Order"
4. Use test card details in the Razorpay checkout
5. Complete the payment flow

### 6. Security Best Practices

1. **Never expose API keys in client-side code** ✓ (Already implemented)
   - Keys are only used on the server
   - Client receives only the Key ID needed for checkout

2. **Always verify signatures on the backend** ✓ (Already implemented)
   - Prevents tampered payment verification

3. **Use HTTPS in production** 
   - Ensure your deployment uses HTTPS

4. **Store credentials in environment variables**
   - Never hardcode API keys

5. **Handle errors gracefully**
   - Users can retry failed payments

### 7. Deployment Checklist

- [ ] Add Razorpay credentials to production environment variables
- [ ] Update CLIENT_URL in .env to your production domain
- [ ] Test payment flow in sandbox mode first
- [ ] Enable production mode in Razorpay dashboard
- [ ] Update API keys to production keys
- [ ] Monitor webhook events for payment reconciliation (optional)

### 8. Troubleshooting

**Payment Modal Not Opening**
- Check if Razorpay script loaded successfully
- Verify RAZORPAY_KEY_ID is correct

**Payment Signature Verification Failed**
- Ensure RAZORPAY_KEY_SECRET is correct
- Check that the secret is not accidentally modified

**"Order not found" Error**
- Verify orderId is being passed correctly
- Check if order exists in database

**CORS Issues**
- Ensure CLIENT_URL in .env matches your frontend URL
- Razorpay is hosted externally, so CORS shouldn't be an issue

### 9. Webhook Integration (Optional)

For production, consider implementing webhooks for:
- Payment authorization
- Payment failure notifications
- Refund status updates

Refer to [Razorpay Webhook Documentation](https://razorpay.com/docs/webhooks/)

### 10. Support

For more information:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Checkout](https://razorpay.com/docs/checkout/)
- [Razorpay API Reference](https://razorpay.com/docs/api/payments/)
