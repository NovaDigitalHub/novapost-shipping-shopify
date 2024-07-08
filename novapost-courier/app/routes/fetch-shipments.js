import {json} from "@remix-run/node";
import {authenticate} from "../shopify.server.js";
import db from "../db.server.js";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shopResponse = await admin.rest.resources.Shop.all({session: session});
  const shopData = shopResponse.data[0];

  const shipments = await db.novapostShipment.findMany({
    where: { shop_domain: shopData.domain },
    orderBy: { createdAt: 'desc' }
  });

  return json({ status: 'success', data: shipments });
};
