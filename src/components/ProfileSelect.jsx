import React, { useState } from "react";
import { FiUser } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import styles from "../styles/ProfileSelect.module.css";

const ProfileSelect = ({ userData, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false); // Controla el menú desplegable
  const [selectedOption, setSelectedOption] = useState("profile"); // Controla la opción seleccionada

  const handleOptionClick = (value) => {
    setSelectedOption(value);
    setIsOpen(false); // Cierra el menú desplegable
    onSelect(value); // Notifica al componente padre
  };

  return (
    <div className={styles["select-profile-container"]}>
      {/* Contenedor principal del select */}
      <div
        className={styles["select-profile"]}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption === "profile" ? (
          <div className={styles["header-profile-option"]}>
            {userData?.userprofile?.profile_picture && (
              <img
                src={userData.userprofile.profile_picture}
                alt="Foto de perfil"
                className={styles["profile-picture"]}
              />
            )}
            <div className={styles["username"]}>
              <span>{userData?.first_name}</span>
              <span>{userData?.username}</span>
            </div>
          </div>
        ) : (
          <div className={styles["header-profile-option"]}>
            <FiUser />
            <div className={styles["username"]}>
              <span>Otro usuario</span>
            </div>
          </div>
        )}
        {/* Icono para desplegar */}
        <IoIosArrowDown />
      </div>

      {isOpen && (
        <div className={styles["select-options"]}>
          <div
            className={styles["header-profile-option"]}
            onClick={() => handleOptionClick("profile")}
          >
            {userData?.userprofile?.profile_picture && (
              <img
                src={userData.userprofile.profile_picture}
                alt="Foto de perfil"
                className={styles["profile-picture"]}
              />
            )}
            <div className={styles["username"]}>
              <span>{userData?.first_name}</span>
              <span>{userData?.username}</span>
            </div>
          </div>
          <div
            className={styles["header-profile-option"]}
            onClick={() => handleOptionClick("empty")}
          >
            <FiUser />
            <div className={styles["username"]}>
              <span>Otro usuario</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSelect;
