import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import SliderHome from "../components/SliderHome";
import styles from "../styles/Home.module.css";
import ListProducts from "../components/ListProducts";
import Faqs from "../components/Faqs";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import graphLoocal from "../assets/graphLoccal2024.png";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const { token, isAuthenticated, logout, userData } = useAuth();

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <>
      <div className={styles["section-banner"]}>
        <SliderHome />
      </div>
      <div className={styles.Banner}>
        <div className={styles.MainBanner}>
          <img src={graphLoocal}></img>
          <h1>Encuentra productos frescos de alta calidad</h1>
          <p>Comprados directamente a productores locales.</p>
          <ul className={styles["highlights"]}>
            <li>
              <FiCheckCircle /> Recibe tu mercado en la puerta de tu casa
            </li>
            <li>
              <FiCheckCircle /> Comprale directamente a productores locales
            </li>
            <li>
              <FiCheckCircle /> Encuentra variedad de opciones en métodos de
              cultivo
            </li>
          </ul>
          <button className={styles["cta-desktop"]}>Ver toda la tienda</button>
        </div>

        <div className={styles.Products}>
          <div className={styles["searchbar-products"]}>
            <SearchBar onSearch={handleSearch} />
          </div>
          <div className={styles["content-products"]}>
            <ListProducts
              className={styles["products"]}
              searchQuery={searchQuery}
            />
            <button className={styles["cta-mobile"]}>Ver toda la tienda</button>
          </div>
        </div>
      </div>

      <div className={styles.Faqs}>
        <hr />
        <h3>
          ¿Tienes dudas?
          <br />
          Déjanos ayudarte
        </h3>
        <Faqs />
      </div>
    </>
  );
}

export default Home;
