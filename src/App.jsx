import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Outlet } from "react-router-dom";
import "./App.css";
import { Helmet } from "react-helmet";

import Layout from "./containers/Layout";
import ViewportMeta from "./components/ViewportMeta";
import analytics from "./analytics";

function App() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Loocal");

  useEffect(() => {
    initGA(); // Inicializa Google Analytics al cargar la aplicación
  }, []);

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    analytics.page(location.pathname); // Envía la vista de página a Segment
  }, [location]);


  return (
    <div className="App">
      <Helmet>
        <script src="https://checkout.bold.co/library/boldPaymentButton.js" />
      </Helmet>
      <ViewportMeta />
      <Layout>
        <Outlet />
      </Layout>
    </div>
  );
}

export default App;
