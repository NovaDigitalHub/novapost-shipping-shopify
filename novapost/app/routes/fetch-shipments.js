import {json} from "@remix-run/node";
import https from 'https';
import {authenticate} from "../shopify.server.js";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shopResponse = await admin.rest.resources.Shop.all({session: session});
  const shopData = shopResponse.data[0];

  const response = await fetch(`${process.env.MICROSERVICE_DOMAIN}/api/proxy/fetchShipments?shopDomain=${shopData.domain}`, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  });

  console.log(response);
  const data = await response.json();

  if (data) {
    return json({status: 'success', data: data});
  }

  return json({status: 'error'});
};
