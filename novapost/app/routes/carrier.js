import {json} from "@remix-run/node";
import https from 'https';
import axios from "axios";

export const action = async ({ request }) => {
  try {
    const shopDomain = request.headers.get('x-shopify-shop-domain')

    if (shopDomain) {
      const callbackBody = await request.json();
      callbackBody.shopDomain = shopDomain;
      callbackBody.isCourier = false;
      const response = await axios.post(`${process.env.MICROSERVICE_DOMAIN}/api/proxy/calculateShipment`, callbackBody, {
        headers: {
          'Content-Type': 'application/json',
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });

      console.log(response);
      if (response.data.currency_code) {
        if (response.data.currency_code === callbackBody.rate.currency) {
          const rates = {
            service_name: "Nova Post Standard Shipping",
            description: "Delivery within 5-7 business days",
            currency: callbackBody.rate.currency,
            service_code: "NP_STANDARD",
            total_price: response.data.amount * 100,
            min_delivery_date: new Date().toISOString(),
            max_delivery_date: new Date().toISOString()
          };

          return json({ rates });
        }
      } else {
        console.error('No services found in the standard response');
      }
    }
  } catch (error) {
    console.error('Error calculation document:', error)
  }
};
