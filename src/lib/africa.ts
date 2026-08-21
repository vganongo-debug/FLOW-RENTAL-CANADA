/**
 * Continental reference data for Flow Rentals OS.
 * Source of truth for the 54 African countries + the markets Flow
 * is live / piloting / prospecting in.
 */

export interface AfricanCountry {
  /** ISO 3166-1 alpha-2 */
  code: string
  name: string
  capital: string
  primaryCurrency: string
  region: 'North' | 'West' | 'Central' | 'East' | 'Southern'
  primaryLanguage: 'EN' | 'FR' | 'AR' | 'PT' | 'OTHER'
  taxName: string
  taxRate: number
  authority: string
  exportFormat: string
  flag: string
}

/**
 * All 54 African countries plus disputed Western Sahara.
 * Tax data is best-effort and serves as form defaults — operators can override.
 */
export const AFRICA: AfricanCountry[] = [
  { code: 'DZ', name: 'Algeria',                          capital: 'Algiers',        primaryCurrency: 'DZD', region: 'North',    primaryLanguage: 'AR',    taxName: 'TVA',     taxRate: 19,   authority: 'DGI',        exportFormat: 'DGI-TVA',  flag: '🇩🇿' },
  { code: 'AO', name: 'Angola',                           capital: 'Luanda',         primaryCurrency: 'AOA', region: 'Central',  primaryLanguage: 'PT',    taxName: 'IVA',     taxRate: 14,   authority: 'AGT',        exportFormat: 'AGT-IVA',  flag: '🇦🇴' },
  { code: 'BJ', name: 'Benin',                            capital: 'Porto-Novo',     primaryCurrency: 'XOF', region: 'West',     primaryLanguage: 'FR',    taxName: 'TVA',     taxRate: 18,   authority: 'DGI Bénin',  exportFormat: 'DGI-TVA',  flag: '🇧🇯' },
  { code: 'BW', name: 'Botswana',                         capital: 'Gaborone',       primaryCurrency: 'BWP', region: 'Southern', primaryLanguage: 'EN',    taxName: 'VAT',     taxRate: 14,   authority: 'BURS',       exportFormat: 'BURS-VAT', flag: '🇧🇼' },
  { code: 'BF', name: 'Burkina Faso',                     capital: 'Ouagadougou',    primaryCurrency: 'XOF', region: 'West',     primaryLanguage: 'FR',    taxName: 'TVA',     taxRate: 18,   authority: 'DGI BF',     exportFormat: 'DGI-TVA',  flag: '🇧🇫' },
  { code: 'BI', name: 'Burundi',                          capital: 'Gitega',         primaryCurrency: 'BIF', region: 'East',     primaryLanguage: 'FR',    taxName: 'TVA',     taxRate: 18,   authority: 'OBR',        exportFormat: 'OBR-TVA',  flag: '🇧🇮' },
  { code: 'CV', name: 'Cabo Verde',                       capital: 'Praia',          primaryCurrency: 'CVE', region: 'West',     primaryLanguage: 'PT',    taxName: 'IVA',     taxRate: 15,   authority: 'DNRE',       exportFormat: 'DNRE-IVA', flag: '🇨🇻' },
  { code: 'CM', name: 'Cameroon',                         capital: 'Yaoundé',        primaryCurrency: 'XAF', region: 'Central',  primaryLanguage: 'FR',    taxName: 'TVA',     taxRate: 19.25, authority: 'DGI Cameroun', exportFormat: 'DGI-TVA', flag: '🇨🇲' },
  { code: 'CF', name: 'Central African Republic',         capital: 'Bangui',         primaryCurrency: 'XAF', region: 'Central',  primaryLanguage: 'FR',    taxName: 'TVA',     taxRate: 19,   authority: 'DGID',       exportFormat: 'DGID-TVA', flag: '🇨🇫' },
  { code: 'TD', name: 'Chad',                             capital: "N'Djamena",      primaryCurrency: 'XAF', region: 'Central',  primaryLanguage: 'FR',    taxName: 'TVA',     taxRate: 18,   authority: 'DGI Tchad',  exportFormat: 'DGI-TVA',  flag: '🇹🇩' },
  { code: 'KM', name: 'Comoros',                          capital: 'Moroni',         primaryCurrency: 'KMF', region: 'East',     primaryLanguage: 'AR',    taxName: 'TVA',     taxRate: 10,   authority: 'AGID',       exportFormat: 'AGID-TVA', flag: '🇰🇲' },
  { code: 'CG', name: 'Congo (Brazzaville)',              capital: 'Brazzaville',    primaryCurrency: 'XAF', region: 'Central',  primaryLanguage: 'FR',    taxName: 'TVA',     taxRate: 18.9, authority: 'DGI Congo',  exportFormat: 'DGI-TVA',  flag: '🇨🇬' },
  { code: 'CD', name: 'Congo (DRC)',                      capital: 'Kinshasa',       primaryCurrency: 'CDF', region: 'Central',  primaryLanguage: 'FR',    taxName: 'TVA',     taxRate: 16,   authority: 'DGI RDC',    exportFormat: 'DGI-TVA',  flag: '🇨🇩' },
  { code: 'CI', name: "Côte d'Ivoire",                    capital: 'Yamoussoukro',   primaryCurrency: 'XOF', region: 'West',     primaryLanguage: 'FR',    taxName: 'TVA',     taxRate: 18,   authority: 'DGI CI',     exportFormat: 'DGI-TVA',  flag: '🇨🇮' },
  { code: 'DJ', name: 'Djibouti',                         capital: 'Djibouti',       primaryCurrency: 'DJF', region: 'East',     primaryLanguage: 'FR',    taxName: 'TVA',     taxRate: 10,   authority: 'DGI',        exportFormat: 'DGI-TVA',  flag: '🇩🇯' },
  { code: 'EG', name: 'Egypt',                            capital: 'Cairo',          primaryCurrency: 'EGP', region: 'North',    primaryLanguage: 'AR',    taxName: 'VAT',     taxRate: 14,   authority: 'ETA',        exportFormat: 'ETA-VAT',  flag: '🇪🇬' },
  { code: 'GQ', name: 'Equatorial Guinea',                capital: 'Malabo',         primaryCurrency: 'XAF', region: 'Central',  primaryLanguage: 'OTHER', taxName: 'IVA',     taxRate: 15,   authority: 'DGI',        exportFormat: 'DGI-IVA',  flag: '🇬🇶' },
  { code: 'ER', name: 'Eritrea',                          capital: 'Asmara',         primaryCurrency: 'ERN', region: 'East',     primaryLanguage: 'OTHER', taxName: 'Sales Tax', taxRate: 5,  authority: 'IRD',        exportFormat: 'IRD',      flag: '🇪🇷' },
  { code: 'SZ', name: 'Eswatini',                         capital: 'Mbabane',        primaryCurrency: 'SZL', region: 'Southern', primaryLanguage: 'EN',    taxName: 'VAT',     taxRate: 15,   authority: 'ERS',        exportFormat: 'ERS-VAT',  flag: '🇸🇿' },
  { code: 'ET', name: 'Ethiopia',                         capital: 'Addis Ababa',    primaryCurrency: 'ETB', region: 'East',     primaryLanguage: 'OTHER', taxName: 'VAT',     taxRate: 15,   authority: 'MoR',        exportFormat: 'MoR-VAT',  flag: '🇪🇹' },
  { code: 'GA', name: 'Gabon',                            capital: 'Libreville',     primaryCurrency: 'XAF', region: 'Central',  primaryLanguage: 'FR',    taxName: 'TVA',     taxRate: 18,   authority: 'DGI Gabon',  exportFormat: 'DGI-TVA',  flag: '🇬🇦' },
  { code: 'GM', name: 'Gambia',                           capital: 'Banjul',         primaryCurrency: 'GMD', region: 'West',     primaryLanguage: 'EN',    taxName: 'VAT',     taxRate: 15,   authority: 'GRA',        exportFormat: 'GRA-VAT',  flag: '🇬🇲' },
  { code: 'GH', name: 'Ghana',                            capital: 'Accra',          primaryCurrency: 'GHS', region: 'West',     primaryLanguage: 'EN',    taxName: 'VAT',     taxRate: 15,   authority: 'GRA',        exportFormat: 'GRA-VAT',  flag: '🇬🇭' },
  { code: 'GN', name: 'Guinea',                           capital: 'Conakry',        primaryCurrency: 'GNF', region: 'West',     primaryLanguage: 'FR',    taxName: 'TVA',     taxRate: 18,   authority: 'DGI Guinée', exportFormat: 'DGI-TVA',  flag: '🇬🇳' },
  { code: 'GW', name: 'Guinea-Bissau',                    capital: 'Bissau',         primaryCurrency: 'XOF', region: 'West',     primaryLanguage: 'PT',    taxName: 'IVA',     taxRate: 19,   authority: 'DGCI',       exportFormat: 'DGCI-IVA', flag: '🇬🇼' },
  { code: 'KE', name: 'Kenya',                            capital: 'Nairobi',        primaryCurrency: 'KES', region: 'East',     primaryLanguage: 'EN',    taxName: 'VAT',     taxRate: 16,   authority: 'KRA',        exportFormat: 'KRA-VAT3', flag: '🇰🇪' },
  { code: 'LS', name: 'Lesotho',                          capital: 'Maseru',         primaryCurrency: 'LSL', region: 'Southern', primaryLanguage: 'EN',    taxName: 'VAT',     taxRate: 15,   authority: 'LRA',        exportFormat: 'LRA-VAT',  flag: '🇱🇸' },
  { code: 'LR', name: 'Liberia',                          capital: 'Monrovia',       primaryCurrency: 'LRD', region: 'West',     primaryLanguage: 'EN',    taxName: 'GST',     taxRate: 10,   authority: 'LRA',        exportFormat: 'LRA-GST',  flag: '🇱🇷' },
  { code: 'LY', name: 'Libya',                            capital: 'Tripoli',        primaryCurrency: 'LYD', region: 'North',    primaryLanguage: 'AR',    taxName: 'Stamp Duty', taxRate: 2, authority: 'GTA',        exportFormat: 'GTA-SD',   flag: '🇱🇾' },
  { code: 'MG', name: 'Madagascar',                       capital: 'Antananarivo',   primaryCurrency: 'MGA', region: 'East',     primaryLanguage: 'FR',    taxName: 'TVA',     taxRate: 20,   authority: 'DGI Mada',   exportFormat: 'DGI-TVA',  flag: '🇲🇬' },
  { code: 'MW', name: 'Malawi',                           capital: 'Lilongwe',       primaryCurrency: 'MWK', region: 'Southern', primaryLanguage: 'EN',    taxName: 'VAT',     taxRate: 16.5, authority: 'MRA',        exportFormat: 'MRA-VAT',  flag: '🇲🇼' },
  { code: 'ML', name: 'Mali',                             capital: 'Bamako',         primaryCurrency: 'XOF', region: 'West',     primaryLanguage: 'FR',    taxName: 'TVA',     taxRate: 18,   authority: 'DGI Mali',   exportFormat: 'DGI-TVA',  flag: '🇲🇱' },
  { code: 'MR', name: 'Mauritania',                       capital: 'Nouakchott',     primaryCurrency: 'MRU', region: 'West',     primaryLanguage: 'AR',    taxName: 'TVA',     taxRate: 16,   authority: 'DGI',        exportFormat: 'DGI-TVA',  flag: '🇲🇷' },
  { code: 'MU', name: 'Mauritius',                        capital: 'Port Louis',     primaryCurrency: 'MUR', region: 'East',     primaryLanguage: 'EN',    taxName: 'VAT',     taxRate: 15,   authority: 'MRA',        exportFormat: 'MRA-VAT',  flag: '🇲🇺' },
  { code: 'MA', name: 'Morocco',                          capital: 'Rabat',          primaryCurrency: 'MAD', region: 'North',    primaryLanguage: 'AR',    taxName: 'TVA',     taxRate: 20,   authority: 'DGI Maroc',  exportFormat: 'DGI-TVA',  flag: '🇲🇦' },
  { code: 'MZ', name: 'Mozambique',                       capital: 'Maputo',         primaryCurrency: 'MZN', region: 'Southern', primaryLanguage: 'PT',    taxName: 'IVA',     taxRate: 17,   authority: 'AT',         exportFormat: 'AT-IVA',   flag: '🇲🇿' },
  { code: 'NA', name: 'Namibia',                          capital: 'Windhoek',       primaryCurrency: 'NAD', region: 'Southern', primaryLanguage: 'EN',    taxName: 'VAT',     taxRate: 15,   authority: 'NamRA',      exportFormat: 'NamRA-VAT',flag: '🇳🇦' },
  { code: 'NE', name: 'Niger',                            capital: 'Niamey',         primaryCurrency: 'XOF', region: 'West',     primaryLanguage: 'FR',    taxName: 'TVA',     taxRate: 19,   authority: 'DGI Niger',  exportFormat: 'DGI-TVA',  flag: '🇳🇪' },
  { code: 'NG', name: 'Nigeria',                          capital: 'Abuja',          primaryCurrency: 'NGN', region: 'West',     primaryLanguage: 'EN',    taxName: 'VAT',     taxRate: 7.5,  authority: 'FIRS',       exportFormat: 'FIRS-VAT', flag: '🇳🇬' },
  { code: 'RW', name: 'Rwanda',                           capital: 'Kigali',         primaryCurrency: 'RWF', region: 'East',     primaryLanguage: 'EN',    taxName: 'VAT',     taxRate: 18,   authority: 'RRA',        exportFormat: 'RRA-VAT',  flag: '🇷🇼' },
  { code: 'ST', name: 'São Tomé and Príncipe',            capital: 'São Tomé',       primaryCurrency: 'STN', region: 'Central',  primaryLanguage: 'PT',    taxName: 'IVA',     taxRate: 15,   authority: 'DGI',        exportFormat: 'DGI-IVA',  flag: '🇸🇹' },
  { code: 'SN', name: 'Senegal',                          capital: 'Dakar',          primaryCurrency: 'XOF', region: 'West',     primaryLanguage: 'FR',    taxName: 'TVA',     taxRate: 18,   authority: 'DGID',       exportFormat: 'DGID-TVA', flag: '🇸🇳' },
  { code: 'SC', name: 'Seychelles',                       capital: 'Victoria',       primaryCurrency: 'SCR', region: 'East',     primaryLanguage: 'EN',    taxName: 'VAT',     taxRate: 15,   authority: 'SRC',        exportFormat: 'SRC-VAT',  flag: '🇸🇨' },
  { code: 'SL', name: 'Sierra Leone',                     capital: 'Freetown',       primaryCurrency: 'SLE', region: 'West',     primaryLanguage: 'EN',    taxName: 'GST',     taxRate: 15,   authority: 'NRA',        exportFormat: 'NRA-GST',  flag: '🇸🇱' },
  { code: 'SO', name: 'Somalia',                          capital: 'Mogadishu',      primaryCurrency: 'SOS', region: 'East',     primaryLanguage: 'AR',    taxName: 'Sales Tax', taxRate: 5, authority: 'IRD',       exportFormat: 'IRD',      flag: '🇸🇴' },
  { code: 'ZA', name: 'South Africa',                     capital: 'Pretoria',       primaryCurrency: 'ZAR', region: 'Southern', primaryLanguage: 'EN',    taxName: 'VAT',     taxRate: 15,   authority: 'SARS',       exportFormat: 'SARS-VAT', flag: '🇿🇦' },
  { code: 'SS', name: 'South Sudan',                      capital: 'Juba',           primaryCurrency: 'SSP', region: 'East',     primaryLanguage: 'EN',    taxName: 'Sales Tax', taxRate: 18, authority: 'NRA',       exportFormat: 'NRA-ST',   flag: '🇸🇸' },
  { code: 'SD', name: 'Sudan',                            capital: 'Khartoum',       primaryCurrency: 'SDG', region: 'North',    primaryLanguage: 'AR',    taxName: 'VAT',     taxRate: 17,   authority: 'TCA',        exportFormat: 'TCA-VAT',  flag: '🇸🇩' },
  { code: 'TZ', name: 'Tanzania',                         capital: 'Dodoma',         primaryCurrency: 'TZS', region: 'East',     primaryLanguage: 'EN',    taxName: 'VAT',     taxRate: 18,   authority: 'TRA',        exportFormat: 'TRA-VAT',  flag: '🇹🇿' },
  { code: 'TG', name: 'Togo',                             capital: 'Lomé',           primaryCurrency: 'XOF', region: 'West',     primaryLanguage: 'FR',    taxName: 'TVA',     taxRate: 18,   authority: 'OTR',        exportFormat: 'OTR-TVA',  flag: '🇹🇬' },
  { code: 'TN', name: 'Tunisia',                          capital: 'Tunis',          primaryCurrency: 'TND', region: 'North',    primaryLanguage: 'AR',    taxName: 'TVA',     taxRate: 19,   authority: 'DGI Tunisie',exportFormat: 'DGI-TVA',  flag: '🇹🇳' },
  { code: 'UG', name: 'Uganda',                           capital: 'Kampala',        primaryCurrency: 'UGX', region: 'East',     primaryLanguage: 'EN',    taxName: 'VAT',     taxRate: 18,   authority: 'URA',        exportFormat: 'URA-VAT3', flag: '🇺🇬' },
  { code: 'ZM', name: 'Zambia',                           capital: 'Lusaka',         primaryCurrency: 'ZMW', region: 'Southern', primaryLanguage: 'EN',    taxName: 'VAT',     taxRate: 16,   authority: 'ZRA',        exportFormat: 'ZRA-VAT',  flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe',                         capital: 'Harare',         primaryCurrency: 'ZWL', region: 'Southern', primaryLanguage: 'EN',    taxName: 'VAT',     taxRate: 15,   authority: 'ZIMRA',      exportFormat: 'ZIMRA-VAT',flag: '🇿🇼' },
]

export function countryByCode(code: string): AfricanCountry | undefined {
  return AFRICA.find((c) => c.code === code)
}

export const COUNTRY_OPTIONS = AFRICA.map((c) => ({ value: c.code, label: `${c.flag} ${c.name}` }))

/**
 * Operating-presence labels for sample data:
 *   live      — Flow is actively trading
 *   pilot     — soft launch, limited inventory
 *   prospect  — signed LOI or in market entry diligence
 *   future    — strategic target, no commitments yet
 */
export type OperatingStatus = 'live' | 'pilot' | 'prospect' | 'future'

export const MARKET_STATUS: Record<string, OperatingStatus> = {
  CG: 'live',
  UG: 'live',
  ET: 'live',
  KE: 'pilot',
  SN: 'pilot',
  RW: 'pilot',
  NG: 'prospect',
  CI: 'prospect',
  GH: 'prospect',
  MA: 'prospect',
  CM: 'prospect',
  ZA: 'prospect',
  TZ: 'prospect',
  CD: 'prospect',
  GA: 'prospect',
}

/**
 * USD-base FX rates for operating currencies (subset of all African currencies).
 * Extend this map when adding new live markets so formatCurrency() works there.
 */
export const OPERATING_CURRENCIES: { code: string; symbol: string; ratePerUsd: number }[] = [
  { code: 'USD', symbol: '$',   ratePerUsd: 1 },          // continental settlement currency
  { code: 'XAF', symbol: 'F.CFA', ratePerUsd: 600 },      // Central African CFA franc
  { code: 'XOF', symbol: 'F.CFA', ratePerUsd: 600 },      // West African CFA franc
  { code: 'UGX', symbol: 'USh', ratePerUsd: 3700 },
  { code: 'ETB', symbol: 'Br',  ratePerUsd: 56 },
  { code: 'KES', symbol: 'KSh', ratePerUsd: 130 },
  { code: 'NGN', symbol: '₦',   ratePerUsd: 1500 },
  { code: 'ZAR', symbol: 'R',   ratePerUsd: 18 },
  { code: 'GHS', symbol: '₵',   ratePerUsd: 12 },
  { code: 'MAD', symbol: 'DH',  ratePerUsd: 10 },
  { code: 'EGP', symbol: 'E£',  ratePerUsd: 48 },
  { code: 'RWF', symbol: 'FRw', ratePerUsd: 1350 },
]
