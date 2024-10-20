import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useCart } from "../hooks/useCart";
import ProductCard from "../components/ProductCard";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Order.module.css";

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

function Order() {
  const { cart, subtotal } = useCart();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(localStorage.getItem("orderId"));

  useEffect(() => {
    // Generar el ID de la orden si no existe
    if (!orderId) {
      const newOrderId = generateOrderId(); // Lógica que ya tienes
      localStorage.setItem("orderId", newOrderId);
      setOrderId(newOrderId);
    }
  }, []);


  const generateOrderId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = ("0" + (now.getMonth() + 1)).slice(-2);
    const day = ("0" + now.getDate()).slice(-2);
    const hour = ("0" + now.getHours()).slice(-2);
    const minute = ("0" + now.getMinutes()).slice(-2);
    const second = ("0" + now.getSeconds()).slice(-2);
    const millisecond = ("00" + now.getMilliseconds()).slice(-3);
    const productCount = "C" + cart.length;
    const randomValue = "R" + Math.floor(Math.random() * 9000 + 1000);
    const orderId = `LC${year}${month}${day}${hour}${minute}${second}${millisecond}${productCount}${randomValue}`;
    return orderId;
  };

  const handleConfirmOrder = async () => {
    try {
      // Preparar los items de la orden
      const orderItems = cart.map((item) => ({
        product_variation_id: item.variationId || null, // Para productos fijos, variationId es null
        product_id: item.id, // Para productos fijos, usar product_id
        quantity: item.quantity,
      }));

      const orderData = {
        custom_order_id: orderId,
        items: orderItems, // Enviar todos los productos
        subtotal: subtotal, // Enviar el subtotal calculado
      };

      console.log("Datos enviados:", orderData);

      // Crear la orden en el backend
      const response = await axios.post(
        "https://loocal.co/api/orders/api/v1/orders/",
        orderData
      );

      console.log("Orden creada:", response.data);
      // Redirigir al checkout
      navigate("/checkout", { state: { orderId } });
    } catch (error) {
      console.error("Error al crear la orden:", error);
    }
  };

  return (
    <>
      <div className={styles["order-header"]}>
        <div className={styles["header-content"]}>
          <FiChevronLeft onClick={() => window.history.back()} />
          <h2>Resumen de tu compra</h2>
        </div>
        <hr className={styles["divider-header"]} />
      </div>

      <div className={styles["order-content"]}>
        {cart.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className={styles["order-subtotal"]}>
        <div className={styles["order-subtotal-content"]}>
          <p>{formatPriceToCOP(subtotal)}</p>
          <span>
            {cart.length} {cart.length === 1 ? "producto" : "productos"}
          </span>
        </div>
        <div
          className={styles["order-subtotal-button"]}
          onClick={handleConfirmOrder}
        >
          <p>Confirmar pedido</p>
          <FiChevronRight />
        </div>
      </div>
    </>
  );
}

export default Order;
