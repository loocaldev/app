import React, { useState, useEffect } from "react";
import styles from "../styles/NewCheckout.module.css";
import { FiMail } from "react-icons/fi";
import Logo from "../assets/logo.svg";
import UserDataForm from "../components/Forms/UserDataForms.jsx";
import AddressForm from "../components/Forms/AddressForm";
import ProductCardSQRead from "../components/ProductCardSQRead";
import ProfileSelect from "../components/ProfileSelect.jsx";
import { AVAILABLE_CITIES } from "../data/departamentosYMunicipios.js";
import analytics from "../analytics";
import {
  FiChevronLeft,
  FiMapPin,
  FiUser,
  FiChevronRight,
  FiShoppingCart,
  FiTruck,
} from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { CiUser, CiDeliveryTruck } from "react-icons/ci";
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
import { indicativos } from "../data/indicativos";
import FooterLight from "../components/FooterLight.jsx";
import { getNextAvailableDates2, getAvailableHours2 } from "../utils/dateTime2.js";
import useTransportCost from "../hooks/transportCost.js";

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
  const minOrderValue = 50000;
  const [isMessageHidden, setIsMessageHidden] = useState(false);
  const [isCityValid, setIsCityValid] = useState(true);
  const [errors, setErrors] = useState([]);
  const { cart, subtotal } = useCart();
  const [availableHours, setAvailableHours] = useState([]);
  const navigate = useNavigate();
  const { token, isAuthenticated, logout, userData, addresses, getAddresses } =
    useAuth();
  const isMobile = useScreenSize();
  const [useProfileData, setUseProfileData] = useState(true);
  const [finalTotal, setFinalTotal] = useState([]);
  const [formData, setFormData] = useState(() => {
    const tempAddress = JSON.parse(localStorage.getItem("tempAddress")) || {}; // Obtén dirección temporal del localStorage

    if (isAuthenticated && useProfileData) {
      // Datos del usuario autenticado
      return {
        firstname: userData?.first_name || "",
        lastname: userData?.last_name || "",
        documentType: userData?.userprofile?.document_type || "CC", // Accede a userprofile
        documentNumber: userData?.userprofile?.document_number || "",
        phoneCode: "+57", // Valor fijo, actualizar si es dinámico
        phone: userData?.userprofile?.phone_number || "",
        email: userData?.email || "",
        addressId: null,
        departament: "",
        town: "",
        address: "",
        delivery_date: "",
        delivery_time: "",
        transportCost: 0,
        transportDiscount: 0,
        paymentPreference: "online",
        discountCode: "",
      };
    } else {
      // Datos para usuarios no autenticados o sin perfil cargado
      return {
        firstname: "",
        lastname: "",
        documentType: "CC",
        documentNumber: "",
        phone: "",
        phoneCode: "+57",
        email: "",
        addressId: tempAddress.address ? "temp" : null, // Usa "temp" si hay una dirección temporal
        departament: tempAddress.departament || "",
        town: tempAddress.town || "",
        address: tempAddress.address || "",
        delivery_date: "",
        delivery_time: "",
        transportCost: 0,
        transportDiscount: 0,
        paymentPreference: "online",
        discountCode: "",
      };
    }
  });

  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [discountInfo, setDiscountInfo] = useState(null);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [discountStatusMessage, setDiscountStatusMessage] = useState("");
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [paymentDiscount, setPaymentDiscount] = useState(0); // Descuento por pagar online
  const [orderData, setOrderData] = useState(null); // Guarda los datos de la orden creada
  const [showUserTypeSelector, setShowUserTypeSelector] = useState(false);

  const [tempAddress, setTempAddress] = useState({
    departament: "",
    town: "",
    address: "",
  });

  const [userType, setUserType] = useState("persona"); // Default: Persona}

  useEffect(() => {
    setAvailableDates(getNextAvailableDates2());
  }, []);

  // const [loadingTransportCost, setLoadingTransportCost] = useState(false);
  const [transportError, setTransportError] = useState(null);
  const { transportCost, loading: loadingTransportCost } = useTransportCost(
    formData.town
  );

  useEffect(() => {
    setFormData((prev) => ({ ...prev, transportCost }));
  }, [transportCost]);

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      lastname: userType === "empresa" ? "" : prevData.lastname,
      documentType: userType === "empresa" ? "NIT" : "CC",
    }));
  }, [userType]);

  const handleUserTypeChange = (e) => {
    const newUserType = e.target.value;
    setUserType(newUserType);

    // Actualiza `formData` según el tipo de usuario
    setFormData((prevData) => ({
      ...prevData,
      firstname: "", // Reinicia el nombre para evitar inconsistencias
      lastname: newUserType === "empresa" ? "" : prevData.lastname, // Quita apellido si es empresa
      documentType: newUserType === "empresa" ? "NIT" : "CC", // Tipo de documento predeterminado
      documentNumber: "", // Limpia el número de documento
    }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      getAddresses();
    } else {
      // Si no está autenticado, asignar la dirección temporal
      setFormData((prevData) => ({
        ...prevData,
        departament: tempAddress.departament,
        town: tempAddress.town,
        address: tempAddress.address,
      }));
    }
  }, [isAuthenticated, tempAddress]);

  useEffect(() => {
    // Si el usuario selecciona "Pagar ahora", aplicar un 5% de descuento
    if (formData.paymentPreference === "online") {
      setPaymentDiscount(0.05 * subtotal); // Calcular el 5%
    } else {
      setPaymentDiscount(0); // Si no es online, el descuento es 0
    }
  }, [formData.paymentPreference, subtotal]);

  useEffect(() => {
    // Calcular el total de descuentos
    const discountAmount =
      (formData.paymentPreference === "online" ? 0.05 * subtotal : 0) + // Descuento por pago online
      (discountInfo?.discount_value || 0) + // Descuento en subtotal
      (discountInfo?.transport_discount || 0); // Descuento en transporte

    // Calcular el total final
    const calculatedTotal = subtotal + formData.transportCost - discountAmount;

    // Evitar valores negativos
    setFinalTotal(Math.max(calculatedTotal, 0));
  }, [
    subtotal,
    formData.transportCost,
    formData.paymentPreference,
    discountInfo,
  ]);

  // Calcular el subtotal final después de los descuentos
  const totalDiscount =
    paymentDiscount +
    (discountInfo ? discountInfo.discount_value : 0) +
    formData.transportDiscount;

  //  const finalTotal = subtotal + formData.transportCost - totalDiscount;

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

  const handleProfileSelection = (e) => {
    const selectedProfile = e.target.value;

    if (selectedProfile === "profile") {
      setUseProfileData(true);
      if (userData) {
        setFormData((prevData) => ({
          ...prevData,
          firstname: userData?.first_name || "",
          lastname: userData?.last_name || "",
          documentType: userData?.userprofile?.document_type || "CC",
          documentNumber: userData?.userprofile?.document_number || "",
          phone: userData?.userprofile?.phone_number || "",
          email: userData?.email || "",
        }));
      }
    } else {
      setUseProfileData(false);
      setFormData((prevData) => ({
        ...prevData,
        firstname: "",
        lastname: "",
        documentType: "CC",
        documentNumber: "",
        phone: "",
        email: "",
      }));
    }
  };

  const handlePhoneCodeChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      phoneCode: e.target.value,
    }));
  };

  const trimAndUpperCase = (value) => value.trim().toUpperCase();

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "discountCode" ? trimAndUpperCase(value) : value,
    }));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setAvailableHours(getAvailableHours2(date));
    setFormData({
      ...formData,
      delivery_date: date,
    });// Actualiza horas disponibles al cambiar la fecha
  };

  const handleTimeSelect = (hour) => {
    setSelectedHour(hour);
    setFormData((prev) => ({ ...prev, delivery_time: hour }));
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

  const handleDepartamentoChange = (e) => {
    setFormData({ ...formData, departament: e.target.value, town: "" });
  };

  const handleMunicipioChange = (e) => {
    const selectedCity = e.target.value;
    setFormData((prevData) => ({ ...prevData, town: selectedCity }));

    // Validar si la ciudad está en la lista de ciudades disponibles
    const cityIsValid = AVAILABLE_CITIES.includes(selectedCity.toUpperCase());
    setIsCityValid(cityIsValid);

    // Actualizar errores en tiempo real si la ciudad es inválida
    if (!cityIsValid) {
      setErrors((prevErrors) =>
        prevErrors.includes("cityUnavailable")
          ? prevErrors
          : [...prevErrors, "cityUnavailable"]
      );
    } else {
      setErrors((prevErrors) =>
        prevErrors.filter((err) => err !== "cityUnavailable")
      );
    }
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      address: value,
    }));

    // Validar longitud mínima de la dirección
    if (value.length < 15) {
      setErrors((prevErrors) =>
        prevErrors.includes("addressTooShort")
          ? prevErrors
          : [...prevErrors, "addressTooShort"]
      );
    } else {
      setErrors((prevErrors) =>
        prevErrors.filter((error) => error !== "addressTooShort")
      );
    }
  };

  const handleDiscountCode = async () => {
    setLoading(true);
    try {
      const formattedCode = trimAndUpperCase(formData.discountCode); // Formatear antes de enviar
      const response = await axios.post(
        "https://loocal.co/api/orders/apply-discount/",
        {
          code: formattedCode,
          subtotal: subtotal,
          city: formData.town, // Agregar la ciudad
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.valid) {
        const { discount_value, applies_to_transport, transport_discount } =
          response.data;

        // Actualizar el estado con base en la respuesta
        setFormData((prev) => ({
          ...prev,
          transportDiscount: applies_to_transport
            ? Math.min(transport_discount, prev.transportCost || 0)
            : 0,
        }));
        setDiscountInfo({
          discount_value: applies_to_transport ? 0 : discount_value, // Descuento en subtotal
          transport_discount: applies_to_transport ? transport_discount : 0, // Descuento en transporte
          applies_to_transport,
        });
        setIsDiscountApplied(true);
        setDiscountStatusMessage("Código de descuento aplicado exitosamente");
        setIsMessageHidden(false);
      } else {
        throw new Error("Código inválido o expirado");
      }
    } catch (error) {
      console.error("Error al verificar el código:", error);
      setDiscountStatusMessage("Error al aplicar el código de descuento");
      setDiscountInfo(null);
      setIsDiscountApplied(false);
      setIsMessageHidden(false);
      setTimeout(() => {
        setIsMessageHidden(true);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAddresses();
  }, []);

  useEffect(() => {
    // Enviar evento cuando se carga la página de checkout
    analytics.track("Checkout Viewed", {
      cart_size: cart.length,
      subtotal: subtotal,
      currency: "COP",
    });
  }, [cart, subtotal]);

  const createOrder = async () => {
    if (orderData) {
      console.log("Reutilizando orden existente:", orderData);
      return orderData;
    }

    const fullPhoneNumber = `${formData.phoneCode} ${formData.phone}`;
    const formattedSubtotal = parseFloat(subtotal.toFixed(0));
    const newOrderData = {
      custom_order_id: `ORD${Date.now()}`,
      items: cart.map((item) => ({
        product_id: item.id,
        product_variation_id: item.variationId || null,
        quantity: item.quantity,
      })),
      subtotal: formattedSubtotal,
      discount_code: formData.discountCode,
      delivery_date: formData.delivery_date,
      delivery_time: formData.delivery_time,
      address: {
        street: formData.address,
        city: formData.town || "Ciudad desconocida",
        state: formData.departament || "Departamento desconocido",
        postal_code: formData.postal_code || "11111",
        country: "Colombia",
      },
      customer: {
        firstname: formData.firstname,
        lastname: formData.lastname,
        document_type: formData.documentType,
        document_number: formData.documentNumber,
        phone: fullPhoneNumber,
        email: formData.email,
      },
      payment_method: formData.paymentPreference,
      status: "pending",
    };

    console.log(
      "Datos enviados a la API (newOrderData):",
      JSON.stringify(newOrderData, null, 2)
    );

    try {
      const response = await axios.post(
        "https://loocal.co/api/orders/order/",
        newOrderData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200 || response.status === 201) {
        console.log("Orden creada:", response.data);
        setOrderData(response.data); // Guardar la orden creada
        return response.data;
      } else {
        console.error("Error al crear la orden:", response.data);
        throw new Error("Error al crear la orden. " + response.data?.error);
      }
    } catch (error) {
      console.error("Error al crear la orden:", error);
      throw error;
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
      const response = await axios.post(
        "https://loocal.co/api/payments/generate_integrity_hash/",
        {
          order: {
            order_id: orderId,
            amount: amount,
            currency: "COP",
          },
        }
      );
      return response.data.hash;
    } catch (error) {
      console.error(
        "Error al generar el hash de integridad:",
        error.response?.data || error
      );
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
        const transactionId = transaction.id; // Asignar `transactionId` devuelto por Wompi
        navigate(`/order-status?id=${transactionId}`);
      } else if (transaction) {
        toast.error("Transacción no aprobada. Intenta de nuevo.");
      } else {
        toast.error("Error en la transacción. Por favor, intenta nuevamente.");
      }
    });
  };

  const requiredFields = {
    firstname: "Nombre",
    phone: "Celular",
    email: "Correo electrónico válido",
    departament: "Departamento",
    town: "Ciudad",
    address: "Dirección",
    delivery_date: "Fecha de entrega",
    delivery_time: "Hora de entrega",
  };

  const isEmailValid = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex simple para email
    return emailPattern.test(email);
  };

  const validateForm = () => {
    const missingFields = Object.keys(requiredFields).filter(
      (field) => formData[field] === ""
    );

    if (formData.email && !isEmailValid(formData.email)) {
      missingFields.push("email");
    }
    if (formData.transportCost <= 0) {
      missingFields.push("transportCost");
    }
    if (!isCityValid) {
      missingFields.push("cityUnavailable");
    }
    if (formData.address && formData.address.length < 15) {
      missingFields.push("addressTooShort");
    }

    setErrors(missingFields);
    return missingFields.length === 0;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      const tempAddress = JSON.parse(localStorage.getItem("tempAddress")) || {
        departament: "",
        town: "",
        address: "",
      };
      setFormData((prevData) => ({
        ...prevData,
        departament: tempAddress.departament,
        town: tempAddress.town,
        address: tempAddress.address,
        addressId: tempAddress.address ? "temp" : null,
      }));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && addresses.length > 0) {
      const primaryAddress = addresses.find((address) => address.is_default);

      if (primaryAddress) {
        setFormData((prevData) => ({
          ...prevData,
          addressId: primaryAddress.id,
          departament: primaryAddress.state,
          town: primaryAddress.city,
          address: primaryAddress.street,
        }));
      }
    }
  }, [isAuthenticated, addresses]);

  useEffect(() => {
    validateForm();
  }, [formData]); // Ejecuta la validación cuando hay cambios en formData

  // const sortedDepartments = Object.keys(departamentosYMunicipios).sort();
  // const sortedMunicipalities =
  //   formData.departament && departamentosYMunicipios[formData.departament]
  //     ? [...departamentosYMunicipios[formData.departament]].sort()
  //     : [];

  const handleConfirmOrder = async () => {
    if (!isCityValid) {
      toast.error("La ciudad seleccionada no está disponible para entregas.");
      return;
    }
    setAttemptedSubmit(true);
    if (subtotal < minOrderValue) {
      toast.error(
        `El subtotal debe ser al menos ${formatPriceToCOP(
          minOrderValue
        )} para completar tu compra.`
      );
      return;
    }
    if (validateForm()) {
      try {
        // 1. Crea la orden solo si no existe una previamente creada
        const currentOrder = await createOrder();

        // 2. Maneja el flujo de pago según la preferencia
        if (formData.paymentPreference === "online") {
          const hash = await fetchIntegrityHash(
            currentOrder.custom_order_id,
            finalTotal * 100
          );
          if (hash) {
            openWompiCheckout(
              hash,
              currentOrder.custom_order_id,
              finalTotal * 100
            );
          } else {
            throw new Error("No se pudo generar el hash de integridad.");
          }
        } else {
          navigate(`/order-status?orderId=${currentOrder.custom_order_id}`);
          toast.success("Pedido confirmado. Pagarás al recibir.");
        }
      } catch (error) {
        console.error("Error al procesar la orden:", error);
        toast.error("Error al procesar la orden. Intenta de nuevo.");
      }
    }
  };

  const BoxResume = ({
    subtotal,
    transportCost,
    transportDiscount,
    paymentDiscount,
    discountInfo,
    totalDiscount,
    finalTotal,
    handleConfirmOrder,
    errors,
    attemptedSubmit,
    requiredFields,
    minOrderValue, // Nuevo prop para el valor mínimo
  }) => {
    const isBelowMinOrderValue = subtotal < minOrderValue; // Condición del subtotal mínimo
  
    return (
      <div
        className={styles["box-resume"]}
      >
        <div className={styles["box-resume-discount"]}>
          {totalDiscount > 0 && (
            <>
              <div className={styles["discount-message"]}>
                <span>¡Descuentos aplicados!</span>
                <span>-{formatPriceToCOP(totalDiscount)}</span>
              </div>
              <div className={styles["discount-detail"]}>
                {paymentDiscount > 0 && (
                  <div className={styles["discount-detail-item"]}>
                    <span>Descuento por pago online</span>
                    <span>{formatPriceToCOP(paymentDiscount)}</span>
                  </div>
                )}
                {discountInfo && discountInfo.discount_value > 0 && (
                  <div className={styles["discount-detail-item"]}>
                    <span>Descuento en subtotal</span>
                    <span>{formatPriceToCOP(discountInfo.discount_value)}</span>
                  </div>
                )}
                {transportDiscount > 0 && (
                  <div className={styles["discount-detail-item"]}>
                    <span>Descuento en transporte</span>
                    <span>-{formatPriceToCOP(transportDiscount)}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
  
        <div className={styles["box-resume-info"]}>
        <div className={styles["box-resume-info-value"]}>
          {totalDiscount > 0 && ( // Mostrar subtotal inicial si hay descuentos
          <div className={styles["subtotal-cond"]}>
          <smal className={styles["subtotal-label"]}>Antes: </smal>
            <small className={styles["subtotal-initial"]}>
             {formatPriceToCOP(subtotal+transportCost)}<br/>
            </small>
            </div>
          )}
          <h4>Total: {formatPriceToCOP(finalTotal)}</h4>
        </div>

  
          {/* Mensaje de error si no se cumple el mínimo */}
          {isBelowMinOrderValue ? (
            <div className="errorMessage">
              <p>
                El subtotal debe ser al menos{" "}
                {formatPriceToCOP(minOrderValue)} para completar tu compra.
              </p>
              <Link to="/tienda" className={styles["link-to-store"]}>
                Ver más productos
              </Link>
            </div>
          ):(
            <button
            onClick={handleConfirmOrder}
            className={`${styles["button"]} ${
              (isBelowMinOrderValue ||
                (errors.length > 0 && attemptedSubmit)) &&
              styles["button-disabled"]
            }`}
            disabled={isBelowMinOrderValue}
          >
            Confirmar compra
          </button>
          )}


  
          {/* Botón de confirmación desactivado si no se cumple el mínimo */}
          
        </div>
        {attemptedSubmit && errors.length > 0 && (
        <div className="errorMessage">
          <p>Por favor completa los siguientes campos:</p>
          <ul>
            {errors.map((error) => (
              <li key={error}>
                {error === "cityUnavailable"
                  ? "La ciudad no está disponible para entrega."
                  : error === "addressTooShort"
                  ? "Asegúrate de agregar una dirección válida."
                  : requiredFields[error]}
              </li>
            ))}
          </ul>
        </div>
      )}
      </div>
    );
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
                  <div className={styles["profile-card"]}>
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
                    </div>
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
              <span>&nbsp;</span>
            </div>
          </div>

          <div className={styles["canvas-content"]}>
            <div className={styles["content-multirow"]}>
              <div className={styles["row-one"]}>
                <div className={styles["box"]}> {/*En este box se esta mostrando el subtotal de pedido. Si aplica la condicion o error de pedido minimo, se debe habilitar el border rojo como con los otros box. */}
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
                    <div className={styles["box-header-extend"]}></div>
                  </div>
                  <div className={styles["box-content"]}></div>
                </div>
                <div
                  className={`${styles["box"]} ${
                    attemptedSubmit &&
                    (errors.includes("firstname") ||
                      errors.includes("lastname") ||
                      errors.includes("phone") ||
                      errors.includes("email"))
                      ? styles["error-box"]
                      : ""
                  }`}
                >
                  {isAuthenticated ? (
                    <div className={styles["box-header-title-auth"]}>
                      {/* <label htmlFor="profile-select">Usar perfil:</label>
                      <select
                        id="profile-select"
                        onChange={handleProfileSelection}
                        value={useProfileData ? "profile" : "empty"}
                      >
                        <option value="profile">Perfil Autenticado</option>
                        <option value="empty">Sin Perfil</option>
                      </select> */}
                      <ProfileSelect
                        userData={userData}
                        onSelect={(value) => {
                          if (value === "profile") {
                            setUseProfileData(true);
                            setUserType("persona");

                            setFormData({
                              firstname: userData?.first_name || "",
                              lastname: userData?.last_name || "",
                              documentType: "CC",
                              documentNumber:
                                userData?.userprofile?.document_number || "",
                              phoneCode: "+57",
                              phone: userData?.userprofile?.phone_number || "",
                              email: userData?.email || "",
                            });
                          } else {
                            setUseProfileData(false);
                            setFormData({
                              firstname: "",
                              lastname: "",
                              documentType: "CC",
                              documentNumber: "",
                              phone: "",
                              email: "",
                            });
                          }
                        }}
                        onUserTypeChange={(value) => {
                          setUserType(value);
                          setFormData((prevData) => ({
                            ...prevData,
                            lastname:
                              value === "empresa" ? "" : prevData.lastname,
                            documentType: value === "empresa" ? "NIT" : "CC",
                          }));
                        }}
                        setShowUserTypeSelector={setShowUserTypeSelector}
                      />
                      ;
                    </div>
                  ) : (
                    <div className={styles["box-header"]}>
                      <div className={styles["box-header-info"]}>
                        <div className={styles["box-header-icon"]}>
                          <FiUser />
                        </div>
                        <div className={styles["box-header-title"]}>
                          <h4>Tus datos</h4>
                        </div>
                      </div>
                      <div className={styles["box-header-extend"]}></div>
                    </div>
                  )}

                  <div className={styles["box-content"]}>
                    <UserDataForm
                      formData={formData}
                      onChange={handleChange}
                      isReadOnly={isAuthenticated && useProfileData}
                      defaultUserType={userType}
                      showUserTypeSelector={
                        !isAuthenticated ||
                        !useProfileData ||
                        showUserTypeSelector
                      }
                    />
                  </div>
                </div>
                <div
                  className={`${styles["box"]} ${
                    attemptedSubmit &&
                    (errors.includes("address") ||
                      errors.includes("department") ||
                      errors.includes("town"))
                      ? styles["error-box"]
                      : ""
                  }`}
                >
                  <div className={styles["box-header"]}>
                    <div className={styles["box-header-info"]}>
                      <div className={styles["box-header-icon"]}>
                        <FiMapPin />
                      </div>
                      <div className={styles["box-header-title"]}>
                        <h4>Dirección</h4>
                      </div>
                    </div>
                    <div className={styles["box-header-extend"]}></div>
                  </div>
                  <div className={styles["box-content"]}>
                    {isAuthenticated ? (
                      <>
                        {/* Selección de direcciones para usuarios autenticados */}
                        <form>
                          <div className={styles["address-list"]}>
                            {(addresses || []).map((address) => (
                              <div
                                key={address.id}
                                className={`${styles["custom-radio"]} ${
                                  formData.addressId === address.id
                                    ? styles["selected"]
                                    : ""
                                }`}
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    addressId: address.id,
                                    departament: address.state,
                                    town: address.city,
                                    address: address.street,
                                  });
                                }}
                              >
                                <div className={styles["radio-circle"]}></div>
                                <div className={styles["label"]}>
                                  <div className={styles["label-main"]}>
                                    <span>{address.street}</span>
                                  </div>
                                  <div className={styles["label-extra"]}>
                                    <span>
                                      {address.city}, {address.state}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {/* Opción para agregar una nueva dirección */}
                            <div
                              className={`${styles["custom-radio"]} ${
                                formData.addressId === "new"
                                  ? styles["selected"]
                                  : ""
                              }`}
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  addressId: "new",
                                  departament: "",
                                  town: "",
                                  address: "",
                                });
                              }}
                            >
                              <div className={styles["radio-circle"]}></div>
                              <div className={styles["label"]}>
                                <div className={styles["label-main"]}>
                                  <span>Agregar nueva dirección</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </form>

                        {/* Mostrar formulario si se selecciona una nueva dirección */}
                        {formData.addressId === "new" && (
                          <>
                            <AddressForm
                              formData={formData}
                              onDepartamentoChange={handleDepartamentoChange}
                              onMunicipioChange={(e) => {
                                handleMunicipioChange(e);
                              }}
                              onAddressChange={handleAddressChange}
                            />
                            {errors.includes("addressTooShort") && (
                              <span className="errorMessage">
                                Asegúrate de agregar una dirección válida.
                              </span>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Si el usuario no está autenticado, pero tiene una dirección temporal */}
                        {localStorage.getItem("tempAddress") ? (
                          <>
                            <form>
                              <div className={styles["address-list"]}>
                                {/* Cargar dirección temporal como opción */}
                                <div
                                  className={`${styles["custom-radio"]} ${
                                    formData.addressId === "temp"
                                      ? styles["selected"]
                                      : ""
                                  }`}
                                  onClick={() => {
                                    const tempAddress = JSON.parse(
                                      localStorage.getItem("tempAddress")
                                    );
                                    setFormData({
                                      ...formData,
                                      addressId: "temp",
                                      departament: tempAddress.departament,
                                      town: tempAddress.town,
                                      address: tempAddress.address,
                                    });
                                  }}
                                >
                                  <div className={styles["radio-circle"]}></div>
                                  <div className={styles["label"]}>
                                    <div className={styles["label-main"]}>
                                      <span>
                                        {
                                          JSON.parse(
                                            localStorage.getItem("tempAddress")
                                          ).address
                                        }
                                      </span>
                                    </div>
                                    <div className={styles["label-extra"]}>
                                      <span>
                                        {
                                          JSON.parse(
                                            localStorage.getItem("tempAddress")
                                          ).town
                                        }
                                        ,{" "}
                                        {
                                          JSON.parse(
                                            localStorage.getItem("tempAddress")
                                          ).departament
                                        }
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {/* Opción para agregar otra dirección */}
                                <div
                                  className={`${styles["custom-radio"]} ${
                                    formData.addressId === "new"
                                      ? styles["selected"]
                                      : ""
                                  }`}
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      addressId: "new",
                                      departament: "",
                                      town: "",
                                      address: "",
                                    });
                                  }}
                                >
                                  <div className={styles["radio-circle"]}></div>
                                  <div className={styles["label"]}>
                                    <div className={styles["label-main"]}>
                                      <span>Agregar nueva dirección</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </form>

                            {/* Mostrar formulario si se selecciona una nueva dirección */}
                            {formData.addressId === "new" && (
                              <>
                                <AddressForm
                                  formData={formData}
                                  onDepartamentoChange={
                                    handleDepartamentoChange
                                  }
                                  onMunicipioChange={handleMunicipioChange}
                                  onAddressChange={handleAddressChange}
                                />
                                {errors.includes("addressTooShort") && (
                                  <span className="errorMessage2">
                                    Asegúrate de agregar una dirección válida.
                                  </span>
                                )}
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            {/* Formulario de dirección para usuarios no autenticados sin dirección previa */}
                            <AddressForm
                              formData={formData}
                              onDepartamentoChange={handleDepartamentoChange}
                              onMunicipioChange={handleMunicipioChange}
                              onAddressChange={handleChange}
                            />
                            {errors.includes("addressTooShort") && (
                              <span className="errorMessage">
                                Asegúrate de agregar una dirección válida.
                              </span>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles["row-two"]}>
                <div
                  className={`${styles["box"]} ${
                    attemptedSubmit &&
                    (errors.includes("delivery_date") ||
                      errors.includes("delivery_time"))
                      ? styles["error-box"]
                      : ""
                  }`}
                >
                  <div className={styles["box-header"]}>
                    <div className={styles["box-header-info"]}>
                      <div className={styles["box-header-title"]}>
                        <h4>¿Cuándo recibiras tu pedido?</h4>
                      </div>
                    </div>
                    <div className={styles["box-header-extend"]}></div>
                  </div>
                  <div className={styles["box-content"]}>
                    <div className={styles["date-time-picker-container"]}>
                      {" "}
                      {/*Este es el selector de fecha y hora pare recibir el pedido. Te pido que por favor tanto la selección de fecha como de hora, sea en una sola linea cada uno, por lo tanto debe haber scroll horizontal e idealmente unas flechas (angleLeft y angleRight) para navegar en ese scroll en PC's y Mobile. Tambien el scroll puede ser touch. Ten en cuenta también mostrar el estilo de selección para la fecha y hora seleccionada. */}
                      <label>Selecciona el día</label>
                      <DatePicker
                        dates={getNextAvailableDates2()} // Solo fechas con horas disponibles
                        onDateSelect={handleDateSelect}
                        selectedDate={selectedDate} // Pasa la fecha seleccionada aquí en formato YYYY-MM-DD
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
                    <div className={styles["box-header-extend"]}></div>
                  </div>
                  <div className={styles["box-content"]}>
                    <form>
                      <div
                        className={`${styles["custom-radio"]} ${
                          formData.paymentPreference === "online"
                            ? styles["selected"]
                            : ""
                        }`}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            paymentPreference: "online",
                          })
                        }
                      >
                        <div className={styles["radio-circle"]}></div>
                        <div className={styles["label"]}>
                          <div className={styles["label-main"]}>
                            <span>Pagar ahora</span>
                            <span>
                              Con tarjeta débito, crédito, nequi o efectivo.
                            </span>
                          </div>
                          <div className={styles["label-extra"]}>
                            <span>5% </span>
                            <span> dcto.</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`${styles["custom-radio"]} ${
                          formData.paymentPreference === "inPerson"
                            ? styles["selected"]
                            : ""
                        }`}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            paymentPreference: "inPerson",
                          })
                        }
                      >
                        <div className={styles["radio-circle"]}></div>
                        <div className={styles["label"]}>
                          <div className={styles["label-main"]}>
                            <span>Pagar cuando reciba mi pedido</span>
                            <span>
                              Con tarjeta débito, crédito, nequi o efectivo.
                            </span>
                          </div>
                        </div>
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
                    <div className={styles["box-header-extend"]}></div>
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
                      {discountStatusMessage && (
                        <span
                          className={`${styles["discount-status-message"]} ${
                            isDiscountApplied
                              ? styles["success"]
                              : `${styles["error"]} ${
                                  isMessageHidden ? styles.hidden : ""
                                }`
                          }`}
                        >
                          {discountStatusMessage}
                        </span>
                      )}
                    </form>
                  </div>
                </div>
                {formData.town && (
                  <div className={`${styles["box"]} ${styles["transport"]}`}>
                    {isCityValid ? (
                      <>
                        {/* Mostrar información del costo de transporte si la ciudad es válida */}
                        <div className={styles["label-transport"]}>
                          <FiTruck />
                          <span>
                            Envío a {formData.town}, {formData.departament}
                            &nbsp;
                          </span>
                        </div>
                        <span>{formatPriceToCOP(formData.transportCost)}</span>
                      </>
                    ) : (
                      <>
                        {/* Mostrar mensaje de error si la ciudad no es válida */}
                        <div className="errorMessage">
                          Actualmente solo entregamos en:{" "}
                          {AVAILABLE_CITIES.join(", ")}.
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className={styles["box"]}>
                  {!isMobile && (
                    <BoxResume
                      subtotal={subtotal}
                      transportCost={formData.transportCost}
                      transportDiscount={formData.transportDiscount}
                      paymentDiscount={paymentDiscount}
                      discountInfo={discountInfo}
                      totalDiscount={totalDiscount}
                      finalTotal={finalTotal}
                      handleConfirmOrder={handleConfirmOrder}
                      errors={errors}
                      attemptedSubmit={attemptedSubmit}
                      requiredFields={requiredFields}
                      minOrderValue={minOrderValue}
                    />
                  )}
                </div>
              </div>

              {/* Renderiza el BoxResume fuera de row-two si estamos en móvil */}
              {isMobile && (
                <div className={styles["mobile-box-resume"]}>
                  <BoxResume
                    subtotal={subtotal}
                    transportCost={formData.transportCost}
                    transportDiscount={formData.transportDiscount}
                    paymentDiscount={paymentDiscount}
                    discountInfo={discountInfo}
                    totalDiscount={totalDiscount}
                    finalTotal={finalTotal}
                    handleConfirmOrder={handleConfirmOrder}
                    errors={errors}
                    attemptedSubmit={attemptedSubmit}
                    requiredFields={requiredFields}
                    minOrderValue={minOrderValue}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {/*Footer */}
        <FooterLight />
      </div>
    </>
  );
}

export default NewCheckout;
