import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import styles from "../styles/OrderStatus.module.css"; // Crea estilos si es necesario

function OrderStatus() {
  const location = useLocation();
  const [transactionId, setTransactionId] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Obtener el ID de transacción desde la URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const transactionIdParam = searchParams.get("id");

    if (!transactionIdParam) {
      setErrorMessage("No se encontró un ID de transacción en la URL.");
      return;
    }

    setTransactionId(transactionIdParam);

    // Realizar la solicitud para obtener el estado de la orden y detalles
    axios
      .get(`https://loocal.co/api/orders/api/v1/orders/${transactionIdParam}/`)
      .then((response) => {
        const orderDetails = response.data;

        if (!orderDetails) {
          setErrorMessage("No se encontraron datos de la orden.");
          return;
        }

        console.log("Datos de la orden:", orderDetails);
        setOrderData(orderDetails); // Guardamos los datos de la orden
      })
      .catch((error) => {
        setErrorMessage("Error al obtener los datos de la orden.");
        console.error("Error al obtener los detalles de la orden:", error);
      });
  }, [location.search]);

  // Función para formatear precios a COP
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

  if (errorMessage) {
    return <p style={{ color: "red" }}>{errorMessage}</p>;
  }

  if (!orderData) {
    return <p>Cargando detalles de la orden...</p>;
  }

  return (
    <div className={styles["order-status-container"]}>
      <h1>Estado de la Orden</h1>
      <div className={styles["order-details"]}>
        <p><strong>ID de la Orden:</strong> {orderData.custom_order_id}</p>
        <p><strong>Nombre del Cliente:</strong> {orderData.firstname} {orderData.lastname}</p>
        <p><strong>Email:</strong> {orderData.email}</p>
        <p><strong>Teléfono:</strong> {orderData.phone}</p>
        <p><strong>Estado del Pago:</strong> {orderData.payment_status}</p>
        <p><strong>Estado del Envío:</strong> {orderData.shipping_status}</p>
        <p><strong>Subtotal:</strong> {formatPriceToCOP(orderData.subtotal)}</p>
        
        <h3>Productos en la Orden:</h3>
        <ul>
          {orderData.items.map((item, index) => (
            <li key={index} className={styles["order-item"]}>
              <p>
                <strong>Producto:</strong>{" "}
                {item.product_variation?.attribute_options[0]?.name
                  ? `${item.product_variation.attribute_options[0].name}`
                  : `Producto ID ${item.product}`}
              </p>
              <p><strong>Cantidad:</strong> {item.quantity}</p>
              <p><strong>Precio Unitario:</strong> {formatPriceToCOP(item.unit_price)}</p>
              <p><strong>Subtotal:</strong> {formatPriceToCOP(item.subtotal)}</p>
              {item.product_variation && (
                <>
                  <p><strong>Variación:</strong> {item.product_variation.attribute_options[0].name}</p>
                  <img
                    src={item.product_variation.image}
                    alt="Imagen del producto"
                    className={styles["product-image"]}
                  />
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default OrderStatus;
