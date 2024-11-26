import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/NewOrder.module.css";
import Logo from "../assets/logo.svg";
import ProductCardSQRead from "../components/ProductCardSQRead";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { useCart } from "../hooks/useCart";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useScreenSize from "../hooks/useScreenSize.js";
import ProductCardHZRead from "../components/ProductCardHZRead.jsx";
import AddressForm from "../components/Forms/AddressForm.jsx";
import { AVAILABLE_CITIES } from "../data/departamentosYMunicipios.js";

const formatPriceToCOP = (price) => {
  const numericPrice = Number(price);
  if (!isNaN(numericPrice)) {
    return numericPrice.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
};

function NewOrder() {
  const { cart, subtotal } = useCart();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate();
  const { token, isAuthenticated, logout, userData,addresses,
    getAddresses, etPrimaryAddress,
    addAddress,} = useAuth();
  const isMobile = useScreenSize();

  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [tempAddress, setTempAddress] = useState({
    departament: "",
    town: "",
    address: "",
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


  useEffect(() => {
    if (isNavbarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isNavbarOpen]);

  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  const handleSearch = (query) => {
    setSearchQuery(query);
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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  const handleOpenPopup = () => {
    const savedTempAddress = JSON.parse(localStorage.getItem("tempAddress")) || {
      departament: "",
      town: "",
      address: "",
    };
    setTempAddress(savedTempAddress); // Cargar los datos existentes o inicializar vacíos
    setIsPopupOpen(true); // Abre el popup
  };

  const handleConfirmOrder = () => {
    // Redirigir al checkout con los datos del carrito y subtotal
    navigate("/checkout", { state: { cart, subtotal } });
  };

  return (
    <>
      <div className={styles["canvas-container"]}>
        <div className={styles["canvas-box"]}>
          <div className={styles["canvas-header"]}>
            <div className={styles["header-first"]}>
              <div className={styles["header-logo"]}>
              <FiChevronLeft onClick={() => window.history.back()} />
                <img onClick={() => navigate("/")} src={Logo} alt="Logo" />
              </div>
              <div className={styles["header-title"]}>
                <h1>Resumen de tu compra</h1>
              </div>
              <div className={styles["header-profile"]}>
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
                    </div>
                  </div>
                ) : (
                  <div className={styles["buttons-profile"]}>
                    <button onClick={() => navigate("/login")}>Ingresar</button>
                    <button onClick={() => navigate("/crear-cuenta")}>
                      Crear cuenta
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className={styles["header-second"]}>
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
          </div>

          <div className={styles["canvas-content"]}>
            <div className={styles["order-content"]}>
              {cart &&
                cart.map((product) =>
                  isMobile ? (
                    <ProductCardHZRead key={product.id} product={product} />
                  ) : (
                    <ProductCardSQRead key={product.id} product={product} />
                  )
                )}
            </div>
          </div>
          <div className={styles["canvas-action"]}>
            <div className={styles["order-subtotal"]}>
              <div className={styles["order-subtotal-content"]}>
                <p>{formatPriceToCOP(subtotal)}</p>
                <span>
                  {cart.length} {cart.length === 1 ? "producto" : "productos"}
                </span>
              </div>
              <div
                className={styles["order-subtotal-button"]}
                onClick={handleConfirmOrder}
              >
                <p>Confirmar pedido</p>
                <FiChevronRight />
              </div>
            </div>
          </div>
        </div>
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
              onMunicipioChange={handleMunicipioChange} // Actualizamos la función
              onAddressChange={(e) =>
                setTempAddress({ ...tempAddress, address: e.target.value })
              }
            />
            {!isCityValid && (
              <div className="errorMessage">
                Actualmente solo entregamos en: {AVAILABLE_CITIES.join(", ")}.
              </div>
            )}
            <button
              onClick={handleAddAddress}
              disabled={
                !tempAddress.address ||
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

export default NewOrder;
