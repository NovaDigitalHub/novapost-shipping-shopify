import {performRequest} from "./request.jsx";

export const getExchangeRate = async (amount, countryCode, currencyCode, shopDomain, apiKey) => {
  try {
    const BASE_URL = 'https://api.novapost.com/v.1.0';
    const EXCHANGE_RATES_ENDPOINT = '/exchange-rates/conversion';

    const requestData = {
      amount: parseFloat(amount),
      countryCode,
      currencyCode,
      date: getCurrentDate()
    };

    const response = await performRequest(`${BASE_URL}${EXCHANGE_RATES_ENDPOINT}`, requestData, shopDomain, apiKey);
    if (!response.data) {
      throw new Error("Failed to fetch exchange rate");
    }

    return response.data;
  } catch (error) {
    console.error("Error in getExchangeRate:", error);
    throw error;
  }
};

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}T00:00:00.000000Z`;
};
