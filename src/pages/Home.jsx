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
import personBanner from "../assets/personBanner.png";
import Carousel from "../components/Carousel.jsx";
import GridProducts from "../components/GridProducts.jsx";
import useScreenSize from "../hooks/useScreenSize.js";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const { token, isAuthenticated, logout, userData } = useAuth();
  const isMobile = useScreenSize();
  const navigate = useNavigate();

  const items = [
    {
      title: "Primer envío gratis",
      subtitle: "Recibe en casa sin costo adicional.",
      buttonText: "Comprar ahora",
      image: graphLoocal,
      background: "#EDE8EF",
    },
    {
      title: "Martes de promos",
      subtitle: "Ofertas a mitad de precio.",
      buttonText: "Ver productos",
      image:
        "https://multimedia.wenia.com/790x760/6e9c69b135/adquiere-usdc.png",
      background: "#FEF2EC",
    },
    // Agrega más elementos según sea necesario...
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <>
      {/* <div className={styles["section-banner"]}>
        <SliderHome />
      </div> */}
      <div className={styles["carousel-container"]}>
        <Carousel items={items} />
      </div>

      <div className={styles.Banner2}>
        <div className={styles.FirstBanner}>
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
          <div className={styles["cta-content"]}>
            <button
              onClick={() => navigate("/tienda")}
              className={styles["cta-desktop"]}
            >
              Ver toda la tienda
            </button>
          </div>
        </div>
        {isMobile ? (
          <div className={styles.SecondBanner}>
            <div className={styles.SecondProducts}>
            <div className={styles["searchbar-products"]}>
                <SearchBar onSearch={handleSearch} />
              </div>
              <ListProducts
                className={styles["products3"]}
                searchQuery={searchQuery}
              />
            </div>
            <div className={styles.SecondProducer}>
              <img
                className={styles.SecondProducerIMG}
                src={personBanner}
              ></img>
            </div>
          </div>
        ) : (
          <div className={styles.SecondBanner}>
            <div className={styles.SecondProducts}>
              <div className={styles["searchbar-products"]}>
                <SearchBar onSearch={handleSearch} />
              </div>
              <ListProducts
                className={styles["products3"]}
                searchQuery={searchQuery}
              />
            </div>
            <div className={styles.SecondProducer}>
              <img
                className={styles.SecondProducerIMG}
                src={personBanner}
              ></img>
            </div>
          </div>
        )}
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
