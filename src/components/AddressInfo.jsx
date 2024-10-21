import React from "react";
import { departamentosYMunicipios } from "../data/departamentosYMunicipios"; // Supongo que tienes este archivo

function AddressInfo({ formData, handleChange }) {
  return (
    <div>
      <h2>Dirección de Entrega</h2>
      <form>
        <div>
          <label>Departamento</label>
          <select
            name="departament"
            value={formData.departament}
            onChange={handleChange}
          >
            <option value="">Selecciona un departamento</option>
            {Object.keys(departamentosYMunicipios).map((departamento) => (
              <option key={departamento} value={departamento}>
                {departamento}
              </option>
            ))}
          </select>
        </div>
        {formData.departament && (
          <div>
            <label>Ciudad</label>
            <select
              name="town"
              value={formData.town}
              onChange={handleChange}
            >
              <option value="">Selecciona un municipio</option>
              {departamentosYMunicipios[formData.departament].map((town) => (
                <option key={town} value={town}>
                  {town}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label>Dirección</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Detalle (Opcional)</label>
          <input
            type="text"
            name="detalle"
            value={formData.detalle}
            onChange={handleChange}
          />
        </div>
      </form>
    </div>
  );
}

export default AddressInfo;
