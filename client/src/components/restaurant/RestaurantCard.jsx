
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();
  const { _id, name, image, cuisine, rating, deliveryTime, deliveryFee, isOpen, tags } = restaurant;
  const fallbackImage = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400';

  return (
    <div
      className="card restaurant-card"
      style={{ overflow: 'hidden', cursor: 'pointer', opacity: isOpen ? 1 : 0.6 }}
      onClick={() => navigate(`/restaurant/${_id}`)}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
        <img src={image || fallbackImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
          onError={e => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImage;
          }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />
        {/* Overlay gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
        
        {/* Status badge */}
        {!isOpen && (
          <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.8)', color: '#EF4444', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontFamily: 'Syne', fontWeight: 600 }}>
            CLOSED
          </div>
        )}

        {/* Tags */}
        <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 6 }}>
          {tags?.slice(0, 2).map(tag => (
            <span key={tag} style={{ background: 'rgba(255,140,66,0.9)', color: 'white', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontFamily: 'Syne', fontWeight: 600 }}>{tag}</span>
          ))}
        </div>

        {/* Rating */}
        <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.85)', color: '#22C55E', padding: '4px 8px', borderRadius: 8, fontSize: 13, fontFamily: 'Syne', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
          ⭐ {rating}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: '#1F2937', margin: 0 }}>{name}</h3>
        </div>
        <p style={{ color: '#6B7280', fontSize: 13, margin: '0 0 12px 0', lineHeight: 1.4 }}>{cuisine?.join(' · ')}</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #D9C9AE' }}>
          <span style={{ color: '#6B7280', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
            Time: {deliveryTime}
          </span>
          <span style={{ color: '#6B7280', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
            Delivery: {deliveryFee === 0 ? <span style={{ color: '#22C55E' }}>Free</span> : `₹${deliveryFee}`}
          </span>
        </div>
      </div>
    </div>
  );
}
