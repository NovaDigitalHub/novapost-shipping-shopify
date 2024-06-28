import {json} from "@remix-run/node";
import https from 'https';

export const action = async ({request}) => {
  const params = await request.json();
  const responseMicro = await fetch(`${process.env.MICROSERVICE_DOMAIN}/api/proxy/fetchDivision?countryCodes=${params.countryCodes}&settlementName=${params.city}&source=admin`, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  });

  console.log(responseMicro);
  const divisions = await responseMicro.json();

  return  json({ status: "success", data: divisions });
};
