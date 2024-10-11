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

const router = createBrowserRouter([
  {
    path: "",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/tienda", element: <Store /> },
      { path: "/login", element: <Login /> },
      { path: "/order", element: <Order /> },
      { path: "/checkout", element: <Checkout /> },
      { path: "/order-status", element: <OrderStatus /> },
      { path: "/login", element: <Login /> },
      { path: "/crear-cuenta", element: <CreateAccount /> },
      {
        path: "/crear-cuenta/detalles",
        element: <AuthenticatedRoute component={CreateAccountDetail} />,
      },
      {
        path: "/crear-cuenta/detalles/direccion",
        element: <AuthenticatedRoute component={CreateAccountDetailAddress} />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.AUTH0_DOMAIN}
      clientId={process.env.AUTH0_CLIENT_ID}
      redirectUri={window.location.origin}
      audience={`https://${process.env.AUTH0_DOMAIN}/api/v2/`}
      scope="openid profile email"
    >
      <AuthProvider>
        <CartProvider>
          <RouterProvider router={router}>
            <App />
          </RouterProvider>
        </CartProvider>
      </AuthProvider>
    </Auth0Provider>
  </React.StrictMode>
);
