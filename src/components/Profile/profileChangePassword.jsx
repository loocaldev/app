// src/components/ProfileChangePassword.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/ProfileChangePassword.module.css";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

function ProfileChangePassword() {
  const { userData, updateUser, changePassword } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prevShowPassword) => ({
      ...prevShowPassword,
      [field]: !prevShowPassword[field],
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("La nueva contraseña y la confirmación no coinciden.");
      return;
    }

    const success = await changePassword(
      passwordData.currentPassword,
      passwordData.newPassword
    );
    if (success) {
      alert("Contraseña cambiada exitosamente.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      alert("Error al cambiar la contraseña. Verifica tu contraseña actual.");
    }
  };

  return (
    <>
      <h3>Cambiar Contraseña</h3>
      <form onSubmit={handlePasswordSubmit} className={styles["password-form"]}>
        <div className={styles["form-group"]}>
          <label>Contraseña Actual</label>
          <div className={styles["inputs"]}>
            <input
              type={showPassword.currentPassword ? "text" : "password"}
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
            <span
              onClick={() => togglePasswordVisibility("currentPassword")}
              className={styles["password-toggle"]}
            >
              {showPassword.currentPassword ? <FaRegEyeSlash /> : <FaRegEye />}
            </span>
          </div>
        </div>
        <div className={styles["form-group"]}>
          <label>Nueva Contraseña</label>
          <div className={styles["inputs"]}>
          <input
            type={showPassword.newPassword ? "text" : "password"}
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            required
          /> 
          <span
            onClick={() => togglePasswordVisibility("newPassword")}
            className={styles["password-toggle"]}
          >
            {showPassword.newPassword ? <FaRegEyeSlash /> : <FaRegEye />}
          </span>
          </div>
        </div>
        <div className={styles["form-group"]}>
          <label>Confirmar Nueva Contraseña</label>
          <div className={styles["inputs"]}>
          <input
            type={showPassword.confirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            required
          />
          <span
            onClick={() => togglePasswordVisibility("confirmPassword")}
            className={styles["password-toggle"]}
          >
            {showPassword.confirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
          </span>
          </div>
        </div>
        <button type="submit" className={styles["submit-button"]}>
          Cambiar Contraseña
        </button>
      </form>
    </>
  );
}

export default ProfileChangePassword;
