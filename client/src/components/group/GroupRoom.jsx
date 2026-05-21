
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { initiateRazorpayPayment } from '../../services/razorpay';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export default function GroupRoom({ groupOrder: initialGroup, onUpdate }) {
  const [groupOrder, setGroupOrder] = useState(initialGroup);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showFinalize, setShowFinalize] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [payingShare, setPayingShare] = useState(false);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const { user } = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState('');
  const isCreator = String(groupOrder?.creator?._id || groupOrder?.creator) === String(user?._id);

  // Socket.IO connection
  useEffect(() => {
    if (!groupOrder || !user) return;

    const sock = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    setSocket(sock);

    sock.on('connect', () => {
      sock.emit('joinGroupRoom', { groupCode: groupOrder.code, userId: user._id, userName: user.name });
    });

    // Real-time event handlers
    sock.on('memberJoined', ({ user: newUser }) => {
      toast.success(`${newUser.name} joined the group!`);
      setGroupOrder(prev => ({
        ...prev,
        members: [...(prev.members || []), { user: newUser, name: newUser.name, avatar: newUser.avatar, subtotal: 0 }]
      }));
    });

    sock.on('itemAdded', ({ item, groupOrder: updatedSummary }) => {
      if (item.addedBy !== user._id) {
        toast(`${item.addedByName} added ${item.name}!`, { icon: 'New' });
      }
      setGroupOrder(prev => {
        // Check if item from same user exists
        const existIdx = prev.items?.findIndex(i => i.menuItem === item.menuItem && i.addedBy === item.addedBy);
        let newItems;
        if (existIdx >= 0) {
          newItems = prev.items.map((i, idx) => idx === existIdx ? { ...i, quantity: i.quantity + item.quantity } : i);
        } else {
          newItems = [...(prev.items || []), item];
        }
        return {
          ...prev,
          items: newItems,
          subtotal: updatedSummary.subtotal,
          tax: updatedSummary.tax,
          total: updatedSummary.total,
          members: updatedSummary.members || prev.members
        };
      });
    });

    sock.on('itemRemoved', ({ itemIndex, groupOrder: updatedSummary }) => {
      setGroupOrder(prev => {
        const newItems = [...(prev.items || [])];
        newItems.splice(itemIndex, 1);
        return { ...prev, items: newItems, ...updatedSummary };
      });
    });

    sock.on('userOnline', ({ userId, userName }) => {
      setOnlineUsers(prev => [...new Set([...prev, userId])]);
      toast(`${userName} is online`, { icon: 'Online' });
    });

    sock.on('userOffline', ({ userId }) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    });

    sock.on('orderFinalized', ({ orderId }) => {
      if (isCreator) {
        toast.success('Order has been placed!');
        navigate(`/orders/${orderId}`);
        return;
      }
      toast.success('Order finalized. Pay your share now.');
      setGroupOrder((prev) => ({ ...prev, status: 'locked', finalOrder: orderId }));
    });

    return () => {
      sock.emit('leaveGroupRoom', { groupCode: groupOrder.code, userId: user._id, userName: user.name });
      sock.disconnect();
    };
  }, [groupOrder?.code, user]);

  // Timer countdown
  useEffect(() => {
    if (!groupOrder?.closesAt) return;
    const update = () => {
      const diff = new Date(groupOrder.closesAt) - new Date();
      if (diff <= 0) { setTimeLeft('Expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h > 0 ? h + 'h ' : ''}${m}m ${s}s`);
    };
    update();
    timerRef.current = setInterval(update, 1000);
    return () => clearInterval(timerRef.current);
  }, [groupOrder?.closesAt]);

  const handleRemoveItem = async (index) => {
    try {
      const res = await groupAPI.removeItem(groupOrder._id, index);
      setGroupOrder(res.data.groupOrder);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const handleFinalize = async () => {
    if (!address.trim()) { toast.error('Please enter delivery address'); return; }
    setFinalizing(true);
    try {
      const res = await groupAPI.finalize(groupOrder._id, { deliveryAddress: address, paymentMethod });
      toast.success('Group order placed!');
      navigate(`/orders/${res.data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to finalize order');
    } finally { setFinalizing(false); }
  };

  const currentMember = (groupOrder?.members || []).find(
    (member) => String(member.user?._id || member.user) === String(user?._id)
  );

  const handlePayMyShare = async () => {
    setPayingShare(true);
    try {
      const paymentRes = await groupAPI.createMemberPaymentOrder(groupOrder._id);
      const { razorpayOrderId, key, amount } = paymentRes.data;

      const options = {
        key,
        order_id: razorpayOrderId,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'Riviggy',
        description: `Group Order Share #${groupOrder._id}`,
        method: { upi: true },
        handler: async (response) => {
          const verifyRes = await groupAPI.verifyMemberPayment(
            groupOrder._id,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
          setGroupOrder(verifyRes.data.groupOrder);
          toast.success('Your share payment is successful!');
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: { color: '#FF8C42' }
      };

      await initiateRazorpayPayment(options);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to process share payment');
    } finally {
      setPayingShare(false);
    }
  };

  // Group items by user
  const itemsByUser = {};
  (groupOrder?.items || []).forEach(item => {
    const uid = item.addedBy?._id || item.addedBy;
    const uname = item.addedByName || item.addedBy?.name || 'Unknown';
    if (!itemsByUser[uid]) itemsByUser[uid] = { name: uname, items: [] };
    itemsByUser[uid].items.push(item);
  });

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${groupOrder.code}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied!');
  };

  if (!groupOrder) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
      {/* Main area */}
      <div>
        {/* Room header */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div className="live-indicator" style={{ marginBottom: 8 }}>
                <div className="live-dot" />
                <span style={{ color: '#22C55E', fontFamily: 'Syne', fontSize: 13, fontWeight: 600 }}>LIVE GROUP ORDER</span>
              </div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 24, color: '#1F2937', margin: 0 }}>{groupOrder.name}</h2>
              <p style={{ color: '#6B7280', fontSize: 14, margin: '4px 0 0 0' }}>
                {groupOrder.restaurant?.name} · {groupOrder.members?.length || 0} members
              </p>
            </div>
            {timeLeft && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#6B7280', fontSize: 12, fontFamily: 'Syne', marginBottom: 4 }}>CLOSES IN</div>
                <div style={{ color: timeLeft === 'Expired' ? '#EF4444' : '#FF8C42', fontFamily: 'Syne', fontWeight: 800, fontSize: 20 }}>{timeLeft}</div>
              </div>
            )}
          </div>

          {/* Invite code */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#FFFFFF', padding: '12px 16px', borderRadius: 12 }}>
            <div>
              <div style={{ color: '#6B7280', fontSize: 12, fontFamily: 'Syne', fontWeight: 600 }}>INVITE CODE</div>
              <div style={{ color: '#FF8C42', fontFamily: 'Syne', fontWeight: 800, fontSize: 22, letterSpacing: 4 }}>{groupOrder.code}</div>
            </div>
            <button onClick={copyInviteLink} style={{ marginLeft: 'auto', background: 'rgba(255,140,66,0.15)', border: '1px solid rgba(255,140,66,0.3)', color: '#FF8C42', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600, fontSize: 13 }}>
              Copy Link
            </button>
          </div>
        </div>

        {/* Items by user */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: '#1F2937', marginTop: 0, marginBottom: 20 }}>
            Order Items
          </h3>

          {Object.keys(itemsByUser).length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>Menu</div>
              <p style={{ color: '#6B7280', fontFamily: 'Syne' }}>No items yet. Go to the menu and add your favorites.</p>
            </div>
          ) : (
            Object.entries(itemsByUser).map(([uid, { name, items }]) => {
              const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
              const isMe = uid === user._id;
              return (
                <div key={uid} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #D9C9AE' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #FF8C42, #FF8C42)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: 'white' }}>
                        {name[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontFamily: 'Syne', fontWeight: 600, color: isMe ? '#FF8C42' : '#1F2937', fontSize: 15 }}>
                        {name} {isMe && '(You)'}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'Syne', fontWeight: 700, color: '#1F2937' }}>₹{subtotal}</span>
                  </div>
                  {items.map((item, i) => {
                    const globalIdx = groupOrder.items?.findIndex(gi => 
                      gi.name === item.name && (gi.addedBy?._id || gi.addedBy) === uid
                    );
                    const canRemove = isMe || isCreator;
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', paddingLeft: 40 }}>
                        <span style={{ color: '#6B7280', fontSize: 14 }}>{item.name} × {item.quantity}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ color: '#1F2937', fontSize: 14, fontFamily: 'Syne', fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                          {canRemove && groupOrder.status === 'active' && (
                            <button onClick={() => handleRemoveItem(globalIdx >= 0 ? globalIdx : i)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>X</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}

          {/* Add items button */}
          {groupOrder.status === 'active' && (
            <button
              onClick={() => navigate(`/restaurant/${groupOrder.restaurant?._id}?groupId=${groupOrder._id}`)}
              style={{ width: '100%', padding: '14px', background: 'rgba(255,140,66,0.1)', border: '2px dashed rgba(255,140,66,0.4)', borderRadius: 12, color: '#FF8C42', fontFamily: 'Syne', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 8 }}
            >
              + Add Items from Menu
            </button>
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Members */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: '#1F2937', marginTop: 0, marginBottom: 16 }}>Members ({groupOrder.members?.length || 0})</h3>
          {groupOrder.members?.map((member, i) => {
            const uid = member.user?._id || member.user;
            const uname = member.name || member.user?.name;
            const isOnline = uid === user._id || onlineUsers.includes(uid);
            const memberIsCreator = uid === (groupOrder.creator?._id || groupOrder.creator);
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #FF8C42, #FF8C42)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: 'white', border: isOnline ? '2px solid #22C55E' : '2px solid transparent' }}>
                      {uname?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: isOnline ? '#22C55E' : '#6B7280', border: '1px solid #FFFDF8' }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 14, color: uid === user._id ? '#FF8C42' : '#1F2937' }}>
                      {uname} {uid === user._id && '(You)'}
                    </div>
                    {memberIsCreator && <div style={{ fontSize: 11, color: '#FF8C42', fontFamily: 'Syne', fontWeight: 600 }}>Creator</div>}
                  </div>
                </div>
                <span style={{ color: '#6B7280', fontSize: 13, fontFamily: 'Syne' }}>₹{member.subtotal || 0}</span>
              </div>
            );
          })}
        </div>

        {/* Bill Summary */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: '#1F2937', marginTop: 0, marginBottom: 16 }}>Bill Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Subtotal', value: `₹${groupOrder.subtotal || 0}` },
              { label: 'Delivery Fee', value: `₹${groupOrder.deliveryFee || 0}` },
              { label: 'Tax (5%)', value: `₹${groupOrder.tax || 0}` },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280', fontSize: 14 }}>{row.label}</span>
                <span style={{ color: '#1F2937', fontSize: 14, fontFamily: 'Syne', fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #D9C9AE', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: '#1F2937' }}>Total</span>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: '#84CC16' }}>₹{groupOrder.total || 0}</span>
            </div>
          </div>

          {/* Split Bill button */}
          <button
            onClick={() => navigate(`/split-bill/${groupOrder._id}`)}
            style={{ width: '100%', marginTop: 16, padding: '12px', background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: 12, color: '#EC4899', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            View Split Bill
          </button>

          {/* Finalize (creator only) */}
          {isCreator && groupOrder.status === 'active' && (groupOrder.items?.length > 0) && (
            <>
              {!showFinalize ? (
                <button
                  onClick={() => setShowFinalize(true)}
                  style={{ width: '100%', marginTop: 12, padding: '14px', background: 'linear-gradient(135deg, #84CC16, #84CC16)', border: 'none', borderRadius: 12, color: 'white', fontFamily: 'Syne', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                >
                  Finalize Order
                </button>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <input
                    className="input-field"
                    style={{ width: '100%', padding: '10px 12px', fontSize: 14, marginBottom: 10 }}
                    placeholder="Delivery address..."
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                  <div style={{ marginTop: 10, marginBottom: 10 }}>
                    <label style={{ color: '#6B7280', fontSize: 12, fontFamily: 'Syne', fontWeight: 600, display: 'block', marginBottom: 8 }}>PAYMENT METHOD</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[{ v: 'cod', l: 'Cash on Delivery' }, { v: 'upi', l: 'Online' }].map(opt => (
                        <button key={opt.v} onClick={() => setPaymentMethod(opt.v)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: paymentMethod === opt.v ? '1px solid #FF8C42' : '1px solid #D9C9AE', background: paymentMethod === opt.v ? 'rgba(255,140,66,0.1)' : '#FFFFFF', color: paymentMethod === opt.v ? '#FF8C42' : '#6B7280', cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600, fontSize: 12 }}>
                          {opt.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setShowFinalize(false)} style={{ flex: 1, padding: '10px', background: '#FFFFFF', border: '1px solid #D9C9AE', borderRadius: 10, color: '#6B7280', cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600, fontSize: 13 }}>Cancel</button>
                    <button onClick={handleFinalize} disabled={finalizing} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #84CC16, #84CC16)', border: 'none', borderRadius: 10, color: 'white', cursor: 'pointer', fontFamily: 'Syne', fontWeight: 700, fontSize: 13, opacity: finalizing ? 0.7 : 1 }}>
                      {finalizing ? '...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {!isCreator && groupOrder.status === 'locked' && ['upi', 'online'].includes(groupOrder.paymentMethod) && currentMember && (
            <div style={{ marginTop: 12 }}>
              <div style={{ background: 'rgba(255,140,66,0.08)', border: '1px solid rgba(255,140,66,0.25)', borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
                <div style={{ color: '#6B7280', fontSize: 12, fontFamily: 'Syne' }}>Your Share</div>
                <div style={{ color: '#1F2937', fontFamily: 'Syne', fontWeight: 800, fontSize: 20 }}>₹{Math.round(currentMember.splitAmount || 0)}</div>
              </div>
              <button
                onClick={handlePayMyShare}
                disabled={payingShare || currentMember.paymentStatus === 'paid'}
                style={{ width: '100%', padding: '12px', background: currentMember.paymentStatus === 'paid' ? '#22C55E' : 'linear-gradient(135deg, #FF8C42, #FF8C42)', border: 'none', borderRadius: 10, color: 'white', cursor: currentMember.paymentStatus === 'paid' ? 'default' : 'pointer', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, opacity: payingShare ? 0.7 : 1 }}
              >
                {currentMember.paymentStatus === 'paid' ? 'Paid' : payingShare ? 'Processing...' : 'Pay My Share'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
