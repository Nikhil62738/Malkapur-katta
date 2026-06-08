import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageSkeleton } from '../ui/SkeletonLoader';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  // Restrict to users holding this section permission.
  permission?: string;
  // Restrict to the super admin (sub-admin management).
  requireSuperAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  permission,
  requireSuperAdmin
}: ProtectedRouteProps) {
  const { currentUser, isAdmin, isSuperAdmin, hasPermission, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d] text-white">
        <div className="text-center">
          <PageSkeleton />
          <p className="mt-4 text-white/60 text-sm animate-pulse">Verifying administrator authorization...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/admin" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
