import React, { useState, useEffect } from "react";
import styles from "../styles/NewCheckout.module.css";
import Logo from "../assets/logo.svg";
import ProductCardSQRead from "../components/ProductCardSQRead";
import {
  FiChevronLeft,
  FiMapPin,
  FiUser,
  FiChevronRight,
  FiShoppingCart,
} from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { CiUser } from "react-icons/ci";
import { useCart } from "../hooks/useCart";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useScreenSize from "../hooks/useScreenSize.js";
import DatePicker from "../components/DatePicker";
import TimePicker from "../components/TimePicker";
import ProductCardHZRead from "../components/ProductCardHZRead.jsx";
import axios from "axios";
import toast from "react-hot-toast";
import { departamentosYMunicipios } from "../data/departamentosYMunicipios"; // Este archivo ya debe estar en tu estructura

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

function NewCheckout() {
  const { cart, subtotal } = useCart();
  const navigate = useNavigate();
  const { token, isAuthenticated, logout, userData } = useAuth();
  const isMobile = useScreenSize();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    documentType: "CC",
    documentNumber: "",
    phone: "",
    email: "",
    departament: "",
    town: "",
    address: "",
    delivery_date: "",
    delivery_time: "",
    paymentPreference: "inPerson",
    discountCode: "",
  });
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [discountInfo, setDiscountInfo] = useState(null);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discountStatusMessage, setDiscountStatusMessage] = useState("");
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [paymentDiscount, setPaymentDiscount] = useState(0); // Descuento por pagar online

  useEffect(() => {
    // Si el usuario selecciona "Pagar ahora", aplicar un 5% de descuento
    if (formData.paymentPreference === "online") {
      setPaymentDiscount(0.05 * subtotal); // Calcular el 5%
    } else {
      setPaymentDiscount(0); // Si no es online, el descuento es 0
    }
  }, [formData.paymentPreference, subtotal]);

  // Calcular el subtotal final después de los descuentos
  const totalDiscount =
    paymentDiscount + (discountInfo ? discountInfo.discount_value : 0);
  const finalTotal = subtotal - totalDiscount;

  useEffect(() => {
    if (isNavbarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isNavbarOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleDateSelect = (dateString) => {
    const [day, month, year] = dateString.split("/");
    const formattedDate = new Date(`${year}-${month}-${day}`);
    if (!isNaN(formattedDate)) {
      setSelectedDate(formattedDate.toISOString().split("T")[0]);
      setFormData({
        ...formData,
        delivery_date: formattedDate.toISOString().split("T")[0],
      });
    } else {
      toast.error("Fecha inválida, por favor selecciona una fecha correcta.");
    }
  };

  const handleTimeSelect = (hour) => {
    setSelectedHour(hour);
    setFormData({ ...formData, delivery_time: hour });
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

  useEffect(() => {
    setAvailableDates(getNextFiveDays());
  }, []);

  const handleDepartamentoChange = (e) => {
    setFormData({ ...formData, departament: e.target.value, town: "" });
  };

  const handleMunicipioChange = (e) => {
    setFormData({ ...formData, town: e.target.value });
  };

  const handleDiscountCode = async () => {
    setLoading(true);
    try {
      console.log("code:", formData.discountCode);
      console.log("subtotal:", subtotal);
      const response = await axios.post(
        "https://loocal.co/api/orders/apply-discount/",
        {
          code: formData.discountCode,
          subtotal: subtotal, // Asegúrate de que subtotal es un número
        },
        {
          headers: { "Content-Type": "application/json" }, // Asegura el formato JSON
        }
      );

      // Verificar si el código es válido y aplicar el descuento
      if (response.data.valid) {
        setDiscountInfo(response.data);
        setIsDiscountApplied(true);
        setDiscountStatusMessage("Código de descuento aplicado");
      } else if (response.data.expired) {
        setDiscountStatusMessage("El código de descuento ha expirado");
        setDiscountInfo(null);
        setIsDiscountApplied(false);
      } else {
        setDiscountStatusMessage("El código de descuento no es válido");
        setDiscountInfo(null);
        setIsDiscountApplied(false);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        console.error("Detalles del error del backend:", error.response.data);
        setDiscountStatusMessage(
          error.response.data.error || "Solicitud inválida"
        );
      } else {
        setDiscountStatusMessage(
          "Error desconocido al verificar el código de descuento"
        );
      }
      setDiscountInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    // Crear `orderData` con estructura revisada
    const orderData = {
      custom_order_id: `ORD${Date.now()}`,
      items: cart.map((item) => ({
        product_id: item.id,
        product_variation_id: item.variationId || null,
        quantity: item.quantity,
      })),
      subtotal: subtotal,
      discount_code: formData.discountCode,
      delivery_date: formData.delivery_date,
      delivery_time: formData.delivery_time,
      // Estructura revisada para `address`
      address: {
        street: formData.address,
        city: formData.town || "Ciudad desconocida",
        state: formData.departament || "Departamento desconocido",
        postal_code: formData.postal_code || "11111",  // Usar un valor predeterminado si no está disponible
        country: "Colombia",
      },
      customer: {
        firstname: formData.firstname,
        lastname: formData.lastname,
        document_type: formData.documentType,
        document_number: formData.documentNumber,
        phone: formData.phone,
        email: formData.email,
      }
    };
  
    // Imprimir `orderData` para validación antes de enviarlo
    console.log("Datos enviados a la API (orderData):", JSON.stringify(orderData, null, 2));
  
    try {
      // Intento de envío de `orderData` con validación detallada en Axios
      const response = await axios.post("https://loocal.co/api/orders/order/", orderData, {
        headers: { "Content-Type": "application/json" },
        validateStatus: false,  // Asegura que Axios no maneje el error automáticamente
      });
  
      // Confirmación de éxito
      if (response.status === 200 || response.status === 201) {
        console.log("Orden creada:", response.data);
        return response.data;
      } else {
        // Muestra mensaje de error específico si se recibe uno
        console.error("Error en la respuesta del servidor:", response.data);
        throw new Error("Error al crear la orden. " + (response.data?.error || "Detalles no disponibles"));
      }
    } catch (error) {
      // Captura error y detalla respuesta
      console.error("Error al crear la orden:", error.response?.data || error.message);
      throw new Error("No se pudo crear la orden.");
    }
  };

  const addressData = {
      street: formData.address,
      city: "Bogotá",
      state: "Cundinamarca",
      postal_code: "00000",
      country: "Colombia",
    };

  const fetchIntegrityHash = async (orderId, amount) => {
    try {
      const response = await axios.post("https://loocal.co/api/payments/generate_integrity_hash/", {
        order: {
          order_id: orderId,
          amount: amount,
          currency: "COP",
        },
      });
      console.log("Hash de integridad generado:", response.data.hash); // Validación en consola
      return response.data.hash;
    } catch (error) {
      console.error("Error al generar el hash de integridad:", error.response?.data || error);
      throw new Error("No se pudo generar el hash de integridad.");
    }
  };

  const openWompiCheckout = (hash, orderId, amount) => {
    const checkout = new WidgetCheckout({
      currency: "COP",
      amountInCents: amount,
      reference: orderId,
      publicKey: "pub_test_gyZVH3hcyjvHHH8xA8AAvzue2QRBj49O",
      signature: { integrity: hash },
      redirectUrl: `https://loocal.co/order-status`, // Redirigir sin `orderId`
      customerData: {
        email: formData.email,
        fullName: `${formData.firstname} ${formData.lastname}`,
        phoneNumber: formData.phone,
        phoneNumberPrefix: "+57",
        legalId: formData.documentNumber,
        legalIdType: formData.documentType,
      },
    });
  
    checkout.open((result) => {
      const transaction = result.transaction;
      if (transaction && transaction.status === "APPROVED") {
        const transactionId = transaction.id;  // Asignar `transactionId` devuelto por Wompi
        console.log("Transacción aprobada:", transactionId);
        navigate(`/order-status?id=${transactionId}`);
      } else if (transaction) {
        toast.error("Transacción no aprobada. Intenta de nuevo.");
      } else {
        toast.error("Error en la transacción. Por favor, intenta nuevamente.");
      }
    });
  };

  const validateForm = () => {
    const requiredFields = [
      "firstname",
      "lastname",
      "phone",
      "email",
      "address",
      "delivery_date",
      "delivery_time",
    ];
    const incompleteFields = requiredFields.filter(
      (field) => formData[field] === ""
    );
  
    if (incompleteFields.length > 0) {
      console.log("Campos incompletos:", incompleteFields); // Verifica los campos que faltan
      toast.error("Por favor completa todos los campos.");
      return false;
    }
  
    console.log("Validación de formulario completada con éxito"); // Para confirmar que pasa la validación
    return true;
  };

  const handleConfirmOrder = async () => {
    if (validateForm()) {
      try {
        const orderData = await createOrder();
        
        if (formData.paymentPreference === "online") {
          const hash = await fetchIntegrityHash(orderData.custom_order_id, finalTotal * 100);
          if (hash) {
            openWompiCheckout(hash, orderData.custom_order_id, finalTotal * 100);
          } else {
            throw new Error("No se pudo generar el hash de integridad.");
          }
        } else {
          navigate("/order-status", { state: { orderId: orderData.custom_order_id } });
        }
      } catch (error) {
        console.error("Error al procesar la orden:", error);
        toast.error("Error al procesar la orden. Intenta de nuevo.");
      }
    }
  };
  return (
    <>
      <div className={styles["canvas-container"]}>
        <div className={styles["canvas-box"]}>
          <div className={styles["canvas-header"]}>
            <div className={styles["header-first"]}>
              <div className={styles["header-logo"]}>
                <FiChevronLeft onClick={() => window.history.back()} />
                <img onClick={() => navigate("/")} src={Logo} alt="Logo" />
              </div>
              <div className={styles["header-title"]}>
                <h1>Resumen de tu compra</h1>
              </div>
              <div className={styles["header-profile"]}>
                {isAuthenticated ? (
                  <div
                    onClick={toggleProfileMenu}
                    className={styles["profile-card"]}
                  >
                    {userData?.userprofile?.profile_picture ? (
                      <img
                        src={userData.userprofile.profile_picture}
                        alt="Foto de perfil"
                        className={styles["profile-picture"]}
                      />
                    ) : (
                      <img
                        src="/default-placeholder.png"
                        alt="Sin foto de perfil"
                        className={styles["profile-picture"]}
                      />
                    )}
                    <div className={styles["username"]}>
                      <span>{userData?.first_name}</span>
                      {isProfileMenuOpen ? (
                        <IoIosArrowUp />
                      ) : (
                        <IoIosArrowDown />
                      )}
                    </div>
                    {/* Menú desplegable de perfil */}
                    {isProfileMenuOpen && (
                      <div className={styles["profile-menu"]}>
                        <Link to="/perfil" state={{ section: "ProfileDetail" }}>
                          <div className={styles["menu-item"]}>
                            Ajustes de mi cuenta
                          </div>
                        </Link>

                        <Link
                          to="/perfil"
                          state={{ section: "ProfileAddress" }}
                        >
                          <div className={styles["menu-item"]}>
                            Mis direcciones
                          </div>
                        </Link>

                        <Link to="/perfil" state={{ section: "ProfileOrders" }}>
                          <div className={styles["menu-item"]}>Mis pedidos</div>
                        </Link>

                        <div
                          className={styles["menu-item"]}
                          onClick={handleLogout}
                        >
                          Cerrar sesión
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles["buttons-profile"]}>
                    <button onClick={() => navigate("/login")}>Ingresar</button>
                    <button onClick={() => navigate("/crear-cuenta")}>
                      Crear cuenta
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className={styles["header-second"]}>
              <span>Dirección</span>
            </div>
          </div>

          <div className={styles["canvas-content"]}>
            <div className={styles["content-multirow"]}>
              <div className={styles["row-one"]}>
                <div className={styles["box"]}>
                  <div className={styles["box-header"]}>
                    <div className={styles["box-header-info"]}>
                      <div className={styles["box-header-icon"]}>
                        <FiShoppingCart />
                      </div>
                      <div className={styles["box-header-title"]}>
                        <h4>{formatPriceToCOP(subtotal)}</h4>
                        <span>
                          {cart.length}{" "}
                          {cart.length === 1 ? "producto" : "productos"}
                        </span>
                      </div>
                    </div>
                    <div className={styles["box-header-extend"]}>
                      <IoIosArrowDown />
                    </div>
                  </div>
                  <div className={styles["box-content"]}></div>
                </div>
                <div className={styles["box"]}>
                  <div className={styles["box-header"]}>
                    <div className={styles["box-header-info"]}>
                      <div className={styles["box-header-icon"]}>
                        <FiUser />
                      </div>
                      <div className={styles["box-header-title"]}>
                        <h4>Tus datos</h4>
                      </div>
                    </div>
                    <div className={styles["box-header-extend"]}>
                      <IoIosArrowDown />
                    </div>
                  </div>
                  <div className={styles["box-content"]}>
                    <form
                      //   onSubmit={handleSubmit}
                      className={styles["profile-form"]}
                    >
                      <div className={styles["form-row"]}>
                        <div className={styles["form-group"]}>
                          <label>Nombre</label>
                          <input
                            type="text"
                            name="firstname"
                            value={formData.firstname}
                            onChange={handleChange}
                          />
                        </div>
                        <div className={styles["form-group"]}>
                          <label>Apellido</label>
                          <input
                            type="text"
                            name="lastname"
                            value={formData.lastname}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className={styles["form-row"]}>
                        <div className={styles["form-group"]}>
                          <label>Tipo de documento</label>
                          <div className={styles["form-multi-input"]}>
                            <select
                              type="text"
                              name="documentType"
                              value={formData.documentType}
                              onChange={handleChange}
                            >
                              <option value="CC">Cédula de ciudadania</option>
                              <option value="CE">Cédula de extranjería</option>
                              <option value="PP">Pasaporte</option>
                            </select>
                            <input
                              type="text"
                              name="documentNumber"
                              value={formData.documentNumber}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className={styles["form-group"]}>
                          <label>Número de celular</label>
                          <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className={styles["form-row"]}>
                        <div className={styles["form-group"]}>
                          <label>Correo electrónico</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                <div className={styles["box"]}>
                  <div className={styles["box-header"]}>
                    <div className={styles["box-header-info"]}>
                      <div className={styles["box-header-icon"]}>
                        <FiMapPin />
                      </div>
                      <div className={styles["box-header-title"]}>
                        <h4>Dirección</h4>
                      </div>
                    </div>
                    <div className={styles["box-header-extend"]}>
                      <IoIosArrowDown />
                    </div>
                  </div>
                  <div className={styles["box-content"]}>
                    <form
                      //   onSubmit={handleSubmit}
                      className={styles["profile-form"]}
                    >
                      <div className={styles["form-row"]}>
                        <div className={styles["form-group"]}>
                          <label>Departamento</label>
                          <select
                            value={formData.departament}
                            onChange={handleDepartamentoChange}
                          >
                            <option value="">Selecciona un departamento</option>
                            {Object.keys(departamentosYMunicipios).map(
                              (dep) => (
                                <option key={dep} value={dep}>
                                  {dep}
                                </option>
                              )
                            )}
                          </select>

                          {formData.departament && (
                            <select
                              value={formData.town}
                              onChange={handleMunicipioChange}
                            >
                              <option value="">Selecciona un municipio</option>
                              {(
                                departamentosYMunicipios[
                                  formData.departament
                                ] || []
                              ).map((city) => (
                                <option key={city} value={city}>
                                  {city}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div className={styles["form-group"]}>
                          <label>Ciudad</label>
                          <select>
                            <option>Chía</option>
                            <option>Cajicá</option>
                            <option>Medellín</option>
                          </select>
                        </div>
                      </div>

                      <div className={styles["form-row"]}>
                        <div className={styles["form-group"]}>
                          <label>Dirección de entrega</label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className={styles["row-two"]}>
                <div className={styles["box"]}>
                  <div className={styles["box-header"]}>
                    <div className={styles["box-header-info"]}>
                      <div className={styles["box-header-title"]}>
                        <h4>¿Cuándo recibiras tu pedido?</h4>
                      </div>
                    </div>
                    <div className={styles["box-header-extend"]}>
                      <IoIosArrowDown />
                    </div>
                  </div>
                  <div className={styles["box-content"]}>
                    <div className={styles["date-time-picker-container"]}>
                      {" "}
                      {/*Este es el selector de fecha y hora pare recibir el pedido. Te pido que por favor tanto la selección de fecha como de hora, sea en una sola linea cada uno, por lo tanto debe haber scroll horizontal e idealmente unas flechas (angleLeft y angleRight) para navegar en ese scroll en PC's y Mobile. Tambien el scroll puede ser touch. Ten en cuenta también mostrar el estilo de selección para la fecha y hora seleccionada. */}
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
                  </div>
                </div>

                <div className={styles["box"]}>
                  <div className={styles["box-header"]}>
                    <div className={styles["box-header-info"]}>
                      <div className={styles["box-header-title"]}>
                        <h4>¿Cómo prefieres hacer el pago?</h4>
                      </div>
                    </div>
                    <div className={styles["box-header-extend"]}>
                      <IoIosArrowDown />
                    </div>
                  </div>
                  <div className={styles["box-content"]}>
                    <form>
                      {" "}
                      {/* Este form permite seleccionar al usuario una opción de pago. Puede pagar ahora por pasarela Online lo que permitira que cuando el usaurio oprima el boton final de 'Completar compra' se deberá redirgir al proceso de pago en Pasarela. De lo contrario, si el usaurio elige 'Pagar cuando reciba mi pedido', NO deberá pasar a pasarela online sino directamente a confirmar pedido en OrderStatus. Ten en cuenta que si el usuario elige 'Pagar ahora' tiene un 5% de descuento sobre la orden. */}
                      <div>
                        <input
                          type="radio"
                          id="onlinepayment"
                          name="paymentPreference"
                          value="online"
                          checked={formData.paymentPreference === "online"}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="onlinepayment">Pagar ahora</label>

                        <input
                          type="radio"
                          id="inpersonpayment"
                          name="paymentPreference"
                          value="inPerson"
                          checked={formData.paymentPreference === "inPerson"}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="inpersonpayment">
                          Pagar cuando reciba mi pedido
                        </label>
                      </div>
                    </form>
                  </div>
                </div>

                <div className={styles["box"]}>
                  <div className={styles["box-header"]}>
                    <div className={styles["box-header-info"]}>
                      <div className={styles["box-header-title"]}>
                        <h4>¿Tienes algún código de descuento?</h4>
                      </div>
                    </div>
                    <div className={styles["box-header-extend"]}>
                      <IoIosArrowDown />
                    </div>
                  </div>
                  <div className={styles["box-content"]}>
                    <form>
                      <div className={styles["form-one-row"]}>
                        <input
                          type="text"
                          name="discountCode"
                          value={formData.discountCode}
                          onChange={handleInputChange}
                          disabled={isDiscountApplied}
                          placeholder="Ingresa tu código de descuento"
                        />
                        <button
                          type="button"
                          onClick={handleDiscountCode}
                          disabled={isDiscountApplied || loading}
                        >
                          {loading ? "Procesando..." : "Redimir"}
                        </button>
                      </div>
                      {/* Mensaje de estado del código de descuento */}
                      {discountStatusMessage && (
                        <span className={styles["discount-status-message"]}>
                          {discountStatusMessage}
                        </span>
                      )}
                    </form>
                  </div>
                </div>

                <div className={styles["box"]}>
                  <div className={styles["box-resume"]}>
                    <div className={styles["box-resume-discount"]}>
                      {/* Condicional para mostrar mensaje solo si hay descuentos */}
                      {totalDiscount > 0 && (
                        <>
                          <div className={styles["discount-message"]}>
                            <span>Descuentos aplicados</span>
                            <span>{formatPriceToCOP(totalDiscount)}</span>
                          </div>
                          <div className={styles["discount-detail"]}>
                            {/* Mostrar descuento por pago online */}
                            {paymentDiscount > 0 && (
                              <div className={styles["discount-detail-item"]}>
                                <span>Descuento por pago online</span>
                                <span>{formatPriceToCOP(paymentDiscount)}</span>
                              </div>
                            )}
                            {/* Mostrar descuento por código promocional si se aplicó */}
                            {discountInfo && (
                              <div className={styles["discount-detail-item"]}>
                                <span>Descuento por código</span>
                                <span>
                                  {formatPriceToCOP(
                                    discountInfo.discount_value
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <div className={styles["box-resume-info"]}>
                      <div className={styles["box-resume-info-value"]}>
                        <span>Subtotal:</span>
                        <h4>{formatPriceToCOP(finalTotal)}</h4>
                      </div>
                      <div className={styles["box-completed"]}>
                        <button onClick={handleConfirmOrder}>
                          Confirmar compra
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NewCheckout;
