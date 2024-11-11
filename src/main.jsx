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
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Order from "./pages/Order.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderStatus from "./pages/orderStatus.jsx";
import CreateAccount from "./pages/CreateAccount.jsx";
import CreateAccountDetail from "./pages/CreateAccountDetail.jsx";
import AuthenticatedRoute from "./context/AuthenticatedRoute.jsx";
import CreateAccountDetailAddress from "./pages/CreateAccountDetailAddress.jsx";
import Store from "./pages/Store.jsx";
import Category from "./pages/Category.jsx";
import Profile from "./pages/Profile.jsx";
import Payment from "./pages/Payment.jsx";
import CreateProfile from "./pages/CreateProfile.jsx";
import NewOrder from "./pages/NewOrder.jsx";
import NewCheckout from "./pages/NewCheckout.jsx";

const router = createBrowserRouter([
  {
    path: "",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/tienda", element: <Store /> },
      { path: "/tienda/:categoryName", element: <Category />},
      { path: "/login", element: <Login /> },
      { path: "/order", element: <NewOrder /> },
      { path: "/checkout", element: <NewCheckout /> },
      { path: "/pago", element: <Payment /> },
      { path: "/order-status", element: <OrderStatus /> },
      { path: "/login", element: <Login /> },
      { path: "/crear-cuenta", element: <CreateAccount /> },
      { path: "/crear-perfil", element: <CreateProfile /> },
      { path: "/crear-cuenta/detalles",element: <AuthenticatedRoute component={CreateAccountDetail} />},
      { path: "/crear-cuenta/detalles/direccion",element: <AuthenticatedRoute component={CreateAccountDetailAddress} />},
      { path: "/perfil",element: <AuthenticatedRoute component={Profile} />},

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
