import type { CountryTax } from '../data/countryTax'
import { calculateTaxFromBrackets } from '../data/countryTax'

export interface SalaryInputs {
  grossAnnual: number
  country: CountryTax
  otherDeductionsAnnual: number
}

export interface SalaryResult {
  grossAnnual: number
  taxAmount: number
  otherDeductions: number
  netAnnual: number
  netMonthly: number
  effectiveTaxRate: number
}

export function calculateSalaryAfterTax(inputs: SalaryInputs): SalaryResult {
  const { grossAnnual, country, otherDeductionsAnnual } = inputs
  const taxAmount = calculateTaxFromBrackets(grossAnnual, country.brackets)
  const afterTax = grossAnnual - taxAmount
  const netAnnual = Math.max(0, afterTax - otherDeductionsAnnual)
  const netMonthly = netAnnual / 12
  const effectiveTaxRate = grossAnnual > 0 ? (taxAmount / grossAnnual) * 100 : 0

  return {
    grossAnnual,
    taxAmount,
    otherDeductions: otherDeductionsAnnual,
    netAnnual,
    netMonthly,
    effectiveTaxRate,
  }
}

export function formatCurrency(value: number, currency: string): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(value)
  }
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value)
}

/** Format large numbers with locale grouping (e.g. 50,00,000 for INR). */
export function formatSalaryDisplay(value: number, currency: string): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)
  }
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value)
}
