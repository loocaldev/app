import React, { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async () => {
    try {
      const response = await axios.post("/api/forgot_password/", { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || "Error al procesar la solicitud.");
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
