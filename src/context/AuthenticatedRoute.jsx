import React, { useContext, useState, useEffect } from "react";
import { Routes, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import styles from "../styles/AuthenticatedRoute.module.css"

const AuthenticatedRoute = ({ component: Component, ...props }) => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const delay = setTimeout(() => {
      setLoading(false);
    }, 10); // Cambia el valor a la cantidad de milisegundos que desees de retraso

    return () => clearTimeout(delay);
  }, []);

  if (loading) {
    return <div>Cargando...</div>; // O un spinner u otra pantalla de carga
  }

  return isAuthenticated ? <Component {...props} /> : <Navigate to="/login" />;
};

export default AuthenticatedRoute;
