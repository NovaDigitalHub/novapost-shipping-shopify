import createApp from '@shopify/app-bridge';
import { Page, Layout, Card, Text, BlockStack, Button } from '@shopify/polaris';
import React, { useState, useEffect } from 'react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';

export default function AdditionalPage() {
  const [shipments, setShipments] = useState([]);
  const appBridge = useAppBridge();

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await fetch('/fetch-shipments', {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shipments');
      }

      const responseData = await response.json();
      setShipments(responseData.data);
    } catch (error) {
      console.error(error);
    }
  };

  const redirectToOrder = (orderId) => {
    const config = {
      apiKey: appBridge.config.apiKey,
      host: appBridge.config.host,
    };

    const app = createApp(config);
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
      newContext: true,
      section: {
        name: Redirect.ResourceType.Order,
        resource: {
          id: orderId,
        },
      }
    });
  }

  const getFileNameFromResponse = (response) => {
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition && contentDisposition.includes('filename=')) {
      return contentDisposition.split('filename=')[1].trim().replace(/['"]/g, '');
    }
    return null
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printDocument = async (shipmentId, labelType) => {
    try {
      const response = await fetch('/print-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shipmentId: shipmentId, labelType: labelType }),
      });

      if (response.status !== 200) {
        throw new Error('Failed to print document');
      }

      const blob = await response.blob();
      const filename = getFileNameFromResponse(response) || 'document.pdf';
      downloadBlob(blob, filename);

      shopify.toast.show("Document printed successfully");
    } catch (error) {
      console.log(error);
      shopify.toast.show('Error saving configuration');
    }
  }

  return (
    <Page>
      <ui-title-bar title="Shipments" />
      <Layout>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Shipments
              </Text>
              <table>
                <tbody>
                <tr>
                  <th>Number</th>
                  <th>Payment Status</th>
                  <th>Action</th>
                </tr>
                {shipments.map(item => (
                  <tr key={item.number}>
                    <td>{item.number}</td>
                    <td>{item.status}</td>
                    <td>
                      <Button onClick={() => redirectToOrder(item.order_id)} primary>
                        View Order
                      </Button>
                      <Button onClick={() => printDocument(item.number, 'label')} primary>
                        Print Label
                      </Button>
                      <Button onClick={() => printDocument(item.number, 'invoice')} primary>
                        Print Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
