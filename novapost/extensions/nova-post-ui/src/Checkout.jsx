import React, { useState, useCallback, useEffect } from 'react';
import {
  reactExtension,
  useDeliveryGroups,
  useShippingAddress,
  useApi,
  useSessionToken,
  BlockSpacer,
  Button,
  Form,
  Select,
  Heading,
  TextField
} from '@shopify/ui-extensions-react/checkout';

const DeliveryPointSelector = ({ shipment }) => {
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const sessionToken = useSessionToken();
  const {orderConfirmation} = useApi();

  const fetchDivisions = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.SHOPIFY_APP_URL}/app/fetch-divisions?_data=routes/app.fetch-divisions&action=getDivision&countryCodes=${encodeURIComponent(shipment?.countryCode)}&settlement=${encodeURIComponent(shipment?.city)}`);
      if (response.ok) {
        const divisions = await response.json();
        const options = [{ value: '', label: 'Select a division...' }];
        divisions.data.forEach(division => {
          options.push({
            value: division.id,
            label: `${division.name} - ${division.address}`
          });
        });
        setDivisionOptions(options);
        setFilteredOptions(options);
      }
    } catch (error) {
      console.error('Error fetching divisions:', error);
    }
  }, [shipment?.countryCode]);

  useEffect(() => {
    (async () => {
      await fetchDivisions();
    })()
  }, [shipment?.city]);

  const handleDivisionChange = useCallback((value) => {
    setSelectedDivision(value);
  }, []);

  const handleFilterTextChange = useCallback((value) => {
    setFilterText(value);
    const filtered = divisionOptions.filter(option =>
      option.label.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [divisionOptions]);

  const handleSubmit = async () => {
    const orderIdString = orderConfirmation.current.order.id;
    const orderId = orderIdString.match(/\d+/)[0];

    const token = await sessionToken.get();
    const response = await fetch(`${process.env.SHOPIFY_APP_URL}/app/submit-checkout?_data=routes/app.submit-checkout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        token: token,
        selectedDivision: selectedDivision,
        orderId: orderId
      })
    });

    const data = await response.json();
    console.log(data);
    setIsSubmitDisabled(true);
  }

  return (
    <Form onSubmit={() => handleSubmit()}>
      <TextField
        label="Filter Divisions"
        value={filterText}
        onInput={handleFilterTextChange}
      />
      <BlockSpacer spacing="base" />
      <Select
        label="Select Division"
        options={filteredOptions}
        value={selectedDivision}
        onChange={handleDivisionChange}
      />
      <BlockSpacer spacing="base" />
      <Button accessibilityRole="submit" disabled={isSubmitDisabled}>Submit</Button>
    </Form>
  );
};

function Extension() {
  const {extension} = useApi();
  const {target} = extension;
  const shipment = useShippingAddress();
  const deliveryGroups = useDeliveryGroups();

  // Boolean to check if Express is selected
  const isNovaPostSelected = () => {
    if (
      target !== "purchase.thank-you.customer-information.render-after" ||
      deliveryGroups?.length <= 0
    ) {
      return false;
    }

    const expressHandle = deliveryGroups[0].deliveryOptions.find(
      (method) => method.title === "Nova Post Standard Shipping"
    )?.handle;

    return expressHandle === deliveryGroups[0].selectedDeliveryOption?.handle;
  };

  return isNovaPostSelected() ? (
    <>
      <Heading>Select a Division for delivery</Heading>
      <BlockSpacer spacing="extraTight" />
      <DeliveryPointSelector shipment={ shipment }/>
    </>
  ) : null;
}

const novaPostDelivery = reactExtension(
  'purchase.thank-you.customer-information.render-after',
  () => <Extension />
);

export { novaPostDelivery };
