import { Link } from 'react-router-dom'
import '../App.css'

const currentYear = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <p className="footer-copy">
          © {currentYear} <Link to="/data" className="footer-logo">Converters</Link>. All rights reserved.
        </p>
        <p className="footer-tagline">
          Free online tools for JSON, images, PDF, calculators & more.
        </p>
      </div>
    </footer>
  )
}
