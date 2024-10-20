import React, { useState, useEffect } from "react";
import styles from "../styles/ProductCard.module.css";
import { FiPlus, FiMinus, FiCheck } from "react-icons/fi";
import { useCart } from "../hooks/useCart"; 
import formatPriceToCOP from "../utils/formatPrice";  // Asegúrate de que este import funcione correctamente

function ProductCard({ product }) {
  const { cart, addToCart, removeFromCart, decrementQuantity } = useCart();
  const [selectedVariation, setSelectedVariation] = useState(null);  // Variación seleccionada
  const [hasLoaded, setHasLoaded] = useState(false);  // Controla la carga inicial

  // Verificar si el producto tiene variaciones
  const hasVariations = product.is_variable && product.variations?.length > 0;

  // Efecto para cargar la variación seleccionada desde el carrito
  useEffect(() => {
    console.log("Producto en el carrito:", product);  // Verificar si se recibe el producto correctamente
    if (product.variationId) {
      // Encontrar la variación seleccionada basada en el variationId del carrito
      const variation = product.variations.find(
        (v) => v.id === product.variationId
      );
      setSelectedVariation(variation);
      console.log("Variación seleccionada desde el carrito:", variation);
    }
    setHasLoaded(true);  // Indicar que la carga inicial ha ocurrido
  }, [product]);

  const handleVariationChange = (event) => {
    const variationId = event.target.value;
    const variation = product.variations.find(
      (variation) => variation.id === parseInt(variationId)
    );
    setSelectedVariation(variation);
    console.log("Variación seleccionada manualmente:", variation);
  };

  const getProductQuantity = () => {
    const cartProduct = cart.find(
      (item) => item.id === product.id && item.variationId === product.variationId
    );
    return cartProduct ? cartProduct.quantity : 0;
  };

  const productQuantity = getProductQuantity();

  const getProductPrice = () => {
    if (selectedVariation) {
      return formatPriceToCOP(selectedVariation.price);
    }
    return formatPriceToCOP(product.price);
  };

  // Mostrar el dropdown solo si no hay una variación seleccionada (después de la carga)
  return (
    <div className={styles.card}>
      <div className={styles["main-product"]}>
        <div className={styles["product-img"]}>
          <img
            src={selectedVariation?.image || product.image}
            alt={product.name}
          />
        </div>
        <div className={styles["product-content"]}>
          <p className={styles["product-content-name"]}>{product.name}</p>
          {/* Mostrar variación seleccionada o permitir al usuario seleccionar una variación si no hay ninguna */}
          {hasVariations && !selectedVariation && hasLoaded && (
            <select onChange={handleVariationChange} value={selectedVariation?.id || ''}>
              <option value="">Selecciona una variación</option>
              {product.variations.map((variation) => (
                <option key={variation.id} value={variation.id}>
                  {variation.attribute_options.map((opt) => opt.name).join(", ")} - {formatPriceToCOP(variation.price)}
                </option>
              ))}
            </select>
          )}
          {/* Mostrar la variación seleccionada */}
          {selectedVariation && (
            <div className={styles["product-variations"]}>
              {selectedVariation.attribute_options.map((opt) => (
                <span key={opt.id}>{opt.name}</span>
              ))}
            </div>
          )}
        </div>
        <div className={styles["product-action"]}>
          <div className={styles["product-action-quantity"]}>
            <button onClick={() => decrementQuantity(product, selectedVariation?.id)}>
              <FiMinus />
            </button>
            <span>{productQuantity} Kg</span>
            <button onClick={() => addToCart(product, selectedVariation?.id)}>
              <FiPlus />
            </button>
          </div>
          <div className={styles["product-action-price"]}>
            <p>{getProductPrice()}</p>
          </div>
          <div className={styles["product-action-pum"]}>
            <span>Kg a {getProductPrice()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
