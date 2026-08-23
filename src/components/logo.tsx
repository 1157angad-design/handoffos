import { Link } from '@tanstack/react-router'

export function Logo({ compact = false, className = '' }: { compact?: boolean; className?: string }) {
  return (
    <Link to="/" className={`brand-logo ${compact ? 'brand-logo--compact' : ''} ${className}`} aria-label="HandoffOS home">
      <img src="/assets/handoffos-logo.jpeg" alt="HandoffOS" />
    </Link>
  )
}
