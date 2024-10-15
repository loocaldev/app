import React, { useState, useEffect } from "react";
import styles from "../styles/CreateAccountDetail.module.css";
import Logo from "../assets/logo.svg";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

import 'react-phone-input-2/lib/material.css'

function CreateAccountDetail() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    documentType: "C.C.",
    documentNumber: "",
    phone: "",
    email: ""
  }); 
  const { updateUser } = useAuth();
  const [incompleteFields, setIncompleteFields] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e, name = null) => {
    if (name) {
      // Es una llamada de PhoneInput
      setFormData({
        ...formData,
        [name]: e,
      });
    } else {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    const requiredFields = ["firstname", "lastname", "documentType", "documentNumber", "phone"];
    const newIncompleteFields = requiredFields.filter(field => !formData[field]);
    setIncompleteFields(newIncompleteFields);

    if (newIncompleteFields.length > 0) {
      console.log("Incomplete fields:", newIncompleteFields);
      return; // No enviar el formulario si hay campos incompletos
    }

    try {
      setLoading(true);
      console.log("Form data to send:", formData);
      await updateUser({
        first_name: formData.firstname,
        last_name: formData.lastname,
        email: formData.email,
        // Añadir otros campos necesarios para actualizar el perfil
      });
      navigate("/crear-cuenta/detalles/direccion");
    } catch (error) {
      console.error("Error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.Container}>
      <div className={styles["box"]}>
        <div className={styles["box-content"]}>
          <img src={Logo} />
          <h3>Completa tu registro</h3>
          <p>Registrando tu información podrás hacer pedidos más rápido</p>
          <div className={styles["box-form"]}>
            <form>
              <div className={styles["two-columns-form"]}>
                <div className={styles["input-form"]}>
                  <label>Nombre</label>
                  <input
                    type="text"
                    name="firstname"
                    onChange={handleChange}
                    className={
                      incompleteFields.includes("firstname")
                        ? styles["incomplete-field"]
                        : ""
                    }
                  ></input>
                </div>
                <div className={styles["input-form"]}>
                  <label>Apellido</label>
                  <input
                    type="text"
                    name="lastname"
                    onChange={handleChange}
                    className={
                      incompleteFields.includes("lastname")
                        ? styles["incomplete-field"]
                        : ""
                    }
                  ></input>
                </div>
              </div>
              <div className={styles["two-columns-form-13"]}>
                <div
                  className={`${styles["input-form"]} ${
                    incompleteFields.includes("documentType")
                      ? styles["incomplete-field"]
                      : ""
                  }`}
                >
                  <label>Tipo de documento</label>
                  <select
                    name="documentType"
                    onChange={handleChange}
                    className={
                      incompleteFields.includes("documentType")
                        ? styles["incomplete-select"]
                        : ""
                    }
                  >
                    <option value="CC">C.C.</option>
                    <option value="CE">C.E.</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div className={styles["input-form"]}>
                  <label>Número de documento</label>
                  <input
                    type="number"
                    name="documentNumber"
                    onChange={handleChange}
                    className={
                      incompleteFields.includes("documentNumber")
                        ? styles["incomplete-field"]
                        : ""
                    }
                  ></input>
                </div>
              </div>
              <div className={styles["one-column-form"]}>
                <div className={styles["input-form"]}>
                  <label>Celular</label>
                  <input
                    type="number"
                    name="phone"
                    onChange={handleChange}
                    className={
                      incompleteFields.includes("phone")
                        ? styles["incomplete-field"]
                        : ""
                    }
                  ></input>
                </div>
              </div>
              <button onClick={handleSubmit}>Continuar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAccountDetail;
