
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function JoinGroupPage() {
  const { code } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/join/${code}`);
      return;
    }
    const join = async () => {
      try {
        const res = await groupAPI.joinByCode(code);
        toast.success('Joined group order!');
        navigate(`/group-orders/${res.data.groupOrder._id}`);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to join group order');
        navigate('/group-orders');
      }
    };
    join();
  }, [code, user]);

  return <div style={{ padding: 80 }}><LoadingSpinner text={`Joining group order ${code}...`} /></div>;
}
