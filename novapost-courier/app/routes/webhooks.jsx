import { authenticate } from "../shopify.server";
import db from "../db.server";
import crypto from "crypto";
import {json} from "@remix-run/node";

export const action = async ({ request }) => {
  const { topic, shop, session, admin } = await authenticate.webhook(request);

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }

  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }

      break;
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
      const verified = await verifyHmac(request);

      if (!verified) {
        return json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
      }

      return json({ status: 'success' }, { status: 200 });

    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};

const verifyHmac = async (request) => {
  const hmacHeader = request.headers.get('X-Shopify-Hmac-Sha256');
  const data = await request.clone().text();
  const calculatedHmac = crypto.createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    .update(data)
    .digest('base64');
  return crypto.timingSafeEqual(Buffer.from(calculatedHmac), Buffer.from(hmacHeader));
};

