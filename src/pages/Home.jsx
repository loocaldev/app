import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import SliderHome from "../components/SliderHome";
import styles from "../styles/Home.module.css";
import ListProducts from "../components/ListProducts";
import Faqs from "../components/Faqs";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <>
      <div className={styles["section-banner"]}>
        <SliderHome />
      </div>
      <div className={styles.MainBanner}>
        <h1>Encuentra productos frescos de alta calidad</h1>
        <p>Comprados directamente a productores locales</p>
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className={styles.Products}>
        <ListProducts searchQuery={searchQuery} />
        <button>Ver toda la tienda</button>
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
