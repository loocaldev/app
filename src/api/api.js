// api.js

import axios from 'axios';

const API_URL = "https://tu-backend.com/";

export const getAcceptanceToken = async () => {
  const response = await axios.get(`${API_URL}get_acceptance_token/`);
  return response.data.acceptance_token;
};

export const tokenizeCard = async (cardData) => {
  const response = await axios.post(`${API_URL}tokenize_card/`, cardData);
  return response.data.data.id;
};

export const createPaymentSource = async (paymentSourceData) => {
  const response = await axios.post(`${API_URL}create_payment_source/`, paymentSourceData);
  return response.data.data;
};

export const createTransaction = async (transactionData) => {
  const response = await axios.post(`${API_URL}create_transaction/`, transactionData);
  return response.data;
};
