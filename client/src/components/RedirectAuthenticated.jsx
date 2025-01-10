import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RedirectAuthenticated = ({ children }) => {
  // Get user and role from Redux store
  const { user, role } = useSelector((state) => state.user);
  
  // Check if user is authenticated
  const isAuthenticated = !!user;

  if (isAuthenticated) {
    // Redirect based on user role
    switch (role) {
      case 'editor':
        return <Navigate to="/editor-dashboard" replace />;
      case 'creator':
        return <Navigate to="/creator-dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  // If not authenticated, render children
  return children;
};

export default RedirectAuthenticated;