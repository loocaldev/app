import React, { useState } from "react";
import { FiShoppingCart, FiChevronRight, FiX } from "react-icons/fi";
import ProductCard from "./ProductCard";
import { useCart } from "../hooks/useCart";

import styles from "../styles/Cart.module.css";

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

function Cart() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartDetailedOpen, setIsCartDetailedOpen] = useState(false);

  const { cart, addToCart, checkProductInCart, removeFromCart, subtotal } = useCart()

  const handleCartIconClick = () => {
    setIsCartOpen(!isCartOpen);
    setIsCartDetailedOpen(false); // Close detailed view if opening/closing cart content
  };

  const handleContentBoxClick = () => {
    setIsCartDetailedOpen(!isCartDetailedOpen);
  };

  const handleDetailedCloseClick = () => {
    setIsCartDetailedOpen(false);
  };

  return (
    <div className={`${styles.Cart} ${isCartOpen ? styles.open : styles.closed}`}>
      <div className={`${styles["cart-container"]} ${isCartOpen ? styles.show : styles.hide}`}>
        <div className={`${styles["cart-box"]} ${isCartDetailedOpen ? styles.detailed : ""}`}>
          <div className={`${styles["cart-first-column"]} ${isCartOpen ? styles.show : styles.hide}`}>
            <div className={styles["cart-icon-box"]} onClick={handleCartIconClick}>
              <div className={styles["cart-icon"]}>
                <FiShoppingCart />
              </div>
            </div>
            <div className={`${styles["cart-content-box"]} ${isCartOpen ? styles.show : styles.hide}`} onClick={handleContentBoxClick}>
              <h4>{formatPriceToCOP (subtotal)}</h4>
              <span>{cart.length} {cart.length === 1 ? 'producto' : 'productos'}</span>
            </div>
          </div>
          <div className={`${styles["cart-action-box"]} ${isCartOpen ? styles.show : styles.hide}`}>
            <span>Completar compra</span>
            <FiChevronRight />
          </div>
        </div>
      </div>
      <div className={`${styles["cart-box-detailed"]} ${isCartDetailedOpen ? styles.show : styles.hide}`}>
        <div className={styles["cart-detailed-top"]}>
          <h3>Tu carrito</h3>
          <FiX onClick={handleDetailedCloseClick} />
        </div>
        {cart.map(product => (
          <ProductCard key={product.id} product = {product}/>
        ))}
      </div>
    </div>
  );
}

export default Cart;
