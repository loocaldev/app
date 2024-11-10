import React from "react";
import styles from "../styles/ProductCardSquare.module.css";
import {
  FiShoppingCart,
  FiCheck,
  FiPlus,
  FiMinus,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

function ProductCardSquare() {
  return (
    <div className={styles["product-box"]}>
      <div className={styles["product-box-content"]}>
        <div className={styles["product-image"]}>
          <img src="https://loocalapp.s3.amazonaws.com/product_images/zanahoriaFresca_vik2kMi.webp" /> {/* Imagén del producto */}
          <div className={styles["promo-label"]}> {/* Solo es visible si el producto esta en oferta o descuento */}
            <span>Oferta</span>
          </div>
        </div>
        <div className={styles["product-info"]}>
          <p>Zanahoria</p> {/* Nombre del producto */}
          <div className={styles["product-variables"]}> {/* Si el producto no es variable se omite este elemento */}
            <label>Maduración:</label> {/* Este es el select de variables disponibles para cada atributo del producto */}
            <select>
                <option>Maduro</option>
                <option>A punto</option>
                <option>Verde</option>
            </select>
          </div>
          
        </div>
        <div className={styles["product-price"]}>
          <div className={styles["product-pricePromo"]}> {/* Solo se muestra el elemento si el producto esta en promoción */}
            <span>20%</span> {/* Valor del span es el porcentaje de descuento del producto. Indepente se haya configurado tipo porcentaje o valor absoluto, siempre se debe mostrar en procentaje. */}
            <span>$7.500</span> {/* Este es el valor total original del producto sin aplicar promoción*/}
          </div>
          <div className={styles["product-priceMain"]}>
            <p>$12.500</p> {/* Este precio es por defecto el del producto en la cantidad minima y se modifica a la vez que el usuario incrementa o decrementa la cantidad. Además, incluye los efectos de promoción o descuento en caso de que aplique */}
            <span>(1.5 Kg)</span> {/* Este unit_quantity y unit_type también varia dependiendo de la cantidad agregada por el usaurio. */}
          </div>
          <div className={styles["product-pricePum"]}> {/* Este valor se mantiene fijo y no cambia si se añade al carrito más unidades. Se debe mostrar siempre el precio por unidad minima */}
            <span>500 gramos a $2.500</span>
          </div>
        </div>
        <div className={styles["product-action"]}>
          <div className={styles["product-addButton"]}> {/* Los elementos de este botón son dinamicos dependiendo de si se ha añadido al carrito o no. Si no se ha añadido se muestra el icon ShoppingCart y el span 'Añadir', de lo contrario se muestra el signo Minus, el span de cantidad que se este añadiendo y el signo Plus*/}
            <FiShoppingCart className={styles["addButton -iconCompra"]} />
            <FiMinus/>
            <FiPlus/>
            <span>Añadir</span>
            <span>Cantidad: 1</span>
          </div>
          <div className={styles["product-showExtend"]}> {/* Al hacer click en este DIV se debe mostrar y ocultar el div className 'product-extend'. El icono debe cambiar en el toggle por su inverso (up/down) */}
            <FiChevronDown />
          </div>
        </div>
        <div className={styles["product-extend"]}> {/* Este div esta oculto por defecto y es mostrado u ocutaldo por el div 'product-showExtend' */}
          <span>Descripción: Lorem ipsum dolor sit amet</span>
        </div>
      </div>
    </div>
  );
}

export default ProductCardSquare;
