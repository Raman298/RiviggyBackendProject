
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
const STATUS_LABELS = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'On the Way',
  delivered: 'Delivered',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    orderAPI.getById(id)
      .then(res => setOrder(res.data.order))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 40 }}><LoadingSpinner /></div>;
  if (!order) return null;

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <button onClick={() => navigate('/orders')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600, marginBottom: 28, padding: 0 }}>
        ← Back to Orders
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, color: '#1F2937', marginBottom: 6 }}>Order #{order._id.slice(-6).toUpperCase()}</h1>
          <p style={{ color: '#6B7280', margin: 0 }}>{order.restaurant?.name} · {new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </div>
        {order.isGroupOrder && <span className="badge badge-blue">Group Order</span>}
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="card" style={{ padding: 28, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17, color: '#1F2937', marginTop: 0, marginBottom: 24 }}>Order Status</h3>
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            {/* Progress line */}
            <div style={{ position: 'absolute', top: 16, left: 16, right: 16, height: 2, background: '#D9C9AE', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: 16, left: 16, height: 2, background: '#84CC16', zIndex: 0, width: currentStep >= 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` : '0%', transition: 'width 0.5s ease' }} />

            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStep;
              return (
                <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? '#84CC16' : '#FFFFFF', border: `2px solid ${done ? '#84CC16' : '#D9C9AE'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, transition: 'all 0.3s' }}>
                    {done ? <span style={{ color: 'white', fontSize: 12 }}>Done</span> : <span style={{ color: '#6B7280', fontSize: 11 }}>{i + 1}</span>}
                  </div>
                  <span style={{ fontFamily: 'Syne', fontWeight: done ? 700 : 500, fontSize: 11, color: done ? '#84CC16' : '#6B7280', textAlign: 'center', lineHeight: 1.3, maxWidth: 60 }}>
                    {STATUS_LABELS[step]}
                  </span>
                </div>
              );
            })}
          </div>

          {order.estimatedDelivery && order.status !== 'delivered' && (
            <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(132,204,22,0.08)', borderRadius: 10, textAlign: 'center' }}>
              <span style={{ color: '#6B7280', fontSize: 13 }}>Estimated delivery: </span>
              <span style={{ color: '#84CC16', fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>{new Date(order.estimatedDelivery).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17, color: '#1F2937', marginTop: 0, marginBottom: 18 }}>Items</h3>
        {order.items?.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < order.items.length - 1 ? '1px solid #D9C9AE' : 'none' }}>
            <span style={{ color: '#1F2937', fontSize: 15 }}>{item.name} <span style={{ color: '#6B7280' }}>×{item.quantity}</span></span>
            <span style={{ fontFamily: 'Syne', fontWeight: 600, color: '#1F2937' }}>₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Bill */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17, color: '#1F2937', marginTop: 0, marginBottom: 16 }}>Bill Details</h3>
        {[['Subtotal', order.subtotal], ['Delivery Fee', order.deliveryFee], ['Tax', order.tax]].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ color: '#6B7280' }}>{l}</span>
            <span style={{ color: '#1F2937', fontFamily: 'Syne', fontWeight: 600 }}>₹{v}</span>
          </div>
        ))}
        {order.couponCode && order.couponDiscount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ color: '#6B7280' }}>
              Coupon <span style={{ fontFamily: 'Syne', fontWeight: 600, color: '#1F2937' }}>({order.couponCode})</span>
            </span>
            <span style={{ color: '#84CC16', fontFamily: 'Syne', fontWeight: 600 }}>−₹{order.couponDiscount}</span>
          </div>
        )}
        <div style={{ borderTop: '1px solid #D9C9AE', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: '#1F2937' }}>Total Paid</span>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: '#84CC16' }}>₹{order.total}</span>
        </div>
        <div style={{ marginTop: 12, color: '#6B7280', fontSize: 13 }}>
          Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'upi' ? 'UPI' : 'Online'}
        </div>
      </div>
    </div>
  );
}
