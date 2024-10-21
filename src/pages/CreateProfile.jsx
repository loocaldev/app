import React, { useState } from "react";
import PersonalInfo from "../components/PersonalInfo.jsx";  // El paso para la información personal
import AddressInfo from "../components/AddressInfo";    // El paso para la dirección de entrega
import { useAuth } from "../context/AuthContext.jsx";  // Para manejar la actualización de datos y agregar dirección
import { useNavigate } from "react-router-dom";

function CreateProfile() {
  const { updateUser, addAddress } = useAuth();
  const [step, setStep] = useState(1);  // Controla el paso actual (1 o 2)
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    documentType: "C.C.",
    documentNumber: "",
    phone: "",
    email: "",
    departament: "",
    town: "",
    address: "",
    detalle: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNextStep = () => {
    if (step === 1) {
      // Validación de datos personales
      const requiredFields = ["firstname", "lastname", "documentType", "documentNumber", "phone"];
      const incompleteFields = requiredFields.filter(field => !formData[field]);
      if (incompleteFields.length > 0) {
        alert("Por favor completa todos los campos requeridos.");
        return;
      }
    } else if (step === 2) {
      // Validación de la dirección
      const requiredFields = ["departament", "town", "address"];
      const incompleteFields = requiredFields.filter(field => !formData[field]);
      if (incompleteFields.length > 0) {
        alert("Por favor completa todos los campos de dirección.");
        return;
      }
    }

    setStep(step + 1);  // Avanzar al siguiente paso
  };

  const handleBackStep = () => {
    setStep(step - 1);  // Retroceder un paso
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Enviar los datos personales
      await updateUser({
        first_name: formData.firstname,
        last_name: formData.lastname,
        email: formData.email,
      });

      // Enviar la dirección
      await addAddress({
        street: formData.address,
        city: formData.town,
        state: formData.departament,
        postal_code: "110111",
        country: "Colombia",
        is_default: true
      });

      alert("Perfil y dirección agregados exitosamente.");
      navigate("/");  // Redirigir al home o a la página que prefieras
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      alert("Hubo un error al enviar los datos. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-profile-container">
      {step === 1 && (
        <PersonalInfo formData={formData} handleChange={handleChange} />
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
