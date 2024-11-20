import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Profile.module.css";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import ProfileDetail from "../components/Profile/profileDetail";
import ProfilePassword from "../components/Profile/profileChangePassword";
import ProfileAddress from "../components/Profile/profileAddress";
import ProfileOrders from "../components/Profile/profileOrders";
import useScreenSize from "../hooks/useScreenSize";
import { FaCamera } from "react-icons/fa";
import { TbChevronLeft } from "react-icons/tb";

function Profile() {
  const { userData, updateUser } = useAuth();
  const location = useLocation();
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const isMobile = useScreenSize(); // Detecta si estamos en móvil

  const [isNavVisible, setIsNavVisible] = useState(true); // Controla si se muestra la navegación
  const initialSection = location.state?.section || "ProfileDetail";
  const [selectedSection, setSelectedSection] = useState(initialSection);

  useEffect(() => {
    if (location.state?.section) {
      setSelectedSection(location.state.section);
    }
  }, [location.state?.section]);

  const renderContent = () => {
    switch (selectedSection) {
      case "ProfileDetail":
        return <ProfileDetail />;
      case "ProfilePassword":
        return <ProfilePassword />;
      case "ProfileAddress":
        return <ProfileAddress />;
      case "ProfileOrders":
        return <ProfileOrders />;
      default:
        return <ProfileDetail />;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const maxSize = 10 * 1024 * 1024;

    if (file && file.size > maxSize) {
      alert("El archivo es demasiado grande. Tamaño máximo permitido: 10 MB.");
      return;
    }

    setProfilePicture(file);
    handleUpload(file);
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async (file) => {
    if (!file) {
      alert("Por favor selecciona una imagen.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("profile_picture", file);

      const success = await updateUser(formData);
      alert("Foto de perfil actualizada exitosamente.");
    } catch (error) {
      console.error("Error al subir la foto de perfil:", error);
      alert("Error al actualizar la foto de perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handleNavSelection = (section) => {
    setSelectedSection(section);
    if (isMobile) {
      setIsNavVisible(false); // Oculta navegación en móvil
    }
  };

  const goBackToNav = () => {
    setIsNavVisible(true); // Muestra navegación en móvil
  };

  return (
    <div className={styles["container"]}>
      <div
        className={`${styles["content"]} ${
          isMobile
            ? isNavVisible
              ? styles["nav-visible"]
              : styles["content-visible"]
            : ""
        }`}
      >
        {/* Primera columna (Navegación) */}
        <div className={styles["first-column"]}>
          <div className={styles["profile-card"]}>
            <div className={styles["photo"]} onClick={handleImageClick}>
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
              <div className={styles["overlay"]}>
                <FaCamera className={styles["camera-icon"]} />
              </div>
            </div>
            <div className={styles["username"]}>
              <span>{userData?.first_name}</span>
            </div>
          </div>
          <div className={styles["navbar-vertical"]}>
            <div
              className={`${styles["navbar-option"]} ${
                selectedSection === "ProfileDetail"
                  ? styles["navbar-option-active"]
                  : ""
              }`}
              onClick={() => handleNavSelection("ProfileDetail")}
            >
              Datos de mi cuenta
            </div>
            <div
              className={`${styles["navbar-option"]} ${
                selectedSection === "ProfilePassword"
                  ? styles["navbar-option-active"]
                  : ""
              }`}
              onClick={() => handleNavSelection("ProfilePassword")}
            >
              Cambiar contraseña
            </div>
            <div
              className={`${styles["navbar-option"]} ${
                selectedSection === "ProfileAddress"
                  ? styles["navbar-option-active"]
                  : ""
              }`}
              onClick={() => handleNavSelection("ProfileAddress")}
            >
              Direcciones
            </div>
            <div
              className={`${styles["navbar-option"]} ${
                selectedSection === "ProfileOrders"
                  ? styles["navbar-option-active"]
                  : ""
              }`}
              onClick={() => handleNavSelection("ProfileOrders")}
            >
              Pedidos
            </div>
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {loading && <p>Subiendo...</p>}

        {/* Segunda columna (Contenido) */}
        <div className={styles["second-column"]}>
          {isMobile && !isNavVisible && (
            <button className={styles["back-button"]} onClick={goBackToNav}>
              <TbChevronLeft /> Volver
            </button>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Profile;
