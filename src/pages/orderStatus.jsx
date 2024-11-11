import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useCart } from '../hooks/useCart';
import formatPriceToCOP from "../utils/formatPrice";
import styles from "../styles/OrderStatus.module.css";

function OrderStatus() {
  const location = useLocation();
  const { clearCart } = useCart();
  const [transactionId, setTransactionId] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchProductById = async (id) => {
    try {
      const response = await axios.get(`https://loocal.co/api/products/api/v1/products/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el producto ${id}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const transactionIdParam = searchParams.get("id");
    const orderIdParam = searchParams.get("orderId");

    if (transactionIdParam) {
      setTransactionId(transactionIdParam);
      fetchOrderStatusWithTransactionId(transactionIdParam);
    } else if (orderIdParam) {
      fetchOrderStatusWithOrderId(orderIdParam);
    } else {
      setErrorMessage("No se encontró un ID de transacción ni de orden en la URL.");
    }
  }, [location.search]);

  // Caso: Pago en línea, con transactionId
  const fetchOrderStatusWithTransactionId = async (transactionIdParam) => {
    try {
      const response = await axios.get(`https://sandbox.wompi.co/v1/transactions/${transactionIdParam}`);
      const transactionData = response.data?.data;

      if (!transactionData) {
        setErrorMessage("No se pudieron obtener los datos de la transacción.");
        return;
      }

      setTransactionStatus(transactionData.status);

      if (transactionData.status === "APPROVED") {
        const orderId = transactionData.reference;
        clearCart();

        try {
          await axios.patch(`https://loocal.co/api/orders/order/${orderId}/`, {
            payment_status: "completed",
          });
          fetchOrderDetails(orderId);
        } catch (error) {
          console.error("Error al actualizar el estado de pago:", error);
          setErrorMessage("No se pudo actualizar el estado de pago.");
        }
      } else {
        setErrorMessage(`Estado de la transacción en Wompi: ${transactionData.status}`);
      }
    } catch (error) {
      console.error("Error al obtener la transacción desde Wompi:", error);
      setErrorMessage("Error al obtener el estado de la transacción.");
    }
  };

  // Caso: Pago contra entrega, con orderId
  const fetchOrderStatusWithOrderId = async (orderIdParam) => {
    try {
      clearCart();
      fetchOrderDetails(orderIdParam);
    } catch (error) {
      console.error("Error al recuperar la orden:", error);
      setErrorMessage("Error al recuperar los detalles de la orden.");
    }
  };

  // Función para obtener los detalles de la orden
  const fetchOrderDetails = async (orderId) => {
    try {
      const orderResponse = await axios.get(`https://loocal.co/api/orders/customid/${orderId}/`);
      let orderData = orderResponse.data;

      if (Array.isArray(orderData) && orderData.length > 0) {
        orderData = orderData[0];
      }

      if (!orderData || !orderData.items) {
        console.warn("La respuesta de la orden no contiene items:", orderData);
        setErrorMessage("No se encontraron los detalles de los productos en la orden.");
        return;
      }

      const detailedItems = await Promise.all(
        orderData.items.map(async (item) => {
          const productData = await fetchProductById(item.product);
          return {
            ...item,
            productDetails: productData,
            image: item.product_variation?.image || productData?.image || "https://via.placeholder.com/100",
          };
        })
      );

      setOrderDetails({ ...orderData, items: detailedItems });
    } catch (error) {
      console.error("Error al obtener los detalles de la orden:", error);
      setErrorMessage("Error al obtener los detalles de la orden.");
    }
  };

  // Función para mostrar las variantes correctamente
  const formatAttributeData = (attributeData) => {
    return Object.entries(attributeData)
      .map(([attributeName, attributeValues]) => {
        const values = Array.isArray(attributeValues)
          ? attributeValues.map((value) => value.name).join(", ")
          : attributeValues;
        return `${attributeName}: ${values}`;
      })
      .join("; ");
  };

  return (
    <div>
      <h1>Estado de la Orden</h1>
      {errorMessage ? (
        <p style={{ color: "red" }}>{errorMessage}</p>
      ) : (
        <>
          <p>ID de la Transacción: {transactionId}</p>
          <p>Estado de la Transacción: {transactionStatus || 'Pendiente de confirmación'}</p>

          {orderDetails && (
            <div className={styles.orderSummary}>
              <h2>Resumen de la Compra</h2>
              <p><strong>Nombre:</strong> {orderDetails.firstname} {orderDetails.lastname}</p>
              <p><strong>Email:</strong> {orderDetails.email}</p>
              <p><strong>Teléfono:</strong> {orderDetails.phone}</p>
              <p><strong>Total:</strong> {formatPriceToCOP(orderDetails.total)}</p>

              <p><strong>Fecha de Entrega:</strong> {orderDetails.delivery_date || 'No seleccionada'}</p>
              <p><strong>Hora de Entrega:</strong> {orderDetails.delivery_time || 'No seleccionada'}</p>

              <h3>Productos:</h3>
              <div className={styles.productList}>
                {orderDetails.items && orderDetails.items.map((item) => (
                  <div key={item.product} className={styles.productItem}>
                    <img
                      src={item.image}
                      alt={item.productDetails?.name || "Producto"}
                      className={styles.productImage}
                    />
                    <div>
                      <p><strong>{item.productDetails?.name || "Producto desconocido"}</strong></p>
                      <p>{item.quantity} x {formatPriceToCOP(item.unit_price)}</p>
                      {item.product_variation && item.product_variation.attribute_data && (
                        <p>Variante: {formatAttributeData(item.product_variation.attribute_data)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OrderStatus;
