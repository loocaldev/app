// src/components/ProfileDetail.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/profileDetail.module.css";

function profileDetail() {
  const { userData, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    first_name: userData?.first_name || "",
    last_name: userData?.last_name || "",
    document_type: userData?.userprofile?.document_type || "",
    document_number: userData?.userprofile?.document_number || "",
    phone_number: userData?.userprofile?.phone_number || "",
    email: userData?.email || "",
  });
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    // Console log para verificar los datos de userData cada vez que cambien
    console.log("Datos de usuario cargados:", userData);

    if (userData) {
      setFormData({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        document_type: userData.userprofile?.document_type || "",
        document_number: userData.userprofile?.document_number || "",
        phone_number: userData.userprofile?.phone_number || "",
        email: userData.email || "",
      });
    }
  }, [userData]);


  // Detectar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Activar el botón de actualización si se detecta algún cambio
    setIsModified(true);
  };

  // Manejar el envío del formulario para actualizar los datos del usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateUser(formData);
    setIsModified(false); // Desactivar el botón de actualización tras el envío exitoso
  };

  return (
    <div className={styles["profile-detail"]}>
      <h2>Datos de mi cuenta</h2>
      <form onSubmit={handleSubmit} className={styles["profile-form"]}>
        <div className={styles["form-row"]}>
          <div className={styles["form-group"]}>
            <label>Nombre</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>

          <div className={styles["form-group"]}>
            <label>Apellido</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className={styles["form-row"]}>
          <div className={styles["form-group"]}>
            <label>Tipo de documento</label>
            <div className={styles["form-multi-input"]}>
              <select type="text" name="document_type" value={formData.document_type} onChange={handleChange}>
                <option value="CC">Cédula de ciudadania</option>
                <option value="CE">Cédula de extranjería</option>
                <option value="PP">Pasaporte</option>
              </select>
              <input
                type="text"
                name="document_number"
                value={formData.document_number}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles["form-group"]}>
            <label>Número de celular</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles["form-group"]}>
          <label>Correo electrónico</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled // El campo de correo estará deshabilitado
          />
        </div>

        {/* Botón de actualización habilitado solo si se detectaron cambios */}
        <button
          type="submit"
          disabled={!isModified}
          className={styles["submit-button"]}
        >
          Actualizar Datos
        </button>
      </form>
    </div>
  );
}

export default profileDetail;
