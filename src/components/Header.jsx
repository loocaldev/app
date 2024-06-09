import React, { useState } from "react";
import styles from "../styles/Header.module.css";

import { FiMenu, FiShoppingCart } from "react-icons/fi";
import SearchBar from "./SearchBar";
import Logo from "../assets/logo.svg";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const { token, isAuthenticated, logout, userData } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={styles.Header}>
      <div className={styles["header-container"]}>
        <div className={styles.content}>
          <div className={styles.firstContent}>
            <FiMenu />
            <img src={Logo} />
          </div>
          <div className={styles.thirdContent}>
            {isAuthenticated ? (
              <div>
                <p>Hola {userData.username}</p>
                <button onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <div>
                <button onClick={() => navigate("/login")}>Ingresar</button>
                <button>Crear cuenta</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
