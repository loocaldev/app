import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Header.module.css";
import { FiMenu, FiShoppingCart } from "react-icons/fi";
import useScreenSize from "../hooks/useScreenSize.js";
import { MdClose } from "react-icons/md";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { getAllProducts } from "../api/products.api";
import ProductCardHZ from "./ProductCardHZ.jsx";
import ProductCardSQ from "./ProductCardSQ.jsx";
import {
  TbRosetteDiscount,
  TbApple,
  TbCarrot,
  TbBuildingStore,
  TbUserCircle,
  TbChevronRight,
} from "react-icons/tb";
import { FiSearch } from "react-icons/fi";
import SearchBar from "./SearchBar";
import Logo from "../assets/logo.svg";
import LogoIso from "../assets/logoiso.svg";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const [searchNavQuery, setsearchNavQuery] = useState("");
  const { token, isAuthenticated, logout, userData } = useAuth();
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const navigate = useNavigate();
  const isMobile = useScreenSize();

  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false); // Estado de depuración

  useEffect(() => {
    if (isNavbarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isNavbarOpen]);

  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);
  const toggleDebugMode = () => setIsDebugMode(!isDebugMode);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      // Evitar búsqueda si el campo está vacío
      if (searchNavQuery.trim() === "") {
        setSuggestions([]);
        setIsDropdownVisible(false);
        return;
      }
      try {
        const response = await getAllProducts();
        const filteredProducts = response.data.filter((product) =>
          product.name.toLowerCase().includes(searchNavQuery.toLowerCase())
        );
        setSuggestions(filteredProducts);
        setIsDropdownVisible(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };
    fetchSuggestions();
  }, [searchNavQuery]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setsearchNavQuery(value);

    // Solo mostrar el dropdown si el campo tiene texto
    if (value.trim() !== "") {
      setIsDropdownVisible(true);
    } else {
      setIsDropdownVisible(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchNavQuery.trim() !== "") {
      navigate(`/resultados?query=${encodeURIComponent(searchNavQuery)}`);
      setIsDropdownVisible(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleResultClick = (productId) => {
    navigate(`/producto/${productId}`);
    setIsDropdownVisible(false);
  };

  const handleSuggestionClick = (productName) => {
    navigate(`/resultados?query=${encodeURIComponent(productName)}`);
    setIsDropdownVisible(false);
  };

  const handleBlur = () => {
    if (!isDebugMode) {
      setTimeout(() => setIsDropdownVisible(false), 200); // Solo cierra si no está en modo depuración
    }
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
    <>
    
    <div className={styles.Header}>
    {isDropdownVisible && (
          <>
            <div
              className={styles["dropdown-overlay"]}
              onClick={() => setIsDropdownVisible(false)}
            ></div>
            <div className={styles["dropdown-container"]} onClick={(e) => e.stopPropagation()} ref={dropdownRef}>
              <div className={styles["dropdown-container-in"]}>
                {isMobile ? (
                  <>
                    {suggestions.length > 0 ? (
                      suggestions.map((product) => (
                        <ProductCardHZ key={product.id} product={product} onClick={(e) => e.stopPropagation()} />
                      ))
                    ) : (
                      <div className={styles["dropdown-no-results"]}>
                        No hay resultados para "{searchNavQuery}"
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {suggestions.length > 0 ? (
                      suggestions.map((product) => (
                        <ProductCardSQ key={product.id} product={product} onClick={(e) => e.stopPropagation()} />
                      ))
                    ) : (
                      <div className={styles["dropdown-no-results"]}>
                        No hay resultados para "{searchNavQuery}"
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      <div className={styles["header-container"]}>
        <div className={styles.content}>
          <div className={styles.firstContent}>
            <FiMenu onClick={toggleNavbar} />
            {/* Botón para alternar el modo de depuración */}
            <div style={{ position: "fixed", top: "10px", right: "10px" }}>
              {/* <button
                onClick={toggleDebugMode}
                style={{
                  padding: "8px",
                  background: isDebugMode ? "red" : "green",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                {isDebugMode ? "Salir de Depuración" : "Activar Depuración"}
              </button> */}
            </div>
            <div className={styles["logo-search-mobile"]}>
              {!isMobile ? (
                <>
                  <img onClick={() => navigate("/")} src={Logo} alt="Logo" />
                  <div className={styles["box-search-header"]}>
                    <input
                      type="text"
                      placeholder="Buscar en Loocal..."
                      value={searchNavQuery}
                      onChange={handleSearchChange}
                      onFocus={() => {
                        if (searchNavQuery.trim() !== "") {
                          setIsDropdownVisible(true);
                        }
                      }}
                      ref={inputRef} 
                      // onBlur={handleBlur}
                    />
                    <button
                      className={styles["searchButtonHeader"]}
                      onClick={handleSearchSubmit}
                    >
                      <FiSearch />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <img onClick={() => navigate("/")} src={LogoIso} alt="Logo" />
                  <div className={styles["box-search-header"]}>
                    <input
                      type="text"
                      placeholder="Buscar en Loocal..."
                      value={searchNavQuery}
                      onChange={handleSearchChange}
                      onFocus={() => {
                        if (searchNavQuery.trim() !== "") {
                          setIsDropdownVisible(true);
                        }
                      }}
                      // onBlur={handleBlur}
                    />
                    <button
                      className={styles["searchButtonHeader"]}
                      onClick={handleSearchSubmit}
                    >
                      <FiSearch />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* <div className={styles.secondContent}>
            <span>Buscar...</span>
          </div> */}
          <div className={styles.thirdContent}>
            {isAuthenticated ? (
              <div
                onClick={toggleProfileMenu}
                className={styles["profile-card"]}
              >
                {userData?.userprofile?.profile_picture ? (
                  <img
                    src={userData.userprofile.profile_picture}
                    alt="Foto de perfil"
                    className={styles["profile-picture"]}
                  />
                ) : (
                  <img
                    src="/default-placeholder.png"
                    alt="Sin foto de perfil"
                    className={styles["profile-picture"]}
                  />
                )}
                <div className={styles["username"]}>
                  <span>{userData?.first_name}</span>
                  {isProfileMenuOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </div>
                {/* Menú desplegable de perfil */}
                {isProfileMenuOpen && (
                  <div className={styles["profile-menu"]}>
                    <Link to="/perfil" state={{ section: "ProfileDetail" }}>
                      <div className={styles["menu-item"]}>
                        Ajustes de mi cuenta
                      </div>
                    </Link>

                    <Link to="/perfil" state={{ section: "ProfileAddress" }}>
                      <div className={styles["menu-item"]}>Mis direcciones</div>
                    </Link>

                    <Link to="/perfil" state={{ section: "ProfileOrders" }}>
                      <div className={styles["menu-item"]}>Mis pedidos</div>
                    </Link>

                    <div className={styles["menu-item"]} onClick={handleLogout}>
                      Cerrar sesión
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <button onClick={() => navigate("/login")}>Ingresar</button>
                <button onClick={() => navigate("/register")}>
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
              <Link to="/tienda">
                <span>Ver todo</span>
              </Link>
              <Link to="/tienda/frutas">
                <span>Frutas</span>
              </Link>
              <Link to="/tienda/verduras">
                <span>Verduras y hortalizas</span>
              </Link>
              <Link to="/tienda/Granos%20y%20cereales">
                <span>Granos y cereales</span>
              </Link>
              <Link to="/tienda/productos%20organicos">
                <span>Productos orgánicos</span>
              </Link>
              <Link to="/tienda/productos%20artesanales">
                <span>Productos artesanales</span>
              </Link>
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
    </>
  );
}

export default Header;
