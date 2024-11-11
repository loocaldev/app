// src/components/AddressForm.jsx

import React from "react";
import { departamentosYMunicipios } from "../../data/departamentosYMunicipios";
import styles from "../../styles/NewCheckout.module.css"; // Asegúrate de importar el archivo de estilos adecuado

const AddressForm = ({ formData, onDepartamentoChange, onMunicipioChange, onAddressChange }) => {
  const sortedDepartments = Object.keys(departamentosYMunicipios).sort();
  const sortedMunicipalities =
    formData.departament && departamentosYMunicipios[formData.departament]
      ? [...departamentosYMunicipios[formData.departament]].sort()
      : [];

  return (
    <form>
      <div className="form-row">
        <div className="form-group">
          <label>Departamento</label>
          <select
            value={formData.departament}
            onChange={onDepartamentoChange}
          >
            <option value="">Selecciona un departamento</option>
            {sortedDepartments.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Ciudad</label>
          <select
            value={formData.town}
            onChange={onMunicipioChange}
            disabled={!formData.departament}
          >
            <option value="">
              {formData.departament
                ? "Selecciona un municipio"
                : "Selecciona un departamento"}
            </option>
            {sortedMunicipalities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Dirección de entrega</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={onAddressChange}
          />
        </div>
      </div>
    </form>
  );
};

export default AddressForm;
