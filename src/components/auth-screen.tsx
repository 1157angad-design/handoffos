import { Link, useNavigate } from '@tanstack/react-router'
import { AuthError, login, oauthLogin, signup } from '@netlify/identity'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Github, LoaderCircle, LockKeyhole, Mail } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Logo } from './logo'
import { useAuth } from '@/lib/auth'

export function AuthScreen({ mode }: { mode: 'login' | 'signup' }) {
  const navigate = useNavigate()
  const { user, loading: authLoading, callbackType, error: callbackError } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState(callbackError ?? '')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user && callbackType !== 'recovery') void navigate({ to: '/dashboard' })
  }, [user, callbackType, navigate])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage(''); setSuccess('')
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')
    try {
      if (mode === 'signup') {
        const name = String(data.get('name') ?? '').trim()
        const created = await signup(email, password, { full_name: name })
        if (created.confirmedAt) await navigate({ to: '/dashboard' })
        else setSuccess('Account created. Check your email to verify your address, then return here to continue.')
      } else {
        await login(email, password)
        await navigate({ to: '/dashboard' })
      }
    } catch (error) {
      if (error instanceof AuthError) {
        setMessage(error.status === 401 ? 'The email or password is incorrect.' : error.status === 422 ? 'An account already exists for this email. Try signing in instead.' : error.message)
      } else setMessage('Authentication could not be completed. Please try again.')
    } finally { setLoading(false) }
  }

  if (authLoading) return <AuthLoading />
  return <main className="auth-page"><section className="auth-brand"><Link to="/" className="back-link"><ArrowLeft /> Back to HandoffOS</Link><div className="auth-brand-content"><Logo /><span className="kicker">SEAMLESS CONVERSATIONS. ZERO CONTEXT LOSS.</span><h1>{mode === 'login' ? 'Welcome back to the conversation layer.' : 'Build continuity into every customer interaction.'}</h1><p>Securely orchestrate AI and human work with complete context, observable delivery, and enterprise controls.</p><div className="auth-benefits"><span><Check /> Production-ready SDKs</span><span><Check /> Scoped API credentials</span><span><Check /> Real-time handoff observability</span></div></div><div className="auth-glow" /></section><section className="auth-panel"><div className="auth-card"><span className="auth-overline">{mode === 'login' ? 'SIGN IN' : 'CREATE WORKSPACE'}</span><h2>{mode === 'login' ? 'Continue to HandoffOS' : 'Start building with HandoffOS'}</h2><p>{mode === 'login' ? 'Access your projects, handoffs, and analytics.' : 'Your first 2,500 monthly handoffs are ready when you are.'}</p><div className="social-buttons"><button onClick={() => oauthLogin('google')}><GoogleIcon /> Continue with Google</button><button onClick={() => oauthLogin('github')}><Github /> Continue with GitHub</button></div><div className="divider"><span>OR CONTINUE WITH EMAIL</span></div><form onSubmit={submit}>{mode === 'signup' && <label>Full name<input name="name" autoComplete="name" required placeholder="Alex Morgan" /></label>}<label>Work email<div className="input-icon"><Mail /><input name="email" type="email" autoComplete="email" required placeholder="you@company.com" /></div></label><label>Password<div className="input-icon"><LockKeyhole /><input name="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} required placeholder="At least 8 characters" /><button type="button" className="reveal" onClick={() => setShowPassword((value) => !value)} aria-label="Show password">{showPassword ? <EyeOff /> : <Eye />}</button></div></label>{mode === 'login' && <div className="form-meta"><label><input type="checkbox" defaultChecked /> Keep me signed in</label><Link to="/forgot-password">Forgot password?</Link></div>}{message && <div className="auth-error">{message}</div>}{success && <div className="auth-success">{success}</div>}<button className="button button--primary auth-submit" disabled={loading}>{loading ? <LoaderCircle className="spin" /> : <>{mode === 'login' ? 'Sign in securely' : 'Create my workspace'} <ArrowRight /></>}</button></form><p className="auth-switch">{mode === 'login' ? <>New to HandoffOS? <Link to="/signup">Create an account</Link></> : <>Already have an account? <Link to="/login">Sign in</Link></>}</p><small>By continuing, you agree to the Terms of Service and Privacy Policy.</small></div></section></main>
}

function AuthLoading() { return <main className="auth-loading"><Logo /><LoaderCircle className="spin" /><p>Securing your HandoffOS session…</p></main> }
function GoogleIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.3Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a5.8 5.8 0 0 1-5.5-4H3.2v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.9V7.5H3.2a10 10 0 0 0 0 9.2L6.5 14Z"/><path fill="#EA4335" d="M12 6.1c1.6 0 3 .5 4.1 1.6l3.1-3A10 10 0 0 0 3.2 7.5l3.3 2.6a5.8 5.8 0 0 1 5.5-4Z"/></svg> }
