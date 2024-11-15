import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async () => {
    setMessage("");
    setError("");

    const response = await forgotPassword(email);

    if (response.success) {
      setMessage(response.message);
    } else {
      setError(response.error);
    }
  };

  return (
    <div>
      <h2>Recuperar Contraseña</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Correo electrónico"
      />
      <button onClick={handleForgotPassword}>Enviar</button>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ForgotPassword;
