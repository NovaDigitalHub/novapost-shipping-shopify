# Novapost

Elevate your e-commerce shipping experience with the Nova Post shipping plugin. This versatile tool integrates seamlessly with your store, enabling you to create and manage shipments effortlessly. Whether shipping to home addresses or Nova Post divisions, this plugin ensures a smooth delivery process. 

## Key Features
- **Create Shipments**: Efficiently generate shipments directly from your store's backend, reducing manual entry and saving time.
- **Home Address and Division Delivery**: Offer flexible delivery options, including direct home delivery and division pick-up, catering to your customers' preferences.
- **Print Labels**: Simplify your packaging process with easy label printing in various formats.
- **Pickups Settings**: The plugin contains settings that allow you to pick up parcels by courier.
- **Custom Pricing**: Connect your own Nova Post account to access custom pricing tailored to your shipping needs.
- **Support for Multiple Destinations**: Ship your orders from your location to various countries, including the EU, UK.
- **Delivery Options**: Support for Nova Post Home Delivery, Service Point, and Postmachine, offering diverse delivery methods to suit your customers' needs.

## Requirements
1. Create a Shopify partner account if you don’t have one.
2. Create a Development store where you can install and test your app if you don’t have one.
3. In the Partner dashboard, create a new app. You’ll need this app’s API credentials during the setup process.
4. Download NGROK - a free service that makes it easy to host your app in development. Sign up for NGROK.

## Development
1. Clone the project and run `npm install`
2. Create `.env` from `.env.example`
3. Add the following environment variables from your Shopify App settings:
    - `SHOPIFY_APP_URL=<your app URL>`
    - `SHOPIFY_API_KEY=<your API key>`
    - `SHOPIFY_API_SECRET=<your API secret>`
    - `SCOPES=<scopes>`
4. Start NGROK and replace HOST with your NGROK URL.
5. In your Shopify App settings:
    - Set App URL to NGROK URL
    - Set Allowed redirection URL(s) to `<NGROK URL>/auth/callback`, for example: `https://1231231.ngrok.io/auth/callback`
    - You will need to update it every time you change NGROK URL.
6. Run `npm run dev`
7. Click Select store under Test your app in Shopify App settings.
8. This should prompt you to install the app in your development store and open it in an admin dashboard.

## Installation
### Steps
1. Clone the repository:
    ```bash
    git clone git@git.stfalcon.com:nova-poshta-global/np-shipping-shopify.git
    cd novapost
    cd novapost-courier
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Set up environment variables:
    - Create a `.env` file and configure necessary environment variables.
4. Run the app:
    ```bash
    npm run dev
    ```

## Usage
- **Development Mode**: `npm run dev`
- **Build the App**: `npm run build`
- **Start the App**: `npm run start`

## Configuration
Ensure the following environment variables are set in your `.env` file:
- `SHOPIFY_APP_URL`
- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SCOPES`

Admin Panel:
1. After app installation on the main page click the **“Enable Nova Post”** in the admin panel enter all **required information**. Also, click **“Enable Nova Post Courier”** on the main page of Nova Post Courrier app.
2. The next step is to configure **Store Checkout Settings**, info to set:
- “Select what contact method customers use to check out” – **“Email”**
- “Customer information” -> “Shipping address phone number” - **“Required”**
3. Click on the **“Customize”** button (checkout section) and select the **“Thank You”** page. **“Section”** tab on the left navigation bar, select the **nova-post-ui** block, and click **“Save”**.

## Dependencies
Refer to `package.json` for a complete list of dependencies.

## Support
For support, contact servicedesk@novapost.com.

## License
This project is licensed under the MIT License.