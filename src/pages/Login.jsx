import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";
import Logo from "../assets/logo.svg";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";

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
      setErrorMessage(""); // Limpiar mensajes de error previos
      await login(email, password);
      navigate("/");
    } catch (error) {
      console.error("Error:", error);
      if (error.response && error.response.data.error) {
        setErrorMessage(error.response.data.error); // Mostrar error específico del servidor
      } else {
        setErrorMessage("Ocurrió un error inesperado. Inténtalo más tarde.");
      }
    } finally {
      setLoading(false);
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
            <Link to="/">
              <img src={Logo} />
            </Link>
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
                <span>¿Olvidaste tu contraseña?</span>
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
                <Link to="/crear-cuenta">Registrate aquí</Link>
              </span>
            </div>
            <div className={styles["forget-password"]}>
              <Link to="/recuperar-contraseña">¿Olvidaste tu contraseña?</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
