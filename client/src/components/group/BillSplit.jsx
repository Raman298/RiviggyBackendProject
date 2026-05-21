
import React, { useState } from 'react';
import { groupAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function BillSplit({ groupOrderId, breakdown, summary, onSplitModeChange }) {
  const [mode, setMode] = useState(summary?.splitMode || 'by_contribution');
  const [loading, setLoading] = useState(false);

  const handleModeChange = async (newMode) => {
    setLoading(true);
    try {
      await groupAPI.setSplitMode(groupOrderId, newMode);
      setMode(newMode);
      if (onSplitModeChange) onSplitModeChange(newMode);
      toast.success('Split mode updated!');
    } catch (err) {
      toast.error('Failed to update split mode');
    } finally { setLoading(false); }
  };

  const memberCount = breakdown?.length || 1;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Mode selector */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: '#1F2937', marginTop: 0, marginBottom: 16 }}>Split Mode</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { value: 'by_contribution', label: 'By Contribution', icon: 'By', desc: 'Each pays for what they ordered plus proportional share of fees' },
            { value: 'equal', label: 'Split Equally', icon: 'Equal', desc: 'Total divided equally among all members' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => handleModeChange(opt.value)}
              disabled={loading}
              style={{
                padding: '16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                background: mode === opt.value ? 'rgba(132,204,22,0.1)' : '#FFFFFF',
                border: mode === opt.value ? '2px solid #84CC16' : '2px solid #D9C9AE',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>{opt.icon}</div>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: mode === opt.value ? '#84CC16' : '#1F2937', marginBottom: 4 }}>{opt.label}</div>
              <div style={{ color: '#6B7280', fontSize: 12, lineHeight: 1.4 }}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: '#1F2937', marginTop: 0, marginBottom: 16 }}>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { l: 'Food Subtotal', v: `₹${summary.subtotal}` },
              { l: 'Delivery Fee', v: `₹${summary.deliveryFee}` },
              { l: 'Tax', v: `₹${summary.tax}` },
            ].map(r => (
              <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280', fontSize: 15 }}>{r.l}</span>
                <span style={{ color: '#1F2937', fontSize: 15, fontFamily: 'Syne', fontWeight: 600 }}>{r.v}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #D9C9AE', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: '#1F2937' }}>Grand Total</span>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: '#84CC16' }}>₹{summary.total}</span>
            </div>
            {mode === 'equal' && (
              <div style={{ background: 'rgba(132,204,22,0.08)', border: '1px solid rgba(132,204,22,0.2)', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                <span style={{ color: '#84CC16', fontFamily: 'Syne', fontWeight: 700 }}>₹{Math.round(summary.total / memberCount)} per person</span>
                <span style={{ color: '#6B7280', fontSize: 13 }}> ({memberCount} members)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Per-member breakdown */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: '#1F2937', marginTop: 0, marginBottom: 20 }}>Individual Breakdown</h3>
        {(breakdown || []).map((member, i) => (
          <div key={i} style={{ marginBottom: 24, padding: 16, background: '#FFFFFF', borderRadius: 12 }}>
            {/* Member header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #84CC16, #84CC16)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: 'white' }}>
                  {member.user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: '#1F2937' }}>{member.user?.name}</div>
                  <div style={{ color: '#6B7280', fontSize: 12 }}>{member.items?.length || 0} item(s)</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: '#84CC16' }}>₹{member.total}</div>
                <div style={{ color: '#6B7280', fontSize: 12 }}>TOTAL DUE</div>
              </div>
            </div>

            {/* Items list */}
            {member.items?.map((item, j) => (
              <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #D9C9AE' }}>
                <span style={{ color: '#6B7280', fontSize: 13 }}>{item.name} × {item.quantity}</span>
                <span style={{ color: '#1F2937', fontSize: 13, fontFamily: 'Syne', fontWeight: 600 }}>₹{item.price * item.quantity}</span>
              </div>
            ))}

            {/* Shared cost breakdown */}
            <div style={{ borderTop: '1px dashed #D9C9AE', marginTop: 10, paddingTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#6B7280', fontSize: 12 }}>Items Subtotal</span>
                <span style={{ color: '#1F2937', fontSize: 12 }}>₹{member.itemsSubtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#6B7280', fontSize: 12 }}>Shared Fees ({mode === 'equal' ? 'Equal' : 'Proportional'})</span>
                <span style={{ color: '#1F2937', fontSize: 12 }}>+₹{member.sharedSplit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
