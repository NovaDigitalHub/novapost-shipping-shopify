import {json} from "@remix-run/node";
import {authenticate, unauthenticated} from "../shopify.server.js";
import {createShipment} from "./nova/create-shipment.jsx";

export const action = async ({ request }) => {
  const requestData = await request.json();
  const { sessionToken } = await authenticate.public.checkout(request);
  const { admin } = await unauthenticated.admin(sessionToken.dest);

  const orderResponse = await admin.graphql(
      `#graphql
    query {
      node(id: "gid://shopify/Order/${requestData?.orderId}") {
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
        email
      }
    }`,
  );

  const [order, shop] = await Promise.all([
    orderResponse.json(),
    shopResponse.json()
  ]);

  order.data.node.shippingAddress.divisionId = requestData.selectedDivision;

  console.log(order.data.node);
  console.log(shop.data.shop);

  const shipment = await createShipment({
    order: order.data.node,
    shop: shop.data.shop
  });

  const createShipmentResponse = await shipment.json();
  console.log(createShipmentResponse);
  if (createShipmentResponse.error) {
    return json({ error: createShipmentResponse.error }, { status: 400 });
  }

  return json({ data: createShipmentResponse.data }, {headers: {
      "Access-Control-Allow-Origin": "*",
      'Access-Control-Allow-Headers': 'Content-Type'
    }});
};

export default function AdditionalPage() {
  return <></>;
}
