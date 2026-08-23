import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Public Pages
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

// Admin Pages
import LoginPage from './pages/admin/LoginPage';
import DashboardOverview from './pages/admin/DashboardOverview';
import ProductsManagement from './pages/admin/ProductsManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import NotificationsPage from './pages/admin/NotificationsPage';

// Protected Route Guard for Admin
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-cairo">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-bold text-sm">جاري التحقق من صلاحيات الدخول...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Visitor Routes (No Auth Needed) */}
      <Route path="/" element={<HomePage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/order-success/:id" element={<OrderSuccessPage />} />

      {/* Admin Auth Route */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Admin Dashboard Protected Routes */}
      <Route
        path="/admin"
        element={<Navigate to="/admin/dashboard" replace />}
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedAdminRoute>
            <DashboardOverview />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedAdminRoute>
            <ProductsManagement />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedAdminRoute>
            <OrdersManagement />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedAdminRoute>
            <NotificationsPage />
          </ProtectedAdminRoute>
        }
      />

      {/* Fallback 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
