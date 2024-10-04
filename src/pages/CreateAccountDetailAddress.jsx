import React, {useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import { departamentosYMunicipios } from "../data/departamentosYMunicipios";
import styles from "../styles/CreateAccountDetailAddress.module.css"

function CreateAccountDetailAddress() {
    const [incompleteFields, setIncompleteFields] = useState([]);
    const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState("");
    const [municipioSeleccionado, setMunicipioSeleccionado] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,
          [name]: value,
        });
      };
    
      const handleDepartamentoChange = (event) => {
        const departamento = event.target.value;
        setDepartamentoSeleccionado(departamento);
        setMunicipioSeleccionado("");
        setFormData({
          ...formData,
          departament: departamento,
        });
      };
    
      const handleMunicipioChange = (event) => {
        const municipio = event.target.value;
        setMunicipioSeleccionado(municipio);
        setFormData({
          ...formData,
          town: municipio,
        });
      };

  return (
    <>
      <form>
        <div className={styles["title-section-form"]}>
          <h3>¿Dónde recibirás tu pedido?</h3>
        </div>
        <div
          className={
            departamentoSeleccionado
              ? styles["two-columns-form"]
              : styles["one-column-form"]
          }
        >
          <div className={styles["input-form"]}>
            <label>Departamento</label>
            <select
              value={departamentoSeleccionado || "DEFAULT"}
              onChange={handleDepartamentoChange}
              name="departament"
              style={{
                maxWidth: departamentoSeleccionado ? "40vw" : "100vw",
              }}
              className={`${
                incompleteFields.includes("department")
                  ? styles["incomplete-field"]
                  : ""
              } ${styles["department-select"]}`}
            >
              <option value="DEFAULT" disabled hidden>
                Selecciona un departamento
              </option>
              {Object.keys(departamentosYMunicipios)
                .sort()
                .map((departamento) => (
                  <option key={departamento} value={departamento}>
                    {departamento}
                  </option>
                ))}
            </select>
          </div>
          {departamentoSeleccionado && (
            <div className={styles["input-form"]}>
              <label>Ciudad</label>

              <div>
                <select
                  value={municipioSeleccionado}
                  onChange={handleMunicipioChange}
                  className={`${
                    incompleteFields.includes("town")
                      ? styles["incomplete-field"]
                      : ""
                  } ${styles["city-select"]}`}
                  name="town"
                >
                  <option value="">Selecciona un municipio</option>
                  {departamentosYMunicipios[departamentoSeleccionado]
                    .sort()
                    .map((municipio) => (
                      <option key={municipio} value={municipio}>
                        {municipio}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}
        </div>
        <div className={styles["one-column-form"]}>
          <div className={styles["input-form"]}>
            <label>Dirección</label>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Calle 12 No. 5-10"
              onChange={handleChange}
              className={
                incompleteFields.includes("address")
                  ? styles["incomplete-field"]
                  : ""
              }
            ></input>
          </div>
          <div className={styles["input-form"]}>
            <label>Detalle</label>
            <input
              type="text"
              id="addressDetail"
              name="detalle"
              placeholder="Interior número 5, diagonal al colegio"
              onChange={handleChange}
            ></input>
          </div>
        </div>
      </form>
    </>
  );
}

export default CreateAccountDetailAddress;
