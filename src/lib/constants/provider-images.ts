/**
 * Provider logos for deposit / linked-account UI.
 * my-wallet referenced PNGs under /images/; originals are not in the repo — SVG placeholders live in public/images/.
 */
export const PROVIDER_IMAGE_URLS: Record<string, string> = {
  airtel_money: '/images/airtel-money.svg',
  airtel_money_zm: '/images/airtel-money.svg',
  airtel_money_ke: '/images/airtel-money.svg',
  tnm_mpamba: '/images/tnm-mpamba.svg',
  nbm: '/images/national-bank.svg',
};

export function getProviderImageUrl(sourceId: string): string | undefined {
  return PROVIDER_IMAGE_URLS[sourceId];
}
