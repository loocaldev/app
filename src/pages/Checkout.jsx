import React, { useState, useEffect, useRef } from "react";
import { useCart } from "../hooks/useCart";
import { useLocation } from "react-router-dom";
import styles from "../styles/Checkout.module.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "react-phone-input-2/lib/style.css";
import toast, { Toaster } from "react-hot-toast";
import { departamentosYMunicipios } from "../data/departamentosYMunicipios";
import formatPriceToCOP from "../utils/formatPrice";
import TimePicker from '../components/TimePicker';
import {
  formatHour,
  formatDateString,
  getAvailableHours,
} from "../utils/dateTime";
import DatePicker from "../components/DatePicker";

function Checkout() {
  const { cart, subtotal } = useCart();
  const location = useLocation();
  const scriptContainerRef = useRef(null);
  const [integrityHash, setIntegrityHash] = useState(null);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState("");
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [incompleteFields, setIncompleteFields] = useState([]);
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
    addressDetail: "",
    fechaEntrega: "",
    horaEntrega: "",
  });

  const order = {
    order_id: localStorage.getItem("orderId"),
    amount: subtotal * 100,
    currency: "COP",
  };

  useEffect(() => {
    const fetchIntegrityHash = async () => {
      try {
        const response = await fetch(
          "https://loocal.co/api/payments/generate_integrity_hash/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ order }),
          }
        );
        const data = await response.json();
        setIntegrityHash(data.hash);
      } catch (error) {
        console.error("Error al generar el hash de integridad:", error);
      }
    };

    if (order.order_id && order.amount) {
      fetchIntegrityHash();
    }
  }, [order]);

  useEffect(() => {
    const loadWompiScript = () => {
      if (
        !document.querySelector(
          "script[src='https://checkout.wompi.co/widget.js']"
        )
      ) {
        const script = document.createElement("script");
        script.src = "https://checkout.wompi.co/widget.js";
        script.async = true;
        script.setAttribute("data-render", "false");
        document.body.appendChild(script);
      }
    };

    loadWompiScript();
  }, []);

  const openWompiCheckout = () => {
    const checkout = new WidgetCheckout({
      currency: "COP",
      amountInCents: order.amount,
      reference: order.order_id,
      publicKey: "pub_test_gyZVH3hcyjvHHH8xA8AAvzue2QRBj49O",
      signature: { integrity: integrityHash },
      redirectUrl: `https://loocal.co/order-status?id=${order.order_id}`,
    });

    checkout.open((result) => {
      const transaction = result.transaction;
      if (transaction.status === "APPROVED") {
        window.location.href = `https://loocal.co/order-status?id=${transaction.id}`;
      } else {
        toast.error("La transacción no fue aprobada. Inténtalo de nuevo.");
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (incompleteFields.includes(name)) {
      const updatedIncompleteFields = incompleteFields.filter(
        (field) => field !== name
      );
      setIncompleteFields(updatedIncompleteFields);
    }
  };

  const validateForm = () => {
    const requiredFields = [
      "firstname",
      "lastname",
      "documentNumber",
      "documentType",
      "phone",
      "email",
      "address",
      "fechaEntrega",
      "horaEntrega",
    ];
    const incompleteFields = requiredFields.filter(
      (field) => formData[field] === ""
    );
    if (incompleteFields.length > 0) {
      setIncompleteFields(incompleteFields);
      toast.error("Por favor completa los campos.");
      return false;
    }
    return true;
  };

  const handleFormSubmit = async () => {
    if (validateForm()) {
      try {
        await saveFormData();
        openWompiCheckout();
      } catch (error) {
        console.error("Error al procesar la orden:", error);
        toast.error("Error al procesar la orden.");
      }
    } else {
      toast.error("Por favor completa todos los campos requeridos.");
    }
  };

  const saveFormData = async () => {
    try {
      const patchData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        fechaEntrega: formData.fechaEntrega,
        horaEntrega: formData.horaEntrega,
      };

      const orderId = localStorage.getItem("orderId");
      if (!orderId) throw new Error("No se encontró el ID de la orden.");

      const response = await fetch(
        `https://loocal.co/api/orders/api/v1/orders/${orderId}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchData),
        }
      );

      if (!response.ok)
        throw new Error("Error en la actualización de la orden.");
      localStorage.removeItem("orderId");
      localStorage.removeItem("cart");
    } catch (error) {
      console.error("Error al actualizar la orden:", error);
      toast.error("Error al actualizar la orden.");
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setFormData({ ...formData, fechaEntrega: date });
  };

  const handleTimeSelect = (hour) => {
    setSelectedHour(hour);
    setFormData({ ...formData, horaEntrega: hour });
  };

  const handleDepartamentoChange = (event) => {
    setDepartamentoSeleccionado(event.target.value);
    setMunicipioSeleccionado("");
    setFormData({ ...formData, departament: event.target.value });
  };

  const handleMunicipioChange = (event) => {
    setMunicipioSeleccionado(event.target.value);
    setFormData({ ...formData, town: event.target.value });
  };

  const getNextFiveDays = () => {
    const days = [];
    const today = new Date();
    const currentHour = today.getHours();

    if (currentHour >= 15) {
      for (let i = 1; i < 6; i++) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i);
        days.push(nextDate.toLocaleDateString());
      }
    } else {
      for (let i = 0; i < 5; i++) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i);
        days.push(nextDate.toLocaleDateString());
      }
    }
    return days;
  };

  useEffect(() => {
    setAvailableDates(getNextFiveDays());
  }, []);

  return (
    <>
      <div className={styles["header"]}>
        <div className={styles["header-content"]}>
          <FiChevronLeft onClick={() => window.history.back()} />
          <h2>Completa tu compra</h2>
        </div>
        <hr className={styles["divider-header"]} />
      </div>
      <div className={styles["order-content"]}>
        <div className={styles["order-resume"]}>
          <div className={styles["order-detail"]}>
            <p>
              {cart.length} {cart.length === 1 ? "producto" : "productos"}
            </p>
          </div>
          <div className={styles["order-price"]}>
            <p>{formatPriceToCOP(subtotal)}</p>
          </div>
        </div>
        <form onSubmit={handleFormSubmit} className={styles.Checkout}>
          <div className={styles["title-section-form"]}>
            <h3>Tu información</h3>
          </div>
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
              />
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
              />
            </div>
          </div>
          <div className={styles["two-columns-form-13"]}>
            <div className={styles["input-form"]}>
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
                <option value="C.C.">C.C.</option>
                <option value="C.E.">C.E.</option>
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
              />
            </div>
          </div>
          <div className={styles["one-column-form"]}>
            <div className={styles["input-form"]}>
              <label>Celular</label>
              <input
                type="tel"
                name="phone"
                onChange={handleChange}
                className={
                  incompleteFields.includes("phone")
                    ? styles["incomplete-field"]
                    : ""
                }
              />
            </div>
            <div className={styles["input-form"]}>
              <label>Correo electrónico</label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                className={
                  incompleteFields.includes("email")
                    ? styles["incomplete-field"]
                    : ""
                }
              />
            </div>
          </div>
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
                className={`${styles["department-select"]} ${
                  incompleteFields.includes("department")
                    ? styles["incomplete-field"]
                    : ""
                }`}
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
                <select
                  value={municipioSeleccionado}
                  onChange={handleMunicipioChange}
                  name="town"
                  className={`${styles["city-select"]} ${
                    incompleteFields.includes("town")
                      ? styles["incomplete-field"]
                      : ""
                  }`}
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
              />
            </div>
            <div className={styles["input-form"]}>
              <label>Detalle</label>
              <input
                type="text"
                id="addressDetail"
                name="detalle"
                placeholder="Interior número 5, diagonal al colegio"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles["title-section-form"]}>
            <h3>¿Cuándo recibirás tu pedido?</h3>
          </div>
          <div className={styles["date-time-picker-container"]}>
            <label>Selecciona el día</label>
            <DatePicker
              dates={getNextFiveDays()}
              onDateSelect={handleDateSelect}
            />
            {selectedDate && (
              <>
                <label>Selecciona una hora</label>
                <TimePicker
                  selectedDate={selectedDate}
                  selectedHour={selectedHour}
                  onTimeSelect={handleTimeSelect}
                />
              </>
            )}
          </div>
          <Toaster position="top-right" />
        </form>
      </div>
      <div className={styles["checkout-action"]}>
        <div className={styles["checkout-action-content"]}></div>
        {/* Contenedor del script de Wompi */}
        <div ref={scriptContainerRef} />
        <div
          id="custom-checkout-button"
          className={styles["checkout-action-button"]}
          onClick={handleFormSubmit}
        >
          <p>Pagar y completar compra</p>
          <FiChevronRight />
        </div>
      </div>
    </>
  );
}

export default Checkout;
