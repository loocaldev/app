import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function OrderStatus() {
  const location = useLocation();
  const [transactionId, setTransactionId] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    // Obtener el transactionId de los parámetros de la URL
    const searchParams = new URLSearchParams(location.search);
    const transactionIdParam = searchParams.get("id"); // ID de la transacción desde Wompi

    // Validar si existe un transactionId en los parámetros
    if (!transactionIdParam) {
      setErrorMessage("No se encontró un ID de transacción en la URL.");
      return;
    }

    setTransactionId(transactionIdParam);

    // Realizar solicitud GET al servidor de Wompi para obtener el estado de la transacción
    axios
      .get(`https://sandbox.wompi.co/v1/transactions/${transactionIdParam}`)
      .then((response) => {
        const transactionData = response.data;
        console.log("Datos de la transacción:", transactionData);

        // Actualizar el estado de la transacción
        setTransactionStatus(transactionData.data.status);

        // Verificar si la transacción fue aprobada
        if (transactionData.data.status === "APPROVED") {
          // Actualizar el estado de la orden en el backend de Loocal
          axios
            .patch(
              `https://loocal.co/api/orders/api/v1/orders/${transactionData.data.reference}/`, 
              { payment_status: "paid" }  // Cambia el estado de pago a "paid"
            )
            .then((response) => {
              console.log("Estado de la orden actualizado en el backend:", response.data);
            })
            .catch((error) => {
              console.error("Error al actualizar el estado de la orden en el backend:", error);
              setErrorMessage("Error al actualizar el estado de la orden.");
            });
        } else {
          console.log(`Estado de la transacción: ${transactionData.data.status}`);
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
