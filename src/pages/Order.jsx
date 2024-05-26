import React from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import { useCart } from "../hooks/useCart";
import ProductCard from "../components/ProductCard"

import styles from "../styles/Order.module.css";

function Order() {
  const { cart, addToCart, checkProductInCart, removeFromCart, subtotal } =
    useCart();
  return (
    <>
      <div className={styles["header"]}>
        <FiChevronLeft onClick={() => window.history.back()} />
        <h2>Resumen de tu compra</h2>
      </div>
      <div>
      {cart.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
      <div>
        <p>{subtotal}</p>
      </div>
    </>
  );
}

export default Order;
