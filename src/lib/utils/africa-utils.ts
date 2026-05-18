import { AFRICAN_COUNTRIES, AfricanCountry } from '../constants/africa';

/**
 * Gets the currency for a given country code (ISO 3166-1 alpha-2)
 */
export const getCurrencyByCountry = (countryCode: string): string => {
  const country = AFRICAN_COUNTRIES.find(c => c.code.toUpperCase() === countryCode.toUpperCase());
  return country ? country.currency : 'USD';
};

/**
 * Gets the country object by currency code (ISO 4217)
 */
export const getCountryByCurrency = (currencyCode: string): AfricanCountry | undefined => {
  return AFRICAN_COUNTRIES.find(c => c.currency.toUpperCase() === currencyCode.toUpperCase());
};

/**
 * Gets all supported African currencies as a unique list
 */
export const getSupportedAfricanCurrencies = (): string[] => {
  return Array.from(new Set(AFRICAN_COUNTRIES.map(c => c.currency))).sort();
};

/**
 * Formats a currency amount with its native symbol if available, otherwise fallback to ISO code
 */
export const formatAfricanCurrency = (amount: number, currencyCode: string, locale: string = 'en-US'): string => {
  const country = getCountryByCurrency(currencyCode);
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol',
    }).format(amount);
  } catch {
    const symbol = country ? country.currencySymbol : currencyCode;
    return `${symbol} ${amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

/**
 * Validates an African bank account number format (basic length check for now)
 */
export const validateAfricanBankAccount = (accountNumber: string, countryCode: string): boolean => {
  const clean = accountNumber.replace(/\s/g, '');
  if (!/^\d+$/.test(clean)) return false;

  switch (countryCode.toUpperCase()) {
    case 'NG': return clean.length === 10; // NUBAN
    case 'ZA': return clean.length >= 7 && clean.length <= 11;
    case 'KE': return clean.length >= 8 && clean.length <= 14;
    default: return clean.length >= 5 && clean.length <= 20;
  }
};
