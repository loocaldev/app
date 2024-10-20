import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function OrderStatus() {
  const location = useLocation();
  const [transactionId, setTransactionId] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const transactionIdParam = searchParams.get("id"); // ID de la transacción desde Wompi
  
    if (!transactionIdParam) {
      setErrorMessage("No se encontró un ID de transacción en la URL.");
      return;
    }
  
    setTransactionId(transactionIdParam);
  
    // Realizar solicitud GET al servidor de Wompi para obtener el estado de la transacción
    axios
      .get(`https://sandbox.wompi.co/v1/transactions/${transactionIdParam}`)
      .then((response) => {
        const transactionData = response.data?.data; // Asegurarse que data existe
        if (!transactionData) {
          setErrorMessage("No se pudieron obtener los datos de la transacción.");
          return;
        }
  
        console.log("Datos de la transacción:", transactionData);
  
        // Actualizar el estado de la transacción
        setTransactionStatus(transactionData.status);
  
        // Verificar si la transacción fue aprobada
        if (transactionData.status === "APPROVED") {
          const orderId = transactionData.reference; // Verifica que sea el custom_order_id
  
          // Actualizar el estado de la orden en el backend de Loocal
          axios
            .patch(
              `https://loocal.co/api/orders/api/v1/orders/${orderId}/`,
              { payment_status: "completed" }  // Cambia el estado de pago a "paid"
            )
            .then((response) => {
              console.log("Estado de la orden actualizado en el backend:", response.data);
            })
            .catch((error) => {
              console.error("Error al actualizar el estado de la orden en el backend:", error);
              setErrorMessage("Error al actualizar el estado de la orden.");
            });
        } else {
          console.log(`Estado de la transacción: ${transactionData.status}`);
        }
      })
      .catch((error) => {
        console.error("Error al obtener la transacción desde Wompi:", error);
        setErrorMessage("Error al obtener el estado de la transacción.");
      });
  }, [location.search]);

  return (
    <div>
      <h1>Estado de la Orden</h1>
      {errorMessage ? (
        <p style={{ color: "red" }}>{errorMessage}</p>
      ) : (
        <>
          <p>ID de la Transacción: {transactionId}</p>
          <p>Estado de la Transacción: {transactionStatus}</p>
        </>
      )}
    </div>
  );
}

export default OrderStatus;
