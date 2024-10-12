import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Cargando...</div>;  // Puedes mostrar un spinner
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
