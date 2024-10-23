import React, { useState } from "react";
import styles from "../styles/CreateProfile.module.css";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { departamentosYMunicipios } from "../data/departamentosYMunicipios";

function CreateProfile() {
  const [step, setStep] = useState(1); // Paso actual del formulario
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { updateUser, addAddress } = useAuth();

  // Estado para la información personal
  const [personalInfo, setPersonalInfo] = useState({
    firstname: "",
    lastname: "",
    documentType: "C.C.",
    documentNumber: "",
    phone: "",
    email: "",
  });

  // Estado para la dirección de entrega
  const [addressInfo, setAddressInfo] = useState({
    departament: "",
    town: "",
    address: "",
    detalle: ""
  });

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({
      ...personalInfo,
      [name]: value,
    });
  };

  const handleAddressInfoChange = (e) => {
    const { name, value } = e.target;
    setAddressInfo({
      ...addressInfo,
      [name]: value,
    });
  };

  const handleDepartamentoChange = (e) => {
    const departamento = e.target.value;
    setAddressInfo({
      ...addressInfo,
      departament: departamento,
      town: "", // Reiniciar el municipio cuando se cambia el departamento
    });
  };

  const handleMunicipioChange = (e) => {
    const municipio = e.target.value;
    setAddressInfo({
      ...addressInfo,
      town: municipio,
    });
  };

  // Enviar la información personal al servidor
  const handleSubmitPersonalInfo = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Llamar al AuthContext para actualizar el perfil del usuario
      await updateUser({
        first_name: personalInfo.firstname,
        last_name: personalInfo.lastname,
        email: personalInfo.email,
        // Otros datos de usuario
      });
      setStep(2); // Avanzar al siguiente paso (dirección)
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  // Enviar la dirección al servidor
  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Llamar al AuthContext para agregar la dirección del usuario
      await addAddress({
        street: addressInfo.address,
        city: addressInfo.town,
        state: addressInfo.departament,
        postal_code: "110111", // Puedes añadir un campo para el código postal
        country: "Colombia",
        is_default: true, // Según la lógica de tu aplicación
      });
      navigate("/"); // Redirigir después de completar los pasos
    } catch (error) {
      console.error("Error al agregar la dirección:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.Container}>
      <div className={styles.Stepper}>
        {step === 1 && (
          <form onSubmit={handleSubmitPersonalInfo}>
            <h3>Completa tu información personal</h3>
            <div className={styles.InputGroup}>
              <label>Nombre</label>
              <input
                type="text"
                name="firstname"
                value={personalInfo.firstname}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div className={styles.InputGroup}>
              <label>Apellido</label>
              <input
                type="text"
                name="lastname"
                value={personalInfo.lastname}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div className={styles.InputGroup}>
              <label>Tipo de documento</label>
              <select
                name="documentType"
                value={personalInfo.documentType}
                onChange={handlePersonalInfoChange}
              >
                <option value="C.C.">C.C.</option>
                <option value="C.E.">C.E.</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>
            <div className={styles.InputGroup}>
              <label>Número de documento</label>
              <input
                type="text"
                name="documentNumber"
                value={personalInfo.documentNumber}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div className={styles.InputGroup}>
              <label>Celular</label>
              <input
                type="text"
                name="phone"
                value={personalInfo.phone}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Siguiente"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmitAddress}>
            <h3>¿Dónde recibirás tu pedido?</h3>
            <div className={styles.InputGroup}>
              <label>Departamento</label>
              <select
                name="departament"
                value={addressInfo.departament}
                onChange={handleDepartamentoChange}
              >
                <option value="">Selecciona un departamento</option>
                {Object.keys(departamentosYMunicipios).sort().map((departamento) => (
                  <option key={departamento} value={departamento}>
                    {departamento}
                  </option>
                ))}
              </select>
            </div>
            {addressInfo.departament && (
              <div className={styles.InputGroup}>
                <label>Municipio</label>
                <select
                  name="town"
                  value={addressInfo.town}
                  onChange={handleMunicipioChange}
                >
                  <option value="">Selecciona un municipio</option>
                  {departamentosYMunicipios[addressInfo.departament]
                    .sort()
                    .map((municipio) => (
                      <option key={municipio} value={municipio}>
                        {municipio}
                      </option>
                    ))}
                </select>
              </div>
            )}
            <div className={styles.InputGroup}>
              <label>Dirección</label>
              <input
                type="text"
                name="address"
                value={addressInfo.address}
                onChange={handleAddressInfoChange}
              />
            </div>
            <div className={styles.InputGroup}>
              <label>Detalle</label>
              <input
                type="text"
                name="detalle"
                value={addressInfo.detalle}
                onChange={handleAddressInfoChange}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Finalizar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateProfile;
