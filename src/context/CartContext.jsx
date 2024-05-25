import { createContext, useState, useReducer } from "react";

export const CartContext = createContext();

const initialState = JSON.parse(window.localStorage.getItem("cart")) || [];

const updateLocalStorage = (state) => {
  window.localStorage.setItem("cart", JSON.stringify(state));
};

const reducer = (state, action) => {
  const { type: actionType, payload: actionPayload } = action;
  switch (actionType) {
    case "ADD_TO_CART": {
      console.log("New state cart: ", actionPayload);
      const { id } = actionPayload;
      const productInCartIndex = state.findIndex((item) => item.id === id);

      if (productInCartIndex >= 0) {
        const newState = structuredClone(state);
        newState[productInCartIndex].quantity += 1;
        updateLocalStorage(newState);
        console.log("ADD_TO_CART:", newState); // Verificación
        return newState;
      }
      const newState = [
        ...state,
        {
          ...actionPayload,
          quantity: 1,
        },
      ];
      updateLocalStorage(newState);
      console.log("ADD_TO_CART:", newState);
      return newState;
    }

    case "DECREMENT_QUANTITY": {
      const { id } = actionPayload;
      const productInCartIndex = state.findIndex((item) => item.id === id);

      if (productInCartIndex >= 0) {
        const newState = structuredClone(state);
        newState[productInCartIndex].quantity -= 1;

        if (newState[productInCartIndex].quantity === 0) {
          newState.splice(productInCartIndex, 1);
        }

        updateLocalStorage(newState);
        return newState;
      }

      return state;
    }

    case "REMOVE_FROM_CART": {
      const { id } = actionPayload;
      const newState = state.filter((item) => item.id != actionPayload.id);
      updateLocalStorage(newState);
      return newState;
    }

    case "CLEAR_CART": {
      const newState = [];
      updateLocalStorage(newState);
      return newState;
    }
  }
  return state;
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addToCart = (product) =>
    dispatch({
      type: "ADD_TO_CART",
      payload: product,
    });

  const decrementQuantity = (product) =>
    dispatch({
      type: "DECREMENT_QUANTITY",
      payload: product,
    });

  const removeFromCart = (product) =>
    dispatch({
      type: "REMOVE_FROM_CART",
      payload: product,
    });

  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const subtotal = state.reduce(
    (total, product) => total + parseFloat(product.price) * product.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart: state,
        addToCart,
        clearCart,
        decrementQuantity,
        removeFromCart,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

//   const subtotal = state.cart.reduce(
//     (total, product) => total + parseFloat(product.price),
//     0
//   );
