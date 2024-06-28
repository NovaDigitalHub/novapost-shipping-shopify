import {useEffect, useState, useCallback} from "react";
import {json} from "@remix-run/node";
import {useActionData, useSubmit} from "@remix-run/react";
import {
  BlockStack,
  Box,
  Button,
  Card,
  Form,
  FormLayout,
  Layout,
  Page,
  Select,
  Text,
  TextField,
  Autocomplete,
  Icon
} from "@shopify/polaris";
import {SearchIcon} from '@shopify/polaris-icons';
import {authenticate} from "../shopify.server";
import {novaCountryOptions} from './nova/options.jsx';

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request, response }) => {
  try {
    const body = await request.json();

    const url = new URL(request.url);
    const { admin, session } = await authenticate.admin(request);

    await syncCarrierService(admin, session, url, body.action);

    return json({ status: 'success' });
  } catch (error) {
    console.error('Error:', error);
    return json({ status: error });
  }
};

const syncCarrierService = async (admin, session, url, action) => {
  const carriers = await admin.rest.resources.CarrierService.all({
    session: session
  });

  const existingCarrier = carriers.data.find(carrier => carrier.name.includes('np_standard'));

  const carrierService = new admin.rest.resources.CarrierService({ session });
  carrierService.name = "np_standard";
  carrierService.callback_url = `https://${url.hostname}/carrier`;

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

export default function Index() {
  const actionData = useActionData();
  const submit = useSubmit();
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [payerContractNumber, setPayerContractNumber] = useState("");
  const [companyTin, setCompanyTin] = useState("");
  const [senderName, setSenderName] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCity, setSelectedCity] = useState([]);
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const [height, setHeight] = useState("");
  const [sendFromDivision, setSendFromDivision] = useState(false);
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [division, setDivision] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchConfiguration().then(() => {
      if (actionData?.status === 'success') {
        shopify.toast.show("Nova Post enabled");
      }
    });
  }, [actionData]);

  const updateCityText = useCallback(
    async (value) => {
      setCity(value);

      if (value.trim().length === 2) {
        setCityOptions([]);
        return;
      }

      try {
        const response = await fetch(`/fetch-admin-cities`, {
          method: "POST",
          body: JSON.stringify({countryCodes: country, query: value}),
        });

        if (response.ok) {
          const cities = await response.json();
          const options = cities.data.map((city) => ({
            value: city,
            label: city,
          }));
          setCityOptions(options);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [country]
  );

  const updateCitySelection = useCallback(
    (selected) => {
      const selectedCity = cityOptions.find(option => option.value === selected[0]);
      if (selectedCity) {
        setCity(selectedCity.label);
        fetchDivisionOptions(country, selectedCity.label);
      }
    },
    [cityOptions, country]
  );

  const validate = () => {
    const newErrors = {};
    if (!apiKey.trim()) newErrors.apiKey = "API Key is required";
    if (!companyTin.trim()) newErrors.companyTin = "Company TIN is required";
    if (!payerContractNumber.trim()) newErrors.payerContractNumber = "Payer contract number is required";
    if (!senderName.trim()) newErrors.senderName = "Sender Name is required";
    if (!country.trim()) newErrors.country = "Country is required";
    if (!address.trim()) newErrors.address = "Address is required";
    if (!apartment.trim()) newErrors.apartment = "Apartment is required";
    if (!postalCode.trim()) newErrors.postalCode = "Postal Code is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!phone.trim()) newErrors.phone = "Phone is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!width) newErrors.width = "Width is required";
    if (!length) newErrors.length = "Length is required";
    if (!height) newErrors.height = "Height is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchConfiguration = async () => {
    try {
      const response = await fetch('/fetch-configuration', {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch default configuration');
      }

      const responseData = await response.json();
      if (responseData.data) {
        setApiKey(atob(responseData.data.config.api_key) || "");
        setPayerContractNumber(responseData.data.config.payer_contract_number || "");
        setCompanyTin(responseData.data.config.company_tin || "");
        setSenderName(responseData.data.config.sender_name || "");
        setCountry(responseData.data.config.country || "");
        setAddress(responseData.data.config.address || "");
        setApartment(responseData.data.config.apartment || "");
        setPostalCode(responseData.data.config.postal_code || "");
        setCity(responseData.data.config.city || "");
        setPhone(responseData.data.config.phone || "");
        setEmail(responseData.data.config.email || "");
        setWidth(responseData.data.config.width || "");
        setLength(responseData.data.config.length || "");
        setHeight(responseData.data.config.height || "");
        setDivision(responseData.data.config.division_id || "");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDivisionOptions = async (country, city) => {
    try {
      const response = await fetch(`/fetch-admin-divisions`, {
        method: "POST",
        body: JSON.stringify({ countryCodes: country, city: city}),
      });

      if (response.ok) {
        const divisions = await response.json();
        const options = [{ value: '', label: 'Select a division...' }];

        divisions.data.forEach(division => {
          options.push({
            value: division.id.toString(),
            label: `${division.name} - ${division.address}`
          });
        });

        setDivisionOptions(options);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const enableNovaPost = () => {
    submit({action: 'enable'}, { replace: true, method: "POST", encType: "application/json" });
  };

  const disableNovaPost = () => {
    submit({action: 'disable'}, { replace: true, method: "POST", encType: "application/json" });
  };

  const handleNovaSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      shopify.toast.show('Please correct the errors before submitting');
      return;
    }

    try {
      const response = await fetch('/save-configuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: btoa(apiKey),
          payerContractNumber: payerContractNumber,
          companyTin: companyTin,
          senderName: senderName,
          country: country,
          division: division,
          address: address,
          apartment: apartment,
          postalCode: postalCode,
          city: city,
          phone: phone,
          email: email,
          width: width,
          length: length,
          height: height
        })
      });

      if (response.status !== 200) {
        throw new Error('Failed to save API key');
      }

      const data = await response.json();
      console.log('API key saved:', data);

      shopify.toast.show("Configuration saved successfully");
    } catch (error) {
      console.log(error);
      shopify.toast.show('Error saving configuration');
    }
  };

  if (loading) {
    return <Page>Loading...</Page>;
  }

  const cityTextField = (
    <Autocomplete.TextField
      onChange={updateCityText}
      label="City"
      value={city}
      prefix={<Icon source={SearchIcon} tone="base" />}
      placeholder="Enter city"
      autoComplete="off"
    />
  );

  return (
    <Page>
      <ui-title-bar title="Remix app template"/>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Test Nova Post App
                  </Text>
                </BlockStack>
                {actionData?.status && (
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
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <Button onClick={enableNovaPost}>Enable Nova Post</Button>
              </Card>
              <Card>
                <Button onClick={disableNovaPost}>Disable Nova Post</Button>
              </Card>
            </BlockStack>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card>
              <Form onSubmit={handleNovaSubmit}>
                <FormLayout>
                  <TextField
                    type={"password"}
                    label="API Key"
                    value={apiKey}
                    onChange={(value) => setApiKey(value)}
                    requiredIndicator
                    autoComplete="off"
                    error={errors.apiKey}
                  />
                  <TextField
                    type={"text"}
                    label="Sender Name"
                    placeholder={"Name Surname"}
                    value={senderName}
                    onChange={(value) => setSenderName(value)}
                    requiredIndicator
                    autoComplete="off"
                    error={errors.senderName}
                  />
                  <TextField
                    type={"text"}
                    label="Payer Contract Number"
                    placeholder={"This is the contract number or tax identification number of the party" +
                      " accountable for the payment of delivery services in non-cash transactions."}
                    value={payerContractNumber}
                    onChange={(value) => setPayerContractNumber(value)}
                    requiredIndicator
                    autoComplete="off"
                    error={errors.payerContractNumber}
                  />
                  <TextField
                    type={"text"}
                    label="Company TIN"
                    placeholder={"The tax identification number or equivalent identifier (EDRPOU, TIN, NIP)" +
                      " for the sender's company."}
                    value={companyTin}
                    onChange={(value) => setCompanyTin(value)}
                    requiredIndicator
                    autoComplete="off"
                    error={errors.companyTin}
                  />
                  <Select
                    label="Country/region"
                    value={country}
                    options={novaCountryOptions}
                    onChange={(value) => {
                      setCountry(value);
                      if (value) {
                        setCityOptions([]);
                      }
                    }}
                    requiredIndicator
                    autoComplete="off"
                    error={errors.country}
                  />
                  <Autocomplete
                    options={cityOptions}
                    selected={selectedCity}
                    onSelect={updateCitySelection}
                    textField={cityTextField}
                  />
                  <TextField
                    type={"text"}
                    label="Address"
                    value={address}
                    onChange={(value) => setAddress(value)}
                    requiredIndicator
                    autoComplete="off"
                    error={errors.address}
                  />
                  <TextField
                    type={"text"}
                    label="Apartment, suite, etc."
                    value={apartment}
                    onChange={(value) => setApartment(value)}
                    requiredIndicator
                    autoComplete="off"
                    error={errors.apartment}
                  />
                  <TextField
                    type={"text"}
                    label="Postal code"
                    value={postalCode}
                    onChange={(value) => setPostalCode(value)}
                    requiredIndicator
                    autoComplete="off"
                    error={errors.postalCode}
                  />
                  <TextField
                    type={"text"}
                    label="Phone"
                    value={phone}
                    onChange={(value) => setPhone(value)}
                    requiredIndicator
                    autoComplete="off"
                    error={errors.phone}
                  />
                  <TextField
                    type={"email"}
                    label="Email"
                    value={email}
                    onChange={(value) => setEmail(value)}
                    requiredIndicator
                    autoComplete="off"
                    error={errors.email}
                  />
                  <TextField
                    type={"number"}
                    label="The parcel's width measured in millimeters"
                    value={width}
                    onChange={(value) => setWidth(value)}
                    requiredIndicator
                    autoComplete="off"
                    error={errors.width}
                  />
                  <TextField
                    type={"number"}
                    label="The parcel's length measured in millimeters"
                    value={length}
                    onChange={(value) => setLength(value)}
                    requiredIndicator
                    autoComplete="off"
                    error={errors.length}
                  />
                  <TextField
                    type={"number"}
                    label="The parcel's height measured in millimeters"
                    value={height}
                    onChange={(value) => setHeight(value)}
                    requiredIndicator
                    autoComplete="off"
                    error={errors.height}
                  />
                  {country && city && (
                    <Select
                      label="Do you want to send parcels from division?"
                      value={sendFromDivision ? 'yes' : 'no'}
                      options={[
                        { label: 'Yes', value: 'yes' },
                        { label: 'No', value: 'no' }
                      ]}
                      onChange={(value) => {
                        const isSendingFromDivision = value === 'yes';
                        setSendFromDivision(isSendingFromDivision);
                        if (isSendingFromDivision) {
                          fetchDivisionOptions(country, city);
                        }
                      }}
                      autoComplete="off"
                    />
                  )}
                  {sendFromDivision && (
                    <Select
                      label="Select Division"
                      value={division}
                      options={divisionOptions}
                      onChange={(value) => setDivision(value)}
                      autoComplete="off"
                    />
                  )}
                  <Button submit>Save Configuration</Button>
                </FormLayout>
              </Form>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
