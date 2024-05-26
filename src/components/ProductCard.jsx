import React, { useState } from "react";
import styles from "../styles/ProductCard.module.css";
import {
  FiChevronDown,
  FiPlus,
  FiMinus,
  FiShoppingCart,
  FiChevronUp,
  FiCheck
} from "react-icons/fi";
import { BsCartCheck } from "react-icons/bs";
import { useCart } from "../hooks/useCart";

function ProductCard({ product }) {
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

  const [isExtended, setIsExtended] = useState(false);

  const toggleExtendContent = () => {
    setIsExtended(!isExtended);
  };

  const checkProductInCart = (product) => {
    if (!product) return false;
    return cart.some((item) => item.id === product.id);
  };

  const { cart, addToCart, removeFromCart, decrementQuantity } = useCart();

  const isProductInCart = checkProductInCart(product);

  const getProductQuantity = (product) => {
    const cartProduct = cart.find((item) => item.id === product.id);
    return cartProduct ? cartProduct.quantity : 0;
  };

  const productQuantity = getProductQuantity(product);

  return (
    <div className={styles.card}>
      <div className={styles["main-product"]}>
        <div className={styles["product-img"]}>
          <img src={product.image}></img>
        </div>
        <div className={styles["product-content"]}>
          <h3 className={styles["product-content-name"]}>{product.name}</h3>
          <div className={styles["product-variations"]}>
            <span>Convencional</span>
            <span>Maduro</span>
          </div>
        </div>
        <div className={styles["product-action"]}>
          <div
            className={`${styles["product-action-buttons"]} ${
              isProductInCart ? styles["added"] : ""
            }`}
          >
            <div
              className={`${styles["product-button-add"]} ${
                isProductInCart ? styles["added"] : ""
              }`}
            >
              {isProductInCart ? (
                <FiCheck />
              ) : (
                <FiShoppingCart onClick={() => addToCart(product)} />
              )}
            </div>
            {isProductInCart ? (
              <div className={styles["product-action-quantity"]}>
                <button onClick={() => decrementQuantity(product)}>
                  <FiMinus />
                </button>
                <span>{productQuantity} Kg</span>
                <button onClick={() => addToCart(product)}>
                  <FiPlus />
                </button>
              </div>
            ) : (
              ""
            )}
          </div>
          <div className={styles["product-action-price"]}>
            {isProductInCart ? (
                <p>{formatPriceToCOP(productQuantity * product.price)}</p>
            ) : (
              <p>{formatPriceToCOP(product.price)}</p>
            )}
            
          </div>
          <div className={styles["product-action-pum"]}>
            <span>Kg a {formatPriceToCOP(product.price)}</span>
          </div>
        </div>
      </div>
      {/* <div className={styles["extend-product"]}>
          <div className={styles["extend-action"]}>
            <div className={styles["extend-action-line"]}>
              <hr />
            </div>
            <div
              className={styles["extend-action-button"]}
              onClick={toggleExtendContent}
            >
              <span>Ver más</span>
              {isExtended ? <FiChevronUp /> : <FiChevronDown />}
            </div>
          </div>
          {isExtended && (
            <div className={styles["extend-content"]}>
              <span>Lorem ipsum dolor sit amet</span>
            </div>
          )}
        </div> */}
    </div>
  );
}

export default ProductCard;
