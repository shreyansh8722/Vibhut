import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Standard User Protection
 */
export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-heritage-paper">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-heritage-rudraksha"></div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

/**
 * Database-Driven Admin Protection
 */
export const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-heritage-paper">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-heritage-rudraksha"></div>
      </div>
    );
  }

  // Logic: Only allow access if 'role' in database is exactly 'admin'
  const isAdmin = user && user.role === 'admin';

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;