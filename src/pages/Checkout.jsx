import React, { useState, useEffect, useRef, useMemo } from "react";
import { useCart } from "../hooks/useCart";
import { useLocation } from "react-router-dom";
import styles from "../styles/Checkout.module.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "react-phone-input-2/lib/style.css";
import toast, { Toaster } from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { departamentosYMunicipios } from "../data/departamentosYMunicipios";

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

const initBoldCheckout = () => {
  if (
    document.querySelector(
      'script[src="https://checkout.bold.co/library/boldPaymentButton.js"]'
    )
  ) {
    console.warn("Bold Checkout script is already loaded.");
    return;
  }

  var js;
  js = document.createElement("script");
  js.onload = () => {
    window.dispatchEvent(new Event("boldCheckoutLoaded"));
  };
  js.onerror = () => {
    window.dispatchEvent(new Event("boldCheckoutLoadFailed"));
  };
  js.src = "https://checkout.bold.co/library/boldPaymentButton.js";
  document.head.appendChild(js);
};

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

  useEffect(() => {
    if (location.state && location.state.integrity_hash) {
      setIntegrityHash(location.state.integrity_hash);
    }
  }, [location.state]);

  const order = {
    order_id: localStorage.getItem("orderId"),
    amount: subtotal * 100, // Convertimos el monto a centavos
    currency: "COP",
  };

  // Obtener el hash de integridad del backend
  useEffect(() => {
    const fetchIntegrityHash = async () => {
      try {
        const response = await fetch("https://loocal.co/api/payments/generate_integrity_hash/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ order }),
        });
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

  // Inicializar el script de Wompi cuando el hash esté listo
  useEffect(() => {
    if (integrityHash && order.order_id && order.amount) {
      const script = document.createElement("script");
      script.src = "https://checkout.wompi.co/widget.js";
      script.async = true;
      script.setAttribute("data-render", "button");
      script.setAttribute("data-public-key", "pub_test_gyZVH3hcyjvHHH8xA8AAvzue2QRBj49O"); // Llave pública Wompi
      script.setAttribute("data-currency", order.currency);
      script.setAttribute("data-amount-in-cents", order.amount);
      script.setAttribute("data-reference", order.order_id);
      script.setAttribute("data-signature:integrity", integrityHash);
      script.setAttribute("data-redirect-url", "https://loocal.co/order-status");// URL redirección al finalizar

      if (scriptContainerRef.current) {
        scriptContainerRef.current.innerHTML = ""; // Limpiar cualquier script previo
        scriptContainerRef.current.appendChild(script);
      }
    }
  }, [integrityHash, order]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  
    // Remover el campo de la lista de campos incompletos si se completa
    if (incompleteFields.includes(name)) {
      const updatedIncompleteFields = incompleteFields.filter(field => field !== name);
      setIncompleteFields(updatedIncompleteFields);
    }
  };

  const validateForm = () => {
    const requiredFields = ["firstname", "lastname", "documentNumber", "documentType", "phone", "email", "address", "fechaEntrega", "horaEntrega"];
    const incompleteFields = requiredFields.filter((field) => formData[field] === "");
    if (incompleteFields.length > 0) {
      setIncompleteFields(incompleteFields);
      toast.error(`Por favor completa los campos`);
      return false;
    }
    return true;
  };

  const handleFormSubmit = async () => {
    if (validateForm()) {
      try {
        await saveFormData();  // Asegúrate de que los datos del cliente se guardan correctamente
        openWompiCheckout();  // Dispara el widget de Wompi después de guardar los datos
      } catch (error) {
        console.error("Error al procesar la orden:", error);
        toast.error("Error al procesar la orden.");
      }
    } else {
      console.error("¡El formulario no está completo!");
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
      if (!orderId) {
        throw new Error("No se encontró el ID de la orden.");
      }
  
      const response = await fetch(`https://loocal.co/api/orders/api/v1/orders/${orderId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patchData),
      });
  
      if (!response.ok) {
        throw new Error("Error en la actualización de la orden.");
      }
  
      const data = await response.json();
      console.log("Datos de la orden actualizados:", data);
      
      // Remover la orden del localStorage si es necesario
      localStorage.removeItem("orderId");
      localStorage.removeItem("cart");
      
      // Aquí puedes proceder a iniciar el pago si todo salió bien
    } catch (error) {
      console.error("Error al actualizar la orden:", error);
      toast.error("Error al actualizar la orden.");
    }
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

  useEffect(() => {
    const loadWompiScript = () => {
      const script = document.createElement('script');
      script.src = "https://checkout.wompi.co/widget.js";
      script.async = true;
      document.body.appendChild(script);
    };
  
    loadWompiScript();
  }, []);

  const openWompiCheckout = () => {
    const checkout = new WidgetCheckout({
      currency: "COP",
      amountInCents: order.amount,  // Asegúrate de que `order.amount` esté en centavos
      reference: order.order_id,  // Usa el `order_id` de tu orden
      publicKey: "pub_test_gyZVH3hcyjvHHH8xA8AAvzue2QRBj49O",  // Llave pública de Wompi
      signature: {
        integrity: integrityHash,  // Firma de integridad generada en el backend
      },
      redirectUrl: "https://loocal.co/order-status",  // URL de redirección cuando se completa el pago
    });
  
    checkout.open((result) => {
      const transaction = result.transaction;
      console.log("Transaction ID: ", transaction.id);
      console.log("Transaction object: ", transaction);
    });
  };
  

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      departament: departamentoSeleccionado,
      town: municipioSeleccionado,
    }));
  }, [departamentoSeleccionado, municipioSeleccionado]);

  const getNextFiveDays = () => {
    const days = [];
    const today = new Date();
    const currentHour = today.getHours();

    // Si es menos de 4 horas antes de las 6pm, mostrar solo los siguientes 5 días
    if (currentHour >= 15) {
      for (let i = 1; i < 6; i++) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i);
        days.push(nextDate.toLocaleDateString());
      }
    } else {
      // Si hay más de 4 horas antes de las 6pm, incluir el día actual y los siguientes 4 días
      for (let i = 0; i < 5; i++) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i);
        days.push(nextDate.toLocaleDateString());
      }
    }
    return days;
  };

  useEffect(() => {
    const dates = getNextFiveDays();
    setAvailableDates(dates);
  }, []);

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

  const formatHour = (hour) => {
    const [hourPart, minutePart] = hour.split(":");
    let formattedHour = parseInt(hourPart);
    let period = "am";

    if (formattedHour >= 12) {
      period = "pm";
      if (formattedHour > 12) {
        formattedHour -= 12;
      }
    }

    return { hour: formattedHour, minute: minutePart, period: period };
  };

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
              <input type="text" name="firstname" onChange={handleChange} className={incompleteFields.includes("firstname") ? styles["incomplete-field"] : ""}></input>
            </div>
            <div className={styles["input-form"]}>
              <label>Apellido</label>
              <input
                type="text"
                name="lastname"
                onChange={handleChange}
                className={incompleteFields.includes("lastname") ? styles["incomplete-field"] : ""}
              ></input>
            </div>
          </div>
          <div className={styles["two-columns-form-13"]}>
            <div className={`${styles["input-form"]} ${incompleteFields.includes("documentType") ? styles["incomplete-field"] : ""}`}>
              <label>Tipo de documento</label>
              <select name="documentType" onChange={handleChange} className={incompleteFields.includes("documentType") ? styles["incomplete-select"] : ""}>
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
                className={incompleteFields.includes("documentNumber") ? styles["incomplete-field"] : ""}
              ></input>
            </div>
          </div>
          <div className={styles["one-column-form"]}>
            <div className={styles["input-form"]}>
              <label>Celular</label>
              <input type="tel" name="phone" onChange={handleChange} className={incompleteFields.includes("phone") ? styles["incomplete-field"] : ""}></input>
            </div>
            <div className={styles["input-form"]}>
              <label>Correo electrónico</label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                className={incompleteFields.includes("email") ? styles["incomplete-field"] : ""}
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
                className={`${incompleteFields.includes("department") ? styles["incomplete-field"] : ""} ${styles["department-select"]}`}
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
                    className={`${incompleteFields.includes("town") ? styles["incomplete-field"] : ""} ${styles["city-select"]}`}
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
                className={incompleteFields.includes("address") ? styles["incomplete-field"] : ""}
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
              className={incompleteFields.includes("fechaEntrega") ? styles["incomplete-field"] : ""}
            />
            {selectedDate && (
              <>
                <label>Selecciona una hora</label>
                <TimePicker
                  selectedDate={selectedDate}
                  onTimeSelect={handleTimeSelect}
                  className={incompleteFields.includes("horaEntrega") ? styles["incomplete-field"] : ""}
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
          id="bold-checkout-button"
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
