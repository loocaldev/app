import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function Login() {
  const { login, token } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Estado para controlar la animación de carga

  const navigate = useNavigate();

  useEffect(() => {
    console.log(token);
  }, [token]);

  const handleLogin = async () => {
    try {
      setLoading(true); // Activar la animación de carga
      await login(username, password);
      console.log(token)
      navigate("/");
      // Lógica adicional después de iniciar sesión, como redireccionar a otra página
    } catch (error) {
      console.error("Error:", error);
      // Manejo de errores de inicio de sesión
    } finally {
      setLoading(false); // Desactivar la animación de carga
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="button" onClick={handleLogin} disabled={loading}> {/* Deshabilitar el botón mientras se está cargando */}
          {loading ? "Loading..." : "Login"} {/* Mostrar el texto "Loading..." mientras se está cargando */}
        </button>
      </form>
    </div>
  );
}

export default Login;
