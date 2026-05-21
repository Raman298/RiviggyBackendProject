
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupAPI, restaurantAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function GroupOrderPage() {
  const [myGroupOrders, setMyGroupOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [form, setForm] = useState({ restaurantId: '', name: '', closingMinutes: 60 });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [groupRes, restRes] = await Promise.all([groupAPI.getMyGroupOrders(), restaurantAPI.getAll()]);
        setMyGroupOrders(groupRes.data.groupOrders);
        setRestaurants(restRes.data.restaurants);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.restaurantId) { toast.error('Please select a restaurant'); return; }
    setCreating(true);
    try {
      const res = await groupAPI.create(form);
      toast.success('Group order room created!');
      navigate(`/group-orders/${res.data.groupOrder._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group order');
    } finally { setCreating(false); }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) { toast.error('Enter invite code'); return; }
    setJoining(true);
    try {
      const res = await groupAPI.joinByCode(joinCode.toUpperCase());
      toast.success('Joined group order!');
      navigate(`/group-orders/${res.data.groupOrder._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally { setJoining(false); }
  };

  const statusColors = { active: '#22C55E', locked: '#FF8C42', completed: '#EC4899', cancelled: '#EF4444', expired: '#EF4444' };

  const getDisplayStatus = (groupOrder) => {
    if (groupOrder.status === 'active' && groupOrder.closesAt && new Date(groupOrder.closesAt) < new Date()) {
      return 'expired';
    }
    return groupOrder.status;
  };

  if (loading) return <div style={{ padding: 40 }}><LoadingSpinner text="Loading group orders..." /></div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 36, color: '#1F2937', marginBottom: 8 }}>Group Orders</h1>
      <p style={{ color: '#6B7280', marginBottom: 32, fontSize: 16 }}>Order together, split automatically. Perfect for hostel runs.</p>

      {/* Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
        {/* Create */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: '#1F2937', marginTop: 0, marginBottom: 16 }}>
            Create a Group Order
          </h3>
          {!showCreate ? (
            <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 15 }}>
              Start Group Order Room
            </button>
          ) : (
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ color: '#6B7280', fontSize: 13, fontFamily: 'Syne', fontWeight: 600, display: 'block', marginBottom: 8 }}>RESTAURANT</label>
                <select className="input-field" style={{ width: '100%', padding: '10px 12px', fontSize: 14 }} value={form.restaurantId} onChange={e => setForm({...form, restaurantId: e.target.value})} required>
                  <option value="">Choose a restaurant...</option>
                  {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ color: '#6B7280', fontSize: 13, fontFamily: 'Syne', fontWeight: 600, display: 'block', marginBottom: 8 }}>ROOM NAME (optional)</label>
                <input className="input-field" style={{ width: '100%', padding: '10px 12px', fontSize: 14 }} placeholder={`${user.name}'s Group Order`} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: '#6B7280', fontSize: 13, fontFamily: 'Syne', fontWeight: 600, display: 'block', marginBottom: 8 }}>CLOSE ORDER AFTER</label>
                <select className="input-field" style={{ width: '100%', padding: '10px 12px', fontSize: 14 }} value={form.closingMinutes} onChange={e => setForm({...form, closingMinutes: e.target.value})}>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary" style={{ flex: 1, padding: '12px', fontSize: 14 }}>Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary" style={{ flex: 2, padding: '12px', fontSize: 14 }}>
                  {creating ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Join */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: '#1F2937', marginTop: 0, marginBottom: 16 }}>
            Join a Group Order
          </h3>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>Enter the invite code shared by your friend to join their group order room.</p>
          <input
            className="input-field"
            style={{ width: '100%', padding: '12px 16px', fontSize: 18, letterSpacing: 4, textAlign: 'center', fontFamily: 'Syne', fontWeight: 800, marginBottom: 14 }}
            placeholder="ABC12345"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            maxLength={8}
          />
          <button onClick={handleJoin} disabled={joining} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 15 }}>
            {joining ? '⏳ Joining...' : '→ Join Room'}
          </button>
        </div>
      </div>

      {/* My group orders */}
      <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 24, color: '#1F2937', marginBottom: 20 }}>My Group Orders</h2>
      {myGroupOrders.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>Group</div>
          <h3 style={{ fontFamily: 'Syne', color: '#1F2937', marginBottom: 8 }}>No group orders yet</h3>
          <p style={{ color: '#6B7280' }}>Create one above or ask a friend to share their invite code!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {myGroupOrders.map(go => {
            const displayStatus = getDisplayStatus(go);
            return (
            <div key={go._id} className="card" style={{ padding: 20, cursor: 'pointer', transition: 'border-color 0.2s', borderColor: displayStatus === 'active' ? 'rgba(34,197,94,0.3)' : '#D9C9AE' }} onClick={() => navigate(`/group-orders/${go._id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <img src={go.restaurant?.image} alt="" style={{ width: 60, height: 54, objectFit: 'cover', borderRadius: 12 }} />
                  <div>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17, color: '#1F2937', margin: '0 0 4px' }}>{go.name}</h3>
                    <p style={{ color: '#6B7280', fontSize: 14, margin: '0 0 8px' }}>{go.restaurant?.name}</p>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ color: '#6B7280', fontSize: 13 }}>{go.members?.length || 0} members</span>
                      <span style={{ color: '#FF8C42', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, letterSpacing: 2 }}>#{go.code}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, background: `${statusColors[displayStatus]}20`, color: statusColors[displayStatus], fontFamily: 'Syne', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', marginBottom: 8 }}>
                    {displayStatus}
                  </span>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, color: '#1F2937', fontSize: 16 }}>₹{go.total || 0}</div>
                  <div style={{ color: '#6B7280', fontSize: 12 }}>{new Date(go.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
