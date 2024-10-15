import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { departamentosYMunicipios } from "../data/departamentosYMunicipios";
import styles from "../styles/CreateAccountDetailAddress.module.css";
import { useAuth } from "../context/AuthContext.jsx";  // Importar el contexto de autenticación

function CreateAccountDetailAddress() {
  const [formData, setFormData] = useState({
    departament: "",  
    town: "",         
    address: "",      
    detalle: ""       
  });
  const [incompleteFields, setIncompleteFields] = useState([]);
  const { addAddress } = useAuth();  // Obtener la función addAddress del contexto
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDepartamentoChange = (event) => {
    const departamento = event.target.value;
    setFormData({
      ...formData,
      departament: departamento,
      town: "",  // Resetear el municipio cuando cambia el departamento
    });
  };

  const handleMunicipioChange = (event) => {
    const municipio = event.target.value;
    setFormData({
      ...formData,
      town: municipio,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIncompleteFields([]);

    const requiredFields = ["departament", "town", "address"];
    const newIncompleteFields = requiredFields.filter(field => !formData[field]);
    setIncompleteFields(newIncompleteFields);

    if (newIncompleteFields.length > 0) {
      console.log("Incomplete fields:", newIncompleteFields);
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    try {
      setLoading(true);
      console.log("Form data to send:", formData);

      // Enviar la dirección a través del contexto de Auth
      await addAddress({
        street: formData.address,
        city: formData.town,
        state: formData.departament,
        postal_code: "110111",  // Puedes agregar otro campo para el código postal si es necesario
        country: "Colombia",  // Ajusta según tus necesidades
        is_default: true,  // Puedes cambiar según la lógica de tu app
      });

      alert("Dirección agregada exitosamente.");
      navigate("/");  // Redirigir a la página que prefieras
    } catch (error) {
      console.error("Error al agregar la dirección:", error);
      alert("Error al agregar la dirección. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.Container}>
      <form onSubmit={handleSubmit}>
        <div className={styles["title-section-form"]}>
          <h3>¿Dónde recibirás tu pedido?</h3>
        </div>

        <div className={formData.departament ? styles["two-columns-form"] : styles["one-column-form"]}>
          <div className={styles["input-form"]}>
            <label>Departamento</label>
            <select
              value={formData.departament || "DEFAULT"}
              onChange={handleDepartamentoChange}
              name="departament"
              className={incompleteFields.includes("departament") ? styles["incomplete-field"] : ""}
            >
              <option value="DEFAULT" disabled hidden>Selecciona un departamento</option>
              {Object.keys(departamentosYMunicipios).sort().map(departamento => (
                <option key={departamento} value={departamento}>{departamento}</option>
              ))}
            </select>
          </div>

          {formData.departament && (
            <div className={styles["input-form"]}>
              <label>Ciudad</label>
              <select
                value={formData.town}
                onChange={handleMunicipioChange}
                className={incompleteFields.includes("town") ? styles["incomplete-field"] : ""}
                name="town"
              >
                <option value="">Selecciona un municipio</option>
                {departamentosYMunicipios[formData.departament].sort().map(municipio => (
                  <option key={municipio} value={municipio}>{municipio}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className={styles["one-column-form"]}>
          <div className={styles["input-form"]}>
            <label>Dirección</label>
            <input
              type="text"
              name="address"
              placeholder="Calle 12 No. 5-10"
              value={formData.address}
              onChange={handleChange}
              className={incompleteFields.includes("address") ? styles["incomplete-field"] : ""}
            />
          </div>

          <div className={styles["input-form"]}>
            <label>Detalle</label>
            <input
              type="text"
              name="detalle"
              placeholder="Interior número 5, diagonal al colegio"
              value={formData.detalle}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles["submit-button"]}>
          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateAccountDetailAddress;
