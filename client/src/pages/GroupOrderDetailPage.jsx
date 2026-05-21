
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupAPI } from '../services/api';
import GroupRoom from '../components/group/GroupRoom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function GroupOrderDetailPage() {
  const { id } = useParams();
  const [groupOrder, setGroupOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await groupAPI.getById(id);
        setGroupOrder(res.data.groupOrder);
      } catch (err) {
        toast.error('Group order not found');
        navigate('/group-orders');
      } finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <div style={{ padding: 40 }}><LoadingSpinner text="Loading group order..." /></div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <button onClick={() => navigate('/group-orders')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600, fontSize: 14, marginBottom: 24, padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        ← Back to Group Orders
      </button>
      <GroupRoom groupOrder={groupOrder} onUpdate={setGroupOrder} />
    </div>
  );
}
