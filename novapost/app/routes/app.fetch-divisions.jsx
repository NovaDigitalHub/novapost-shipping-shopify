import {json} from "@remix-run/node";
import { cors } from 'remix-utils/cors';
import { getDivision } from "../models/options.jsx";

export const loader = async ({ request }) => {
  const responseDivisions = await getDivision(request);

  const divisions = await responseDivisions.json();
  const response = json({ status: "success", data: divisions }, { status: 200 });
  return await cors(request, response, {origin: true});
};

export const action = async ({request}) => {
  const response = json({ status: "ok" }, { status: 200 });
  return await cors(request, response, {origin: true});
};

export default function AdditionalPage() {
  return <></>;
}
