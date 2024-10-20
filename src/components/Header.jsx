import React, { useState, useEffect } from "react";
import styles from "../styles/Header.module.css";
import { FiMenu, FiShoppingCart } from "react-icons/fi";
import useScreenSize from "../hooks/useScreenSize.js";
import { MdClose } from "react-icons/md";
import {
  TbRosetteDiscount,
  TbApple,
  TbCarrot,
  TbBuildingStore,
  TbUserCircle,
  TbChevronRight,
} from "react-icons/tb";
import SearchBar from "./SearchBar";
import Logo from "../assets/logo.svg";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const { token, isAuthenticated, logout, userData } = useAuth();
  const navigate = useNavigate();
  const isMobile = useScreenSize();

  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  useEffect(() => {
    if (isNavbarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isNavbarOpen]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  const handleNavSide = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  return (
    <div className={styles.Header}>
      <div className={styles["header-container"]}>
        <div className={styles.content}>
          <div className={styles.firstContent}>
            <FiMenu onClick={toggleNavbar} />
            <img onClick={() => navigate("/")} src={Logo} alt="Logo" />
          </div>
          <div className={styles.secondContent}>
            <span>Buscar...</span>
          </div>
          <div className={styles.thirdContent}>
            {isAuthenticated ? (
              <div>
                {userData ? (
                  <p onClick={handleLogout}>Hola {userData.username}</p>
                ) : (
                  <p>Cargando...</p>
                )}
                <button onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <div>
                <button onClick={() => navigate("/login")}>Ingresar</button>
                <button onClick={() => navigate("/crear-cuenta")}>
                  Crear cuenta
                </button>
              </div>
            )}
          </div>
        </div>
        <div className={styles.SecondBar}>
          <div className={styles.SecondBarLeft}>
            <span>Ingresa tu dirección y recibe tu pedido en casa</span>
          </div>
          {isMobile ? (
            <></>
          ) : (
            <div className={styles.SecondBarRight}>
              <Link to="/tienda"><span>Ver todo</span></Link>
              <Link to="/tienda/frutas"><span>Frutas</span></Link>
              <Link to="/tienda/verduras"><span>Verduras y hortalizas</span></Link>
              <Link to="/tienda/Granos%20y%20cereales"><span>Granos y cereales</span></Link>
              <Link to="/tienda/productos%20organicos"><span>Productos orgánicos</span></Link>
              <Link to="/tienda/productos%20artesanales"><span>Productos artesanales</span></Link>
            </div>
          )}
        </div>
      </div>
      {isNavbarOpen && (
        <div className={styles.overlay} onClick={toggleNavbar}>
          <div
            className={`${styles.navbar} ${
              isNavbarOpen ? styles.open : styles.closed
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["navbarContent"]}>
              <div className={styles["navbarTop"]}>
                <div className={styles["navbarHead"]}>
                  <Link to="/">
                    <img onClick={handleNavSide} src={Logo} alt="Logo" />
                  </Link>
                  <MdClose onClick={toggleNavbar} />
                </div>
                <div className={styles["navbarMain"]}>
                  <Link to="/tienda">
                    <div
                      onClick={handleNavSide}
                      className={styles["navbar-option"]}
                    >
                      <TbBuildingStore /> Toda la tienda
                    </div>
                  </Link>
                  <Link to="/tienda">
                    <div className={styles["navbar-option"]}>
                      <TbApple /> Frutas
                    </div>
                  </Link>
                  <Link to="/tienda">
                    <div className={styles["navbar-option"]}>
                      <TbCarrot /> Verduras
                    </div>
                  </Link>
                  <Link to="/tienda">
                    <div className={styles["navbar-option"]}>
                      <TbRosetteDiscount /> Ofertas
                    </div>
                  </Link>
                </div>
              </div>
              <div className={styles["navbarBottom"]}>
                {isAuthenticated ? (
                  <div className={styles["navbarAccount"]}>
                    <span>Mi cuenta</span>
                    <Link to="/">
                      <div className={styles["navbar-option-bottom"]}>
                        Datos de mi cuenta
                      </div>
                    </Link>
                    <Link to="/">
                      <div className={styles["navbar-option-bottom"]}>
                        Mis direcciones
                      </div>
                    </Link>
                    <Link to="/">
                      <div className={styles["navbar-option-bottom"]}>
                        Necesito ayuda
                      </div>
                    </Link>
                  </div>
                ) : (
                  <Link to="/login">
                    <div className={styles["navbarAccountOff"]}>
                      <div className={styles["navbarAccountOffLeft"]}>
                        <TbUserCircle />
                        <p>Ingresar</p>
                      </div>
                      <div className={styles["navbarAccountOffRight"]}>
                        {" "}
                        <TbChevronRight />
                      </div>
                    </div>
                  </Link>
                )}

                <div className={styles["navbarInfo"]}>
                  <span>Información</span>
                  <Link to="/">
                    <div className={styles["navbar-option-bottom"]}>
                      Sobre Loocal
                    </div>
                  </Link>
                  <Link to="/">
                    <div className={styles["navbar-option-bottom"]}>
                      Soy productor
                    </div>
                  </Link>
                  <Link to="/">
                    <div className={styles["navbar-option-bottom"]}>Legal</div>
                  </Link>
                  <Link to="/">
                    <div className={styles["navbar-option-bottom"]}>
                      Trabaja con nosotros
                    </div>
                  </Link>
                  <p>Versión 1.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;
