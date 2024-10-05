import React, { useState, useEffect } from "react";
import axios from "axios"; // Importar Axios para realizar solicitudes HTTP
import { Link } from "react-router-dom";
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
  const { cart, addToCart, checkProductInCart, removeFromCart, subtotal } =
    useCart();
  const [integrityHash, setIntegrityHash] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const orderId = localStorage.getItem("orderId");
    if (!orderId) {
      const newOrderId = generateOrderId(); // Generar nuevo ID de orden estructurado
      localStorage.setItem("orderId", newOrderId);
      console.log(orderId)
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
    const randomValue = "R" + Math.floor(Math.random() * 9000 + 1000); // Valor aleatorio de 4 dígitos
    const orderId = `LC${year}${month}${day}${hour}${minute}${second}${millisecond}${productCount}${randomValue}`;
    return orderId;
  };

  const handleConfirmOrder = async () => {
    const order_id = localStorage.getItem("orderId");
    const amount = subtotal;
    const currency = "COP";

    try {
      const order = {
        order_id: order_id,
        amount: amount,
        currency: currency,
      };
      const response = await axios.post(
        "http://44.220.218.144/api/payments/generate_integrity_hash/",
        {
          order: order,
        }
      );
      const integrity_hash = response.data.hash;
      console.log(integrity_hash)
      setIntegrityHash(integrity_hash);
      navigate("/checkout", { state: { integrity_hash} });
      return integrity_hash;
    } catch (error) {
      console.log(error.response.data);
      return null;
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
        <div>
        </div>
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
