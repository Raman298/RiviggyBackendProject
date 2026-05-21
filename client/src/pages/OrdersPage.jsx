
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const STATUS_MAP = {
  pending: { label: 'Pending', color: '#F59E0B', icon: '⏳' },
  confirmed: { label: 'Confirmed', color: '#EC4899' },
  preparing: { label: 'Preparing', color: '#A78BFA' },
  out_for_delivery: { label: 'On the Way', color: '#84CC16' },
  delivered: { label: 'Delivered', color: '#22C55E' },
  cancelled: { label: 'Cancelled', color: '#EF4444' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    orderAPI.getMyOrders()
      .then(res => setOrders(res.data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40 }}><LoadingSpinner text="Loading orders..." /></div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 32, color: '#1F2937', marginBottom: 32 }}>My Orders</h1>

      {orders.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'Syne', color: '#1F2937', marginBottom: 8 }}>No orders yet</h3>
          <p style={{ color: '#6B7280', marginBottom: 24 }}>Your order history will appear here</p>
          <button onClick={() => navigate('/')} className="btn-primary" style={{ padding: '12px 28px' }}>Order Now</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => {
            const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
            return (
              <div key={order._id} className="card" style={{ padding: 20, cursor: 'pointer', transition: 'border-color 0.2s' }}
                onClick={() => navigate(`/orders/${order._id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <img src={order.restaurant?.image} alt="" style={{ width: 56, height: 50, objectFit: 'cover', borderRadius: 10 }} onError={e => e.target.style.display='none'} />
                    <div>
                      <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17, color: '#1F2937', margin: '0 0 4px' }}>{order.restaurant?.name}</h3>
                      <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>
                        {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {order.isGroupOrder && <span style={{ fontSize: 12, color: '#EC4899', background: 'rgba(236,72,153,0.1)', padding: '2px 8px', borderRadius: 8, fontFamily: 'Syne', fontWeight: 600 }}>Group Order</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: '#1F2937', marginBottom: 6 }}>₹{order.total}</div>
                    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, background: `${statusInfo.color}20`, color: statusInfo.color, fontFamily: 'Syne', fontWeight: 700, fontSize: 12 }}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {order.items?.slice(0, 3).map((item, i) => (
                    <span key={i} style={{ background: '#FFFFFF', padding: '4px 12px', borderRadius: 20, color: '#6B7280', fontSize: 13 }}>
                      {item.name} ×{item.quantity}
                    </span>
                  ))}
                  {order.items?.length > 3 && <span style={{ background: '#FFFFFF', padding: '4px 12px', borderRadius: 20, color: '#6B7280', fontSize: 13 }}>+{order.items.length - 3} more</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
