import React from "react";
import { indicativos } from "../../data/indicativos";
import styles from "../../styles/NewCheckout.module.css";

const UserDataForm = ({ formData, onChange, onPhoneCodeChange }) => {
  return (
    <form>
      <div className="form-row">
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={onChange}
          />
        </div>
        <div className="form-group">
          <label>Apellido</label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={onChange}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Tipo de documento</label> 
          <div className="form-multi-input">
            <select
              name="documentType"
              value={formData.documentType}
              onChange={onChange}
            >
              <option value="CC">C.C.</option>
              <option value="CE">C.E.</option>
              <option value="PP">Pasaporte</option>
            </select>
            <input
              type="text"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={onChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Número de celular</label>
          <div className="form-multi-input">
            <select
              name="phoneCode"
              value={formData.phoneCode}
              onChange={onPhoneCodeChange} // Cambiado a onPhoneCodeChange
            >
              {indicativos.map((indicativo, index) => (
                <option
                  key={`${indicativo.code}-${index}`} // Combinamos el código con el índice
                  value={indicativo.code}
                >
                  {`${indicativo.abbreviation} (${indicativo.code})`}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={onChange}
            />
          </div>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Correo electrónico</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
          />
        </div>
      </div>
    </form>
  );
};

export default UserDataForm;
