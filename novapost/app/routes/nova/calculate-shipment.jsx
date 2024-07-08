import {performRequest} from "./request.jsx";
import {getExchangeRate} from "./exchange-rate.jsx";

export const calculateShipment = async (mapData, storeCurrencyCode, shopDomain, config) => {
  const BASE_URL = 'https://api.novapost.com/v.1.0';
  const EXCHANGE_RATES_ENDPOINT = '/shipments/calculations';

  const response = await performRequest(`${BASE_URL}${EXCHANGE_RATES_ENDPOINT}`, mapData.map, shopDomain, config.api_key);
  console.log(response);

  if (!response.data) {
    throw new Error(response.error);
  }

  const shipmentServices = response.data.services;
  const filteredServices = shipmentServices.filter(service => service.serviceCode !== "Courier");
  const sumPrice = filteredServices.reduce((sum, service) => sum + service.price, 0);

  const exchange = await getExchangeRate(sumPrice, config.country, mapData.currencyCode, shopDomain, config.api_key);
  if (!exchange) {
    throw new Error('Currency exchange failed');
  }
  console.log(exchange);
  const exchangeRates = exchange;
  let exchangeAmount = null;

  if (exchangeRates.requestCurrency.currencyCode !== storeCurrencyCode) {
    for (const currency of exchangeRates.convertedCurrencies) {
      if (currency.currencyCode === storeCurrencyCode) {
        exchangeAmount = currency.amount;
        break;
      }
    }
  } else {
    exchangeAmount = exchangeRates.requestCurrency.amount;
  }

  return exchangeAmount;
};
