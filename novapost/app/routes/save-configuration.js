import {json} from "@remix-run/node";
import { authenticate } from "../shopify.server";
import https from 'https';
import axios from "axios";

export const action = async ({ request }) => {
  const requestData = await request.json();
  const { admin, session } = await authenticate.admin(request);

  const shop = await admin.rest.resources.Shop.all({
    session: session,
  });

  const response = await axios.post(`${process.env.MICROSERVICE_DOMAIN}/api/proxy/configuration`,
    {
      shop_domain: shop.data[0].domain,
      api_key: requestData.apiKey,
      payer_contract_number: requestData.payerContractNumber,
      company_tin: requestData.companyTin,
      sender_name: requestData.senderName,
      country: requestData.country,
      division_id: requestData.division,
      address: requestData.address,
      apartment: requestData.apartment,
      postal_code: requestData.postalCode,
      city: requestData.city,
      phone: requestData.phone,
      email: requestData.email,
      width: requestData.width,
      length: requestData.length,
      height: requestData.height
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });

  console.log(response);
  if (response.data) {
    return json({status: 'success', data: response.data});
  }

  return json({status: 'error'});
};
