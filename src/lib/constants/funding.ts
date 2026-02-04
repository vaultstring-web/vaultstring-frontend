import { Wallet, Smartphone, Building, CreditCard, LucideIcon } from 'lucide-react';

export interface FundingOption {
  value: string;
  label: string;
  channel: string;
  icon: LucideIcon;
}

export const getFundingOptions = (currency: string, walletBalance: number): FundingOption[] => {
  const balLabel = `VaultString Wallet (${walletBalance.toFixed(2)} ${currency})`;
  
  if (currency === 'MWK') {
    return [
      { value: 'wallet_balance', label: balLabel, channel: 'wallet', icon: Wallet },
      { value: 'airtel_money', label: 'Airtel Money', channel: 'mobile_money', icon: Smartphone },
      { value: 'tnm_mpamba', label: 'TNM Mpamba', channel: 'mobile_money', icon: Smartphone },
      { value: 'nbm', label: 'National Bank of Malawi', channel: 'bank', icon: Building },
      { value: 'standard_bank_mw', label: 'Standard Bank Malawi', channel: 'bank', icon: Building },
      { value: 'fdh_bank', label: 'FDH Bank', channel: 'bank', icon: Building },
      { value: 'nbs_bank', label: 'NBS Bank', channel: 'bank', icon: Building },
      { value: 'first_capital_bank', label: 'First Capital Bank', channel: 'bank', icon: Building },
      { value: 'ecobank_mw', label: 'Ecobank Malawi', channel: 'bank', icon: Building },
      { value: 'visa_mastercard', label: 'Visa/Mastercard', channel: 'card', icon: CreditCard },
    ];
  }
  
  if (currency === 'CNY') {
    return [
      { value: 'wallet_balance', label: balLabel, channel: 'wallet', icon: Wallet },
      { value: 'alipay', label: 'Alipay', channel: 'mobile_money', icon: Smartphone },
      { value: 'wechat_pay', label: 'WeChat Pay', channel: 'mobile_money', icon: Smartphone },
      { value: 'icbc', label: 'ICBC', channel: 'bank', icon: Building },
      { value: 'ccb', label: 'China Construction Bank', channel: 'bank', icon: Building },
      { value: 'boc', label: 'Bank of China', channel: 'bank', icon: Building },
      { value: 'abc', label: 'Agricultural Bank of China', channel: 'bank', icon: Building },
      { value: 'cmb', label: 'China Merchants Bank', channel: 'bank', icon: Building },
      { value: 'unionpay_card', label: 'UnionPay Card', channel: 'card', icon: CreditCard },
    ];
  }

  if (currency === 'ZMW') {
    return [
      { value: 'wallet_balance', label: balLabel, channel: 'wallet', icon: Wallet },
      { value: 'airtel_money_zm', label: 'Airtel Money Zambia', channel: 'mobile_money', icon: Smartphone },
      { value: 'mtn_money_zm', label: 'MTN Mobile Money', channel: 'mobile_money', icon: Smartphone },
      { value: 'zamtel_money', label: 'Zamtel Money', channel: 'mobile_money', icon: Smartphone },
      { value: 'zanaco', label: 'Zanaco', channel: 'bank', icon: Building },
      { value: 'stanbic_zm', label: 'Stanbic Bank Zambia', channel: 'bank', icon: Building },
      { value: 'absa_zm', label: 'ABSA Zambia', channel: 'bank', icon: Building },
      { value: 'atlas_mara', label: 'Atlas Mara', channel: 'bank', icon: Building },
      { value: 'visa_mastercard', label: 'Visa/Mastercard', channel: 'card', icon: CreditCard },
    ];
  }

  return [
    { value: 'wallet_balance', label: 'VaultString Wallet', channel: 'wallet', icon: Wallet },
    { value: 'visa_mastercard', label: 'Visa/Mastercard', channel: 'card', icon: CreditCard },
    { value: 'wire_transfer', label: 'Bank Wire Transfer', channel: 'bank', icon: Building },
  ];
};

export const getPayoutOptions = (targetCurrency: string): FundingOption[] => {
  if (targetCurrency === 'CNY') {
    return [
      { value: 'wallet_topup_cny', label: 'Wallet Top-up (CNY)', channel: 'wallet', icon: Wallet },
      { value: 'alipay', label: 'Alipay', channel: 'mobile_money', icon: Smartphone },
      { value: 'wechat_pay', label: 'WeChat Pay', channel: 'mobile_money', icon: Smartphone },
      { value: 'icbc', label: 'ICBC', channel: 'bank', icon: Building },
      { value: 'ccb', label: 'China Construction Bank', channel: 'bank', icon: Building },
      { value: 'boc', label: 'Bank of China', channel: 'bank', icon: Building },
      { value: 'abc', label: 'Agricultural Bank of China', channel: 'bank', icon: Building },
      { value: 'cmb', label: 'China Merchants Bank', channel: 'bank', icon: Building },
    ];
  }
  if (targetCurrency === 'MWK') {
    return [
      { value: 'wallet_topup_mwk', label: 'Wallet Top-up (MWK)', channel: 'wallet', icon: Wallet },
      { value: 'airtel_money', label: 'Airtel Money', channel: 'mobile_money', icon: Smartphone },
      { value: 'tnm_mpamba', label: 'TNM Mpamba', channel: 'mobile_money', icon: Smartphone },
      { value: 'nbm', label: 'National Bank of Malawi', channel: 'bank', icon: Building },
      { value: 'standard_bank_mw', label: 'Standard Bank Malawi', channel: 'bank', icon: Building },
      { value: 'fdh_bank', label: 'FDH Bank', channel: 'bank', icon: Building },
      { value: 'nbs_bank', label: 'NBS Bank', channel: 'bank', icon: Building },
    ];
  }
  if (targetCurrency === 'ZMW') {
    return [
      { value: 'wallet_topup_zmw', label: 'Wallet Top-up (ZMW)', channel: 'wallet', icon: Wallet },
      { value: 'airtel_money_zm', label: 'Airtel Money Zambia', channel: 'mobile_money', icon: Smartphone },
      { value: 'mtn_money_zm', label: 'MTN Mobile Money', channel: 'mobile_money', icon: Smartphone },
      { value: 'zamtel_money', label: 'Zamtel Money', channel: 'mobile_money', icon: Smartphone },
      { value: 'zanaco', label: 'Zanaco', channel: 'bank', icon: Building },
      { value: 'stanbic_zm', label: 'Stanbic Bank Zambia', channel: 'bank', icon: Building },
      { value: 'absa_zm', label: 'ABSA Zambia', channel: 'bank', icon: Building },
    ];
  }
  return [
    { value: 'wire_transfer', label: 'Bank Wire Transfer', channel: 'bank', icon: Building },
    { value: 'visa_mastercard', label: 'Visa/Mastercard', channel: 'card', icon: CreditCard },
  ];
};
