// Profile.jsx
import React, { useState } from "react";
import styles from "../styles/Profile.module.css";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { userData, updateUser } = useAuth();
  const [profilePicture, setProfilePicture] = useState(null); // Almacena la imagen seleccionada
  const [loading, setLoading] = useState(false);

  // Manejar el cambio de archivo
  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]); // Guardar la imagen seleccionada
  };

  // Subir la imagen de perfil
  const handleUpload = async () => {
    if (!profilePicture) {
      alert("Por favor selecciona una imagen primero.");
      return;
    }

    try {
      setLoading(true);
      // Enviar los datos con la imagen
      await updateUser({ profile_picture: profilePicture });
      alert("Foto de perfil actualizada exitosamente.");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["container"]}>
      <div className={styles["content"]}>
        <h1>{userData?.username}</h1>
        <h2>Mi cuenta</h2>
        
        {userData?.profile?.profile_picture ? (
          <img
            src={userData.profile.profile_picture}
            alt="Foto de perfil"
            className={styles["profile-picture"]}
          />
        ) : (
          <img
            src="/default-placeholder.png"  // Mostrar placeholder si no hay foto
            alt="Sin foto de perfil"
            className={styles["profile-picture"]}
          />
        )}

        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Subiendo..." : "Subir foto"}
        </button>
      </div>
    </div>
  );
}

export default Profile;
