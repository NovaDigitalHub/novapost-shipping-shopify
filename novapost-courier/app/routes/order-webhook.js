import { json } from "@remix-run/node";
import crypto from 'crypto';
import https from 'https';
import axios from "axios";
import { authenticate } from "../shopify.server.js";

export const action = async ({ request }) => {
  try {
    console.log('webhook back');
    const orderData = await request.clone().json();

    if (orderData.shipping_lines[0].code === 'NP_COURIER') {
      const hmac_header = request.headers.get('X-Shopify-Hmac-Sha256');
      const data = await request.clone().text();
      const calculated_hmac = crypto.createHmac('sha256', process.env.SHOPIFY_API_SECRET).update(data).digest('base64');

      const verified = crypto.timingSafeEqual(Buffer.from(calculated_hmac), Buffer.from(hmac_header));

      if (!verified) {
        return json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
      }

      const { admin } = await authenticate.webhook(request);

      const orderResponse = await admin.graphql(
          `#graphql
        query {
          node(id: "gid://shopify/Order/${orderData?.id}") {
            id
            ... on Order {
              id
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              lineItems(first: 250) {
                edges {
                  node {
                    title
                    sku
                    quantity
                    originalTotalSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    variant {
                      weight
                      weightUnit
                    }
                  }
                }
              }
              shippingAddress {
                firstName
                lastName
                address1
                address2
                city
                country
                phone
                province
                zip
                countryCodeV2
              }
              shippingLine {
                code
              }
              email
              totalWeight
            }
          }
        }`,
      );

      const shopResponse = await admin.graphql(
          `#graphql
        query {
          shop {
            myshopifyDomain
            name
            email
          }
        }`,
      );

      const [order, shop] = await Promise.all([
        orderResponse.json(),
        shopResponse.json()
      ]);

      const response = await axios.post(
        `${process.env.MICROSERVICE_DOMAIN}/api/proxy/createDocument`,
        {
          order: order.data.node,
          shop: shop.data.shop
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          httpsAgent: new https.Agent({ rejectUnauthorized: false })
        }
      );

      console.log('Response from external API:', response.data);
      return json({ status: 'success' },  { status: 200 });
    }

    return json({ status: 'not NP_COURIER' }, { status: 200 });

  } catch (error) {
    console.error('Error handling webhook:', error);
    return json({ status: 'error', message: error.message }, { status: 200 });
  }
};
