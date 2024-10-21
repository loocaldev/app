import React, { useState, useEffect } from "react";
import styles from "../styles/CreateAccount.module.css";
import Logo from "../assets/logo.svg";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

function CreateAccount() {
  const { register, token } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordFilled, setPasswordFilled] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async () => {
    setFormSubmitted(true);

    try {
      setLoading(true);
      setErrorMessage(""); // Limpiar los mensajes de error del formulario
      setRegistrationError(""); // Limpiar los errores de registro previos

      // Validaciones del formulario
      if (!validateEmail(email)) {
        setErrorMessage("Ingresa un correo electrónico válido.");
      } else if (!validatePassword(password)) {
        setErrorMessage(
          "Asegúrate de que tu contraseña cumpla con los requisitos de seguridad."
        );
      } else if (!termsChecked || !privacyChecked) {
        setErrorMessage(
          "Asegúrate de aceptar los términos y condiciones y la política de privacidad."
        );
      } else {
        // Intentar registrar el usuario
        const result = await register(email, password);

        if (result?.error) {
          setRegistrationError(result.error); // Mostrar el error del registro (usuario ya existente)
        } else {
          navigate("/crear-cuenta/detalles");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect para observar cambios en las dependencias relevantes y actualizar el estado del botón y el mensaje de error
  useEffect(() => {
    const updateState = () => {
      if (!validateEmail(email)) {
        setErrorMessage("Ingresa un correo electrónico válido.");
        setButtonDisabled(true); // Deshabilitar el botón
      } else if (!validatePassword(password)) {
        setErrorMessage(
          "Asegúrate de que tu contraseña cumpla con los requisitos de seguridad."
        );
        setButtonDisabled(true); // Deshabilitar el botón
      } else if (!termsChecked || !privacyChecked) {
        setErrorMessage(
          "Asegúrate de aceptar los términos y condiciones, y la política de privacidad."
        );
        setButtonDisabled(true); // Deshabilitar el botón
      } else {
        setErrorMessage(""); // Limpiar el mensaje de error si todas las validaciones se cumplen
        if (!loading) {
          setButtonDisabled(false); // Habilitar el botón
        }
      }
    };

    updateState();
  }, [email, password, termsChecked, privacyChecked, loading, passwordValid]);

  const validateEmail = (email) => {
    // Simple email validation
    return /\S+@\S+\.\S+/.test(email);
  };

  // Función para validar la contraseña
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

    if (valid !== passwordValid) {
      setPasswordValid(valid);
    }

    return valid;
  };

  const getPasswordRequirementClass = (fulfilled) => {
    return fulfilled ? styles["fulfilled"] : "";
  };

  return (
    <div className={styles.Container}>
      <div className={styles["box"]}>
        <div className={styles["box-content"]}>
          <img src={Logo} />
          <h2>Comienza tu registro</h2>
          <p>Ingresa tu correo electrónico y crea una contraseña</p>
          <div className={styles["box-form"]}>
            <form>
              <div className={styles["element-form"]}>
                <label htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
              </div>
              <div className={styles["element-form"]}>
                <label htmlFor="password">Contraseña</label>
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
                            )}
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
              <div
                className={`${styles["element-form"]} ${styles["legal-checkbox"]}`}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={termsChecked}
                    onChange={(e) => {
                      setTermsChecked(e.target.checked);
                    }}
                  />
                  Acepto los{" "}
                  <a
                    href="https://loocal.co/legal/terminos-y-condiciones"
                    target="_blank"
                  >
                    términos y condiciones
                  </a>{" "}
                  de Loocal
                </label>
              </div>
              <div
                className={`${styles["element-form"]} ${styles["legal-checkbox"]}`}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={privacyChecked}
                    onChange={(e) => {
                      setPrivacyChecked(e.target.checked);
                    }}
                  />
                  Acepto el tratamiento de mis datos personales según la{" "}
                  <a
                    href="https://loocal.co/legal/política-de-tratamiento-de-datos"
                    target="_blank"
                  >
                    política
                  </a>{" "}
                  de Loocal
                </label>
              </div>
              <button
                className={`${styles["form-button"]} ${
                  buttonDisabled ? styles["disabled"] : ""
                }`}
                onClick={handleSubmit}
                type="button"
              >
                Crear cuenta
              </button>

              <div className={styles["error-message"]}>
                {formSubmitted && registrationError && (
                  <div className={styles.errorMessage}>
                    {registrationError.includes("Ya existe una cuenta") ? (
                      <>
                        <span>{registrationError}</span>
                        <br />
                        <Link to="/login">
                          Haz clic aquí para iniciar sesión
                        </Link>
                      </>
                    ) : (
                      <span>{registrationError}</span>
                    )}
                  </div>
                )}
              </div>
            </form>
            <div className={styles["go-signin"]}>
              <span>
                ¿Ya tienes una cuenta? <Link to="/login">Ingresa aquí</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAccount;
