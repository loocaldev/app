import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import App from "./App.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import "./index.css";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Order from "./pages/Order.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderStatus from "./pages/orderStatus.jsx";

const router = createBrowserRouter([
  {
    path: "",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/order", element: <Order /> },
      { path: "/checkout", element: <Checkout /> },
      { path: "/order-status", element: <OrderStatus /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CartProvider>
      <RouterProvider router={router}>
        <App />
      </RouterProvider>
    </CartProvider>
  </React.StrictMode>
);
