
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI, paymentAPI, couponAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { initiateRazorpayPayment } from '../services/razorpay';
import CouponCard from '../components/common/CouponCard';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  const deliveryFee = 30;
  const tax = Math.round(subtotal * 0.05);
  const couponDiscount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal + deliveryFee + tax - couponDiscount);

  const handleApplyCoupon = (coupon, discount) => {
    applyCoupon(coupon, discount);
  };

  const handleRemoveCoupon = async () => {
    removeCoupon();
  };

  const handleOrder = async () => {
    // Check if user is logged in
    if (!user) {
      toast.error('Please log in to place an order');
      navigate('/login');
      return;
    }
    if (!address.trim()) { toast.error('Please enter delivery address'); return; }
    if (cart.items.length === 0) { toast.error('Cart is empty'); return; }
    setLoading(true);
     try {
       // Check if token exists in sessionStorage
       const token = sessionStorage.getItem('token');
       if (!token) {
         toast.error('Session expired. Please log in again');
         navigate('/login');
         return;
       }

      // Step 1: Create order
      const orderRes = await orderAPI.create({
        restaurantId: cart.restaurantId,
        items: cart.items.map(i => ({ menuItemId: i._id, quantity: i.quantity })),
        deliveryAddress: address,
        paymentMethod,
        couponCode: appliedCoupon?.code || null
      });

      const order = orderRes.data.order;

      // Step 2: If payment method is COD, navigate directly
      if (paymentMethod === 'cod') {
        clearCart();
        toast.success('Order placed successfully!');
        navigate(`/orders/${order._id}`);
        return;
      }

      // Step 3: If payment method is UPI, initiate Razorpay with UPI preferred
      if (paymentMethod === 'upi') {
        const paymentRes = await paymentAPI.createRazorpayOrder(order._id);
        const { razorpayOrderId, key } = paymentRes.data;

        const options = {
          key,
          order_id: razorpayOrderId,
          amount: order.total * 100,
          currency: 'INR',
          name: 'Riviggy',
          description: `Order #${order._id}`,
          method: { upi: true },
          handler: async (response) => {
            try {
              // Verify payment on backend
              const verifyRes = await paymentAPI.verifyPayment(
                order._id,
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );
              clearCart();
              toast.success('Payment successful! Order confirmed.');
              navigate(`/orders/${order._id}`);
            } catch (error) {
              toast.error('Payment verification failed. Please contact support.');
              // Update order payment status to failed
              await paymentAPI.handlePaymentFailure(order._id);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || ''
          },
          theme: { color: '#FF8C42' }
        };

        await initiateRazorpayPayment(options);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      if (paymentMethod === 'upi' && err.response?.data?.order) {
        await paymentAPI.handlePaymentFailure(err.response.data.order._id).catch(() => {});
      }
    } finally { setLoading(false); }
  };

  if (cart.items.length === 0) return (
    <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: 24 }}>
      <div style={{ fontSize: 80, marginBottom: 24 }}>🛒</div>
      <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, color: '#1F2937', marginBottom: 12 }}>Cart is empty</h2>
      <p style={{ color: '#6B7280', marginBottom: 28 }}>Add some delicious food from our restaurants</p>
      <button onClick={() => navigate('/')} className="btn-primary" style={{ padding: '14px 32px', fontSize: 16 }}>Browse Restaurants</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 32, color: '#1F2937', marginBottom: 8 }}>Your Cart</h1>
      <p style={{ color: '#6B7280', marginBottom: 32 }}>From: {cart.restaurantName}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Cart items */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: '#1F2937', marginTop: 0, marginBottom: 20 }}>🛒 Items ({cart.items.length})</h3>
          {cart.items.map(item => (
            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #D9C9AE' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80'} alt={item.name} style={{ width: 64, height: 56, objectFit: 'cover', borderRadius: 10 }} onError={e => e.target.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80'} />
                <div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 15, color: '#1F2937', marginBottom: 4 }}>{item.name}</div>
                  <div style={{ color: '#FF8C42', fontFamily: 'Syne', fontWeight: 700 }}>₹{item.price}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid #D9C9AE', borderRadius: 10, overflow: 'hidden' }}>
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} style={{ padding: '6px 12px', background: 'none', border: 'none', color: '#FF8C42', cursor: 'pointer', fontSize: 18, fontWeight: 700 }}>−</button>
                  <span style={{ padding: '0 12px', fontFamily: 'Syne', fontWeight: 700, color: '#1F2937' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)} style={{ padding: '6px 12px', background: 'none', border: 'none', color: '#FF8C42', cursor: 'pointer', fontSize: 18, fontWeight: 700 }}>+</button>
                </div>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: '#1F2937', minWidth: 60, textAlign: 'right' }}>₹{item.price * item.quantity}</div>
                <button onClick={() => removeFromCart(item._id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', borderRadius: 8, padding: '6px 10px', fontSize: 14 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary + checkout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CouponCard 
            subtotal={subtotal} 
            appliedCoupon={appliedCoupon}
            onApply={handleApplyCoupon}
            onRemove={handleRemoveCoupon}
            loading={loading}
          />

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: '#1F2937', marginTop: 0, marginBottom: 16 }}>Order Summary</h3>
            {[['Subtotal', `₹${subtotal}`], ['Delivery Fee', `₹${deliveryFee}`], ['Tax (5%)', `₹${tax}`]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ color: '#6B7280', fontSize: 14 }}>{l}</span>
                <span style={{ color: '#1F2937', fontFamily: 'Syne', fontWeight: 600, fontSize: 14 }}>{v}</span>
              </div>
            ))}
            {couponDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ color: '#6B7280', fontSize: 14 }}>Discount</span>
                <span style={{ color: '#84CC16', fontFamily: 'Syne', fontWeight: 600, fontSize: 14 }}>−₹{couponDiscount}</span>
              </div>
            )}
            <div style={{ borderTop: '1px solid #D9C9AE', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: '#1F2937' }}>Total</span>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: '#FF8C42' }}>₹{total}</span>
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: '#1F2937', marginTop: 0, marginBottom: 16 }}>Delivery Details</h3>
            <textarea className="input-field" style={{ width: '100%', padding: '12px', fontSize: 14, resize: 'vertical', minHeight: 80 }} placeholder="Enter delivery address..." value={address} onChange={e => setAddress(e.target.value)} />

            <div style={{ marginTop: 14 }}>
              <label style={{ color: '#6B7280', fontSize: 13, fontFamily: 'Syne', fontWeight: 600, display: 'block', marginBottom: 10 }}>PAYMENT METHOD</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ v: 'cod', l: 'Cash on Delivery' }, { v: 'upi', l: 'Online' }].map(opt => (
                  <button key={opt.v} onClick={() => setPaymentMethod(opt.v)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: paymentMethod === opt.v ? '1px solid #FF8C42' : '1px solid #D9C9AE', background: paymentMethod === opt.v ? 'rgba(255,140,66,0.1)' : '#FFFFFF', color: paymentMethod === opt.v ? '#FF8C42' : '#6B7280', cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600, fontSize: 13 }}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>

            {!user && (
              <div style={{ background: 'rgba(255, 152, 0, 0.1)', border: '1px solid #FFB74D', borderRadius: 10, padding: 12, marginTop: 14, marginBottom: 12 }}>
                <p style={{ margin: 0, color: '#F57C00', fontSize: 14, fontFamily: 'Syne', fontWeight: 600 }}>
                  Please <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#FF8C42', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Syne', fontWeight: 700, padding: 0 }}>log in</button> or <button onClick={() => navigate('/register')} style={{ background: 'none', border: 'none', color: '#FF8C42', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Syne', fontWeight: 700, padding: 0 }}>sign up</button> to place an order
                </p>
              </div>
            )}

            <button onClick={handleOrder} disabled={loading || !user} className="btn-primary" style={{ width: '100%', padding: '15px', fontSize: 16, marginTop: 16, opacity: !user ? 0.5 : 1, cursor: !user ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Placing order...' : `Place Order · ₹${total}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
