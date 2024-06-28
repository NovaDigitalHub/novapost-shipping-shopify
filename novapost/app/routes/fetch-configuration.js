import {json} from "@remix-run/node";
import { authenticate } from "../shopify.server";
import https from 'https';
import axios from "axios";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = await admin.rest.resources.Shop.all({
    session: session,
  });

  const response = await axios.post(`${process.env.MICROSERVICE_DOMAIN}/api/proxy/fetchConfiguration`,
    {
      shop_domain: shop.data[0].domain,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });

  if (response.data) {
    return json({status: 'success', data: response.data});
  }

  return json({status: 'error'});
};
