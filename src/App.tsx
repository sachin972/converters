import { useState, useEffect } from 'react'
import { Link, NavLink, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { RouteMeta } from './components/RouteMeta'
import { CompatibilityBanner } from './components/CompatibilityBanner'
import { Footer } from './components/Footer'
import { DataPage } from './pages/data/DataPage'
import { ImagesPage } from './pages/images/ImagesPage'
import { CalculatorsPage } from './pages/calculators/CalculatorsPage'
import { GeneratorsPage } from './pages/generators/GeneratorsPage'
import { FileConverterPage } from './pages/file-converter/FileConverterPage'
import './App.css'
import './AppLayout.css'

const PAGES = [
  { path: 'data', label: 'Data & text' },
  { path: 'images', label: 'Images' },
  { path: 'calculators', label: 'Calculators' },
  { path: 'generators', label: 'Generators' },
  { path: 'file-converter', label: 'File converter' },
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="layout">
      <RouteMeta />
      <nav className="nav" aria-label="Main navigation">
        <Link to="/data" className="nav-logo" onClick={() => setMenuOpen(false)}>
          Converters
        </Link>
        <button
          type="button"
          className="nav-toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-controls="nav-links"
        >
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
        </button>
        <div
          id="nav-links"
          className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}
        >
          {PAGES.map(({ path, label }) => (
            <NavLink
              key={path}
              to={`/${path}`}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
      <CompatibilityBanner />
      <main className="layout-content" id="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/data" replace />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/images" element={<ImagesPage />} />
          <Route path="/calculators" element={<CalculatorsPage />} />
          <Route path="/generators" element={<GeneratorsPage />} />
          <Route path="/file-converter" element={<FileConverterPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
