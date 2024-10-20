import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function OrderStatus() {
  const location = useLocation();
  const [transactionId, setTransactionId] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");
  const [orderDetails, setOrderDetails] = useState(null); // Estado para almacenar los detalles de la orden
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const transactionIdParam = searchParams.get("id"); // Obtener el ID de la transacción de la URL

    if (!transactionIdParam) {
      setErrorMessage("No se encontró un ID de transacción en la URL.");
      return;
    }

    setTransactionId(transactionIdParam);

    // Realizar la solicitud GET al servidor de Wompi para obtener el estado de la transacción
    axios
      .get(`https://sandbox.wompi.co/v1/transactions/${transactionIdParam}`)
      .then((response) => {
        const transactionData = response.data?.data;

        if (!transactionData) {
          setErrorMessage("No se pudieron obtener los datos de la transacción.");
          return;
        }

        console.log("Datos de la transacción:", transactionData);

        // Actualizar el estado de la transacción
        setTransactionStatus(transactionData.status);

        if (transactionData.status === "APPROVED") {
          const orderId = transactionData.reference; // Verifica que el ID de la orden sea correcto

          // Obtener los detalles de la orden desde el backend de Loocal
          axios
            .get(`https://loocal.co/api/orders/api/v1/orders/${orderId}/`)
            .then((response) => {
              setOrderDetails(response.data); // Guardar los detalles de la orden
              console.log("Detalles de la orden:", response.data);

              // Actualizar el estado de la orden a "paid" en el backend
              axios
                .patch(
                  `https://loocal.co/api/orders/api/v1/orders/${orderId}/`,
                  { payment_status: "completed" }  // Cambia el estado de pago a "paid"
                )
                .then(() => {
                  console.log("Estado de la orden actualizado en el backend.");
                })
                .catch((error) => {
                  console.error("Error al actualizar el estado de la orden en el backend:", error);
                  setErrorMessage("Error al actualizar el estado de la orden.");
                });
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

  // Formatear precios a moneda COP
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

  if (!orderDetails) {
    return <p>Cargando detalles de la orden...</p>;
  }

  return (
    <div>
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
        <ul>
          {orderDetails.items.map((item, index) => (
            <li key={index}>
              <p><strong>Producto:</strong> {item.product_variation?.attribute_options[0]?.name || `Producto ID ${item.product}`}</p>
              <p><strong>Cantidad:</strong> {item.quantity}</p>
              <p><strong>Precio Unitario:</strong> {formatPriceToCOP(item.unit_price)}</p>
              <p><strong>Subtotal:</strong> {formatPriceToCOP(item.subtotal)}</p>
              {item.product_variation && (
                <>
                  <p><strong>Variación:</strong> {item.product_variation.attribute_options[0].name}</p>
                  <img
                    src={item.product_variation.image}
                    alt="Imagen del producto"
                    style={{ width: "100px", height: "100px" }} // Ajusta el tamaño según sea necesario
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
