import {json} from "@remix-run/node";
import db from "../db.server.js";
import {validateCountryCodes} from "./country.jsx";

export const getDivision = async (request) => {
  try {
    const url = new URL(request.url);
    const countryCodes = url.searchParams.get("countryCodes");
    const settlement = url.searchParams.get("settlement");
    const source = url.searchParams.get("source");
    if (!validateCountryCodes(countryCodes)) {
      return json({ error: "Invalid country codes" }, { status: 400 });
    }

    const conditions = {
      countryCode: { in: countryCodes.split(",") },
      address_city: { contains: settlement }

    };

    if (source === "admin") {
      conditions.source = "NPAX";
    }

    const divisions = await db.novapostDivision.findMany({
      where: conditions,
    });

    return json(divisions);
  } catch (error) {
    return json({ error: `Failed to retrieve divisions: ${error.message}` }, { status: 500 });
  }
};

export const getCity = async (request) => {
  try {
    const url = new URL(request.url);
    const countryCodes = url.searchParams.get("countryCodes");
    const value = url.searchParams.get("value")?.toLowerCase();

    if (!validateCountryCodes(countryCodes)) {
      return json({ error: "Invalid country codes" }, { status: 400 });
    }

    const cities = await db.novapostDivision.findMany({
      where: {
        countryCode: { in: countryCodes.split(",") },
      },
      distinct: ["address_city"],
      select: {
        settlement_id: true,
        address_city: true,
      },
    });

    const filteredCities = cities.filter(city => city.address_city.toLowerCase().includes(value)).map(city => ({
      settlement_id: city.settlement_id,
      address_city: city.address_city,
    }));

    return json(filteredCities);
  } catch (error) {
    return json({ error: `Failed to retrieve cities: ${error.message}` }, { status: 500 });
  }
};
