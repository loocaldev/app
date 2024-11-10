import { createContext, useReducer } from "react";

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

    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  

  const convertQuantity = (product, quantity) => {
    
    // Verifica que product.unit_type y product.unit_quantity existan
    if (!product.unit_type || !product.unit_quantity) {
      return `${quantity}`;
    }
  
    // Calcula la cantidad total
    const totalQuantity = product.unit_quantity * quantity;
    const unitType = product.unit_type; // Usar directamente como string
  
    // Determina la unidad de medida adecuada
    if (unitType === "Peso") {
      const result = totalQuantity >= 1000 
        ? `${(totalQuantity / 1000).toFixed(2)} kilogramos`
        : `${totalQuantity} gramos`;
      return result;
    } else if (unitType === "Volumen") {
      const result = totalQuantity >= 1000 
        ? `${(totalQuantity / 1000).toFixed(2)} litros`
        : `${totalQuantity} mililitros`;
      return result;
    } else if (unitType === "Unidad") {
      const result = `${totalQuantity} unidades`;
      return result;
    }
  
    // Valor por defecto
    const result = `${totalQuantity}`;
    return result;
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
        ? product.variations?.find((v) => v.id === product.variationId)?.price || product.price
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
