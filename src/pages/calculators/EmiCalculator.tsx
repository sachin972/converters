import { useState, useCallback, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { calculateEmi, formatMoney, type EmiResult } from '../../utils/emiCalculator'
import '../../App.css'
import './EmiCalculator.css'

const EMI_PIE_COLORS = ['#3fb950', '#f85149'] // principal, interest
const RATE_MIN = 0
const RATE_MAX = 30
const RATE_STEP = 0.5
const TENURE_MIN = 1
const TENURE_MAX = 30
const TENURE_STEP = 1

export function EmiCalculator() {
  const [principal, setPrincipal] = useState('')
  const [annualRate, setAnnualRate] = useState(10.5)
  const [tenureYears, setTenureYears] = useState(20)
  const [result, setResult] = useState<EmiResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR')

  const handleCalculate = useCallback(() => {
    setError(null)
    const p = parseFloat(principal.replace(/,/g, ''))

    if (Number.isNaN(p) || p <= 0) {
      setError('Enter a valid loan amount.')
      setResult(null)
      return
    }

    const tenureMonths = Math.round(tenureYears * 12)
    setResult(
      calculateEmi({
        principal: p,
        annualRatePercent: annualRate,
        tenureMonths,
      })
    )
  }, [principal, annualRate, tenureYears])

  const emiPieData = useMemo(() => {
    if (!result || result.totalPayment <= 0) return []
    return [
      { name: 'Principal', value: Math.round(result.principal) },
      { name: 'Total interest', value: Math.round(result.totalInterest) },
    ].filter((d) => d.value > 0)
  }, [result])

  return (
    <div className="app">
      <header className="header">
        <h1>Loan EMI Calculator</h1>
        <p className="tagline">Calculate monthly EMI, total payment and interest</p>
      </header>

      <main className="main emi-calc-main">
        <section className="panel emi-calc-input">
          <div className="panel-header">
            <h2>Loan details</h2>
          </div>
          <div className="emi-calc-form">
            <label className="emi-field">
              <span className="emi-label">Currency</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'INR' | 'USD')}
                className="emi-select"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
              </select>
            </label>
            <label className="emi-field">
              <span className="emi-label">Loan amount (principal)</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder={currency === 'INR' ? 'e.g. 50,00,000' : 'e.g. 100000'}
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="emi-input"
              />
            </label>
            <label className="emi-field">
              <span className="emi-label">Annual interest rate: {annualRate}%</span>
              <div className="emi-slider-wrap">
                <input
                  type="range"
                  min={RATE_MIN}
                  max={RATE_MAX}
                  step={RATE_STEP}
                  value={annualRate}
                  onChange={(e) => setAnnualRate(Number(e.target.value))}
                  className="emi-slider"
                  aria-label="Annual interest rate"
                />
                <div className="emi-slider-labels">
                  <span>{RATE_MIN}%</span>
                  <span>{RATE_MAX}%</span>
                </div>
              </div>
            </label>
            <label className="emi-field">
              <span className="emi-label">Tenure: {tenureYears} years</span>
              <div className="emi-slider-wrap">
                <input
                  type="range"
                  min={TENURE_MIN}
                  max={TENURE_MAX}
                  step={TENURE_STEP}
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="emi-slider"
                  aria-label="Loan tenure in years"
                />
                <div className="emi-slider-labels">
                  <span>{TENURE_MIN} yr</span>
                  <span>{TENURE_MAX} yr</span>
                </div>
              </div>
            </label>
            {error && <p className="error">{error}</p>}
            <button type="button" className="btn btn-primary emi-btn" onClick={handleCalculate}>
              Calculate EMI
            </button>
          </div>
        </section>

        <section className="panel emi-calc-output">
          <div className="panel-header">
            <h2>Result</h2>
          </div>
          <div className="emi-result">
            {result ? (
              <>
                {emiPieData.length > 0 && (
                  <div className="emi-pie-wrap">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={emiPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {emiPieData.map((_, i) => (
                            <Cell key={i} fill={EMI_PIE_COLORS[i]} stroke="var(--surface)" strokeWidth={1} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatMoney(value, currency)}
                          contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                          labelStyle={{ color: 'var(--text)' }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: 12 }}
                          formatter={(value) => <span style={{ color: 'var(--text)' }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="emi-row emi-row-highlight">
                  <span>Monthly EMI</span>
                  <strong>{formatMoney(result.emi, currency)}</strong>
                </div>
                <hr className="emi-divider" />
                <div className="emi-row">
                  <span>Principal</span>
                  <span>{formatMoney(result.principal, currency)}</span>
                </div>
                <div className="emi-row">
                  <span>Total interest</span>
                  <span>{formatMoney(result.totalInterest, currency)}</span>
                </div>
                <div className="emi-row">
                  <span>Total payment</span>
                  <span>{formatMoney(result.totalPayment, currency)}</span>
                </div>
              </>
            ) : (
              <p className="placeholder">Enter loan amount, rate and tenure, then click Calculate EMI.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
