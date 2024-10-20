import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import formatPriceToCOP from "../utils/formatPrice"; // Asegúrate de tener esta función para formatear los precios
import styles from "../styles/OrderStatus.module.css";

function OrderStatus() {
  const location = useLocation();
  const [transactionId, setTransactionId] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");
  const [orderDetails, setOrderDetails] = useState(null); // Estado para almacenar los detalles de la orden
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const transactionIdParam = searchParams.get("id");

    if (!transactionIdParam) {
      setErrorMessage("No se encontró un ID de transacción en la URL.");
      return;
    }

    setTransactionId(transactionIdParam);

    // Realizar la solicitud GET a Wompi para obtener el estado de la transacción
    axios
      .get(`https://sandbox.wompi.co/v1/transactions/${transactionIdParam}`)
      .then((response) => {
        const transactionData = response.data?.data;

        if (!transactionData) {
          setErrorMessage("No se pudieron obtener los datos de la transacción.");
          return;
        }

        // Actualizar el estado de la transacción
        setTransactionStatus(transactionData.status);

        if (transactionData.status === "APPROVED") {
          const orderId = transactionData.reference;

          // Obtener los detalles de la orden
          axios
            .get(`https://loocal.co/api/orders/api/v1/orders/${orderId}/`)
            .then((response) => {
              setOrderDetails(response.data);
            })
            .catch((error) => {
              console.error("Error al obtener los detalles de la orden:", error);
              setErrorMessage("Error al obtener los detalles de la orden.");
            });
        } else {
          console.log(`Estado de la transacción: ${transactionData.status}`);
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          setErrorMessage("Transacción no encontrada. Verifica el ID.");
        } else {
          setErrorMessage("Error al obtener el estado de la transacción.");
        }
        console.error("Error al obtener la transacción desde Wompi:", error);
      });
  }, [location.search]);

  // Función para obtener la imagen correcta del producto o su variación
  const getProductImage = (item) => {
    if (item.product_variation && item.product_variation.image) {
      return item.product_variation.image; // Imagen de la variación
    }
    if (item.product && item.product.image) {
      return item.product.image; // Imagen del producto simple
    }
    return "https://via.placeholder.com/100"; // Imagen por defecto si no hay imagen
  };

  // Verificar si hay un error
  if (errorMessage) {
    return <p style={{ color: "red" }}>{errorMessage}</p>;
  }

  // Mostrar mientras se cargan los detalles de la orden
  if (!orderDetails) {
    return <p>Cargando detalles de la orden...</p>;
  }

  return (
    <div className={styles.orderStatus}>
      <h1>Estado de la Orden</h1>
      <div>
        <p><strong>ID de la Transacción:</strong> {transactionId}</p>
        <p><strong>Estado de la Transacción:</strong> {transactionStatus}</p>
        <p><strong>ID de la Orden:</strong> {orderDetails.custom_order_id}</p>
        <p><strong>Nombre del Cliente:</strong> {orderDetails.firstname} {orderDetails.lastname}</p>
        <p><strong>Email:</strong> {orderDetails.email}</p>
        <p><strong>Teléfono:</strong> {orderDetails.phone}</p>
        <p><strong>Subtotal:</strong> {formatPriceToCOP(orderDetails.subtotal)}</p>
        <p><strong>Estado del Pago:</strong> {orderDetails.payment_status}</p>
        <p><strong>Estado del Envío:</strong> {orderDetails.shipping_status}</p>

        <h3>Productos en la Orden:</h3>
        <div className={styles.productList}>
          {orderDetails.items.map((item, index) => (
            <div key={index} className={styles.productCard}>
              {/* Imagen del producto */}
              <div className={styles.productImage}>
                <img
                  src={getProductImage(item)}
                  alt={`Producto ${item.product}`}
                />
              </div>
              {/* Información del producto */}
              <div className={styles.productInfo}>
                <p><strong>Producto:</strong> {item.product_variation?.attribute_options[0]?.name || `Producto ID ${item.product}`}</p>
                <p><strong>Cantidad:</strong> {item.quantity}</p>
                <p><strong>Precio Unitario:</strong> {formatPriceToCOP(item.unit_price)}</p>
                <p><strong>Subtotal:</strong> {formatPriceToCOP(item.subtotal)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrderStatus;
