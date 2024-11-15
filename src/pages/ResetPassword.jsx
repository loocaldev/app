import React, { useState, useEffect } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    // Si no hay token en la URL, marcamos como inválido.
    if (!token) {
      setIsValidToken(false);
    }
  }, [token]);

  const handleResetPassword = async () => {
    setMessage("");
    setError("");

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

  if (!isValidToken) {
    return <Navigate to="/404" />; // Redirige a una página 404
  }

  return (
    <div>
      <h2>Restablecer Contraseña</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="password"
        placeholder="Nueva contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirmar nueva contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button onClick={handleResetPassword}>Restablecer Contraseña</button>
    </div>
  );
};

export default ResetPassword;
