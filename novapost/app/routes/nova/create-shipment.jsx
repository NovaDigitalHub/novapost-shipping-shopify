import { json } from "@remix-run/node";
import db from "../../db.server";
import { performRequest } from "./request.jsx";
import { mapOrderToShipping } from "../../models/mapping.jsx";
import { saveShipment } from "../../models/save-shipment.jsx";

export const createShipment = async ({ order, shop }) => {
  try {
    const BASE_URL = 'https://api.novapost.com/v.1.0';
    const CREATE_SHIPMENT_ENDPOINT = '/shipments';

    if (!order?.id || !shop?.myshopifyDomain) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    const orderId = extractOrderId(order.id);

    if (await db.novapostShipment.findFirst({ where: { order_id: orderId } })) {
      return json({ error: "Order already exists." }, { status: 400 });
    }

    const shopDomain = shop.myshopifyDomain;
    const orderShipping = order.shippingLine.code;

    if (["NP_STANDARD", "NP_COURIER"].includes(orderShipping)) {
      const config = await db.novapostConfig.findFirst({ where: { shop_domain: shopDomain } });
      if (!config) {
        return json({ error: "Config not found" }, { status: 404 });
      }

      const requestData = await mapOrderToShipping(order, shop, config);
      const response = await performRequest(
        `${BASE_URL}${CREATE_SHIPMENT_ENDPOINT}`,
        requestData,
        shopDomain,
        config.api_key
      );
      console.log(response);
      if (response.data) {
        await saveShipment(order, shop, response.data);

        return json({ data: response.data }, { status: response.status_code });
      } else {
        throw new Error(response.error);
      }
    }

    return json({ error: "Invalid shipping method" }, { status: 400 });
  } catch (error) {
    console.error("Error in createDocument:", error);
    await saveShipment(order, shop);

    return json({ error: error.message, status_code: 400 });
  }
};

const extractOrderId = (orderId) => {
  const parts = orderId.split('/');
  return parts[parts.length - 1];
};

