  import React, { useState, forwardRef } from "react";
  import styles from "../styles/ProductCardSQ.module.css";
  import { FiShoppingCart, FiCheck, FiPlus, FiMinus } from "react-icons/fi";
  import { useCart } from "../hooks/useCart";
  import formatPriceToCOP from "../utils/formatPrice";

  const ProductCardSQ = forwardRef(({ product }, ref) => {
    const { cart, addToCart, decrementQuantity, removeFromCart } = useCart();
    const [selectedVariation, setSelectedVariation] = useState(null); // Selección de variación

    // Si el producto tiene variaciones
    const hasVariations = product.is_variable && product.variations.length > 0;

    const handleVariationChange = (event) => {
      const variationId = event.target.value;
      const variation = product.variations.find(
        (variation) => variation.id === parseInt(variationId)
      );
      setSelectedVariation(variation);
    };

    // Ajustamos la lógica para que maneje tanto productos fijos como variables
    const isProductInCart = (productId, variationId = null) => {
      return cart.some((item) => {
        // Para productos fijos, no usamos variationId
        if (!variationId) {
          return item.id === productId && !item.variationId;
        }
        // Para productos variables, usamos variationId
        return item.id === productId && item.variationId === variationId;
      });
    };

    const getProductQuantity = () => {
      const cartProduct = cart.find(
        (item) => item.id === product.id && (selectedVariation ? item.variationId === selectedVariation.id : !item.variationId)
      );
      return cartProduct ? cartProduct.quantity : 0;
    };

    const handleAddToCart = () => {
      const variationId = selectedVariation ? selectedVariation.id : null;
      addToCart(product, variationId);
    };

    const handleDecrement = () => {
      const variationId = selectedVariation ? selectedVariation.id : null;
      decrementQuantity(product, variationId);
    };

    const handleRemoveFromCart = () => {
      const variationId = selectedVariation ? selectedVariation.id : null;
      removeFromCart(product, variationId);
    };

    const productInCart = isProductInCart(
      product.id,
      selectedVariation ? selectedVariation.id : null
    );
    const productQuantity = getProductQuantity();

    const getProductPrice = () => {
      if (selectedVariation) {
        return formatPriceToCOP(selectedVariation.price);
      }
      return product.is_variable ? null : formatPriceToCOP(product.price);
    };

    return (
      <div className={styles.card} ref={ref}>
        <div className={styles["main-product"]}>
          <div className={styles["product-img"]}>
            <img
              src={
                selectedVariation?.image || product.image
              } /* Imagen de la variación o imagen general */
              alt={product.name}
            />
          </div>
          <div className={styles["product-content"]}>
            <p className={styles["product-content-name"]}>{product.name}</p>
            {hasVariations && (
              <select onChange={handleVariationChange}>
                <option value="">Selecciona una variación</option>
                {product.variations.map((variation) => (
                  <option key={variation.id} value={variation.id}>
                    {variation.attribute_options
                      .map((opt) => opt.name)
                      .join(", ")}{" "}
                    - {formatPriceToCOP(variation.price)}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className={styles["product-action"]}>
            <div className={styles["product-action-price"]}>
              <p>{getProductPrice()}</p>
            </div>
            <div className={styles["product-action-buttons"]}>
              {/* Productos variables o fijos */}
              {selectedVariation || !hasVariations ? (
                productInCart ? (
                  <div className={styles["product-action-quantity"]}>
                    <button onClick={handleDecrement}>
                      <FiMinus />
                    </button>
                    <span>{productQuantity}</span>
                    <button onClick={handleAddToCart}>
                      <FiPlus />
                    </button>
                  </div>
                ) : (
                  <div onClick={handleAddToCart}>
                    <FiShoppingCart />
                    <span>Añadir</span>
                  </div>
                )
              ) : (
                <span>Selecciona una variación</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  });

  export default ProductCardSQ;
