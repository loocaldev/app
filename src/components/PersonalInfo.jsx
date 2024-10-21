import React, { useState } from "react";
import PersonalInfo from "./PersonalInfo";
import AddressInfo from "./AddressInfo";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function CreateProfile() {
  const { updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    documentType: "C.C.",
    documentNumber: "",
    phone: "",
    email: "",
    profilePicture: null  // Agregamos la foto de perfil aquí
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNextStep = () => {
    // Validaciones previas a avanzar al siguiente paso
    setStep(step + 1);
  };

  const handleBackStep = () => {
    setStep(step - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (file) => {
    // Actualizamos la imagen de perfil en el estado
    setFormData({
      ...formData,
      profilePicture: file,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Creamos un objeto FormData para enviar archivos
      const data = new FormData();
      data.append("first_name", formData.firstname);
      data.append("last_name", formData.lastname);
      data.append("email", formData.email);
      if (formData.profilePicture) {
        data.append("profile_picture", formData.profilePicture);  // Adjuntamos la foto de perfil
      }

      // Enviar los datos al backend
      await updateUser(data);

      alert("Perfil actualizado exitosamente.");
      navigate("/");
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      alert("Error al actualizar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-profile-container">
      {step === 1 && (
        <PersonalInfo
          formData={formData}
          handleChange={handleChange}
          handleImageChange={handleImageChange}
        />
      )}
      {step === 2 && (
        <AddressInfo formData={formData} handleChange={handleChange} />
      )}

      <div className="buttons-container">
        {step > 1 && (
          <button onClick={handleBackStep} disabled={loading}>
            Atrás
          </button>
        )}
        {step < 2 && (
          <button onClick={handleNextStep} disabled={loading}>
            Siguiente
          </button>
        )}
        {step === 2 && (
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Enviando..." : "Finalizar"}
          </button>
        )}
      </div>
    </div>
  );
}

export default CreateProfile;
