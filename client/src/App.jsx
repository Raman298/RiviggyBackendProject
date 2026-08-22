
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout
import Navbar from './components/common/Navbar';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RestaurantPage from './pages/RestaurantPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import GroupOrderPage from './pages/GroupOrderPage';
import GroupOrderDetailPage from './pages/GroupOrderDetailPage';
import SplitBillPage from './pages/SplitBillPage';
import JoinGroupPage from './pages/JoinGroupPage';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid #D9C9AE', borderTop: '3px solid #FF8C42', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#6B7280', fontFamily: 'Syne' }}>Loading riviggy...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

// Layout with Navbar
const Layout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
);

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/join/:code" element={<JoinGroupPage />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Layout><HomePage /></Layout></ProtectedRoute>} />
        <Route path="/restaurant/:id" element={<ProtectedRoute><Layout><RestaurantPage /></Layout></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Layout><CartPage /></Layout></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Layout><OrdersPage /></Layout></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><Layout><OrderDetailPage /></Layout></ProtectedRoute>} />
        <Route path="/group-orders" element={<ProtectedRoute><Layout><GroupOrderPage /></Layout></ProtectedRoute>} />
        <Route path="/group-orders/:id" element={<ProtectedRoute><Layout><GroupOrderDetailPage /></Layout></ProtectedRoute>} />
        <Route path="/split-bill/:id" element={<ProtectedRoute><Layout><SplitBillPage /></Layout></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#FFFDF8',
              color: '#1F2937',
              border: '1px solid #D9C9AE',
              borderRadius: '12px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22C55E', secondary: '#FFFDF8' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#FFFDF8' } },
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
}
