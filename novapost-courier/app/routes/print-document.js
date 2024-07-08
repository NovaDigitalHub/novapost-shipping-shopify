import https from 'https';
import fs from "fs";
import {authenticate} from "../shopify.server.js";
import {printDocument} from "./nova/print-document.jsx";

export const action = async ({request}) => {
  const { admin, session } = await authenticate.admin(request);
  const shopResponse = await admin.rest.resources.Shop.all({session: session});
  const shopData = shopResponse.data[0];
  const params = await request.json();

  let type, size;
  if (params.labelType === 'label') {
    type= 'marking';
    size = 'size_100_100'
  } else if (params.labelType === 'invoice') {
    type= 'invoice';
    size = 'size_A4'
  } else {
    throw new Error('Invalid label type');
  }

  const { pdfBuffer, filename, filePath } = await printDocument(shopData.domain, params.shipmentId, type, size);
  console.log(filename);
  console.log(pdfBuffer);

  const fileStream = fs.createReadStream(filePath);
  const response = new Response(fileStream, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });

  response.headers.append('File-Path', filePath);
  fileStream.on('close', () => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file: ${err.message}`);
      } else {
        console.log(`File deleted: ${filePath}`);
      }
    });
  });

  return response;
};
