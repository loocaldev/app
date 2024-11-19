import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logPageView } from "./analytics";

const AnalyticsHandler = () => {
  const location = useLocation();

  useEffect(() => {
    logPageView(location.pathname); // Registra la vista de página al cambiar la ruta
  }, [location]);

  return null; // Este es necesario, pero no afecta el DOM
};

export default AnalyticsHandler;