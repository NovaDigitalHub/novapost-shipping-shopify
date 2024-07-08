import { json } from "@remix-run/node";
import db from "../db.server";
import {authenticate} from "../shopify.server.js";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = await admin.rest.resources.Shop.all({
    session: session,
  });

  const shopDomain = shop.data[0].domain;
  if (!shopDomain) {
    return json({ error: "shopDomain is required" }, { status: 422 });
  }

  const config = await db.novapostConfig.findUnique({
    where: { shop_domain: shopDomain },
  });

  if (!config) {
    return json({ error: "Configuration not found for the given shop domain" }, { status: 200 });
  }

  return json({ message: "Configuration retrieved successfully", config });
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = await admin.rest.resources.Shop.all({
    session: session,
  });

  const shop_domain = shop.data[0].domain;
  if (!shop_domain) {
    return json({ error: "shop_domain is required" }, { status: 422 });
  }

  const formData = await request.json();
  const config = await db.novapostConfig.upsert({
    where: { shop_domain },
    update: {
      api_key: formData.apiKey,
      payer_contract_number: formData.payerContractNumber,
      company_tin: formData.companyTin,
      sender_name: formData.senderName,
      country: formData.country,
      division_id: formData.division,
      address: formData.address,
      apartment: formData.apartment,
      postal_code: formData.postalCode,
      city: formData.city,
      phone: formData.phone,
      email: formData.email,
      width: parseInt(formData.width, 10),
      length: parseInt(formData.length, 10),
      height: parseInt(formData.height, 10),
    },
    create: {
      shop_domain,
      api_key: formData.apiKey,
      payer_contract_number: formData.payerContractNumber,
      company_tin: formData.companyTin,
      sender_name: formData.senderName,
      country: formData.country,
      division_id: formData.division,
      address: formData.address,
      apartment: formData.apartment,
      postal_code: formData.postalCode,
      city: formData.city,
      phone: formData.phone,
      email: formData.email,
      width: parseInt(formData.width, 10),
      length: parseInt(formData.length, 10),
      height: parseInt(formData.height, 10),
    },
  });

  return json({ message: "Configuration saved successfully", config });
};
