
import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MenuItem({ item, restaurant, onAddToGroup, isGroupMode }) {
  const { addToCart, cart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const cartItem = cart.items.find(i => i._id === item._id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    if (!user) { navigate('/login'); return; }
    if (isGroupMode) { onAddToGroup(item); return; }
    addToCart(item, restaurant);
  };

  const defaultImg = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200`;

  return (
    <div style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid #D9C9AE', alignItems: 'flex-start' }}>
      {/* Left info */}
      <div style={{ flex: 1 }}>
        {/* Veg/Non-veg indicator */}
        <div style={{ marginBottom: 6 }}>
          <span style={{ display: 'inline-block', width: 14, height: 14, border: `2px solid ${item.isVeg ? '#22C55E' : '#EF4444'}`, borderRadius: 2, position: 'relative', verticalAlign: 'middle', marginRight: 6 }}>
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 7, height: 7, borderRadius: '50%', background: item.isVeg ? '#22C55E' : '#EF4444', display: 'block' }} />
          </span>
          {item.spiceLevel && item.spiceLevel !== 'mild' && (
            <span style={{ fontSize: 11, color: '#84CC16', background: 'rgba(132,204,22,0.1)', padding: '1px 6px', borderRadius: 8, fontFamily: 'Syne', fontWeight: 600 }}>
              {item.spiceLevel === 'hot' ? 'Hot' : item.spiceLevel === 'extra-hot' ? 'Extra Hot' : 'Medium'}
            </span>
          )}
        </div>

        <h4 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: '#1F2937', margin: '0 0 4px 0' }}>{item.name}</h4>
        <p style={{ color: '#84CC16', fontFamily: 'Syne', fontWeight: 700, fontSize: 15, margin: '0 0 6px 0' }}>₹{item.price}</p>
        {item.description && <p style={{ color: '#6B7280', fontSize: 13, margin: 0, lineHeight: 1.5, maxWidth: 360 }}>{item.description}</p>}
      </div>

      {/* Right: image + add button */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <img
          src={imgError ? defaultImg : item.image || defaultImg}
          alt={item.name}
          onError={() => setImgError(true)}
          style={{ width: 100, height: 90, objectFit: 'cover', borderRadius: 12 }}
        />
        
        {/* Add / Quantity control */}
        <div style={{ position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
          {quantity === 0 || isGroupMode ? (
            <button
              onClick={handleAdd}
              style={{ background: isGroupMode ? 'linear-gradient(135deg, #3B82F6, #EC4899)' : 'linear-gradient(135deg, #84CC16, #84CC16)', color: 'white', border: 'none', borderRadius: 8, padding: '5px 16px', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
            >
              {isGroupMode ? 'Add to Group' : '+ ADD'}
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', background: '#FFFDF8', border: '1px solid #84CC16', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
              <button onClick={() => quantity === 1 ? removeFromCart(item._id) : updateQuantity(item._id, quantity - 1)} style={{ background: 'none', border: 'none', color: '#84CC16', padding: '4px 10px', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>−</button>
              <span style={{ color: '#84CC16', fontFamily: 'Syne', fontWeight: 700, minWidth: 20, textAlign: 'center', fontSize: 14 }}>{quantity}</span>
              <button onClick={() => updateQuantity(item._id, quantity + 1)} style={{ background: 'none', border: 'none', color: '#84CC16', padding: '4px 10px', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
