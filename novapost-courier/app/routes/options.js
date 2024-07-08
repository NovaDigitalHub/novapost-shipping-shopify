import { json } from "@remix-run/node";
import { getDivision, getCity } from "../models/options.jsx";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  if (action === "getDivision") {
    return await getDivision(request);
  }

  if (action === "getCity") {
    return await getCity(request);
  }

  return json({ error: "Invalid action" }, { status: 400 });
};
