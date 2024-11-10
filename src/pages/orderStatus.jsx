import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useCart } from '../hooks/useCart'; 
import formatPriceToCOP from "../utils/formatPrice"; // Formatear el precio
import styles from "../styles/OrderStatus.module.css"; // Asegúrate de tener un estilo para OrderStatus

function OrderStatus() {
  const location = useLocation();
  const { clearCart } = useCart();
  const [transactionId, setTransactionId] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Función para obtener los productos completos desde la API por ID
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

    if (!transactionIdParam) {
      setErrorMessage("No se encontró un ID de transacción en la URL.");
      return;
    }

    setTransactionId(transactionIdParam);

    // Realizar la solicitud GET al servidor de Wompi para obtener el estado de la transacción
    axios
      .get(`https://sandbox.wompi.co/v1/transactions/${transactionIdParam}`)
      .then(async (response) => {
        const transactionData = response.data?.data;

        if (!transactionData) {
          setErrorMessage("No se pudieron obtener los datos de la transacción.");
          return;
        }

        console.log("Datos de la transacción:", transactionData);

        // Actualizar el estado de la transacción
        setTransactionStatus(transactionData.status);

        if (transactionData.status === "APPROVED") {
          const orderId = transactionData.reference;
          // Limpiar el carrito después de la aprobación de la transacción
          clearCart(); 

          // Actualizar el estado de pago en el backend
          await axios.patch(`https://loocal.co/api/orders/${orderId}/`, {
            payment_status: "completed",  // Cambia el estado de pago a "completed"
          });

          // Obtener los detalles de la orden desde el backend
          try {
            const orderResponse = await axios.get(`https://loocal.co/api/orders/${orderId}/`);
            const orderData = orderResponse.data;

            // Procesar cada producto de la orden para obtener más detalles
            const detailedItems = await Promise.all(
              orderData.items.map(async (item) => {
                const productData = await fetchProductById(item.product);

                if (productData) {
                  // Agregar los detalles del producto al item
                  return {
                    ...item,
                    productDetails: productData,
                    image: item.product_variation?.image || productData.image, // Imagen del producto o de la variación
                  };
                }
                return item; // En caso de error, devolvemos el item tal cual
              })
            );

            // Guardar los detalles completos de la orden
            setOrderDetails({
              ...orderData,
              items: detailedItems, // Actualizamos los items con más detalles
            });
          } catch (error) {
            console.error("Error al obtener los detalles de la orden:", error);
            setErrorMessage("Error al obtener los detalles de la orden.");
          }
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

  return (
    <div>
      <h1>Estado de la Orden</h1>
      {errorMessage ? (
        <p style={{ color: "red" }}>{errorMessage}</p>
      ) : (
        <>
          <p>ID de la Transacción: {transactionId}</p>
          <p>Estado de la Transacción: {transactionStatus}</p>

          {orderDetails && (
            <div className={styles.orderSummary}>
              <h2>Resumen de la Compra</h2>
              <p><strong>Nombre:</strong> {orderDetails.firstname} {orderDetails.lastname}</p>
              <p><strong>Email:</strong> {orderDetails.email}</p>
              <p><strong>Teléfono:</strong> {orderDetails.phone}</p>
              <p><strong>Total:</strong> {formatPriceToCOP(orderDetails.subtotal)}</p>

              {/* Mostrar fecha y hora de entrega */}
              <p><strong>Fecha de Entrega:</strong> {orderDetails.fechaEntrega || 'No seleccionada'}</p>
              <p><strong>Hora de Entrega:</strong> {orderDetails.horaEntrega || 'No seleccionada'}</p>

              <h3>Productos:</h3>
              <div className={styles.productList}>
                {orderDetails.items.map((item) => (
                  <div key={item.product} className={styles.productItem}>
                    <img
                      src={item.image || "https://via.placeholder.com/100"} // Mostrar imagen o placeholder si no hay imagen
                      alt={item.productDetails?.name || "Producto"}
                      className={styles.productImage}
                    />
                    <div>
                      <p><strong>{item.productDetails?.name}</strong></p>
                      <p>{item.quantity} x {formatPriceToCOP(item.unit_price)}</p>
                      {item.product_variation && (
                        <p>Variante: {item.product_variation.attribute_options.map(opt => opt.name).join(", ")}</p>
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
