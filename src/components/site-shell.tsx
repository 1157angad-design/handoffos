import { Link, useLocation } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Logo } from './logo'

const links = [
  ['Features', '/features'],
  ['Solutions', '/solutions'],
  ['Pricing', '/pricing'],
  ['Developers', '/developers'],
  ['Documentation', '/documentation'],
  ['Contact', '/contact'],
] as const

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  return (
    <header className="site-header">
      <div className="site-nav page-width">
        <Logo />
        <nav className={open ? 'nav-links nav-links--open' : 'nav-links'} aria-label="Primary navigation">
          {links.map(([label, to]) => <Link key={to} to={to} className={location.pathname === to ? 'active' : ''} onClick={() => setOpen(false)}>{label}</Link>)}
        </nav>
        <div className="nav-actions">
          <Link to="/login" className="button button--ghost">Log in</Link>
          <Link to="/signup" className="button button--primary">Start building <span>→</span></Link>
          <button className="menu-button" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-width footer-grid">
        <div><Logo /><p>Conversation continuity infrastructure for the agentic enterprise.</p><span className="system-status"><i /> All systems operational</span></div>
        <div><strong>Product</strong><Link to="/features">Features</Link><Link to="/pricing">Pricing</Link><Link to="/solutions">Solutions</Link></div>
        <div><strong>Developers</strong><Link to="/documentation">Documentation</Link><Link to="/developers">SDKs</Link><Link to="/developers">API status</Link></div>
        <div><strong>Company</strong><Link to="/contact">Contact</Link><Link to="/contact">Security</Link><Link to="/contact">Support</Link></div>
      </div>
      <div className="page-width footer-bottom"><span>© 2026 HandoffOS. Infrastructure for uninterrupted intelligence.</span><span>Privacy · Terms · DPA</span></div>
    </footer>
  )
}

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className="marketing"><SiteHeader />{children}<SiteFooter /></div>
}
