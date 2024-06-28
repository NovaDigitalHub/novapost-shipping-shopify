import {json} from "@remix-run/node";
import https from 'https';

export const action = async ({request}) => {
  const params = await request.json();
  const responseMicro = await fetch(`${process.env.MICROSERVICE_DOMAIN}/api/proxy/fetchCity?countryCodes=${params.countryCodes}`, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  });

  console.log(responseMicro);
  const cities = await responseMicro.json();
  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(params.query.toLowerCase())
  );

  return  json({ status: "success", data: filteredCities });
};
