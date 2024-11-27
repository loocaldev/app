import React, { useState, useEffect } from "react";
import { indicativos } from "../../data/indicativos";
import styles from "../../styles/NewCheckout.module.css";

const UserDataForm = ({
  formData,
  onChange,
  onPhoneCodeChange,
  isReadOnly,
  defaultUserType = "persona", // Tipo de usuario por defecto
  showUserTypeSelector = true,
}) => {
  const [userType, setUserType] = useState(defaultUserType);

  useEffect(() => {
    setUserType(defaultUserType);
  }, [defaultUserType]);

  const handleUserTypeChange = (type) => {
    setUserType(type);
    onChange({ target: { name: "userType", value: type } });
  };

  return (
    <form>
      {/* Selector de tipo de usuario */}
      {showUserTypeSelector && (
        <div className="user-type-selector">
          <label
            className={userType === "persona" ? "selected" : ""}
            onClick={() => handleUserTypeChange("persona")}
          >
            Persona
          </label>
          <label
            className={userType === "empresa" ? "selected" : ""}
            onClick={() => handleUserTypeChange("empresa")}
          >
            Empresa
          </label>
        </div>
      )}
      {/* Campos del formulario */}
      <div className="form-row">
        <div className="form-group">
          <label>
            {userType === "empresa" ? "Nombre o razón social" : "Nombre"}
          </label>
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={onChange}
            readOnly={isReadOnly}
          />
        </div>
        {userType !== "empresa" && (
          <div className="form-group">
            <label>Apellido</label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={onChange}
              readOnly={isReadOnly}
            />
          </div>
        )}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Tipo de documento</label>
          <div className="form-multi-input">
            <select
              name="documentType"
              value={formData.documentType}
              onChange={onChange}
              disabled={isReadOnly || userType === "empresa"} // Bloqueado si es "empresa"
            >
              {userType === "empresa" ? (
                <option value="NIT">NIT</option>
              ) : (
                <>
                  <option value="CC">C.C.</option>
                  <option value="CE">C.E.</option>
                  <option value="PP">Pasaporte</option>
                </>
              )}
            </select>
            <input
              type="text"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={onChange}
              readOnly={isReadOnly}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Número de celular</label>
          <div className="form-multi-input">
            <select
              name="phoneCode"
              value={formData.phoneCode}
              onChange={onPhoneCodeChange}
              disabled={isReadOnly}
            >
              {indicativos.map((indicativo, index) => (
                <option
                  key={`${indicativo.code}-${index}`}
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
              readOnly={isReadOnly}
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
            readOnly={isReadOnly}
          />
        </div>
      </div>
    </form>
  );
};

export default UserDataForm;
