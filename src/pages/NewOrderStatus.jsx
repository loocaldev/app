import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useCart } from '../hooks/useCart';
import formatPriceToCOP from "../utils/formatPrice";
import styles from "../styles/NewOrderStatus.module.css";

import LogoGray from "../assets/logo-gray3.svg";
import { IoMdCheckmark, IoMdClose, IoMdTime } from "react-icons/io";

function NewOrderStatus() {
  const location = useLocation();
  const { clearCart } = useCart();
  const [transactionId, setTransactionId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("En progreso");  // Estado inicial
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

  // Obtener estado y detalles de la transacción
  const fetchOrderStatusWithTransactionId = async (transactionIdParam) => {
    try {
      const response = await axios.get(`https://sandbox.wompi.co/v1/transactions/${transactionIdParam}`);
      const transactionData = response.data?.data;

      if (!transactionData) {
        setErrorMessage("No se pudieron obtener los datos de la transacción.");
        return;
      }

      const status = transactionData.status === "APPROVED" ? "Aprobado" : "Rechazado";
      setPaymentStatus(status);

      if (transactionData.status === "APPROVED") {
        const orderId = transactionData.reference;
        clearCart();
        await updatePaymentStatus(orderId);
        fetchOrderDetails(orderId);
      }
    } catch (error) {
      console.error("Error al obtener la transacción desde Wompi:", error);
      setErrorMessage("Error al obtener el estado de la transacción.");
    }
  };

  const fetchOrderStatusWithOrderId = async (orderIdParam) => {
    try {
      clearCart();
      fetchOrderDetails(orderIdParam);
    } catch (error) {
      console.error("Error al recuperar la orden:", error);
      setErrorMessage("Error al recuperar los detalles de la orden.");
    }
  };

  const updatePaymentStatus = async (orderId) => {
    try {
      await axios.patch(`https://loocal.co/api/orders/order/${orderId}/`, {
        payment_status: "completed",
      });
    } catch (error) {
      console.error("Error al actualizar el estado de pago:", error);
      setErrorMessage("No se pudo actualizar el estado de pago.");
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const orderResponse = await axios.get(`https://loocal.co/api/orders/customid/${orderId}/`);
      let orderData = orderResponse.data;
      if (Array.isArray(orderData) && orderData.length > 0) {
        orderData = orderData[0];
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

  const formatAttributeData = (attributeData) => {
    if (!attributeData || typeof attributeData !== 'object') {
      return ''; // Devuelve un string vacío si `attributeData` es `null` o `undefined`
    }
  
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
    <div className={styles["content-order-status"]}>
      <div className={styles["box-receipt"]}>
        <div className={styles["receipt-header"]}>
          <div className={styles["receipt-header-row"]}>
            <img src={LogoGray} alt="Logo" />
            <span>{new Date().toLocaleString()}</span> {/* Fecha y hora */}
          </div>
          <div className={styles["receipt-header-row"]}>
            <div className={styles["header-second-column"]}>
              <span>Orden #{orderDetails?.custom_order_id || 'Cargando...'}</span>
              <h4>Gracias por tu compra</h4>
            </div>
            <div className={styles["header-second-column"]}>
              <div className={`${styles["payment-status"]} ${styles[`status-${paymentStatus.toLowerCase()}`]}`}>
                {paymentStatus === "Aprobado" ? <IoMdCheckmark /> : paymentStatus === "Rechazado" ? <IoMdClose /> : <IoMdTime />}
                <span>{paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <p style={{ color: "red" }}>{errorMessage}</p>
        ) : (
          <>
            <div className={styles["receipt-content"]}>
              <div className={styles["receipt-section"]}>
                <div className={styles["receipt-section-title"]}>
                  <span>Cliente</span>
                  <hr />
                </div>
                <div className={styles["receipt-section-content"]}>
                  <div className={styles["section-column"]}>
                    <span>{orderDetails?.firstname} {orderDetails?.lastname}</span>
                    <span>{orderDetails?.document_type} {orderDetails?.document_number}</span>
                  </div>
                  <div className={styles["section-column"]}>
                    <span>Email: {orderDetails?.email}</span>
                    <span>Cel: {orderDetails?.phone}</span>
                  </div>
                </div>
              </div>

              <div className={styles["receipt-section"]}>
                <div className={styles["receipt-section-title"]}>
                  <span>Entrega</span>
                  <hr />
                </div>
                <div className={styles["receipt-section-content"]}>
                  <div className={styles["section-column"]}>
                    <span>Fecha: {orderDetails?.delivery_date || 'No seleccionada'}</span>
                    <span>Hora: {orderDetails?.delivery_time || 'No seleccionada'}</span>
                  </div>
                  <div className={styles["section-column"]}>
                    <span>Dirección: {orderDetails?.address?.street}</span>
                    <span>{orderDetails?.address?.state}, {orderDetails?.address?.city}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles["receipt-resume-order"]}>
              <div className={styles["resume-order-column"]}>
                {orderDetails?.discounts && orderDetails.discounts.map((discount, index) => (
                  <span key={index}>{discount.description} - {formatPriceToCOP(discount.amount)}</span>
                ))}
              </div>
              <div className={styles["resume-order-column"]}>
                <span>{formatPriceToCOP(orderDetails?.subtotal)}</span>
                <span>{formatPriceToCOP(orderDetails?.total)}</span>
                <span>{orderDetails?.items?.length} productos</span>
              </div>
            </div>

            <div className={styles["receipt-items"]}>
              <ul>
                {orderDetails?.items?.map((item, index) => (
                  <li key={index}>
                    <div className={styles["receipt-item"]}>
                      <div className={styles["item-detail"]}>
                        <span>{item.productDetails?.name} {formatAttributeData(item.product_variation?.attribute_data)}</span>
                        <span>x{item.quantity}</span>
                        <span>({item.displayQuantity})</span>
                      </div>
                      <div className={styles["item-price"]}>
                        <span>{formatPriceToCOP(item.unit_price)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default NewOrderStatus;
