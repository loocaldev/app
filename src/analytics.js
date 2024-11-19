// // src/analytics.js
// import ReactGA from "react-ga4";

// // Inicializa Google Analytics con tu Measurement ID
// export const initGA = () => {
//   ReactGA.initialize("G-ZMXQW5970G"); // Reemplaza con tu Measurement ID
// };

// // Registra la visita a una página
// export const logPageView = (page) => {
//   ReactGA.send({ hitType: "pageview", page });
// };

// // Envía un evento personalizado
// export const logEvent = (category, action, label) => {
//   ReactGA.event({ category, action, label });
// };


import { useAnalytics } from '@segment/analytics-react';

const analytics = (eventName, properties) => {
  const { track } = useAnalytics();

  const trackEvent = (eventName, properties = {}) => {
    track(eventName, properties);
  };

  return { trackEvent };
};

export default analytics;
