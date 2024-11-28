import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useCart } from "../hooks/useCart";
import formatPriceToCOP from "../utils/formatPrice";
import styles from "../styles/NewOrderStatus.module.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

import LogoGray from "../assets/logo-gray3.svg";
import { IoMdCheckmark, IoMdClose, IoMdTime } from "react-icons/io";

function NewOrderStatus() {
  const location = useLocation();
  const { clearCart } = useCart();
  const [transactionId, setTransactionId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("En progreso"); // Estado inicial
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  

  const fetchProductById = async (id) => {
    try {
      const response = await axios.get(
        `https://loocal.co/api/products/api/v1/products/${id}/`
      );
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
      setErrorMessage(
        "No se encontró un ID de transacción ni de orden en la URL."
      );
    }
  }, [location.search]);

  const mapPaymentStatus = (status) => {
    switch (status) {
      case "paid":
        return "Aprobado";
      case "pending":
        return "Pendiente";
      case "failed":
      case "declined":
        return "Rechazado";
      default:
        return "En progreso";
    }
  };
  

  // Obtener estado y detalles de la transacción
  const fetchOrderStatusWithTransactionId = async (transactionIdParam) => {
    try {
      const response = await axios.get(`https://sandbox.wompi.co/v1/transactions/${transactionIdParam}`);
      const transactionData = response.data?.data;
      console.log("Transaction Data: ", transactionData)
  
      if (!transactionData) {
        setErrorMessage("No se pudieron obtener los datos de la transacción.");
        return;
      }
  
      let status = "En progreso";
      setPaymentStatus(status);
  
      if (transactionData.status === "APPROVED") {
        const orderId = transactionData.reference;
        clearCart();
        // await updatePaymentStatus(orderId, "paid");
        fetchOrderDetails(orderId);
      } else if (transactionData.status === "DECLINED" || transactionData.status === "FAILED") {
        const orderId = transactionData.reference;
        // await updatePaymentStatus(orderId, "failed");
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

  // const updatePaymentStatus = async (orderId, status) => {
  //   try {
  //     await axios.patch(`https://loocal.co/api/orders/order/${orderId}/`, {
  //       payment_status: status,
  //       checkout: true,
  //     });
  //   } catch (error) {
  //     console.error("Error al actualizar el estado de pago:", error);
  //     setErrorMessage("No se pudo actualizar el estado de pago.");
  //   }
  // };
  
  const fetchOrderDetails = async (orderId) => {
    try {
      const orderResponse = await axios.get(
        `https://loocal.co/api/orders/customid/${orderId}/`
      );
      let orderData = orderResponse.data;
      if (Array.isArray(orderData) && orderData.length > 0) {
        orderData = orderData[0];
      }

      setPaymentStatus(mapPaymentStatus(orderData.payment_status || 'En progreso'));

      const detailedItems = await Promise.all(
        orderData.items.map(async (item) => {
          const productData = await fetchProductById(item.product);
          return {
            ...item,
            productDetails: productData,
            image:
              item.product_variation?.image ||
              productData?.image ||
              "https://via.placeholder.com/100",
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
    if (!attributeData || typeof attributeData !== "object") {
      return ""; // Devuelve un string vacío si `attributeData` es `null` o `undefined`
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
  console.log(orderDetails);

  const generatePDF = async () => {
    const receiptElement = document.querySelector(`.${styles["box-receipt"]}`);
    if (!receiptElement) {
      console.error("No se encontró el elemento del recibo.");
      return;
    }

    try {
      // Capturar el HTML del recibo como imagen
      const canvas = await html2canvas(receiptElement, { scale: 2 }); // Escalado para mayor calidad
      const imgData = canvas.toDataURL("image/png");

      // Tamaño carta y márgenes
      const pdfWidth = 612; // Ancho de tamaño carta en puntos
      const pdfHeight = 792; // Alto de tamaño carta en puntos
      const margin = 36; // Márgenes de 0.5 pulgadas (36 puntos)
      const contentWidth = pdfWidth - margin * 2; // Ancho disponible para el contenido
      const contentHeight = pdfHeight - margin * 2; // Alto disponible para el contenido

      // Dimensiones de la imagen capturada
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calcular escala para ajustar al contenido dentro del área disponible
      const ratio = Math.min(
        contentWidth / imgWidth,
        contentHeight / imgHeight
      );
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      // Posicionar el contenido dentro de los márgenes, más cerca de la parte superior
      const xOffset = margin;
      const yOffset = margin; // Posiciona en la parte superior según el margen

      // Crear el PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt", // Unidades en puntos
        format: "letter", // Tamaño carta
      });

      // Agregar la imagen al PDF
      pdf.addImage(imgData, "PNG", xOffset, yOffset, scaledWidth, scaledHeight);
      pdf.save(`Recibo_${orderDetails.custom_order_id}.pdf`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    }
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
              <span>
                Orden #{orderDetails?.custom_order_id || "Cargando..."}
              </span>
              <h4>Gracias por tu compra</h4>
            </div>
            <div className={styles["header-second-column"]}>
              <div
                className={`${styles["payment-status"]} ${
                  styles[`status-${paymentStatus.toLowerCase()}`]
                }`}
              >
                {paymentStatus === "Aprobado" ? (
                  <IoMdCheckmark />
                ) : paymentStatus === "Rechazado" ? (
                  <IoMdClose />
                ) : (
                  <IoMdTime />
                )}
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
                    <span>
                      {orderDetails?.firstname} {orderDetails?.lastname}
                    </span>
                    <span>
                      {orderDetails?.document_type}{" "}
                      {orderDetails?.document_number}
                    </span>
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
                    <span>
                      Fecha: {orderDetails?.delivery_date || "No seleccionada"}
                    </span>
                    <span>
                      Hora: {orderDetails?.delivery_time || "No seleccionada"}
                    </span>
                  </div>
                  <div className={styles["section-column"]}>
                    <span>Dirección: {orderDetails?.address?.street}</span>
                    <span>
                      {orderDetails?.address?.state},{" "}
                      {orderDetails?.address?.city}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles["receipt-resume-order"]}>
              <div className={styles["resume-order-column"]}>
                {orderDetails?.discounts &&
                  orderDetails.discounts.map((discount, index) => (
                    <span key={index}>
                      {discount.description} -{" "}
                      {formatPriceToCOP(discount.amount)}
                    </span>
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
                        <span>
                          {item.productDetails?.name}{" "}
                          {formatAttributeData(
                            item.product_variation?.attribute_data
                          )}
                        </span>
                        <span>x{item.quantity}</span>
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
      <div className={styles["receipt-download"]}>
        <button onClick={generatePDF} className={styles["button-download"]}>
          Descargar PDF
        </button>
      </div>
    </div>
  );
}

export default NewOrderStatus;
