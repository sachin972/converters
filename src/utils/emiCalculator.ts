export interface EmiInputs {
  principal: number
  annualRatePercent: number
  tenureMonths: number
}

export interface EmiResult {
  emi: number
  totalPayment: number
  totalInterest: number
  principal: number
}

/**
 * EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 * P = principal, r = monthly rate (decimal), n = number of months
 */
export function calculateEmi(inputs: EmiInputs): EmiResult {
  const { principal, annualRatePercent, tenureMonths } = inputs
  if (principal <= 0 || tenureMonths <= 0) {
    return { emi: 0, totalPayment: 0, totalInterest: 0, principal: 0 }
  }
  const r = annualRatePercent / 12 / 100
  const n = tenureMonths
  let emi: number
  if (r === 0) {
    emi = principal / n
  } else {
    const factor = Math.pow(1 + r, n)
    emi = (principal * r * factor) / (factor - 1)
  }
  emi = Math.round(emi * 100) / 100
  const totalPayment = Math.round(emi * n * 100) / 100
  const totalInterest = Math.round((totalPayment - principal) * 100) / 100
  return {
    emi,
    totalPayment,
    totalInterest,
    principal,
  }
}

export function formatMoney(value: number, currency = 'INR'): string {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : undefined, {
    style: 'currency',
    currency: currency === 'INR' ? 'INR' : 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value)
}
