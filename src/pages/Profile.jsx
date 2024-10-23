// Profile.jsx
import React, { useState, useEffect } from "react";
import styles from "../styles/Profile.module.css";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { userData, updateUser } = useAuth();
  const [profilePicture, setProfilePicture] = useState(null); // Almacena la imagen seleccionada
  const [loading, setLoading] = useState(false);

  // Depurar: Imprimir el valor de profile_picture cuando userData cambia
  useEffect(() => {
    console.log("Profile picture URL:", userData?.userprofile?.profile_picture);
  }, [userData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const maxSize = 10 * 1024 * 1024; // Tamaño máximo permitido (10 MB)

    if (file.size > maxSize) {
      alert("El archivo es demasiado grande. El tamaño máximo permitido es de 10 MB.");
      return;
    }

    setProfilePicture(file);
  };

  // Subir la imagen de perfil
  const handleUpload = async () => {
    if (!profilePicture) {
      alert("Por favor selecciona una imagen primero.");
      return;
    }

    try {
      setLoading(true);

      // Creamos un FormData para manejar archivos
      const formData = new FormData();
      formData.append("profile_picture", profilePicture); // Añadir la imagen al FormData

      // Opcional: Si quieres agregar otros campos de actualización
      // formData.append("email", newEmail); 
      // formData.append("first_name", newFirstName);

      // Enviar los datos con la imagen
      await updateUser(formData); // Asegúrate de que 'updateUser' maneje FormData
      alert("Foto de perfil actualizada exitosamente.");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Error actualizando la foto de perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["container"]}>
      <div className={styles["content"]}>
        <h1>{userData?.username}</h1>
        <h2>Mi cuenta</h2>

        {userData?.userprofile?.profile_picture ? (
          <img
            src={userData.userprofile.profile_picture} // Usar la URL completa
            alt="Foto de perfil"
            className={styles["profile-picture"]}
          />
        ) : (
          <img
            src="/default-placeholder.png" // Mostrar placeholder si no hay foto
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
