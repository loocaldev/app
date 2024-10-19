import React, { useState, forwardRef } from "react";
import styles from "../styles/ProductCardSQ.module.css";
import {
  FiChevronDown,
  FiPlus,
  FiMinus,
  FiShoppingCart,
  FiChevronUp,
  FiCheck,
} from "react-icons/fi";
import { BsCartCheck } from "react-icons/bs";
import { useCart } from "../hooks/useCart";

const ProductCardSQ = forwardRef(({ product }, ref) => {
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
    <div className={styles.card} ref={ref}>
      <div className={styles["main-product"]}>
        <div className={styles["product-img"]}>
          <img src={product.image} alt={product.name} />
        </div>
        <div className={styles["product-content"]}>
          <p className={styles["product-content-name"]}>{product.name}</p>
          <div className={styles["product-variations"]}>
            {/* Mostrar dinámicamente las categorías del producto */}
            {product.categories && product.categories.length > 0 ? (
              product.categories.map((category) => (
                <span key={category.id}>{category.name}</span>
              ))
            ) : (
              <span>Sin categoría</span>
            )}
          </div>
        </div>
        <div className={styles["product-action"]}>
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
                <>
                  <FiShoppingCart onClick={() => addToCart(product)} />
                  <span
                    onClick={() => addToCart(product)}
                    className={styles["buy-span"]}
                  >
                    Añadir
                  </span>
                </>
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
        </div>
      </div>
    </div>
  );
});

export default ProductCardSQ;
