import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/ProfileChangePassword.module.css";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

function ProfileChangePassword() {
  const { changePassword } = useAuth();
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
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errorMessages, setErrorMessages] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // Estado para el mensaje de éxito

  const validatePassword = (password) => {
    const regexUpperCase = /[A-Z]/;
    const regexLowerCase = /[a-z]/;
    const regexNumber = /[0-9]/;
    const regexSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    return (
      password.length >= 6 &&
      regexUpperCase.test(password) &&
      regexLowerCase.test(password) &&
      regexNumber.test(password) &&
      regexSpecialChar.test(password)
    );
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });

    if (name === "newPassword") {
      setPasswordValid(validatePassword(value));
    }
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
      setErrorMessages("La nueva contraseña y la confirmación no coinciden.");
      return;
    }

    if (!passwordValid) {
      setErrorMessages(
        "La nueva contraseña no cumple con los requisitos de seguridad."
      );
      return;
    }

    const success = await changePassword(
      passwordData.currentPassword,
      passwordData.newPassword
    );
    if (success) {
      setSuccessMessage("Contraseña cambiada exitosamente.");
      setErrorMessages(""); // Limpiar errores si los hay
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Eliminar el mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccessMessage(""), 5000);
    } else {
      setErrorMessages(
        "Error al cambiar la contraseña. Verifica tu contraseña actual."
      );
    }
  };

  const getPasswordRequirementClass = (fulfilled) =>
    fulfilled ? styles["fulfilled"] : "";

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
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              required
            />
            <span
              onClick={() => togglePasswordVisibility("newPassword")}
              className={styles["password-toggle"]}
            >
              {showPassword.newPassword ? <FaRegEyeSlash /> : <FaRegEye />}
            </span>
          </div>
          {passwordFocused && (
            <div className={styles["password-requirements"]}>
              <span>Tu nueva contraseña debe cumplir con:</span>
              <ul>
                <li
                  className={getPasswordRequirementClass(
                    passwordData.newPassword.length >= 6
                  )}
                >
                  <FiCheckCircle />
                  Al menos 6 caracteres
                </li>
                <li
                  className={getPasswordRequirementClass(
                    /[A-Z]/.test(passwordData.newPassword)
                  )}
                >
                  <FiCheckCircle />
                  Una mayúscula (A-Z)
                </li>
                <li
                  className={getPasswordRequirementClass(
                    /[a-z]/.test(passwordData.newPassword)
                  )}
                >
                  <FiCheckCircle />
                  Una minúscula (a-z)
                </li>
                <li
                  className={getPasswordRequirementClass(
                    /[0-9]/.test(passwordData.newPassword)
                  )}
                >
                  <FiCheckCircle />
                  Un número (0-9)
                </li>
                <li
                  className={getPasswordRequirementClass(
                    /[!@#$%^&*.]/.test(passwordData.newPassword)
                  )}
                >
                  <FiCheckCircle />
                  Un carácter especial
                </li>
              </ul>
            </div>
          )}
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
        {errorMessages && (
          <div className={styles["errorMessage"]}>
            <FiAlertCircle /> {errorMessages}
          </div>
        )}
        {successMessage && (
          <div className={styles["successMessage"]}>
            <FiCheckCircle /> {successMessage}
          </div>
        )}
        <button type="submit" className={styles["submit-button"]}>
          Cambiar Contraseña
        </button>
      </form>
    </>
  );
}

export default ProfileChangePassword;
