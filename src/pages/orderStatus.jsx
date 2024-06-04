import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function OrderStatus() {
  const location = useLocation();
  const [orderId, setOrderId] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orderIdParam = searchParams.get("bold-order-id");
    const transactionStatusParam = searchParams.get("bold-tx-status");

    setOrderId(orderIdParam);
    setTransactionStatus(transactionStatusParam);

    if (orderIdParam && transactionStatusParam === "approved") {
      // Realizar solicitud GET al servidor para obtener la orden correspondiente
      axios
        .get(
          `http://localhost:8000/orders/api/v1/orders/customid/${orderIdParam}`
        )
        .then((response) => {
          const orderData = response.data;
          console.log("Datos de la orden:", orderData); // Imprimir los datos de la orden en la consola
          console.log(orderData[0].id)
          // Actualizar el estado de la orden en la base de datos si la transacción está aprobada
          axios
              .patch(
                `http://localhost:8000/orders/api/v1/orders/${orderData[0].id}/`,
                { payment_status: "pending" }
              )
              .then((response) => {
                console.log("Estado de la orden actualizado:", response.data);
              })
              .catch((error) => {
                console.error(
                  "Error al actualizar el estado de la orden:",
                  error
                );
              });
        })
        .catch((error) => {
          console.error("Error al obtener la orden:", error);
        });
    }
  }, [location.search]);
  return (
    <div>
      <h1>Estado de la Orden</h1>
      <p>Order ID: {orderId}</p>
      <p>Estado de la Transacción: {transactionStatus}</p>
    </div>
  );
}

export default OrderStatus;
