import React, { useState, useEffect } from "react";
import styles from "../styles/Header.module.css";
import { FiMenu, FiShoppingCart } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import {
  TbRosetteDiscount,
  TbApple,
  TbCarrot,
  TbBuildingStore,
  TbUserCircle,TbChevronRight
} from "react-icons/tb";
import SearchBar from "./SearchBar";
import Logo from "../assets/logo.svg";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const { isAuthenticated, userData, login, logout } = useAuth();  // Importa `login` y `logout` del contexto
  const navigate = useNavigate();

  useEffect(() => {
    if (isNavbarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isNavbarOpen]);

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  return (
    <div className={styles.Header}>
      <div className={styles["header-container"]}>
        <div className={styles.content}>
          <div className={styles.firstContent}>
            <FiMenu onClick={toggleNavbar} />
            <Link to="/">
              <img src={Logo} alt="Logo" />
            </Link>
          </div>
          <div className={styles.thirdContent}>
          {isAuthenticated ? (
              <div>
                {userData ? (
                  <p>Hola {userData.name || userData.nickname}</p>  // Saluda al usuario
                ) : (
                  <p>Cargando...</p>
                )}
                <button onClick={logout}>Logout</button>
              </div>
            ) : (
              <div>
                {/* Este botón ahora llama a login() que redirige a Auth0 */}
                <button onClick={login}>Ingresar</button>  
                <button onClick={() => navigate("/crear-cuenta")}>
                  Crear cuenta
                </button>
              </div>
            )}
          </div>
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
                  <img src={Logo} alt="Logo" />
                  <MdClose onClick={toggleNavbar} />
                </div>
                <div className={styles["navbarMain"]}>
                  <Link to="/tienda">
                    <div className={styles["navbar-option"]}>
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
                      <div className={styles["navbarAccountOffRight"]}> <TbChevronRight /></div>
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
