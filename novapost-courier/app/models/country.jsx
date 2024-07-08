export const novaCountryOptions = [
  { label: '-Select-', value: '' },
  { label: 'Czech Republic', value: 'CZ' },
  { label: 'Germany', value: 'DE' },
  { label: 'Estonia', value: 'EE' },
  { label: 'Spain', value: 'ES' },
  { label: 'France', value: 'FR' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'Hungary', value: 'HU' },
  { label: 'Italy', value: 'IT' },
  { label: 'Lithuania', value: 'LT' },
  { label: 'Latvia', value: 'LV' },
  { label: 'Moldova', value: 'MD' },
  { label: 'Poland', value: 'PL' },
  { label: 'Romania', value: 'RO' },
  { label: 'Slovakia', value: 'SK' },
  { label: 'Ukraine', value: 'UA' },
];

export const validateCountryCodes = (countryCodes) => {
  const allowedCountryCodes = novaCountryOptions.map(option => option.value).filter(value => value);

  const codes = countryCodes.split(',');
  for (let code of codes) {
    if (!allowedCountryCodes.includes(code.trim())) {
      return false;
    }
  }
  return true;
};
