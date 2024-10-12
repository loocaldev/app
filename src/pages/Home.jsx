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
import Carousel from "../components/Carousel.jsx";
import GridProducts from "../components/GridProducts.jsx";
const { fetchProtectedData, isAuthenticated } = useAuth();

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const { token, isAuthenticated, logout, userData } = useAuth();
  const navigate = useNavigate();

  const items = [
    {
      title: 'Primer envío gratis',
      subtitle: 'Recibe en casa sin costo adicional.',
      buttonText: 'Comprar ahora',
      image: graphLoocal,
      background: '#EDE8EF',
    },
    {
      title: 'Martes de promos',
      subtitle: 'Ofertas a mitad de precio.',
      buttonText: 'Ver productos',
      image: 'https://multimedia.wenia.com/790x760/6e9c69b135/adquiere-usdc.png',
      background: '#FEF2EC',
    },
    // Agrega más elementos según sea necesario...
  ];
  

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Función que maneja la carga de datos protegidos
  const loadProtectedData = async () => {
    try {
      const data = await fetchProtectedData();  // Llamar a la función del contexto
      setProtectedData(data);  // Guardar los datos protegidos en el estado
    } catch (err) {
      setError("Error al cargar los datos protegidos");
    }
  };


  return (
    <>
      {/* <div className={styles["section-banner"]}>
        <SliderHome />
      </div> */}
      <div className={styles["carousel-container"]}>
            <Carousel items={items} />
          </div>
      <div className={styles.Banner}>
        <div className={styles.MainBanner}>
          {/* <img src={graphLoocal}></img> */}
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
          <button onClick={() => navigate("/tienda")} className={styles["cta-desktop"]}>Ver toda la tienda</button>
          {/* Botón para cargar datos protegidos */}
          {isAuthenticated && (
            <div>
              <button onClick={loadProtectedData} className={styles["cta-desktop"]}>
                Cargar datos protegidos
              </button>
              {protectedData && (
                <pre>{JSON.stringify(protectedData, null, 2)}</pre>  // Mostrar los datos si se cargan correctamente
              )}
              {error && <p>{error}</p>}
            </div>
          )}
          </div>
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
            <button onClick={() => navigate("/tienda")} className={styles["cta-mobile"]}>Ver toda la tienda</button>
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
