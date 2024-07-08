export const extractOrderId = (orderId) => {
  if (orderId && /\/(\d+)$/.test(orderId)) {
    const matches = orderId.match(/\/(\d+)$/);
    return matches ? parseInt(matches[1], 10) : null;
  }
  return null;
};

export const convertWeightToGrams = (weight, unit) => {
  if (weight === 0) {
    return 1000;
  }

  switch (unit) {
    case 'KILOGRAMS':
      return weight * 1000;
    case 'POUNDS':
      return weight * 453.592;
    case 'OUNCES':
      return weight * 28.3495;
    default:
      return weight;
  }
};
