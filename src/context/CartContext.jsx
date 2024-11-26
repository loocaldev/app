import { createContext, useEffect, useReducer } from "react";
import { getAllProducts } from "../api/products.api";

export const CartContext = createContext();

const initialState = JSON.parse(window.localStorage.getItem("cart")) || [];

const updateLocalStorage = (state) => {
  window.localStorage.setItem("cart", JSON.stringify(state));
};

const reducer = (state, action) => {
  const { type: actionType, payload: actionPayload } = action;

  switch (actionType) {
    case "ADD_TO_CART": {
      const { id, variationId } = actionPayload;

      const productInCartIndex = state.findIndex(
        (item) => item.id === id && item.variationId === variationId
      );

      // Si el producto con la variación ya está en el carrito, solo incrementamos la cantidad
      if (productInCartIndex >= 0) {
        const newState = structuredClone(state);
        newState[productInCartIndex].quantity += 1;
        updateLocalStorage(newState);
        return newState;
      }

      // Si es un nuevo producto/variación, lo añadimos al carrito
      const newState = [
        ...state,
        {
          ...actionPayload,
          quantity: 1,
        },
      ];
      updateLocalStorage(newState);
      return newState;
    }

    case "DECREMENT_QUANTITY": {
      const { id, variationId } = actionPayload;
      const productInCartIndex = state.findIndex(
        (item) => item.id === id && item.variationId === variationId
      );

      if (productInCartIndex >= 0) {
        const newState = structuredClone(state);
        newState[productInCartIndex].quantity -= 1;

        // Eliminar el producto si la cantidad llega a 0
        if (newState[productInCartIndex].quantity === 0) {
          newState.splice(productInCartIndex, 1);
        }

        updateLocalStorage(newState);
        return newState;
      }

      return state;
    }

    case "REMOVE_FROM_CART": {
      const { id, variationId } = actionPayload; // Asegúrate de que haya un payload para esta acción
      const newState = state.filter(
        (item) => item.id !== id || item.variationId !== variationId
      );
      updateLocalStorage(newState);
      return newState;
    }

    case "CLEAR_CART": {
      const newState = []; // No necesita un payload
      updateLocalStorage(newState);
      return newState;
    }

    case "SET_CART": {
      const newState = actionPayload; // Reemplaza el estado del carrito
      updateLocalStorage(newState);
      return newState;
    }

    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const validateCart = async () => {
    try {
      // Obtén todos los productos disponibles
      const response = await getAllProducts();
      const availableProducts = response.data;

      // Filtra los productos del carrito para verificar su existencia
      const validatedCart = state.filter((item) =>
        availableProducts.some((product) => product.id === item.id)
      );

      // Si el carrito cambia, actualiza el estado
      if (validatedCart.length !== state.length) {
        dispatch({ type: "SET_CART", payload: validatedCart });
      }
    } catch (error) {
      console.error("Error validando el carrito:", error);
    }
  };

  useEffect(() => {
    validateCart(); // Valida el carrito al montar el componente
  }, []);

  const convertQuantity = (item, quantity) => {
    const unitQuantity = parseFloat(item.unit_quantity || item.product.unit_quantity || 1);
    const totalQuantity = unitQuantity * quantity;
    const unitType = item.unit_type || item.product.unit_type;

    const abbreviations = {
        Peso: totalQuantity >= 1000 ? "Kg" : "Gr",
        Volumen: totalQuantity >= 1000 ? "L" : "Ml",
        Unidad: "Und",
    };

    // Formato: muestra 1.5 como "1.5" y 1.00 como "1"
    const formatQuantity = (value) => {
        if (value % 1 === 0) {
            return value.toString(); // No muestra decimales si es un número entero
        } else {
            return value.toFixed(1).replace(".", ","); // Usa una coma como separador decimal para decimales
        }
    };

    if (unitType === "Peso") {
        return totalQuantity >= 1000
            ? `${formatQuantity(totalQuantity / 1000)} ${abbreviations[unitType]}`
            : `${formatQuantity(totalQuantity)} ${abbreviations[unitType]}`;
    } else if (unitType === "Volumen") {
        return totalQuantity >= 1000
            ? `${formatQuantity(totalQuantity / 1000)} ${abbreviations[unitType]}`
            : `${formatQuantity(totalQuantity)} ${abbreviations[unitType]}`;
    } else if (unitType === "Unidad") {
        return `${formatQuantity(totalQuantity)} ${abbreviations[unitType]}`;
    }

    return formatQuantity(totalQuantity);
};

  const addToCart = (product, variationId = null) => {
    dispatch({
      type: "ADD_TO_CART",
      payload: { ...product, variationId },
    });
  };

  const decrementQuantity = (product, variationId = null) => {
    dispatch({
      type: "DECREMENT_QUANTITY",
      payload: { ...product, variationId },
    });
  };

  const removeFromCart = (product, variationId = null) => {
    dispatch({
      type: "REMOVE_FROM_CART",
      payload: { ...product, variationId },
    });
  };

  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  // Cálculo del subtotal
  const subtotal = state.reduce((total, product) => {
    const price = product.variationId
      ? product.variations?.find((v) => v.id === product.variationId)?.price ||
        product.price
      : product.price;

    return total + (parseFloat(price) || 0) * product.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart: state,
        addToCart,
        clearCart,
        decrementQuantity,
        removeFromCart,
        subtotal,
        convertQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
