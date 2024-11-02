// Profile.jsx
import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Profile.module.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import ProfileDetail from "../components/Profile/profileDetail";
import ProfileAddress from "../components/Profile/profileAddress";
import ProfileOrders from "../components/Profile/profileOrders";
import { FaCamera } from "react-icons/fa"; // Asegúrate de instalar react-icons
import {
  TbRosetteDiscount,
  TbApple,
  TbCarrot,
  TbBuildingStore,
  TbUserCircle,
  TbChevronRight,
} from "react-icons/tb";

function Profile() {
  const { userData, updateUser } = useAuth();
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null); // Referencia al input de archivo

  const [selectedSection, setSelectedSection] = useState("ProfileDetail");

  const renderContent = () => {
    switch (selectedSection) {
      case "ProfileDetail":
        return <ProfileDetail />;
      case "ProfileAddress":
        return <ProfileAddress />;
      case "ProfileOrders":
        return <ProfileOrders />;
      default:
        return <AccountData />;
    }
  };

  useEffect(() => {
    console.log("Profile picture URL:", userData?.userprofile?.profile_picture);
  }, [userData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const maxSize = 10 * 1024 * 1024; // Tamaño máximo permitido (10 MB)

    if (file && file.size > maxSize) {
      alert(
        "El archivo es demasiado grande. El tamaño máximo permitido es de 10 MB."
      );
      return;
    }

    setProfilePicture(file);
    handleUpload(file); // Sube la imagen automáticamente al seleccionarla
  };

  // Abre el selector de archivos al hacer clic en la imagen
  const handleImageClick = () => {
    fileInputRef.current.click(); // Activa el input de archivo
  };

  // Subir la imagen de perfil
  const handleUpload = async (file) => {
    if (!file) {
      alert("Por favor selecciona una imagen primero.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("profile_picture", file);

      await updateUser(formData);
      alert("Foto de perfil actualizada exitosamente.");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Error actualizando la foto de perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["container"]}>
      <div className={styles["content"]}>
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
            <Link to="/perfil">
              <div
                className={`${styles["navbar-option"]} ${
                selectedSection === "ProfileDetail" ? styles["navbar-option-active"] : ""
              }`}
                onClick={() => setSelectedSection("ProfileDetail")}
              >
                {" "}
                Datos de mi cuenta
              </div>
            </Link>
            <Link to="/perfil">
              <div
                className={`${styles["navbar-option"]} ${
                selectedSection === "ProfileAddress" ? styles["navbar-option-active"] : ""
              }`}
                onClick={() => setSelectedSection("ProfileAddress")}
              >
                {" "}
                Direcciones
              </div>
            </Link>
            <Link to="/perfil">
              <div
                className={`${styles["navbar-option"]} ${
                selectedSection === "ProfileOrders" ? styles["navbar-option-active"] : ""
              }`}
                onClick={() => setSelectedSection("ProfileOrders")}
              >
                {" "}
                Pedidos
              </div>
            </Link>
            <Link to="/perfil">
              <div
                className={`${styles["navbar-option"]} ${
                selectedSection === "accountData" ? styles["navbar-option-active"] : ""
              }`}
                onClick={() => setSelectedSection("ProfileDetail")}
              >
                Necesito ayuda
              </div>
            </Link>
          </div>
        </div>

        {/* Input de archivo, oculto */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {loading && <p>Subiendo...</p>}

        <div className={styles["second-column"]}>{renderContent()}</div>
      </div>
    </div>
  );
}

export default Profile;
