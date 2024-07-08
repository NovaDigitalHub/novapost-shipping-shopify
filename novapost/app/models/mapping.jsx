import {getExchangeRate} from "../routes/nova/exchange-rate.jsx";
import {convertWeightToGrams, extractOrderId} from "./order-service.jsx";

export const mapOrderToCalculation = async (data, config) => {
  try {
    const calculatedItems = await prepareCalculateItems(data.rate, config);

    return {
      map: {
        payerType: "Sender",
        payerContractNumber: config.payer_contract_number,
        parcels: calculatedItems.items,
        sender: getCalculationAddress(config, true),
        recipient: getCalculationAddress(data.rate.destination)
      },
      currencyCode: calculatedItems.currencyCode
    };
  } catch (error) {
    console.error("Error in mapOrderToCalculation:", error);
    throw new Error("Failed to map order to calculation.");
  }
};

export const mapOrderToShipping = async (order, shop, config) => {
  try {
    return {
      status: "ReadyToShip",
      clientOrder: extractOrderId(order.id),
      payerType: "Sender",
      payerContractNumber: config.payer_contract_number,
      invoice: await generateInvoice(order.totalPriceSet.shopMoney, config),
      parcels: prepareOrderItems(order.lineItems.edges, config),
      sender: generateSenderAddress(shop, config),
      recipient: {
        companyName: "Private person",
        phone: order.shippingAddress.phone,
        name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        countryCode: order.shippingAddress.countryCodeV2,
        divisionNumber: order.shippingAddress.divisionId || null,
        addressParts: {
          city: order.shippingAddress.city,
          street: order.shippingAddress.address1.replace(/,/g, ''),
          postCode: order.shippingAddress.zip,
          building: order.shippingAddress.address2 || 'none'
        }
      }
    };
  } catch (error) {
    console.error("Error in mapOrderToShipping:", error);
    throw new Error("Failed to map order to shipping.");
  }
};

const prepareOrderItems = (items, config) => {
  try {
    return items.map((item, index) => {
      const parcelDescription = item.node.title || 'Nova Post Item';
      const insuranceCost = item.node.originalTotalSet.shopMoney.amount;
      const actualWeight = convertWeightToGrams(item.node.variant.weight, item.node.variant.weightUnit);

      return {
        cargoCategory: "parcel",
        parcelDescription,
        insuranceCost,
        rowNumber: index + 1,
        width: config.width,
        length: config.length,
        height: config.height,
        actualWeight
      };
    });
  } catch (error) {
    console.error("Error in prepareOrderItems:", error);
    throw new Error("Failed to map order to shipping.");
  }
};

const prepareCalculateItems = async (rate, config) => {
  const preparedItems = [];
  let rowNumber = 1;
  let currencyCode = null;

  try {
    for (const item of rate.items) {
      const parcelDescription = item.name || "Nova Post Item";
      const cost = (item.price * item.quantity) / 100;
      const actualWeight = item.grams || 1000;

      const exchange = await getExchangeRate(cost, config.country, rate.currency, config.shop_domain, config.api_key);
      console.log(exchange);

      if (exchange) {
        const exchangeRates = exchange;

        preparedItems.push({
          cargoCategory: "parcel",
          parcelDescription,
          insuranceCost: exchangeRates.mainCurrency.amount,
          rowNumber,
          width: config.width,
          length: config.length,
          height: config.height,
          actualWeight
        });

        if (!currencyCode) {
          currencyCode = exchangeRates.mainCurrency.currencyCode;
        }

        rowNumber++;
      }
    }
    return { items: preparedItems, currencyCode };
  } catch (error) {
    console.error("Error in prepareCalculateItems:", error);
    return { items: preparedItems, currencyCode };
  }
};

const generateSenderAddress = (shop, config) => {
  return {
    companyName: "Private person",
    companyTin: config.company_tin,
    phone: config.phone,
    email: shop.email,
    name: config.sender_name,
    countryCode: config.country,
    divisionNumber: config.division_id || null,
    addressParts: {
      city: config.city,
      street: config.address,
      postCode: config.postal_code,
      building: config.apartment
    }
  };
};

const getCalculationAddress = (data, isSender = false) => ({
  phone: data.phone || "",
  email: data.email || "",
  name: isSender ? data.sender_name || "" : data.name || "",
  countryCode: data.country || "",
  divisionNumber: isSender ? data.division_id || null : data.divisionNumber || null,
  addressParts: {
    city: data.city || "",
    street: isSender ? data.address || "" : data.address1 || "",
    postCode: data.postal_code || "",
    building: isSender ? data.apartment || "" : data.building || ""
  }
});

const generateInvoice = async (currency, config) => {
  try {
    const exchange = await getExchangeRate(
      parseFloat(currency.amount),
      config.country,
      currency.currencyCode,
      config.shop_domain,
      config.api_key
    );

    if (exchange) {
      let totalCostEur = 1;
      let totalCostUsd = 1;
      exchange.convertedCurrencies.forEach((convertedCurrency) => {
        switch (convertedCurrency.currencyCode) {
          case 'EUR':
            totalCostEur = convertedCurrency.amount;
            break;
          case 'USD':
            totalCostUsd = convertedCurrency.amount;
            break;
        }
      });

      if (currency.currencyCode === 'USD') {
        totalCostUsd = parseFloat(currency.amount);
      } else if (currency.currencyCode === 'EUR') {
        totalCostEur = parseFloat(currency.amount);
      }

      return {
        incoterm: "DAP",
        currencyCode: currency.currencyCode,
        totalCost: parseFloat(currency.amount),
        totalCostEur,
        totalCostUsd
      };
    }
  } catch (error) {
    console.error("Error in generateInvoice:", error);
    throw new Error("Failed to generate invoice.");
  }
};

