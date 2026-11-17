import { useEffect, useState } from 'react'
import { updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { inp, btn, page } from '../components/ui'
export default function Settings() {
  const { user, logout } = useAuth(), [name, setName] = useState(user.displayName || ''), [cur, setCur] = useState(localStorage.getItem('currency') || 'INR'), [msg, setMsg] = useState('')
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'))
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('theme', dark ? 'dark' : 'light') }, [dark])
  const save = async (e) => { e.preventDefault(); if (!name.trim()) return setMsg('Name cannot be empty.')
    try { await updateProfile(auth.currentUser, { displayName: name.trim() }); await setDoc(doc(db, 'users', user.uid), { name: name.trim(), currency: cur }, { merge: true })
      localStorage.setItem('currency', cur); setMsg('Settings saved') } catch (x) { setMsg('Save failed: ' + x.message) } }
  return <div className={page + ' max-w-md'}><h1 className="text-2xl font-semibold">Settings</h1>
    <form onSubmit={save} className="space-y-3">
      <label className="block text-sm">Name<input className={inp + ' w-full'} value={name} onChange={e => setName(e.target.value)}/></label>
      <label className="block text-sm">Email<input className={inp + ' w-full opacity-60'} value={user.email} disabled/></label>
      <label className="block text-sm">Currency<select className={inp + ' w-full'} value={cur} onChange={e => setCur(e.target.value)}>{['INR','USD','EUR','GBP','AED','JPY'].map(c => <option key={c}>{c}</option>)}</select></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)}/>Dark theme</label>
      {msg && <p className="text-sm">{msg}</p>}<button className={btn}>Save</button></form>
    <p className="text-sm text-slate-500">Account created {user.metadata.creationTime}</p>
    <button className={inp} onClick={logout}>Logout</button></div>
}
