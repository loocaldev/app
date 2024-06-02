import React, { useState, useEffect } from "react";
import axios from "axios"; // Importar Axios para realizar solicitudes HTTP
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useCart } from "../hooks/useCart";
import ProductCard from "../components/ProductCard";
import { v4 as uuidv4 } from "uuid";

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

  useEffect(() => {
    const orderId = localStorage.getItem("orderId");
    if (!orderId) {
      const newOrderId = uuidv4();
      localStorage.setItem("orderId", newOrderId);
      console.log("Nuevo ID de orden generado:", newOrderId);
    } else {
      console.log("ID de orden existente:", orderId);
    }
  }, []);

  const handleConfirmOrder = async () => {

    const order_id = localStorage.getItem("orderId");
    const amount = subtotal;
    const currency = "COP";

    try {
      const order = {
        order_id: order_id,
        amount: amount,
        currency: currency
      }
      const response = await axios.post("http://localhost:8000/payments/generate_integrity_hash/", {
        order: order
      })
      const integrity_hash = response.data.hash
      setIntegrityHash(integrity_hash);
      return integrity_hash
    } catch (error) {
      console.log(error.response.data)
      return null
    }
  }

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
          <script
            data-bold-button="light-L"
            data-order-id={localStorage.getItem("orderId")}
            data-currency="COP"
            data-amount={subtotal}
            data-api-key="KiF61KQUhJb5_nvNR0aNaQlpgcEAsofJyNv_34HsRJI"
            data-integrity-signature={integrityHash}
            data-redirection-url="https://loocal.co/gracias"
          ></script>
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
