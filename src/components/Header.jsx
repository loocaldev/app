import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Header.module.css";
import { useAdvancedSearch } from "../hooks/useAdvancedSearch";
import {
  FiMapPin,
  FiMenu,
  FiShoppingCart,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import useScreenSize from "../hooks/useScreenSize.js";
import { MdClose } from "react-icons/md";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { getAllProducts } from "../api/products.api";
import ProductCardHZ from "./ProductCardHZ.jsx";
import ProductCardSQ from "./ProductCardSQ.jsx";
import AddressForm from "./Forms/AddressForm";
import { AVAILABLE_CITIES } from "../data/departamentosYMunicipios";
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
import Fuse from "fuse.js";

function Header() {
  const [searchNavQuery, setsearchNavQuery] = useState("");
  const {
    token,
    isAuthenticated,
    logout,
    userData,
    addresses,
    getAddresses,
    setPrimaryAddress,
    addAddress,
  } = useAuth();
  const [searchResults, setSearchResults] = useState([]);
  
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const navigate = useNavigate();
  const isMobile = useScreenSize();

  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false); // Estado de depuración

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempAddress, setTempAddress] = useState(() => {
    const savedTempAddress = JSON.parse(localStorage.getItem("tempAddress"));
    return savedTempAddress || { departament: "", town: "", address: "" };
  });
  const [isCityValid, setIsCityValid] = useState(true);
  

  const validateCity = (city) => {
    const isValid = AVAILABLE_CITIES.includes(city.toUpperCase());
    setIsCityValid(isValid);
    return isValid;
  };

  const dropdownMenuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false); // Cierra el menú
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isNavbarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isNavbarOpen]);

  useEffect(() => {
    if (isAuthenticated) {
      getAddresses();
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      const savedAddress = localStorage.getItem("tempAddress");
      if (savedAddress) {
        setSelectedAddress(JSON.parse(savedAddress));
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      const savedAddress = localStorage.getItem("tempAddress");
      if (savedAddress) {
        setSelectedAddress(JSON.parse(savedAddress)); // Carga la dirección desde localStorage
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && addresses.length > 0) {
      const defaultAddress = addresses.find((address) => address.is_default);
      setSelectedAddress(defaultAddress || addresses[0]);
    }
  }, [addresses]);

  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);
  const toggleDebugMode = () => setIsDebugMode(!isDebugMode);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleOpenPopup = () => {
    const savedTempAddress = JSON.parse(localStorage.getItem("tempAddress")) || {
      departament: "",
      town: "",
      address: "",
    };
    setTempAddress(savedTempAddress); // Sincroniza el estado con el `localStorage`
    setIsPopupOpen(true); // Abre el popup
  };

  useEffect(() => {
    if (isPopupOpen) {
      // Sincroniza tempAddress con localStorage cada vez que se abre el popup
      const savedTempAddress = JSON.parse(localStorage.getItem("tempAddress")) || {
        departament: "",
        town: "",
        address: "",
      };
      setTempAddress(savedTempAddress);
    }
  }, [isPopupOpen]);

  useEffect(() => {
    async function fetchProducts() {
      const res = await getAllProducts();
      setProducts(res.data);
    }
    fetchProducts();
  }, []);
  // En el useEffect de búsqueda avanzada
  const suggestions = useAdvancedSearch(products, searchNavQuery);
useEffect(() => {
  const fetchSuggestions = async () => {
    if (searchNavQuery.trim() === "") {
      setSuggestions([]);
      setIsDropdownVisible(false);
      return;
    }

    try {
      const response = await getAllProducts();

      const fuse = new Fuse(response.data, {
        keys: ["name"],
        threshold: 0.3,
        distance: 100,
        includeMatches: true, // Incluye información sobre las coincidencias
        ignoreLocation: true,
      });

      const normalizeText = (text) => 
        text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      const results = fuse.search(normalizeText(searchNavQuery));
      
      const highlightedResults = results.map((result) => {
        const { item, matches } = result;
      
        let highlightedName = item.name;
      
        if (matches) {
          matches.forEach((match) => {
            if (match.key === "name") {
              const originalName = item.name; // Guarda el nombre original
              const normalizedOriginal = normalizeText(originalName); // Normalizado
              const normalizedQuery = normalizeText(searchNavQuery); // Normalizado
      
              const highlightedParts = [];
              let lastIndex = 0;
      
              // Encuentra coincidencias basadas en los índices del texto normalizado
              match.indices.forEach(([start, end]) => {
                // Obtén los índices correspondientes en el texto original
                const originalStart = normalizedOriginal
                  .slice(0, start)
                  .length; // Mapear inicio
                const originalEnd = normalizedOriginal
                  .slice(0, end + 1)
                  .length; // Mapear final
      
                // Agrega la parte no resaltada
                highlightedParts.push(originalName.slice(lastIndex, originalStart));
      
                // Agrega la parte resaltada
                highlightedParts.push(
                  `<mark>${originalName.slice(originalStart, originalEnd)}</mark>`
                );
      
                // Actualiza el índice
                lastIndex = originalEnd;
              });
      
              // Agrega la parte restante del texto
              highlightedParts.push(originalName.slice(lastIndex));
      
              // Une las partes resaltadas
              highlightedName = highlightedParts.join("");
            }
          });
        }
      
        return {
          ...item,
          highlightedName: highlightedName || item.name,
        };
      });

      setSuggestions(highlightedResults);
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

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setPrimaryAddress(address.id); // Cambia la dirección principal en el backend
    setIsDropdownOpen(false);
  };

  const handleAddTempAddress = (e) => {
    e.preventDefault();
    setSelectedAddress(tempAddress); // Guarda la dirección temporal
    setIsPopupOpen(false);
    if (tempAddress.address.length < 15) {
      console.error("La dirección debe tener al menos 15 caracteres.");
      return; // Detener el flujo si la dirección no es válida
    }
  };

  const handleMunicipioChange = (e) => {
    const selectedCity = e.target.value; // Obtén el valor de la ciudad seleccionada
    setTempAddress((prev) => ({ ...prev, town: selectedCity })); // Actualiza la ciudad en el estado temporal de dirección

    // Validar si la ciudad seleccionada está en las ciudades disponibles
    const isValid = validateCity(selectedCity);
    setIsCityValid(isValid); // Actualiza el estado de la validación
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();

    if (!tempAddress.address || !tempAddress.town || !tempAddress.departament) {
      console.error("Todos los campos son obligatorios");
      return;
    }

    if (isAuthenticated) {
      const isDefault = addresses.length === 0;

      const newAddress = {
        street: tempAddress.address,
        city: tempAddress.town,
        state: tempAddress.departament,
        postal_code: "000000",
        country: "Colombia",
        is_default: isDefault,
      };

      try {
        const addedAddress = await addAddress(newAddress);
        if (addedAddress) {
          setIsPopupOpen(false);
          setTempAddress({ departament: "", town: "", address: "" });
          getAddresses();

          if (isDefault) {
            setPrimaryAddress(addedAddress.id);
          }
        }
      } catch (error) {
        console.error("Error al guardar la dirección:", error);
      }
    } else {
      // Para usuarios no autenticados
      localStorage.setItem("tempAddress", JSON.stringify(tempAddress));
      setSelectedAddress(tempAddress); // Asegura la actualización inmediata
      setTempAddress({ departament: "", town: "", address: "" }); // Limpia el formulario
      setIsPopupOpen(false);
    }
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
            <div
              className={styles["dropdown-container"]}
              onClick={(e) => e.stopPropagation()}
              ref={dropdownRef}
            >
              <div className={styles["dropdown-container-in"]}>
                {isMobile ? (
                  <>
                    {suggestions.length > 0 ? (
                        suggestions.map((product) => (
                          <ProductCardHZ
                            key={product.id}
                            product={product}
                            onClick={(e) => e.stopPropagation()}
                            highlightedName={product.highlightedName || product.name} // Pasa el nombre resaltado
                          />
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
                        <ProductCardSQ
                          key={product.id}
                          product={product}
                          onClick={(e) => e.stopPropagation()}
                          highlightedName={product.highlightedName || product.name}
                        />
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
                    <img
                      onClick={() => navigate("/")}
                      src={LogoIso}
                      alt="Logo"
                    />
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
                        <div className={styles["menu-item"]}>
                          Mis direcciones
                        </div>
                      </Link>

                      <Link to="/perfil" state={{ section: "ProfileOrders" }}>
                        <div className={styles["menu-item"]}>Mis pedidos</div>
                      </Link>

                      <div
                        className={styles["menu-item"]}
                        onClick={handleLogout}
                      >
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
              {isAuthenticated ? (
                <div className={styles["address-selector"]}>
                  <FiMapPin />
                  {selectedAddress ? (
                    <span onClick={() => setIsDropdownOpen((prev) => !prev)}>
                      {selectedAddress.street}, {selectedAddress.city}
                      {isDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </span>
                  ) : (
                    <span onClick={() => handleOpenPopup()}>
                      Añadir dirección
                    </span>
                  )}
                  {isDropdownOpen && (
                    <div
                      className={styles["dropdown-menu"]}
                      ref={dropdownMenuRef}
                    >
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={styles["dropdown-item"]}
                          onClick={() => handleAddressSelect(address)}
                        >
                          {address.street}, {address.city}
                        </div>
                      ))}
                      <div
                        className={styles["dropdown-item"]}
                        onClick={handleOpenPopup}
                      >
                        Añadir nueva dirección
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <span onClick={() => setIsPopupOpen(true)}>
                  {selectedAddress?.address && selectedAddress?.town
                    ? `${selectedAddress.address}, ${selectedAddress.town}`
                    : "Añadir dirección"}
                </span>
              )}
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
                      <div className={styles["navbar-option-bottom"]}>
                        Legal
                      </div>
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
      {/* Popup para añadir dirección */}
      {isPopupOpen && (
        <div
          className={styles["popup-overlay"]}
          onClick={() => setIsPopupOpen(false)}
        >
          <div
            className={styles["popup-content"]}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              {isAuthenticated ? "Añadir nueva dirección" : "Tu dirección"}
            </h3>
            <AddressForm
              formData={tempAddress}
              onDepartamentoChange={(e) =>
                setTempAddress({
                  ...tempAddress,
                  departament: e.target.value,
                  town: "",
                })
              }
              onMunicipioChange={handleMunicipioChange}
              onAddressChange={(e) => {
                const value = e.target.value;

                setTempAddress((prevAddress) => ({
                  ...prevAddress,
                  address: value,
                }));

                // Validación
                if (value.length < 15) {
                  console.error(
                    "La dirección debe tener al menos 15 caracteres."
                  );
                }
              }}
            />

            {!isCityValid && (
              <div className="errorMessage">
                Actualmente solo entregamos en: {AVAILABLE_CITIES.join(", ")}.
              </div>
            )}
            {tempAddress.address.length < 15 && (
              <div className="errorMessage2">
                Asegúrate de incluir una dirección válida.
              </div>
            )}

            <button
              onClick={handleAddAddress}
              disabled={
                !tempAddress.address ||
                tempAddress.address.length < 15 ||
                !tempAddress.town ||
                !tempAddress.departament ||
                !isCityValid
              }
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
