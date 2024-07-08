import { json } from "@remix-run/node";
import { Cache } from 'memory-cache';

const cache = new Cache();
const BASE_URL = "https://api.novapost.com/v.1.0";
const AUTHORIZATION_ENDPOINT = "/clients/authorization";

export async function generateToken(storeDomain, apiKey) {
  if (!apiKey) {
    return json({ error: "API Key is required" }, { status: 400 });
  }

  const cachedToken = cache.get(storeDomain + '_jwt_token');
  if (cachedToken) {
    const tokenData = JSON.parse(Buffer.from(cachedToken.split('.')[1], 'base64').toString());
    const expirationTime = tokenData.exp;

    if (expirationTime && expirationTime > Math.floor(Date.now() / 1000)) {
      return json({ jwt: cachedToken });
    }
  }

  const endpoint = `${BASE_URL}${AUTHORIZATION_ENDPOINT}?apiKey=${encodeURIComponent(atob(apiKey))}`;
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'System': 'shopify',
      },
    });

    if (response.status !== 200) {
      return json({ error: "Failed to fetch token" }, { status: response.status });
    }

    const responseData = await response.json();

    if (!responseData.jwt) {
      return json({ error: "JWT Token not found in the response" }, { status: 500 });
    }

    cache.put(storeDomain + '_jwt_token', responseData.jwt, 59 * 60 * 1000);

    return json({ jwt: responseData.jwt });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
}
