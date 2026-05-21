import React, { useState, useEffect } from 'react';
import { couponAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function CouponCard({ subtotal, appliedCoupon, onApply, onRemove, loading = false }) {
  const [code, setCode] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [showList, setShowList] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [validating, setValidating] = useState(false);

  // Fetch available coupons on mount and when subtotal changes
  useEffect(() => {
    if (subtotal > 0 && showList) {
      loadCoupons();
    }
  }, [showList, subtotal]);

  const loadCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const res = await couponAPI.getAll(subtotal);
      setCoupons(res.data.coupons || []);
    } catch (err) {
      console.error('Error loading coupons:', err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setValidating(true);
    try {
      const res = await couponAPI.validate(code, subtotal);
      if (res.data.success) {
        onApply(res.data.coupon, res.data.discount);
        setCode('');
        setShowList(false);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid coupon code';
      toast.error(message);
    } finally {
      setValidating(false);
    }
  };

  const handleSelectCoupon = async (coupon) => {
    setCode(coupon.code);
    setValidating(true);
    try {
      const res = await couponAPI.validate(coupon.code, subtotal);
      if (res.data.success) {
        onApply(res.data.coupon, res.data.discount);
        setCode('');
        setShowList(false);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Cannot apply this coupon';
      toast.error(message);
    } finally {
      setValidating(false);
    }
  };

  const handleRemove = () => {
    onRemove();
    setCode('');
  };

  if (appliedCoupon) {
    return (
      <div className="card" style={{ padding: 16, background: 'rgba(132,204,22,0.08)', border: '1px solid #84CC16', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, color: '#84CC16', fontSize: 14, marginBottom: 4 }}>
              ✓ Coupon Applied
            </div>
            <div style={{ fontSize: 14, color: '#6B7280' }}>
              <span style={{ fontFamily: 'Syne', fontWeight: 600, color: '#1F2937' }}>{appliedCoupon.code}</span> - Saves ₹{appliedCoupon.discount}
            </div>
          </div>
          <button 
            onClick={handleRemove}
            disabled={loading}
            style={{ 
              background: 'rgba(239,68,68,0.1)',
              border: 'none',
              color: '#EF4444',
              cursor: loading ? 'not-allowed' : 'pointer',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 13,
              fontFamily: 'Syne',
              fontWeight: 600,
              opacity: loading ? 0.5 : 1
            }}
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: showList ? 12 : 0 }}>
        <input
          type="text"
          className="input-field"
          placeholder="Enter coupon code..."
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyPress={e => e.key === 'Enter' && handleApply()}
          disabled={validating}
          style={{ flex: 1, padding: '10px 12px', fontSize: 14 }}
        />
        <button
          onClick={handleApply}
          disabled={validating || !code.trim()}
          style={{
            background: '#FF8C42',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 10,
            cursor: validating || !code.trim() ? 'not-allowed' : 'pointer',
            fontFamily: 'Syne',
            fontWeight: 600,
            fontSize: 13,
            opacity: validating || !code.trim() ? 0.5 : 1
          }}
        >
          {validating ? 'Validating...' : 'Apply'}
        </button>
      </div>

      <button
        onClick={() => setShowList(!showList)}
        style={{
          background: 'none',
          border: 'none',
          color: '#FF8C42',
          cursor: 'pointer',
          fontSize: 13,
          fontFamily: 'Syne',
          fontWeight: 600,
          padding: 0,
          textDecoration: 'underline'
        }}
      >
        {showList ? '↑ Hide' : '↓ View available coupons'}
      </button>

      {showList && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #D9C9AE' }}>
          {loadingCoupons ? (
            <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>Loading coupons...</p>
          ) : coupons.length > 0 ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {coupons.map(coupon => (
                <button
                  key={coupon.code}
                  onClick={() => handleSelectCoupon(coupon)}
                  disabled={validating}
                  style={{
                    background: coupon.eligible ? '#FFFFFF' : '#F3F4F6',
                    border: coupon.eligible ? '1px solid #FF8C42' : '1px solid #D9C9AE',
                    padding: 12,
                    borderRadius: 10,
                    cursor: coupon.eligible && !validating ? 'pointer' : 'not-allowed',
                    opacity: coupon.eligible ? 1 : 0.6,
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontFamily: 'Syne', fontWeight: 700, color: '#1F2937', fontSize: 13, marginBottom: 2 }}>
                        {coupon.code}
                      </div>
                      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
                        {coupon.description}
                      </div>
                      {coupon.expiryLabel && (
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                          {coupon.expiryLabel}
                        </div>
                      )}
                    </div>
                    {coupon.eligible && coupon.savingsLabel && (
                      <div style={{ background: '#84CC16', color: 'white', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontFamily: 'Syne', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {coupon.savingsLabel}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>No coupons available for this order</p>
          )}
        </div>
      )}
    </div>
  );
}
