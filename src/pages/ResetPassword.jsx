import React, { useState, useEffect } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/CreateAccount.module.css"; // Usamos los mismos estilos que CreateAccount.jsx
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordFilled, setPasswordFilled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isValidToken, setIsValidToken] = useState(true);
  const [buttonDisabled, setButtonDisabled] = useState(true);

  // Validar el token al cargar la página
  useEffect(() => {
    if (!token || token.trim() === "") {
      setIsValidToken(false);
    }
  }, [token]);

  // Validación en tiempo real de la contraseña
  const validatePassword = (password) => {
    const regexUpperCase = /[A-Z]/;
    const regexLowerCase = /[a-z]/;
    const regexNumber = /[0-9]/;
    const regexSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const valid =
      password.length >= 6 &&
      regexUpperCase.test(password) &&
      regexLowerCase.test(password) &&
      regexNumber.test(password) &&
      regexSpecialChar.test(password);

    setPasswordValid(valid);
    return valid;
  };

  // Manejo del envío del formulario
  const handleResetPassword = async () => {
    setMessage("");
    setError("");

    // Validar contraseñas antes de enviar al backend
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const response = await resetPassword(token, password);

    if (response.success) {
      setMessage(response.message);
    } else {
      setError(response.error);
    }
  };

  // Monitorear cambios en los campos para habilitar/deshabilitar el botón
  useEffect(() => {
    const enableButton = () => {
      if (password && confirmPassword && validatePassword(password)) {
        setButtonDisabled(false);
      } else {
        setButtonDisabled(true);
      }
    };

    enableButton();
  }, [password, confirmPassword]);

  // Clases dinámicas para los requisitos de la contraseña
  const getPasswordRequirementClass = (fulfilled) => {
    return fulfilled ? styles["fulfilled"] : "";
  };

  // Mostrar/Ocultar contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (!isValidToken) {
    return <Navigate to="/404" />; // Redirige a una página 404 si el token no es válido
  }

  return (
    <div className={styles.Container}>
      <div className={styles["box"]}>
        <div className={styles["box-content"]}>
          <h2>Restablecer Contraseña</h2>
          <p>Ingresa una nueva contraseña segura</p>
          <div className={styles["box-form"]}>
            <form>
              <div className={styles["element-form"]}>
                <label htmlFor="password">Nueva Contraseña</label>
                <div
                  className={`${styles["element-form-password"]} ${
                    passwordFocused ? styles["password-focused"] : ""
                  }`}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (e.target.value) {
                        setPasswordFilled(true);
                        setPasswordFocused(true);
                      } else {
                        setPasswordFilled(false);
                      }
                    }}
                    onFocus={() => {
                      if (!passwordFilled) {
                        setPasswordFocused(true);
                      }
                    }}
                    onBlur={() => {
                      if (!password) {
                        setPasswordFocused(false);
                      }
                    }}
                  />
                  <span
                    onClick={togglePasswordVisibility}
                    className={styles["password-toggle"]}
                  >
                    {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                  </span>
                </div>
                {passwordFocused && (passwordFilled || !password) && (
                  <div
                    className={`${styles["password-requirements"]} ${
                      passwordValid ? styles.success : ""
                    }`}
                  >
                    {passwordValid ? (
                      <span className={passwordValid ? styles.success : ""}>
                        ¡Bien! Tu contraseña cumple los requisitos de seguridad.
                      </span>
                    ) : (
                      <>
                        <span>Tu contraseña debe tener: </span>
                        <ul>
                          <li
                            className={getPasswordRequirementClass(
                              password.length >= 6
                            )}
                          >
                            {password.length >= 6 ? (
                              <FiCheckCircle />
                            ) : (
                              <FiAlertCircle />
                            )}{" "}
                            Al menos 6 caracteres
                          </li>
                          <li
                            className={getPasswordRequirementClass(
                              /[A-Z]/.test(password)
                            )}
                          >
                            {/[A-Z]/.test(password) ? (
                              <FiCheckCircle />
                            ) : (
                              <FiAlertCircle />
                            )}{" "}
                            Al menos una mayúscula (A-Z)
                          </li>
                          <li
                            className={getPasswordRequirementClass(
                              /[a-z]/.test(password)
                            )}
                          >
                            {/[a-z]/.test(password) ? (
                              <FiCheckCircle />
                            ) : (
                              <FiAlertCircle />
                            )}{" "}
                            Al menos una minúscula (a-z)
                          </li>
                          <li
                            className={getPasswordRequirementClass(
                              /[0-9]/.test(password)
                            )}
                          >
                            {/[0-9]/.test(password) ? (
                              <FiCheckCircle />
                            ) : (
                              <FiAlertCircle />
                            )}{" "}
                            Al menos un número (0-9)
                          </li>
                          <li
                            className={getPasswordRequirementClass(
                              /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
                                password
                              )
                            )}
                          >
                            {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
                              password
                            ) ? (
                              <FiCheckCircle />
                            ) : (
                              <FiAlertCircle />
                            )}{" "}
                            Al menos un carácter especial (por ejemplo,
                            !@#$%^&*)
                          </li>
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className={styles["element-form"]}>
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <div className={styles["element-form-password"]}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <span
                    onClick={toggleConfirmPasswordVisibility}
                    className={styles["password-toggle"]}
                  >
                    {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                  </span>
                </div>
              </div>
              <button
                className={`${styles["form-button"]} ${
                  buttonDisabled ? styles["disabled"] : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleResetPassword();
                }}
                type="button"
                disabled={buttonDisabled}
              >
                Restablecer Contraseña
              </button>
              {error && <p className={styles.errorMessage}>{error}</p>}
              {message && <p className={styles.successMessage}>{message}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
