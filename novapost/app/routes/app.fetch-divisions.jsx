import {json} from "@remix-run/node";
import https from 'https';
import { cors } from 'remix-utils/cors';

export const loader = async ({ request }) => {
  const response = json({ status: "ok" }, { status: 200 });
  return await cors(request, response, {origin: true});
};

export const action = async ({request}) => {
  const params = await request.json();
  const responseMicro = await fetch(`${process.env.MICROSERVICE_DOMAIN}/api/proxy/fetchDivision?countryCodes=${params.countryCodes}&settlementName=${params.city}`, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  });

  console.log(responseMicro);
  const divisions = await responseMicro.json();

  const response = json({ status: "success", data: divisions }, { status: 200 });
  return await cors(request, response, {origin: true});
};

export default function AdditionalPage() {
  return <></>;
}
