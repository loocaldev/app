import React, { useState, useEffect, useRef } from "react";
import { useCart } from "../hooks/useCart";
import { useLocation } from "react-router-dom";
import styles from "../styles/Checkout.module.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "react-phone-input-2/lib/style.css";
import toast, { Toaster } from "react-hot-toast";
import { departamentosYMunicipios } from "../data/departamentosYMunicipios";

// Formato de precios a moneda COP
const formatPriceToCOP = (price) => {
  const numericPrice = Number(price);
  if (!isNaN(numericPrice)) {
    return numericPrice.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
};

// Función para formatear una hora en formato de 24 horas a formato de 12 horas con AM/PM
const formatHour = (hour) => {
  const [hourPart, minutePart] = hour.split(":");
  let formattedHour = parseInt(hourPart);
  let period = "AM";

  if (formattedHour >= 12) {
    period = "PM";
    if (formattedHour > 12) {
      formattedHour -= 12;
    }
  }

  if (formattedHour === 0) {
    formattedHour = 12; // Manejar medianoche como 12 AM
  }

  return { hour: formattedHour, minute: minutePart, period: period };
};

// Nueva función para formatear las fechas
const formatDateString = (dateString) => {
  const [day, month, year] = dateString.split("/");
  const dateObj = new Date(year, month - 1, day);
  const today = new Date();
  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  if (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  ) {
    const dayOfWeek = daysOfWeek[dateObj.getDay()];
    return { dayOfWeek, dayOfMonth: "", month: "Hoy" };
  } else {
    const dayOfWeek = daysOfWeek[dateObj.getDay()];
    const monthName = months[dateObj.getMonth()];
    const dayOfMonth = dateObj.getDate();
    return { dayOfWeek, dayOfMonth, month: monthName };
  }
};


// Función para obtener las horas disponibles según la fecha seleccionada
const getAvailableHours = (selectedDate) => {
  const availableHours = [];
  const today = new Date();
  const currentHour = today.getHours();
  const [day, month, year] = selectedDate.split("/");
  const selectedDateObj = new Date(year, month - 1, day);

  if (selectedDateObj.getDate() === today.getDate()) {
    // Si la fecha seleccionada es hoy
    const startingHour = currentHour < 14 ? 18 : currentHour + 4;
    for (let hour = startingHour; hour <= 18; hour++) {
      availableHours.push(`${hour}:00`);
    }
  } else {
    // Si la fecha seleccionada no es hoy
    for (let hour = 8; hour <= 18; hour++) {
      availableHours.push(`${hour}:00`);
    }
  }

  return availableHours;
};

function Checkout() {
  const { cart, subtotal } = useCart();
  const location = useLocation();
  const scriptContainerRef = useRef(null);
  const [integrityHash, setIntegrityHash] = useState(null); // Hash de integridad para Wompi
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
    amount: subtotal * 100, // Monto en centavos
    currency: "COP",
  };

  // Obtener el hash de integridad del backend para Wompi
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

  // Inicializa el script de Wompi si no está cargado
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
        script.setAttribute("data-render", "false"); // Evita que se renderice el botón de Wompi automáticamente
        document.body.appendChild(script);
      }
    };

    loadWompiScript();
  }, []);

  // Abrir el checkout de Wompi al hacer clic en "Pagar y completar compra"
  const openWompiCheckout = () => {
    const checkout = new WidgetCheckout({
      currency: "COP",
      amountInCents: order.amount,
      reference: order.order_id,
      publicKey: "pub_test_gyZVH3hcyjvHHH8xA8AAvzue2QRBj49O", // Llave pública de Wompi
      signature: {
        integrity: integrityHash,
      },
      redirectUrl: `https://loocal.co/order-status?id=${order.order_id}`, // Redirección al finalizar
    });

    checkout.open((result) => {
      const transaction = result.transaction;
      if (transaction.status === "APPROVED") {
        // Redirigir manualmente si la transacción fue aprobada
        window.location.href = `https://loocal.co/order-status?id=${transaction.reference}`;
      } else {
        toast.error("La transacción no fue aprobada. Inténtalo de nuevo.");
      }
    });
  };

   // Definición de la función handleChange para actualizar los datos del formulario
   const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Remover el campo de la lista de campos incompletos si se completa
    if (incompleteFields.includes(name)) {
      const updatedIncompleteFields = incompleteFields.filter(
        (field) => field !== name
      );
      setIncompleteFields(updatedIncompleteFields);
    }
  };

  // Validación del formulario antes de proceder con el pago
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

  // Guardar los datos del formulario antes de iniciar el proceso de pago
  const handleFormSubmit = async () => {
    if (validateForm()) {
      try {
        await saveFormData(); // Guarda los datos del cliente
        openWompiCheckout(); // Inicia el widget de Wompi
      } catch (error) {
        console.error("Error al procesar la orden:", error);
        toast.error("Error al procesar la orden.");
      }
    } else {
      console.error("Formulario incompleto");
      toast.error("Por favor completa todos los campos requeridos.");
    }
  };

  // Guardar los datos del cliente en el backend
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
      if (!orderId) {
        throw new Error("No se encontró el ID de la orden.");
      }

      const response = await fetch(
        `https://loocal.co/api/orders/api/v1/orders/${orderId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patchData),
        }
      );

      if (!response.ok) {
        throw new Error("Error en la actualización de la orden.");
      }

      const data = await response.json();
      console.log("Datos de la orden actualizados:", data);

      // Limpiar el localStorage si es necesario
      localStorage.removeItem("orderId");
      localStorage.removeItem("cart");
    } catch (error) {
      console.error("Error al actualizar la orden:", error);
      toast.error("Error al actualizar la orden.");
    }
  };

  // Funciones para manejar la selección de fecha y hora
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      fechaEntrega: date,
    });
  };

  const handleTimeSelect = (hour) => {
    setSelectedHour(hour);
    setFormData({
      ...formData,
      horaEntrega: hour,
    });
  };

  // Manejo del cambio de departamento
  const handleDepartamentoChange = (event) => {
    const departamento = event.target.value;
    setDepartamentoSeleccionado(departamento);
    setMunicipioSeleccionado("");
    setFormData({
      ...formData,
      departament: departamento,
    });
  };

  // Manejo del cambio de municipio
  const handleMunicipioChange = (event) => {
    const municipio = event.target.value;
    setMunicipioSeleccionado(municipio);
    setFormData({
      ...formData,
      town: municipio,
    });
  };

  // Obtener los próximos 5 días disponibles para la entrega
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

  // Componente de selección de fecha
  const DatePicker = ({ dates, onDateSelect }) => {
    return (
      <div className={styles["date-picker"]}>
        {dates.map((date, index) => {
          const { dayOfWeek, month, dayOfMonth } = formatDateString(date);
          return (
            <div
              key={index}
              className={`${styles["date-option"]} ${
                date === selectedDate ? styles["selected"] : ""
              }`}
              onClick={() => onDateSelect(date)}
            >
              <span className={styles["date-option-day"]}>{dayOfWeek}</span>
              <br />
              <span className={styles["date-option-date"]}>
                {month} {dayOfMonth}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Componente de selección de hora
  const TimePicker = ({ selectedDate }) => {
    const availableHours = getAvailableHours(selectedDate);
    return (
      <div className={styles["time-picker"]}>
        {availableHours.map((hour, index) => {
          const { hour: formattedHour, minute, period } = formatHour(hour);
          return (
            <div
              key={index}
              className={`${styles["time-option"]} ${
                hour === selectedHour ? styles["selected"] : ""
              }`}
              onClick={() => handleTimeSelect(hour)}
            >
              <span className={styles["time-option-hour"]}>
                {formattedHour}:{minute}
              </span>
              <br />
              <span className={styles["time-option-period"]}>{period}</span>
            </div>
          );
        })}
      </div>
    );
  };

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
              ></input>
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
              ></input>
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
              ></input>
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
          <div className={styles["title-section-form"]}>
            <h3>¿Cuándo recibirás tu pedido?</h3>
          </div>
          <div className={styles["date-time-picker-container"]}>
            <label>Selecciona el día</label>
            <DatePicker
              dates={getNextFiveDays()}
              onDateSelect={handleDateSelect}
              className={
                incompleteFields.includes("fechaEntrega")
                  ? styles["incomplete-field"]
                  : ""
              }
            />
            {selectedDate && (
              <>
                <label>Selecciona una hora</label>
                <TimePicker
                  selectedDate={selectedDate}
                  onTimeSelect={handleTimeSelect}
                  className={
                    incompleteFields.includes("horaEntrega")
                      ? styles["incomplete-field"]
                      : ""
                  }
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
