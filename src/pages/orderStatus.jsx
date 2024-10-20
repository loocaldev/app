import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function OrderStatus() {
  const location = useLocation();
  const [transactionId, setTransactionId] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const transactionIdParam = searchParams.get("id"); // ID de la transacción desde Wompi

    setTransactionId(transactionIdParam);

    if (transactionIdParam) {
      // Realizar solicitud GET al servidor para obtener el estado de la transacción en Wompi
      axios
        .get(`https://production.wompi.co/v1/transactions/${transactionIdParam}`)
        .then((response) => {
          const transactionData = response.data;
          console.log("Datos de la transacción:", transactionData);
          setTransactionStatus(transactionData.data.status); // Actualizar estado de la transacción
          
          // Actualizar el estado de la orden en la base de datos si la transacción está aprobada
          if (transactionData.data.status === "APPROVED") {
            axios
              .patch(
                `http://loocal.co/api/orders/api/v1/orders/${transactionData.data.reference}/`, 
                { payment_status: "paid" }  // Cambia el estado de pago a "paid"
              )
              .then((response) => {
                console.log("Estado de la orden actualizado:", response.data);
              })
              .catch((error) => {
                console.error("Error al actualizar el estado de la orden:", error);
              });
          }
        })
        .catch((error) => {
          console.error("Error al obtener la transacción:", error);
        });
    }
  }, [location.search]);

  return (
    <div>
      <h1>Estado de la Orden</h1>
      <p>ID de la Transacción: {transactionId}</p>
      <p>Estado de la Transacción: {transactionStatus}</p>
    </div>
  );
}

export default OrderStatus;
