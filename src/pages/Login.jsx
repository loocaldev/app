import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";
import Logo from "../assets/logo.svg";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  FiChevronLeft,
  FiMapPin,
  FiUser,
  FiChevronRight,
  FiShoppingCart,
} from "react-icons/fi";

function Login() {
  const { login, token } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Estado para controlar la animación de carga
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    console.log(token);
  }, [token]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage(""); // Limpia errores previos
      await login(email, password); // Intenta iniciar sesión
      navigate("/"); // Solo redirige si el inicio de sesión es exitoso
    } catch (error) {
      // Manejo de errores
      console.error("Error al iniciar sesión:", error);
      if (error.message) {
        setErrorMessage(error.message); // Mostrar mensaje específico del servidor
      } else {
        setErrorMessage("Error inesperado. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false); // Detiene la animación de carga
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.Container}>
      <div className={styles["box-form"]}>
        {/* <div className={styles["info-column"]}>
          <div className={styles["info-content"]}>
            <h2>Más de 100 mil colombianos hoy compran con Loocal</h2>
          </div>
        </div> */}
        <div className={styles["form-column"]}>
          <div className={styles["title-form"]}>
            <div className={styles.HeaderTitleForm}>
              <FiChevronLeft onClick={() => window.history.back()}/>
            <Link to="/">
              <img src={Logo} />
            </Link>
            </div>
            <h2>Ingresar</h2>
            <p>Ingresa a tu cuenta de Loocal</p>
          </div>
          <div className={styles["content-form"]}>
            <form>
              <div className={styles["element-form"]}>
                <label htmlFor="email">Correo electrónico:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div
                className={styles["element-form"]}
                style={{ position: "relative" }}
              >
                <label htmlFor="password">Contraseña:</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  onClick={togglePasswordVisibility}
                  className={styles["password-toggle"]}
                >
                  {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </span>
              </div>
              <div className={styles["forget-password"]}>
              <Link to="/recover-password"><span>¿Olvidaste tu contraseña?</span></Link>
              </div>
              <button type="button" onClick={handleLogin} disabled={loading}>
                {" "}
                {/* Deshabilitar el botón mientras se está cargando */}
                {loading ? "Ingresando..." : "Iniciar sesión"}{" "}
                {/* Mostrar el texto "Loading..." mientras se está cargando */}
              </button>
            </form>
            {errorMessage && (
              <div className={styles.errorMessage}>{errorMessage}</div>
            )}
            <div className={styles["go-signup"]}>
              <span>
                ¿Aún no tienes tu cuenta?{" "}
                <Link to="/register">Registrate aquí</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
