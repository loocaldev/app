import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import App from "./App.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { Auth0Provider } from "@auth0/auth0-react";
import {AuthProvider} from "./context/AuthContext.jsx"
import "./index.css";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Order from "./pages/Order.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderStatus from "./pages/orderStatus.jsx";
import CreateAccount from "./pages/CreateAccount.jsx";

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
      { path: "/login", element: <Login /> },
      { path: "/crear-cuenta", element: <CreateAccount /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router}>
          <App />
        </RouterProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
