import https from 'https';
import {authenticate} from "../shopify.server.js";

export const action = async ({request}) => {
  const { admin, session } = await authenticate.admin(request);
  const shopResponse = await admin.rest.resources.Shop.all({session: session});
  const shopData = shopResponse.data[0];
  const params = await request.json();
  let endpoint;

  if (params.labelType === 'label') {
    endpoint = 'printLabel';
  } else if (params.labelType === 'invoice') {
    endpoint = 'printInvoice';
  } else {
    throw new Error('Invalid label type');
  }

  const responseMicro = await fetch(`${process.env.MICROSERVICE_DOMAIN}/api/proxy/${endpoint}?shopDomain=${shopData.domain}&shipmentId=${params.shipmentId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  });

  console.log(responseMicro);
  if (responseMicro.status !== 200) {
    return new Response(JSON.stringify({ status: 'error', message: 'Failed to fetch document' }), { status: responseMicro.status });
  }

  const contentDisposition = responseMicro.headers.get('Content-Disposition');
  let filename = 'document.pdf';
  if (contentDisposition && contentDisposition.includes('filename=')) {
    filename = contentDisposition.split('filename=')[1].trim();
  }

  const pdfBuffer = await responseMicro.arrayBuffer();
  console.log(pdfBuffer);

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
};
