import db from "../db.server.js";

export const saveShipment = async (order, shop, shipment = null) => {
  try {
    await db.novapostShipment.create({
      data: {
        shop_domain: extractBaseName(shop.myshopifyDomain),
        order_id: extractBaseName(order.id),
        number: shipment?.number || '',
        scheduled_delivery_date: shipment?.scheduledDeliveryDate || null,
        status: shipment?.status || 'Shipment not created, something went wrong.',
        cost: shipment?.cost || null,
        parcels_amount: shipment?.parcelsAmount || null,
      },
    });
  } catch (error) {
    console.error("Error in saveShipment:", error);
    throw new Error(error.message);
  }
};

const extractBaseName = (value) => {
  const parts = value.split('/');
  return parts[parts.length - 1];
};
