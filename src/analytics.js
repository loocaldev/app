// analytics.js
import { AnalyticsBrowser } from "@segment/analytics-next";

const analytics = AnalyticsBrowser.load({
  writeKey: "3oxdJEWqR5n2ejEupwcPCA7R6uDne2lA", // Sustituye con tu Write Key de Segment
});

export default analytics;
