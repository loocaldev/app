import React, { useState, useEffect } from "react";
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
  const navigate = useNavigate();
  const { token, isAuthenticated, logout, userData } = useAuth();
  const isMobile = useScreenSize();

  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
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
                <img onClick={() => navigate("/")} src={Logo} alt="Logo" />
              </div>
              <div className={styles["header-title"]}>
                <FiChevronLeft onClick={() => window.history.back()} />
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
                      {isProfileMenuOpen ? (
                        <IoIosArrowUp />
                      ) : (
                        <IoIosArrowDown />
                      )}
                    </div>
                    {/* Menú desplegable de perfil */}
                    {isProfileMenuOpen && (
                      <div className={styles["profile-menu"]}>
                        <Link to="/perfil" state={{ section: "ProfileDetail" }}>
                          <div className={styles["menu-item"]}>
                            Ajustes de mi cuenta
                          </div>
                        </Link>

                        <Link
                          to="/perfil"
                          state={{ section: "ProfileAddress" }}
                        >
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
              <span>Dirección</span>
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
    </>
  );
}

export default NewOrder;
