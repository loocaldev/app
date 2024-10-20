import React, { useState, useEffect, useRef } from "react";
import { useCart } from "../hooks/useCart";
import { useLocation } from "react-router-dom";
import styles from "../styles/Checkout.module.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "react-phone-input-2/lib/style.css";
import toast, { Toaster } from "react-hot-toast";
import { departamentosYMunicipios } from "../data/departamentosYMunicipios";
import formatPriceToCOP from "../utils/formatPrice";
import TimePicker from "../components/TimePicker";
import axios from "axios";
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
  const [loading, setLoading] = useState(false); // Estado para manejar la carga
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
  const [orderId, setOrderId] = useState(localStorage.getItem("orderId"));

  // Función para generar custom_order_id
  const generateOrderId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = ("0" + (now.getMonth() + 1)).slice(-2);
    const day = ("0" + now.getDate()).slice(-2);
    const hour = ("0" + now.getHours()).slice(-2);
    const minute = ("0" + now.getMinutes()).slice(-2);
    const second = ("0" + now.getSeconds()).slice(-2);
    const millisecond = ("00" + now.getMilliseconds()).slice(-3);
    const productCount = "C" + cart.length;
    const randomValue = "R" + Math.floor(Math.random() * 9000 + 1000);
    return `LC${year}${month}${day}${hour}${minute}${second}${millisecond}${productCount}${randomValue}`;
  };

  // Crear la orden en el backend
  const createOrder = async () => {
    const newOrderId = generateOrderId();
    setOrderId(newOrderId);
    localStorage.setItem("orderId", newOrderId);

    const orderItems = cart.map((item) => ({
      product_id: item.id,
      product_variation_id: item.variationId || null,
      quantity: item.quantity,
    }));

    const addressData = {
      street: formData.address,
      city: "Bogotá",
      state: "Cundinamarca",
      postal_code: "00000",
      country: "Colombia",
    };

    const orderData = {
      custom_order_id: newOrderId,
      firstname: formData.firstname,
      lastname: formData.lastname,
      email: formData.email,
      phone: formData.phone,
      ...addressData,
      items: orderItems,
      delivery_date: formData.fechaEntrega,
      delivery_time: formData.horaEntrega,
      subtotal: subtotal,
    };

    try {
      const response = await axios.post(
        "https://loocal.co/api/orders/api/v1/orders/",
        orderData
      );
      console.log("Orden creada:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al crear la orden:", error);
      throw new Error("No se pudo crear la orden.");
    }
  };

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

  // Modificar el JSON que envías al backend
  const fetchIntegrityHash = async (orderId, amount) => {
    try {
      const response = await fetch(
        "https://loocal.co/api/payments/generate_integrity_hash/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Cambia la estructura de envío para que coincida con lo que el backend espera
          body: JSON.stringify({
            order: {
              order_id: orderId,
              amount: amount,
              currency: "COP", // Si quieres mantener 'COP' por defecto
            },
          }),
        }
      );
      const data = await response.json();
      console.log("Hash generado:", data.hash);
      return data.hash;
    } catch (error) {
      console.error("Error al generar el hash de integridad:", error);
      throw new Error("No se pudo generar el hash de integridad.");
    }
  };
  // Abrir el widget de Wompi
  const openWompiCheckout = (hash, orderId, amount) => {
    const checkout = new WidgetCheckout({
      currency: "COP",
      amountInCents: amount,
      reference: orderId,
      publicKey: "pub_test_gyZVH3hcyjvHHH8xA8AAvzue2QRBj49O",
      signature: { integrity: hash },
      redirectUrl: `https://loocal.co/order-status?id=${orderId}`,
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

  // Validar el formulario antes de enviar la orden
  const validateForm = () => {
    const requiredFields = [
      "firstname",
      "lastname",
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
      toast.error("Por favor completa todos los campos.");
      return false;
    }
    return true;
  };

  // Manejar la acción del botón de pagar
  const handleFormSubmit = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        // 1. Crear la orden
        const orderData = await createOrder();

        // 2. Obtener el hash de integridad
        const hash = await fetchIntegrityHash(
          orderData.custom_order_id,
          subtotal * 100
        );

        // 3. Verificar si el hash está disponible y abrir el widget de Wompi
        if (hash) {
          openWompiCheckout(hash, orderData.custom_order_id, subtotal * 100);
        } else {
          throw new Error("No se pudo generar el hash de integridad.");
        }
      } catch (error) {
        console.error("Error al procesar la orden:", error);
        toast.error("Error al procesar la orden.");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Por favor completa todos los campos requeridos.");
    }
  };

  // Función para manejar los cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateSelect = (dateString) => {
    // dateString es el valor seleccionado del DatePicker, como "21/10/2024"

    // Divide el string en día, mes y año
    const [day, month, year] = dateString.split("/");

    // Crea un nuevo objeto Date en el formato adecuado "YYYY-MM-DD"
    const formattedDate = new Date(`${year}-${month}-${day}`);

    // Actualiza el estado con la fecha formateada a "YYYY-MM-DD"
    if (!isNaN(formattedDate)) {
      // Verificamos si es una fecha válida
      setSelectedDate(formattedDate.toISOString().split("T")[0]); // Solo la parte de la fecha
      setFormData({
        ...formData,
        fechaEntrega: formattedDate.toISOString().split("T")[0],
      });
    } else {
      console.error("Fecha inválida:", dateString);
      toast.error("Fecha inválida, por favor selecciona una fecha correcta.");
    }
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
              selectedDate={selectedDate} // Pasa la fecha seleccionada aquí
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
        {/* Tu código de UI */}
        <div
          id="custom-checkout-button"
          className={styles["checkout-action-button"]}
          onClick={handleFormSubmit}
        >
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <>
              <p>Pagar y completar compra</p>
              <FiChevronRight />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Checkout;
