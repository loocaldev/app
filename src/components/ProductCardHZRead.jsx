// ProductCardHZRead.jsx
import React, { useState } from "react";
import styles from "../styles/ProductCardHZRead.module.css";
import {
  FiShoppingCart,
  FiPlus,
  FiMinus,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useCart } from "../hooks/useCart";
import formatPriceToCOP from "../utils/formatPrice";
import classNames from "classnames";

function ProductCardHZRead({ product }) {
  const { addToCart, decrementQuantity, removeFromCart, convertQuantity } =
    useCart();

  // Si el producto es undefined o no está definido, evita el renderizado del componente.
  if (!product) {
    return null; // O bien, podrías mostrar un mensaje de error o un componente de carga
  }

  const [showDescription, setShowDescription] = useState(false);

  // Verificar si el producto tiene variaciones
  const hasVariations =
    product.is_variable && product.variations && product.variationId;

  // Obtener la variación seleccionada (usada desde el carrito)
  const selectedVariation = hasVariations
    ? product.variations.find(
        (variation) => variation.id === product.variationId
      )
    : null;

  // Calcular la cantidad total y el precio total basado en la cantidad en el carrito
  const productQuantity = product.quantity || 1;
  const unitPrice =
    selectedVariation?.final_price || selectedVariation?.price || product.price;
  const totalPrice = unitPrice * productQuantity;
  const displayQuantity = convertQuantity(
    selectedVariation || product,
    productQuantity
  );

  const isOnPromotion =
    selectedVariation?.is_on_promotion || product.is_on_promotion;
  const discountPercentage =
    isOnPromotion && selectedVariation
      ? `${Math.round(
          (1 - selectedVariation.final_price / selectedVariation.price) * 100
        )}%`
      : null;
  const originalPrice = formatPriceToCOP(
    selectedVariation?.price || product.price
  );

  const handleAdd = () => {
    addToCart(product, selectedVariation?.id);
  };

  const handleDecrement = () => {
    if (productQuantity > 1) {
      decrementQuantity(product, selectedVariation?.id);
    } else {
      removeFromCart(product, selectedVariation?.id);
    }
  };

  return (
    <div className={styles["product-box"]}>
      <div className={styles["product-box-content"]}>
        <div className={styles["product-box-first"]}>
          {/* Imagen del producto */}
          <div className={styles["product-image"]}>
            <img
              src={selectedVariation?.image || product.image}
              alt={product.name}
            />
            {isOnPromotion && (
              <div className={styles["promo-label"]}>
                <span>Oferta</span>
              </div>
            )}
            {/* Desplegable de descripción */}
            <div
              className={styles["product-showExtend"]}
              onClick={() => setShowDescription(!showDescription)}
            >
              {showDescription ? <FiChevronUp /> : <FiChevronDown />}
            </div>
          </div>

          {/* Información del producto */}
          <div className={styles["product-info"]}>
            <p>{product.name}</p>
            <div className={styles["product-pricePum"]}>
              <span>
                {convertQuantity(product, 1)} a {formatPriceToCOP(unitPrice)}
              </span>
            </div>
            {hasVariations && selectedVariation?.attribute_data && (
              <div className={styles["product-variables"]}>
                {Object.entries(selectedVariation.attribute_data).map(
                  ([attrName, options]) => (
                    <div key={attrName} className={styles["product-variable"]}>
                      <span>{attrName}:</span> <span>{options[0].name}</span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
        <div className={styles["product-box-second"]}>
          {/* Precios y descuentos */}
          <div className={styles["product-price"]}>
            {isOnPromotion && (
              <div className={styles["product-pricePromo"]}>
                <span>{discountPercentage}</span>
                <span>{originalPrice}</span>
              </div>
            )}
            <div className={styles["product-priceMain"]}>
              <p>{formatPriceToCOP(totalPrice)}</p>
              <span>({displayQuantity})</span>
            </div>
            
          </div>

          {/* Acciones de cantidad */}
          <div className={styles["product-action"]}>
            <div className={classNames(styles["product-addButton"])}>
              <FiMinus onClick={handleDecrement} />
              <span>{productQuantity}</span>
              <FiPlus onClick={handleAdd} />
            </div>
          </div>
        </div>
      </div>
      {/* Descripción expandida */}
      {showDescription && (
        <div className={styles["product-extend"]}>
          <span>
            Descripción: {product.description || "Sin descripción disponible"}
          </span>
        </div>
      )}
    </div>
  );
}

export default ProductCardHZRead;
