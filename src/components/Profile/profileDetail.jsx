// src/components/ProfileDetail.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/profileDetail.module.css";

function profileDetail() { 
  const { userData, updateUser, changePassword } = useAuth();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setIsModified(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updateData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      profile: {
        document_type: formData.document_type,
        document_number: formData.document_number,
        phone_number: formData.phone_number,
      },
    };
    await updateUser(updateData);
    setIsModified(false);
  };

  return (
    <div className={styles["profile-detail"]}>
      <h2>Datos de mi cuenta</h2>
      <form onSubmit={handleSubmit} className={styles["profile-form"]}>
        <div className="form-row">
          <div className="form-group">
            <label>Nombre</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Apellido</label>
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            
            <label>Tipo de documento</label>
            <div className={styles["form-multi-input"]}>
            <select type="text" name="document_type" value={formData.document_type} onChange={handleChange}>
              <option value="CC">Cédula de ciudadania</option>
              <option value="CE">Cédula de extranjería</option>
              <option value="PP">Pasaporte</option>
            </select>
            <input type="text" name="document_number" value={formData.document_number} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Número de celular</label>
            <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} />
          </div>
        </div>
        <button type="submit" disabled={!isModified} className={styles["submit-button"]}>
          Actualizar Datos
        </button>
      </form>

      
    </div>
  );
}

export default profileDetail;
