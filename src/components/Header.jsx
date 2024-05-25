import React, { useState } from "react";
import styles from "../styles/Header.module.css";

import { FiMenu, FiShoppingCart } from "react-icons/fi";
import SearchBar from "./SearchBar";
import Logo from "../assets/logo.svg";

function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className={styles.Header}>
      <div className={styles.content}>
        <div className={styles.firstContent}>
          <FiMenu />
          <img src={Logo} />
        </div>
        <div className={styles.secondContent}>
          <div className={styles.SearchBarWrapper}>
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
        <div className={styles.thirdContent}>
          <button>Ingresar</button>
          <button>Crear cuenta</button>
          <FiShoppingCart />
        </div>
      </div>
    </div>
  );
}

export default Header;
