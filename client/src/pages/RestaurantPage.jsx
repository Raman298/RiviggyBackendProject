
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { restaurantAPI, groupAPI } from '../services/api';
import MenuItem from '../components/restaurant/MenuItem';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RestaurantPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [groupOrder, setGroupOrder] = useState(null);
  const [addingToGroup, setAddingToGroup] = useState(false);
  const fallbackHeaderImage = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800';
  const { cart, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await restaurantAPI.getById(id);
        setRestaurant(res.data.restaurant);
        setMenu(res.data.menu);
        setActiveCategory(Object.keys(res.data.menu)[0] || '');

        // Load group order if groupId present
        if (groupId) {
          const gRes = await groupAPI.getById(groupId);
          setGroupOrder(gRes.data.groupOrder);
        }
      } catch (err) {
        toast.error('Failed to load restaurant');
        navigate('/');
      } finally { setLoading(false); }
    };
    fetch();
  }, [id, groupId]);

  const handleAddToGroup = async (item) => {
    if (!groupOrder) return;
    setAddingToGroup(true);
    try {
      await groupAPI.addItem(groupOrder._id, { menuItemId: item._id, quantity: 1 });
      toast.success(`${item.name} added to group order!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to group');
    } finally { setAddingToGroup(false); }
  };

  if (loading) return <div style={{ padding: 40 }}><LoadingSpinner text="Loading menu..." /></div>;
  if (!restaurant) return null;

  const categories = Object.keys(menu);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>
      {/* Group order banner */}
      {groupOrder && (
        <div style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05))', border: '1px solid rgba(236,72,153,0.3)', borderRadius: 16, padding: '16px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="live-indicator" style={{ marginBottom: 4 }}>
              <div className="live-dot" style={{ background: '#EC4899' }} />
              <span style={{ color: '#EC4899', fontFamily: 'Syne', fontSize: 12, fontWeight: 600 }}>GROUP ORDER MODE</span>
            </div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, color: '#1F2937', fontSize: 16 }}>{groupOrder.name}</div>
            <div style={{ color: '#6B7280', fontSize: 13 }}>Adding items to group — each item is tracked per member</div>
          </div>
          <button onClick={() => navigate(`/group-orders/${groupOrder._id}`)} style={{ background: 'rgba(236,72,153,0.2)', border: '1px solid rgba(236,72,153,0.4)', borderRadius: 12, padding: '10px 20px', color: '#EC4899', fontFamily: 'Syne', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            Back to Room →
          </button>
        </div>
      )}

      {/* Restaurant header */}
      <div style={{ position: 'relative', height: 240, borderRadius: 20, overflow: 'hidden', marginBottom: 28 }}>
        <img
          src={restaurant.coverImage || restaurant.image || fallbackHeaderImage}
          alt={restaurant.name}
          onError={e => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackHeaderImage;
          }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
        <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 32, color: 'white', margin: '0 0 8px' }}>{restaurant.name}</h1>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <span style={{ color: '#ccc', fontSize: 14 }}>Cuisine: {restaurant.cuisine?.join(' · ')}</span>
            <span style={{ color: '#ccc', fontSize: 14 }}>Rating: {restaurant.rating}</span>
            <span style={{ color: '#ccc', fontSize: 14 }}>Time: {restaurant.deliveryTime}</span>
            <span style={{ color: '#ccc', fontSize: 14 }}>Delivery: ₹{restaurant.deliveryFee}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32 }}>
        {/* Category sidebar */}
        <div style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
          <div className="card" style={{ padding: 8 }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => {
                setActiveCategory(cat);
                document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: activeCategory === cat ? 'rgba(255,140,66,0.15)' : 'none', border: 'none', color: activeCategory === cat ? '#FF8C42' : '#6B7280', cursor: 'pointer', borderRadius: 10, fontFamily: 'Syne', fontWeight: 600, fontSize: 14, transition: 'all 0.15s', marginBottom: 2 }}>
                {cat}
                <span style={{ float: 'right', fontSize: 12, opacity: 0.7 }}>{menu[cat]?.length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Menu items */}
        <div>
          {categories.map(cat => (
            <div key={cat} id={`cat-${cat}`} style={{ marginBottom: 40 }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 22, color: '#1F2937', marginBottom: 4 }}>{cat}</h2>
              <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 16 }}>{menu[cat]?.length} item{menu[cat]?.length !== 1 ? 's' : ''}</p>
              {menu[cat]?.map(item => (
                <MenuItem key={item._id} item={item} restaurant={restaurant} isGroupMode={!!groupOrder} onAddToGroup={handleAddToGroup} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Floating cart button (individual mode) */}
      {!groupOrder && totalItems > 0 && (
        <button onClick={() => navigate('/cart')} style={{ position: 'fixed', bottom: 32, right: 32, background: 'linear-gradient(135deg, #FF8C42, #FF8C42)', border: 'none', borderRadius: 16, padding: '16px 28px', color: 'white', fontFamily: 'Syne', fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 8px 32px rgba(255,140,66,0.5)', zIndex: 100 }}>
          🛒 View Cart ({totalItems} items)
        </button>
      )}
    </div>
  );
}
