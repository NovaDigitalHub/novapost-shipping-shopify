import {json} from "@remix-run/node";
import db from "../db.server";
import {validateCountryCodes} from "../models/country.jsx";
import {mapOrderToCalculation} from "../models/mapping.jsx";
import {calculateShipment} from "./nova/calculate-shipment.jsx";

export const action = async ({ request }) => {
  try {
    const shopDomain = request.headers.get('x-shopify-shop-domain')

    if (shopDomain) {
      const callbackBody = await request.json();
      console.log(callbackBody);
      if (!validateCountryCodes(callbackBody.rate.origin.country) ||
        !validateCountryCodes(callbackBody.rate.destination.country)) {
        return json({ error: "Invalid country codes" }, { status: 400 });
      }

      const config = await db.novapostConfig.findFirst({where: { shop_domain: shopDomain }});
      if (!config) {
        return json({ error: "Config not found" }, { status: 404 });
      }

      const mapData = await mapOrderToCalculation(callbackBody, config);
      console.log(mapData);

      const exchangeAmount = await calculateShipment(
        mapData,
        callbackBody.rate.currency,
        shopDomain,
        config
      );

      if (exchangeAmount === null) {
        throw new Error('Requested currency not found in converted currencies');
      }

        const rates = {
          service_name: "Nova Post Courier Shipping",
          description: "Delivery with courier",
          currency: callbackBody.rate.currency,
          service_code: "NP_COURIER",
          total_price: exchangeAmount * 100,
          min_delivery_date: new Date().toISOString(),
          max_delivery_date: new Date().toISOString()
        };

        return json({rates});
      }

  } catch (error) {
    console.error('Error calculation document:', error)
  }
};
