// Payment.jsx

import React, { useState, useEffect } from "react";
import { getAcceptanceToken, tokenizeCard, createPaymentSource, createTransaction } from "../api/api";

const Payment = () => {
  const [cardData, setCardData] = useState({ number: '', expMonth: '', expYear: '', cvc: '', cardHolder: '' });
  const [acceptanceToken, setAcceptanceToken] = useState('');
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    // Obtener token de aceptación al cargar la página
    getAcceptanceToken().then(token => setAcceptanceToken(token));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAccepted) {
      alert("Debes aceptar los términos y condiciones.");
      return;
    }

    try {
      // 1. Tokenizar la tarjeta
      const token = await tokenizeCard(cardData);

      // 2. Crear fuente de pago
      const paymentSource = await createPaymentSource({
        type: 'CARD',
        token: token,
        customer_email: 'customer@example.com',
        acceptance_token: acceptanceToken
      });

      // 3. Crear transacción
      const transaction = await createTransaction({
        amount_in_cents: 5000000,  // 50,000 pesos colombianos
        currency: 'COP',
        customer_email: 'customer@example.com',
        reference: 'order_123456',
        payment_source_id: paymentSource.id,
        payment_method: { installments: 1 }
      });

      alert("Transacción exitosa! ID: " + transaction.data.id);
    } catch (error) {
      console.error("Error en el proceso de pago:", error);
    }
  };

  return (
    <div>
      <h1>Formulario de Pago</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Número de Tarjeta</label>
          <input type="text" value={cardData.number} onChange={e => setCardData({ ...cardData, number: e.target.value })} required />
        </div>
        <div>
          <label>Mes de Expiración</label>
          <input type="text" value={cardData.expMonth} onChange={e => setCardData({ ...cardData, expMonth: e.target.value })} required />
        </div>
        <div>
          <label>Año de Expiración</label>
          <input type="text" value={cardData.expYear} onChange={e => setCardData({ ...cardData, expYear: e.target.value })} required />
        </div>
        <div>
          <label>CVC</label>
          <input type="text" value={cardData.cvc} onChange={e => setCardData({ ...cardData, cvc: e.target.value })} required />
        </div>
        <div>
          <label>Nombre en la tarjeta</label>
          <input type="text" value={cardData.cardHolder} onChange={e => setCardData({ ...cardData, cardHolder: e.target.value })} required />
        </div>
        <div>
          <input type="checkbox" checked={isAccepted} onChange={() => setIsAccepted(!isAccepted)} />
          <label>Acepto los términos y condiciones</label>
        </div>
        <button type="submit">Pagar</button>
      </form>
    </div>
  );
};

export default Payment;
