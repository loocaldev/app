import React, { useState, useEffect, forwardRef } from "react";
import styles from "../styles/ProductCardSQ.module.css";
import DOMPurify from "dompurify";
import { FiShoppingCart, FiPlus, FiMinus, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useCart } from "../hooks/useCart";
import formatPriceToCOP from "../utils/formatPrice";
import classNames from 'classnames';

const ProductCardSQ = forwardRef(({ product, highlightedName }, ref) => {
  const { cart, addToCart, decrementQuantity, removeFromCart, convertQuantity } = useCart();

  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [availableOptions, setAvailableOptions] = useState({});
  const [showDescription, setShowDescription] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const hasVariations = product.is_variable && product.variations.length > 0;

  // Configuración inicial de atributos seleccionados y opciones disponibles
  useEffect(() => {
    if (hasVariations) {
      const initialAttributes = {};
      const initialOptions = {};

      product.variations.forEach((variation) => {
        Object.entries(variation.attribute_data).forEach(([attrName, options]) => {
          if (!initialAttributes[attrName]) {
            initialAttributes[attrName] = options[0].name;
          }
          if (!initialOptions[attrName]) {
            initialOptions[attrName] = new Set();
          }
          options.forEach((opt) => initialOptions[attrName].add(opt.name));
        });
      });

      setSelectedAttributes(initialAttributes);
      setAvailableOptions(initialOptions);
    }
  }, [product.variations]);

  // Obtener variación seleccionada basada en los atributos
  const getMatchingVariation = (attributes) => {
    return product.variations.find((variation) =>
      Object.entries(attributes).every(
        ([attrName, attrValue]) =>
          variation.attribute_data[attrName]?.some(opt => opt.name === attrValue)
      )
    );
  };

  // Sincronizar opciones si el usuario interactúa con "Maduración"
  const syncAttributesFromMaduracion = (updatedAttributes) => {
    let syncedAttributes = { ...updatedAttributes };
    let validVariation = getMatchingVariation(syncedAttributes);

    if (!validVariation) {
      const maduracion = syncedAttributes["Maduración"];
      const validCultivo = Array.from(availableOptions["Cultivo"]).find((option) =>
        getMatchingVariation({ "Maduración": maduracion, "Cultivo": option })
      );
      if (validCultivo) {
        syncedAttributes["Cultivo"] = validCultivo;
      }
    }
    setSelectedAttributes(syncedAttributes);
  };

  // Sincronizar opciones si el usuario interactúa con "Tipo de Cultivo"
  const syncAttributesFromCultivo = (updatedAttributes) => {
    let syncedAttributes = { ...updatedAttributes };
    let validVariation = getMatchingVariation(syncedAttributes);

    if (!validVariation) {
      const cultivo = syncedAttributes["Cultivo"];
      const validMaduracion = Array.from(availableOptions["Maduración"]).find((option) =>
        getMatchingVariation({ "Maduración": option, "Cultivo": cultivo })
      );
      if (validMaduracion) {
        syncedAttributes["Maduración"] = validMaduracion;
      }
    }
    setSelectedAttributes(syncedAttributes);
  };

  // Manejar el cambio de un atributo seleccionado y sincronizar según el campo interactuado
  const handleAttributeChange = (attributeName, value) => {
    const updatedAttributes = { ...selectedAttributes, [attributeName]: value };
    if (attributeName === "Maduración") {
      syncAttributesFromMaduracion(updatedAttributes);
    } else if (attributeName === "Cultivo") {
      syncAttributesFromCultivo(updatedAttributes);
    }
  };

  // Actualizar opciones válidas al cambiar los atributos seleccionados
  useEffect(() => {
    if (hasVariations) {
      const updatedOptions = {};

      product.variations.forEach((variation) => {
        Object.entries(variation.attribute_data).forEach(([attrName, options]) => {
          if (!updatedOptions[attrName]) {
            updatedOptions[attrName] = new Set();
          }
          options.forEach(opt => updatedOptions[attrName].add(opt.name));
        });
      });

      setAvailableOptions(updatedOptions);
    }
  }, [product.variations]);

  const selectedVariation = getMatchingVariation(selectedAttributes) || product.variations[0];

  const isProductInCart = (productId, variationId = null) => {
    return cart.some((item) => item.id === productId && item.variationId === variationId);
  };

  const getProductQuantity = () => {
    const cartProduct = cart.find(
      (item) =>
        item.id === product.id &&
        (selectedVariation ? item.variationId === selectedVariation.id : !item.variationId)
    );
    return cartProduct ? cartProduct.quantity : 1;
  };

  // Render del nombre con resaltado si `highlightedName` está disponible
  const renderProductName = () => {
    if (highlightedName) {
      const sanitizedHTML = DOMPurify.sanitize(highlightedName);
      return <span dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
    }
    return <span>{product.name}</span>;
  };

  const productQuantity = getProductQuantity();
  const displayQuantity = convertQuantity(selectedVariation || product, productQuantity);


  const unitPrice = selectedVariation ? selectedVariation.price : product.price;
  const priceWithPromotion = selectedVariation?.final_price || product.final_price || unitPrice;
  const totalPrice = priceWithPromotion * productQuantity;

  const handleAddToCart = () => {
    const variationId = selectedVariation ? selectedVariation.id : null;
    setIsAdding(true);
    addToCart(product, variationId);
    setTimeout(() => setIsAdding(false), 500);
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

  const isOnPromotion = selectedVariation?.is_on_promotion || product.is_on_promotion;
  const originalPrice = formatPriceToCOP(unitPrice);
  const promoPrice = formatPriceToCOP(priceWithPromotion);
  const discountPercentage = isOnPromotion && priceWithPromotion
    ? `${Math.round((1 - priceWithPromotion / unitPrice) * 100)}%`
    : null;

  return (
    <div className={styles["product-box"]} ref={ref}>
      <div className={styles["product-box-content"]}>
        <div className={styles["product-box-first"]}>
        
        <div className={styles["product-image"]}>
          <img src={selectedVariation?.image || product.image} alt={product.name} />
          {isOnPromotion && (
            <div className={styles["promo-label"]}>
              <span>Oferta</span>
            </div>
          )}
        </div>
        
        <div className={styles["product-info"]}>
          <p>{renderProductName()}</p>
          {hasVariations && (
            <div className={styles["product-variables"]}>
              {Object.keys(availableOptions).map((attributeName) => (
                <div key={attributeName} className={styles["product-variable"]}>
                  <label>{attributeName}:</label>
                  <select
                    onChange={(e) => handleAttributeChange(attributeName, e.target.value)}
                    value={selectedAttributes[attributeName] || ""}
                  >
                    {[...availableOptions[attributeName]].map((opt) => (
                      <option 
                        key={opt} 
                        value={opt} 
                      >
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              {/* {selectedVariation && <span>SKU: {selectedVariation.sku}</span>} */}
            </div>
          )}
        </div>
        </div>
        <div className={styles["product-box-second"]}>
        
        <div className={styles["product-price"]}>
          {isOnPromotion && (
            <div className={styles["product-pricePromo"]}>
              <span>{discountPercentage}</span>
              <span>{originalPrice}</span>
            </div>
          )}
          
          <div className={styles["product-priceMain"]}>
            <p>{formatPriceToCOP(totalPrice)}</p>
            <span>({displayQuantity})</span> {/* Esta valor no se esta mostrando correctamente para productos variables. Recuerda que este valor es dinamico y cambio con la cantidad agregada al carrito. Por ejemplo, si un producto se vende por 500 gr y se agrega tres, serian 1.5 Kg */}
          </div>
          
          <div className={styles["product-pricePum"]}>
            <span>{convertQuantity(product, 1)} a {formatPriceToCOP(unitPrice)}</span>
          </div>
        </div>
        
        <div className={styles["product-action"]}>
          <div
            className={classNames(styles["product-addButton"], { [styles["adding-animation"]]: isAdding })}
          >
            {productInCart ? (
              <>
                <FiMinus onClick={handleDecrement} />
                <span>{productQuantity}</span>
                <FiPlus onClick={handleAddToCart} />
              </>
            ) : (
              <div onClick={handleAddToCart} className={styles["addButton-iconCompra"]}>
                <FiShoppingCart />
                <span>Añadir</span>
              </div>
            )}
          </div>
          
          <div className={styles["product-showExtend"]} onClick={() => setShowDescription(!showDescription)}>
            {showDescription ? <FiChevronUp /> : <FiChevronDown />}
          </div>
        </div>
        
        
        {showDescription && (
          <div className={styles["product-extend"]}>
            <span>Descripción: {product.description || "Sin descripción disponible"}</span>
          </div>
        )}
        </div>
      </div>
    </div>
  );
});

export default ProductCardSQ;
