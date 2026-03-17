import { useState, useCallback, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { COUNTRIES } from '../../data/countryTax'
import type { CountryTax } from '../../data/countryTax'
import { calculateSalaryAfterTax, formatCurrency, formatSalaryDisplay, type SalaryResult } from '../../utils/salaryCalculator'
import '../../App.css'
import './SalaryCalculator.css'

const PIE_COLORS_TAX = '#f85149'
const PIE_COLORS_DEDUCTIONS = '#8b9cb3'
const PIE_COLORS_NET = '#3fb950'

const DEFAULT_CURRENCY = 'INR'

function getDefaultCountry(): CountryTax {
  return COUNTRIES.find((c) => c.currency === DEFAULT_CURRENCY) ?? COUNTRIES[0]
}

export function SalaryCalculator() {
  const defaultCountry = useMemo(getDefaultCountry, [])
  const [country, setCountry] = useState<CountryTax>(defaultCountry)
  const [grossAnnual, setGrossAnnual] = useState(() => {
    const [min, max] = defaultCountry.salaryRange
    return Math.round((min + max) / 2 / 10000) * 10000 || min + 10000
  })
  const [otherDeductions, setOtherDeductions] = useState('')
  const [result, setResult] = useState<SalaryResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [minSalary, maxSalary] = country.salaryRange
  const step = Math.max(1000, Math.round((maxSalary - minSalary) / 500))
  const sliderValue = Math.min(maxSalary, Math.max(minSalary, grossAnnual))

  const handleCountryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const c = COUNTRIES.find((x) => x.id === e.target.value)
    if (c) {
      setCountry(c)
      const [min, max] = c.salaryRange
      const stepForCountry = Math.max(1000, Math.round((max - min) / 500))
      const mid = Math.round((min + max) / 2 / stepForCountry) * stepForCountry || min + stepForCountry
      setGrossAnnual(Math.min(max, Math.max(min, mid)))
      setResult(null)
    }
    setError(null)
  }, [])

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value)
      setGrossAnnual(val)
      setError(null)
      setResult(null)
    },
    []
  )

  const handleSalaryInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/,/g, '')
      const num = parseFloat(raw)
      if (raw === '' || raw === '-') {
        setGrossAnnual(minSalary)
        return
      }
      if (!Number.isNaN(num) && num >= 0) {
        const clamped = Math.min(maxSalary, Math.max(minSalary, num))
        setGrossAnnual(clamped)
      }
      setError(null)
      setResult(null)
    },
    [minSalary, maxSalary]
  )

  const handleCalculate = useCallback(() => {
    setError(null)
    const deductions = parseFloat(otherDeductions.replace(/,/g, '')) || 0
    if (deductions < 0) {
      setError('Deductions cannot be negative.')
      setResult(null)
      return
    }
    setResult(
      calculateSalaryAfterTax({
        grossAnnual: sliderValue,
        country,
        otherDeductionsAnnual: deductions,
      })
    )
  }, [sliderValue, country, otherDeductions])

  const displaySalary = useMemo(() => formatSalaryDisplay(sliderValue, country.currency), [sliderValue, country.currency])

  const { pieData, pieColors } = useMemo(() => {
    if (!result) return { pieData: [] as { name: string; value: number }[], pieColors: [] as string[] }
    const items: { name: string; value: number; color: string }[] = [
      { name: 'Tax', value: Math.round(result.taxAmount), color: PIE_COLORS_TAX },
      { name: 'Net take-home', value: Math.round(result.netAnnual), color: PIE_COLORS_NET },
    ]
    if (result.otherDeductions > 0) {
      items.splice(1, 0, { name: 'Other deductions', value: Math.round(result.otherDeductions), color: PIE_COLORS_DEDUCTIONS })
    }
    const filtered = items.filter((d) => d.value > 0)
    return {
      pieData: filtered.map(({ name, value }) => ({ name, value })),
      pieColors: filtered.map((d) => d.color),
    }
  }, [result])

  return (
    <div className="app">
      <header className="header">
        <h1>Salary After Tax</h1>
        <p className="tagline">Estimate take-home pay by country — tax brackets applied automatically</p>
      </header>

      <main className="main salary-calc-main">
        <section className="panel salary-calc-input">
          <div className="panel-header">
            <h2>Inputs</h2>
          </div>
          <div className="salary-calc-form">
            <label className="salary-field">
              <span className="salary-label">Currency / Country</span>
              <select
                value={country.id}
                onChange={handleCountryChange}
                className="salary-select"
                aria-label="Select country and currency"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.currencySymbol} {c.currency} — {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="salary-field">
              <span className="salary-label">Gross salary (annual)</span>
              <div className="salary-slider-wrap">
                <input
                  type="range"
                  min={minSalary}
                  max={maxSalary}
                  step={step}
                  value={sliderValue}
                  onChange={handleSliderChange}
                  className="salary-slider"
                  aria-label="Gross annual salary"
                />
                <div className="salary-slider-labels">
                  <span>{formatSalaryDisplay(minSalary, country.currency)}</span>
                  <span>{formatSalaryDisplay(maxSalary, country.currency)}</span>
                </div>
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={displaySalary}
                onChange={handleSalaryInputChange}
                className="salary-input salary-input-inline"
                aria-label="Gross salary value"
              />
            </label>

            <label className="salary-field">
              <span className="salary-label">Other deductions (annual, optional)</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="e.g. 5000"
                value={otherDeductions}
                onChange={(e) => setOtherDeductions(e.target.value)}
                className="salary-input"
              />
            </label>
            <p className="salary-hint">e.g. 401k, health insurance, PF — in {country.currency}</p>
            {error && <p className="error">{error}</p>}
            <button type="button" className="btn btn-primary salary-btn" onClick={handleCalculate}>
              Calculate
            </button>
          </div>
        </section>

        <section className="panel salary-calc-output">
          <div className="panel-header">
            <h2>Take-home ({country.currency})</h2>
          </div>
          <div className="salary-result">
            {result ? (
              <>
                {pieData.length > 0 && (
                  <div className="salary-pie-wrap">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={pieColors[i] ?? PIE_COLORS_NET} stroke="var(--surface)" strokeWidth={1} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value, country.currency)}
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
                <div className="salary-row salary-row-net">
                  <span>Net (annual)</span>
                  <strong>{formatCurrency(result.netAnnual, country.currency)}</strong>
                </div>
                <div className="salary-row salary-row-net">
                  <span>Net (monthly)</span>
                  <strong>{formatCurrency(result.netMonthly, country.currency)}</strong>
                </div>
                <hr className="salary-divider" />
                <div className="salary-row">
                  <span>Gross (annual)</span>
                  <span>{formatCurrency(result.grossAnnual, country.currency)}</span>
                </div>
                <div className="salary-row">
                  <span>Tax</span>
                  <span>{formatCurrency(result.taxAmount, country.currency)}</span>
                </div>
                {result.otherDeductions > 0 && (
                  <div className="salary-row">
                    <span>Other deductions</span>
                    <span>{formatCurrency(result.otherDeductions, country.currency)}</span>
                  </div>
                )}
                <div className="salary-row">
                  <span>Effective tax rate</span>
                  <span>{result.effectiveTaxRate.toFixed(1)}%</span>
                </div>
                <p className="salary-disclaimer">Tax based on {country.name} brackets. For illustration only.</p>
              </>
            ) : (
              <p className="placeholder">Set salary with the bar, then click Calculate.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
