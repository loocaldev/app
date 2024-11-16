import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Register.module.css";
import Logo from "../assets/logo.svg";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

function Register() {
  const { register, sendEmailOtp, verifyEmailOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState({
    step1: "",
    step2: "",
    step3: "",
  });
  const [code, setCode] = useState(["", "", "", ""]);
  const [step, setStep] = useState(1);
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos en segundos
  const [isOtpValid, setIsOtpValid] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formattedTime = `${Math.floor(timeLeft / 60)}:${timeLeft % 60}`;

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

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

  const goToNextStep = () => setStep((prev) => prev + 1);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Solo números permitidos
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus(); // Enfocar automáticamente el siguiente input
    }
  };

  const handleStep1Validation = async () => {
    if (!validateEmail(email)) {
      setErrorMessages((prev) => ({
        ...prev,
        step1: "Por favor ingresa un correo válido.",
      }));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://loocal.co/api/check_user/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.is_registered && !data.is_temporary) {
          setErrorMessages((prev) => ({
            ...prev,
            step1: "El correo ya está registrado. Por favor, inicia sesión.",
          }));
        } else {
          const otpResult = await sendEmailOtp(email);
          if (otpResult.success) {
            setErrorMessages((prev) => ({ ...prev, step1: "" }));
            goToNextStep();
          } else {
            setErrorMessages((prev) => ({
              ...prev,
              step1: otpResult.error,
            }));
          }
        }
      } else {
        setErrorMessages((prev) => ({
          ...prev,
          step1: data.error || "Error desconocido.",
        }));
      }
    } catch (error) {
      console.error("Error validando el correo:", error);
      setErrorMessages((prev) => ({
        ...prev,
        step1: "Error de red. Inténtalo más tarde.",
      }));
    }

    setLoading(false);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData.split("");
      setCode(newCode);
      newCode.forEach((digit, index) => {
        if (inputsRef.current[index]) {
          inputsRef.current[index].value = digit;
        }
      });
    }
  };

  const handleStep2Validation = async () => {
    const otpCode = code.join("");
    try {
      const result = await verifyEmailOtp(email, otpCode);
      if (result.success) {
        setErrorMessages((prev) => ({ ...prev, step2: "" }));
        setIsOtpValid(true); // Indica que el OTP es válido
        setTimeout(() => {
          goToNextStep();
        }, 2000); // Retraso antes de continuar
      } else {
        setErrorMessages((prev) => ({ ...prev, step2: result.error }));
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setErrorMessages((prev) => ({
        ...prev,
        step2: "Error de red. Inténtalo más tarde.",
      }));
    }
  };

  useEffect(() => {
    const otpCode = code.join("");
    if (otpCode.length === 4) {
      handleStep2Validation();
    }
  }, [code]);

  const inputClass = (index) =>
    isOtpValid
      ? `${styles.input} ${styles.success}` // Estilo verde si OTP es válido
      : errorMessages.step2
      ? `${styles.input} ${styles.error}` // Estilo rojo si hay error
      : styles.input;

  const handleSubmit = async () => {
    if (!passwordValid) {
      setErrorMessages((prev) => ({
        ...prev,
        step3: "Asegúrate de que tu contraseña cumpla con los requisitos.",
      }));
      return;
    }

    try {
      const result = await register(email, password);
      if (result?.error) {
        setErrorMessages((prev) => ({ ...prev, step3: result.error }));
      } else {
        // Redirigir al usuario a la ruta autenticada
        navigate("/create-profile");
      }
    } catch {
      setErrorMessages((prev) => ({
        ...prev,
        step3: "Error inesperado. Intenta nuevamente.",
      }));
    }
  };

  useEffect(() => {
    setPasswordValid(validatePassword(password));
  }, [password]);

  const getPasswordRequirementClass = (fulfilled) =>
    fulfilled ? styles["fulfilled"] : "";

  return (
    <div className={styles.Container}>
      <div className={styles["box"]}>
        <div className={styles["box-content"]}>
          <img src={Logo} alt="Logo" />
          <h2>Comienza tu registro</h2>
          <p>Ingresa tu correo electrónico y crea una contraseña</p>
          <div className={styles["box-form"]}>
            <form>
              {step === 1 && (
                <>
                  <div className={styles["element-form"]}>
                    <label htmlFor="email">Correo electrónico</label>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className={styles["legal-checkbox"]}>
                    <label>
                      <input
                        type="checkbox"
                        checked={termsChecked}
                        onChange={(e) => setTermsChecked(e.target.checked)}
                      />
                      Acepto los{" "}
                      <a
                        href="https://loocal.co/legal/terminos-y-condiciones"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        términos y condiciones
                      </a>
                    </label>
                  </div>
                  <div className={styles["legal-checkbox"]}>
                    <label>
                      <input
                        type="checkbox"
                        checked={privacyChecked}
                        onChange={(e) => setPrivacyChecked(e.target.checked)}
                      />
                      Acepto la{" "}
                      <a
                        href="https://loocal.co/legal/política-de-tratamiento-de-datos"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        política de privacidad
                      </a>
                    </label>
                  </div>
                  {errorMessages.step1 && (
                    <span className={styles["error-message"]}>
                      {errorMessages.step1}
                    </span>
                  )}
                  <button
                    type="button"
                    className={styles["form-button"]}
                    onClick={handleStep1Validation}
                    disabled={loading} // Deshabilitar mientras carga
                  >
                    {loading ? "Cargando..." : "Continuar"}
                  </button>
                </>
              )}
              {step === 2 && (
                <>
                  <label>Código de verificación</label>
                  <p>
                    Hemos enviado un código de verificación a tu correo.
                    <br />
                    El código expirará en: {formattedTime}
                  </p>
                  <div className={styles.otpContainer}>
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) =>
                          handleCodeChange(index, e.target.value)
                        }
                        onPaste={handlePaste}
                        ref={(el) => (inputsRef.current[index] = el)}
                        className={inputClass(index)}
                      />
                    ))}
                  </div>
                  {isOtpValid && (
                    <p className={styles.successMessage}>
                      Correo verificado correctamente.
                    </p>
                  )}
                  {errorMessages.step2 && (
                    <span className={styles.errorMessage}>
                      {errorMessages.step2}
                    </span>
                  )}
                </>
              )}
              {step === 3 && (
                <div className={styles["element-form"]}>
                  <label>Contraseña</label>
                  <div
                    className={`${styles["element-form-password"]} ${
                      passwordFocused ? styles["password-focused"] : ""
                    }`}
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(password.length > 0)}
                    />
                    <span
                      className={styles["password-toggle"]}
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                    </span>
                  </div>
                  {!passwordValid && passwordFocused && (
                    <div className={styles["password-requirements"]}>
                      <span>Tu contraseña debe cumplir con:</span>
                      <ul>
                        <li
                          className={getPasswordRequirementClass(
                            password.length >= 6
                          )}
                        >
                          <FiCheckCircle />
                          Al menos 6 caracteres
                        </li>
                        <li
                          className={getPasswordRequirementClass(
                            /[A-Z]/.test(password)
                          )}
                        >
                          <FiCheckCircle />
                          Una mayúscula (A-Z)
                        </li>
                        <li
                          className={getPasswordRequirementClass(
                            /[a-z]/.test(password)
                          )}
                        >
                          <FiCheckCircle />
                          Una minúscula (a-z)
                        </li>
                        <li
                          className={getPasswordRequirementClass(
                            /[0-9]/.test(password)
                          )}
                        >
                          <FiCheckCircle />
                          Un número (0-9)
                        </li>
                        <li
                          className={getPasswordRequirementClass(
                            /[!@#$%^&*]/.test(password)
                          )}
                        >
                          <FiCheckCircle />
                          Un carácter especial
                        </li>
                      </ul>
                    </div>
                  )}
                  {passwordValid && (
                    <div
                      className={`${styles["password-requirements"]} ${styles.success}`}
                    >
                      <span>
                        ¡Bien! Tu contraseña cumple con los requisitos de
                        seguridad.
                      </span>
                    </div>
                  )}
                  {errorMessages.step3 && (
                    <span className={styles["error-message"]}>
                      {errorMessages.step3}
                    </span>
                  )}
                  <button
                    type="button"
                    className={styles["form-button"]}
                    onClick={handleSubmit}
                  >
                    Crear cuenta
                  </button>
                </div>
              )}
            </form>
            <div className={styles["go-signin"]}>
              <span>
                ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
