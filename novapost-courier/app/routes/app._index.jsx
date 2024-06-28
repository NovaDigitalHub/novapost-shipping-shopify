import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useActionData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  BlockStack,
  Card,
  Button,
  Box
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({request}) => {
  try {
    const body = await request.json();

    const url = new URL(request.url);
    const {admin, session} = await authenticate.admin(request);

    await syncCarrierService(admin, session, url, body.action);
    await syncWebhookService(admin, session, url, body.action);

    return json({status: body.action});
  } catch (error) {
    console.error('Error adding carrier services:', error);
    return json({error: 'Failed to add carrier services'}, 500);
  }
};

const syncCarrierService = async (admin, session, url, action) => {
  const carriers = await admin.rest.resources.CarrierService.all({
    session: session
  });
  console.log(carriers);
  const existingCarrier = carriers.data.find(carrier => carrier.name.includes('np_courier'));

  const carrierService = new admin.rest.resources.CarrierService({ session });
  carrierService.name = "np_courier";
  carrierService.callback_url = `https://${url.hostname}/carrier-courier`;

  if (action === 'enable') {
    carrierService.active = true;
  } else {
    carrierService.active = false;
  }

  if (existingCarrier) {
    carrierService.id = existingCarrier.id;
    await carrierService.save({ update: true });
  } else {
    await carrierService.save();
  }
};

const syncWebhookService = async (admin, session, url, action) => {
  const webhooks = await admin.rest.resources.Webhook.all({
    session: session,
  });

  console.log(webhooks);
  const existingWebhook = webhooks.data.find(webhook => webhook.topic.includes('orders/create'));

  const webhookService = new admin.rest.resources.Webhook({session: session});
  webhookService.address = `https://${url.hostname}/order-webhook`;
  webhookService.topic = "orders/create";
  webhookService.format = "json";

  if (action === 'disable') {
    if (existingWebhook) {
      await admin.rest.resources.Webhook.delete({
        session: session,
        id: existingWebhook.id,
      });
    }
  } else {
    if (existingWebhook) {
      webhookService.id = existingWebhook.id;
      await webhookService.save({ update: true });
    } else {
      await webhookService.save();
    }
  }
};

export default function Index() {
  const actionData = useActionData();
  const submit = useSubmit();

  const enableNovaPost = () => {
    submit({action: 'enable'}, { replace: true, method: "POST", encType: "application/json" });
  };

  const disableNovaPost = () => {
    submit({action: 'disable'}, { replace: true, method: "POST", encType: "application/json" });
  };

  useEffect(() => {
    if (actionData?.status === 'enable') {
      shopify.toast.show("Nova Post Courier enabled");
    } else {
      shopify.toast.show("Nova Post Courier disabled");
    }
  }, []);

  return (
    <Page>
      <ui-title-bar title="Remix app template"/>
      <Layout.Section variant="oneThird">
        <BlockStack gap="500">
          <Card>
            <Button onClick={enableNovaPost}>Enable Nova Post Courier</Button>
          </Card>
          <Box
            padding="400"
            background="bg-surface-active"
            borderWidth="025"
            borderRadius="200"
            borderColor="border"
            overflowX="scroll"
          >
            <pre style={{margin: 0}}>
              <code>{JSON.stringify(actionData?.status, null, 2)}</code>
            </pre>
          </Box>
          <Card>
            <Button onClick={disableNovaPost}>Disable Nova Post Courier</Button>
          </Card>
        </BlockStack>
      </Layout.Section>
    </Page>
  );
}
