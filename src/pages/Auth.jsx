import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth, friendly } from '../context/AuthContext'
export default function Auth({ mode }) {
  const { user, login, register, resetPassword } = useAuth(), nav = useNavigate()
  const [f, setF] = useState({ name:'', email:'', password:'' }), [err, setErr] = useState(''), [info, setInfo] = useState(''), [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/" replace />
  const submit = async (e) => { e.preventDefault(); setErr(''); setInfo(''); setBusy(true)
    try {
      if (mode === 'login') { await login(f.email, f.password); nav('/') }
      else if (mode === 'register') { await register(f.name, f.email, f.password); nav('/') }
      else { await resetPassword(f.email); setInfo('Reset link sent. Check your inbox.') }
    } catch (x) { setErr(friendly(x)) } finally { setBusy(false) } }
  const inp = 'w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2'
  return <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4">
    <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
      <h1 className="text-2xl font-semibold">{mode==='login'?'Welcome back':mode==='register'?'Create account':'Reset password'}</h1>
      {mode==='register' && <input className={inp} placeholder="Name" required value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>}
      <input className={inp} type="email" placeholder="Email" required value={f.email} onChange={e=>setF({...f,email:e.target.value})}/>
      {mode!=='forgot' && <input className={inp} type="password" placeholder="Password" required minLength={6} value={f.password} onChange={e=>setF({...f,password:e.target.value})}/>}
      {err && <p className="text-sm text-red-500">{err}</p>}{info && <p className="text-sm text-emerald-600">{info}</p>}
      <button disabled={busy} className="w-full rounded-lg bg-emerald-600 text-white py-2 disabled:opacity-50">{busy?'Please wait…':'Continue'}</button>
      <div className="text-sm flex justify-between">{mode==='login'?<><Link to="/register">Register</Link><Link to="/forgot">Forgot password?</Link></>:<Link to="/login">Back to login</Link>}</div>
    </form></div>
}
