import { json } from "@remix-run/node";
import fs from "fs";
import https from 'https';
import axios from "axios";
import path from "path";
import db from "../../db.server";
import { generateToken } from "./token";

export const printDocument = async (shopDomain, shipmentId, type, size) => {
  try {
    const BASE_URL = 'https://api.novapost.com/v.1.0';
    const PRINT_DOCUMENT_ENDPOINT = '/shipments/print';

    if (!shipmentId || !shopDomain) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    const config = await db.novapostConfig.findFirst({ where: { shop_domain: shopDomain } });
    if (!config) {
      return json({ error: "Config not found" }, { status: 404 });
    }

    const token = await generateToken(shopDomain, config.api_key);
    const tokenResponse = await token.json();

    const response = await axios.get(`${BASE_URL}${PRINT_DOCUMENT_ENDPOINT}`, {
      headers: {
        'Authorization': `${tokenResponse.jwt}`,
        'Accept': 'application/pdf',
        'System': 'shopify'
      },
      params: {
        numbers: [shipmentId],
        type: type,
        printSizeType: size
      },
      responseType: 'arraybuffer',
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });


    if (response.status === 200) {
      const pdfContent = response.data;
      const dirPath = path.join('storage', type);
      const filePath = path.join('storage', type, `${shipmentId}.pdf`);

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      fs.writeFileSync(filePath, pdfContent);
      return { pdfBuffer: pdfContent, filename: `${shipmentId}.pdf`, filePath };
    } else {
      throw new Error('Failed to fetch document');
    }
  } catch (error) {
    throw new Error(error.message);
  }
};
