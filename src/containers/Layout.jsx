import React from 'react'
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import Cart from '../components/Cart';

import styles from "../styles/Layout.module.css"
import Footer from '../components/Footer';

const Layout = ({ children }) => {
    const location = useLocation();
    const isCanvasPage = location.pathname === "/login";
  
    return (
      <>
        {!isCanvasPage && <Header />}
        <div className={styles.Layout}>{children}
        {/* <Cart /> */}
        </div>
        <Cart />
        {!isCanvasPage && <Footer />}
      </>
    );
  }

export default Layout