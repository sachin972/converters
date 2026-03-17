/**
 * Tax bracket: (min, max] taxed at rate (percent).
 * Amount in bracket = min(income, max) - min; tax = amount * rate/100
 */
export interface TaxBracket {
  min: number
  max: number
  rate: number
}

export interface CountryTax {
  id: string
  name: string
  currency: string
  currencySymbol: string
  /** Brackets in local currency (annual income) */
  brackets: TaxBracket[]
  /** Default salary range for slider [min, max] in local currency */
  salaryRange: [number, number]
}

export const COUNTRIES: CountryTax[] = [
  {
    id: 'IN',
    name: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    salaryRange: [0, 50_00_000],
    brackets: [
      { min: 0, max: 3_00_000, rate: 0 },
      { min: 3_00_000, max: 7_00_000, rate: 5 },
      { min: 7_00_000, max: 10_00_000, rate: 10 },
      { min: 10_00_000, max: 12_00_000, rate: 15 },
      { min: 12_00_000, max: 15_00_000, rate: 20 },
      { min: 15_00_000, max: Number.POSITIVE_INFINITY, rate: 30 },
    ],
  },
  {
    id: 'US',
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    salaryRange: [0, 500_000],
    brackets: [
      { min: 0, max: 11_600, rate: 10 },
      { min: 11_600, max: 47_150, rate: 12 },
      { min: 47_150, max: 100_525, rate: 22 },
      { min: 100_525, max: 191_950, rate: 24 },
      { min: 191_950, max: 243_725, rate: 32 },
      { min: 243_725, max: 609_350, rate: 35 },
      { min: 609_350, max: Number.POSITIVE_INFINITY, rate: 37 },
    ],
  },
  {
    id: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    salaryRange: [0, 300_000],
    brackets: [
      { min: 0, max: 12_570, rate: 0 },
      { min: 12_570, max: 50_270, rate: 20 },
      { min: 50_270, max: 125_140, rate: 40 },
      { min: 125_140, max: Number.POSITIVE_INFINITY, rate: 45 },
    ],
  },
  {
    id: 'CA',
    name: 'Canada',
    currency: 'CAD',
    currencySymbol: 'C$',
    salaryRange: [0, 400_000],
    brackets: [
      { min: 0, max: 55_867, rate: 15 },
      { min: 55_867, max: 111_733, rate: 20.5 },
      { min: 111_733, max: 173_205, rate: 26 },
      { min: 173_205, max: 246_752, rate: 29.32 },
      { min: 246_752, max: Number.POSITIVE_INFINITY, rate: 33 },
    ],
  },
  {
    id: 'AU',
    name: 'Australia',
    currency: 'AUD',
    currencySymbol: 'A$',
    salaryRange: [0, 400_000],
    brackets: [
      { min: 0, max: 18_200, rate: 0 },
      { min: 18_200, max: 45_000, rate: 19 },
      { min: 45_000, max: 135_000, rate: 32.5 },
      { min: 135_000, max: 190_000, rate: 37 },
      { min: 190_000, max: Number.POSITIVE_INFINITY, rate: 45 },
    ],
  },
  {
    id: 'DE',
    name: 'Germany',
    currency: 'EUR',
    currencySymbol: '€',
    salaryRange: [0, 300_000],
    brackets: [
      { min: 0, max: 11_604, rate: 0 },
      { min: 11_604, max: 66_760, rate: 14 },
      { min: 66_760, max: 277_825, rate: 42 },
      { min: 277_825, max: Number.POSITIVE_INFINITY, rate: 45 },
    ],
  },
  {
    id: 'FR',
    name: 'France',
    currency: 'EUR',
    currencySymbol: '€',
    salaryRange: [0, 300_000],
    brackets: [
      { min: 0, max: 11_294, rate: 0 },
      { min: 11_294, max: 28_797, rate: 11 },
      { min: 28_797, max: 82_341, rate: 30 },
      { min: 82_341, max: 177_106, rate: 41 },
      { min: 177_106, max: Number.POSITIVE_INFINITY, rate: 45 },
    ],
  },
  {
    id: 'SG',
    name: 'Singapore',
    currency: 'SGD',
    currencySymbol: 'S$',
    salaryRange: [0, 500_000],
    brackets: [
      { min: 0, max: 20_000, rate: 0 },
      { min: 20_000, max: 30_000, rate: 2 },
      { min: 30_000, max: 40_000, rate: 3.5 },
      { min: 40_000, max: 80_000, rate: 7 },
      { min: 80_000, max: 120_000, rate: 11.5 },
      { min: 120_000, max: 160_000, rate: 15 },
      { min: 160_000, max: 200_000, rate: 18 },
      { min: 200_000, max: 320_000, rate: 19 },
      { min: 320_000, max: Number.POSITIVE_INFINITY, rate: 22 },
    ],
  },
  {
    id: 'AE',
    name: 'UAE',
    currency: 'AED',
    currencySymbol: 'د.إ',
    salaryRange: [0, 1_000_000],
    brackets: [{ min: 0, max: Number.POSITIVE_INFINITY, rate: 0 }],
  },
  {
    id: 'JP',
    name: 'Japan',
    currency: 'JPY',
    currencySymbol: '¥',
    salaryRange: [0, 20_000_000],
    brackets: [
      { min: 0, max: 1_950_000, rate: 5 },
      { min: 1_950_000, max: 3_300_000, rate: 10 },
      { min: 3_300_000, max: 6_950_000, rate: 20 },
      { min: 6_950_000, max: 9_000_000, rate: 23 },
      { min: 9_000_000, max: 18_000_000, rate: 33 },
      { min: 18_000_000, max: 40_000_000, rate: 40 },
      { min: 40_000_000, max: Number.POSITIVE_INFINITY, rate: 45 },
    ],
  },
]

/** Calculate income tax from brackets (progressive). */
export function calculateTaxFromBrackets(income: number, brackets: TaxBracket[]): number {
  if (income <= 0) return 0
  let tax = 0
  for (const { min, max, rate } of brackets) {
    const taxableInBracket = Math.min(income, max) - min
    if (taxableInBracket > 0) tax += (taxableInBracket * rate) / 100
  }
  return Math.round(tax * 100) / 100
}

export function getCountryByCurrency(currency: string): CountryTax | undefined {
  return COUNTRIES.find((c) => c.currency === currency)
}

export function getCountryById(id: string): CountryTax | undefined {
  return COUNTRIES.find((c) => c.id === id)
}
