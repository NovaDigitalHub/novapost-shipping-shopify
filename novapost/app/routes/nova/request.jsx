import { generateToken } from "./token";

export const performRequest = async (endpoint, data, shopDomain, apiKey) => {
  const token = await generateToken(shopDomain, apiKey);
  const tokenResponse = await token.json();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `${tokenResponse.jwt}`,
      "Content-Type": "application/json",
      "System": "shopify"
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  return { data: result, status_code: response.status };
};
