// Order.jsx
import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useCart } from "../hooks/useCart";
import ProductCard from "../components/ProductCard";
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

  const handleConfirmOrder = () => {
    // Redirigir al checkout con los datos del carrito y subtotal
    navigate("/checkout", { state: { cart, subtotal } });
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
