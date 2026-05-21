
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupAPI } from '../services/api';
import BillSplit from '../components/group/BillSplit';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function SplitBillPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [groupOrder, setGroupOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [billRes, groupRes] = await Promise.all([groupAPI.getSplitBill(id), groupAPI.getById(id)]);
        setData(billRes.data);
        setGroupOrder(groupRes.data.groupOrder);
      } catch (err) {
        toast.error('Failed to load split bill');
      } finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <div style={{ padding: 40 }}><LoadingSpinner text="Calculating split..." /></div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <button onClick={() => navigate(`/group-orders/${id}`)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600, fontSize: 14, marginBottom: 24, padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        ← Back to Group Room
      </button>
      <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 32, color: '#1F2937', marginBottom: 8 }}>Split Bill</h1>
      <p style={{ color: '#6B7280', marginBottom: 32 }}>{groupOrder?.name} · {data?.summary?.memberCount} members</p>
      <BillSplit groupOrderId={id} breakdown={data?.breakdown} summary={data?.summary} />
    </div>
  );
}
