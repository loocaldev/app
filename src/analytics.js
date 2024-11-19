// analytics.js
import { AnalyticsBrowser } from "@segment/analytics-next";

// Inicializa el cliente con tu Write Key
const analytics = AnalyticsBrowser.load({
  writeKey: "3oxdJEWqR5n2ejEupwcPCA7R6uDne2lA", // Reemplaza con tu Write Key de Segment
});

export default analytics;
