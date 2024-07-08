-- CreateTable
CREATE TABLE "NovapostConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop_domain" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "company_tin" TEXT NOT NULL,
    "payer_contract_number" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "division_id" TEXT,
    "address" TEXT NOT NULL,
    "apartment" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "length" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NovapostDivision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "division_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "settlement_id" INTEGER,
    "settlement_name" TEXT,
    "region_id" INTEGER,
    "region_name" TEXT,
    "parent_id" INTEGER,
    "parent_name" TEXT,
    "address" TEXT,
    "address_postalCode" TEXT,
    "address_building" TEXT,
    "address_street" TEXT,
    "address_city" TEXT,
    "address_region" TEXT,
    "address_note" TEXT,
    "address_block" TEXT,
    "number" TEXT,
    "status" TEXT,
    "divisionCategory" TEXT,
    "externalId" TEXT,
    "source" TEXT,
    "countryCode" TEXT,
    "maxWeightPlaceSender" INTEGER,
    "maxLengthPlaceSender" INTEGER,
    "maxWidthPlaceSender" INTEGER,
    "maxHeightPlaceSender" INTEGER,
    "maxWeightPlaceRecipient" INTEGER,
    "maxLengthPlaceRecipient" INTEGER,
    "maxWidthPlaceRecipient" INTEGER,
    "maxHeightPlaceRecipient" INTEGER,
    "maxCostPlace" TEXT,
    "maxDeclaredCostPlace" TEXT,
    "settings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NovapostShipment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop_domain" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "scheduled_delivery_date" TEXT,
    "status" TEXT,
    "cost" REAL,
    "parcels_amount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NovapostShipment_shop_domain_fkey" FOREIGN KEY ("shop_domain") REFERENCES "NovapostConfig" ("shop_domain") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "NovapostConfig_shop_domain_key" ON "NovapostConfig"("shop_domain");

-- CreateIndex
CREATE UNIQUE INDEX "NovapostConfig_api_key_key" ON "NovapostConfig"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "NovapostDivision_division_id_key" ON "NovapostDivision"("division_id");

-- CreateIndex
CREATE UNIQUE INDEX "NovapostShipment_order_id_key" ON "NovapostShipment"("order_id");
