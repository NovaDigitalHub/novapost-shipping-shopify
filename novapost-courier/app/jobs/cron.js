import cron from 'node-cron';
import db from "../db.server";
import { createReadStream, createWriteStream, unlinkSync } from 'fs';
import { pipeline } from "stream";
import { promisify } from "util";
import zlib from "zlib";
import { parse } from 'JSONStream';

const divisionsSync = async () => {
  console.log('Start syncing divisions');
  const pipelineAsync = promisify(pipeline);
  const baseVersionUrl = "https://api-cdn.novapost.com//dictionary//divisions//mobile//full//en//base.json.gz";

  try {
    const localFilePath = "/tmp/divisions_base.json.gz";

    const downloadResponse = await fetch(baseVersionUrl);
    const fileStream = createWriteStream(localFilePath);
    await pipelineAsync(downloadResponse.body, fileStream);

    const decompressedStream = createReadStream(localFilePath).pipe(zlib.createGunzip());
    const jsonParser = parse('items.*');

    await pipelineAsync(
      decompressedStream,
      jsonParser,
      async function* (data) {
        for await (const divisionData of data) {
          const rowData = {
            division_id: divisionData.id,
            name: divisionData.name ?? null,
            shortName: divisionData.shortName ?? null,
            settlement_id: divisionData.settlement?.id ?? null,
            settlement_name: divisionData.settlement?.name ?? null,
            region_id: divisionData.region?.id ?? null,
            region_name: divisionData.region?.name ?? null,
            parent_id: divisionData.parent?.id ?? null,
            parent_name: divisionData.parent?.name ?? null,
            address: divisionData.address ?? null,
            address_postalCode: divisionData.addressParts?.postalCode ?? null,
            address_building: divisionData.addressParts?.building ?? null,
            address_street: divisionData.addressParts?.street ?? null,
            address_city: divisionData.addressParts?.city ?? null,
            address_region: divisionData.addressParts?.region ?? null,
            address_note: divisionData.addressParts?.note ?? null,
            address_block: divisionData.addressParts?.block ?? null,
            number: divisionData.number ?? null,
            status: divisionData.status ?? null,
            divisionCategory: divisionData.divisionCategory ?? null,
            externalId: divisionData.externalId ?? null,
            source: divisionData.source ?? null,
            countryCode: divisionData.countryCode ?? null,
            maxWeightPlaceSender: divisionData.maxWeightPlaceSender ?? null,
            maxLengthPlaceSender: divisionData.maxLengthPlaceSender ?? null,
            maxWidthPlaceSender: divisionData.maxWidthPlaceSender ?? null,
            maxHeightPlaceSender: divisionData.maxHeightPlaceSender ?? null,
            maxWeightPlaceRecipient: divisionData.maxWeightPlaceRecipient ?? null,
            maxLengthPlaceRecipient: divisionData.maxLengthPlaceRecipient ?? null,
            maxWidthPlaceRecipient: divisionData.maxWidthPlaceRecipient ?? null,
            maxHeightPlaceRecipient: divisionData.maxHeightPlaceRecipient ?? null,
            maxCostPlace: divisionData.maxCostPlace.toString() ?? null,
            maxDeclaredCostPlace: divisionData.maxDeclaredCostPlace.toString() ?? null,
            settings: JSON.stringify(divisionData.settings) ?? null,
          };

          await db.novapostDivision.upsert({
            where: { division_id: divisionData.id },
            update: rowData,
            create: rowData,
          });
        }
      }
    );

    unlinkSync(localFilePath);
    console.log('Divisions sync successfully');
  } catch (error) {
    console.error('Error syncing divisions:', error);
  }
};

export const scheduleCronJobs = () => {
  console.log('Scheduling cron jobs...');
  cron.schedule('35 21 * * *', async () => {
    console.log('Running a task every day at 06:20 AM');
    await divisionsSync();
  });
};
