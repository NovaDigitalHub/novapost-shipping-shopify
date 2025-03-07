// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  console.log('__________FROM_DELIVERY____');
  console.log(input);
  const configuration = JSON.parse(
    input?.deliveryCustomization?.metafield?.value ?? "{}"
  );

  return NO_CHANGES;
};
