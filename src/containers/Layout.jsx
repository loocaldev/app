import React from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import Cart from "../components/Cart";

import styles from "../styles/Layout.module.css";
import Footer from "../components/Footer";

const Layout = ({ children }) => {

  
  const location = useLocation();
  // Lista centralizada de rutas que deben ser CanvasPage
  const canvasPages = [
    "/login",
    "/order",
    "/checkout",
    "/crear-cuenta",
    "/crear-cuenta/detalles",
    "/reset-password",
    "/recover-password",
    "/register",
    "/create-profile",
  ];

  // Verifica si la ruta actual está en la lista
  const isCanvasPage = canvasPages.includes(location.pathname);

  return (
    <>
      {!isCanvasPage && <Header />}
      <div className={`${styles.Layout} ${isCanvasPage && styles.CanvasPage}`}>
        {children}
      </div>
      {!isCanvasPage && <Cart />}
      {!isCanvasPage && <Footer />}
    </>
  );
};

export default Layout;
