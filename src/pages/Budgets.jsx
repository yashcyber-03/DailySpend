import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { subscribe, upsert, remove } from '../services/db'
import { subscribeTransactions } from '../services/transactions'
import { CATS } from '../utils/constants'
import { utilization, remainingBudget, budgetStatus, formatMoney } from '../utils/finance'
import { inp, btn, page } from '../components/ui'
const COLOR = { normal:'bg-emerald-500', warning:'bg-amber-500', exceeded:'bg-red-500' }
export default function Budgets() {
  const { user } = useAuth()
  const [ym, setYm] = useState(new Date().toISOString().slice(0,7)), [budgets, setBudgets] = useState([]), [tx, setTx] = useState([])
  const [cat, setCat] = useState('overall'), [amt, setAmt] = useState(''), [msg, setMsg] = useState('')
  useEffect(() => { const a = subscribe('budgets', user.uid, setBudgets, e => setMsg(e.message)), b = subscribeTransactions(user.uid, setTx, e => setMsg(e.message)); return () => { a(); b() } }, [user.uid])
  const [year, month] = ym.split('-').map(Number)
  const spentIn = c => tx.filter(t => t.type === 'expense' && t.date.slice(0,7) === ym && (c === 'overall' || t.category === c)).reduce((s,t) => s + Number(t.amount), 0)
  const list = budgets.filter(b => b.year === year && b.month === month).sort((a,b) => (a.category === 'overall' ? -1 : a.category.localeCompare(b.category)))
  const save = async (e) => { e.preventDefault()
    if (!(Number(amt) >= 0) || amt === '') return setMsg('Enter a valid amount.')
    try { await upsert('budgets', `${user.uid}_${ym}_${cat}`, user.uid, { category:cat, amount:Number(amt), month, year }); setAmt(''); setMsg('Budget saved') } catch (x) { setMsg('Save failed: ' + x.message) } }
  const del = async (id) => { if (window.confirm('Delete this budget?')) try { await remove('budgets', id) } catch (x) { setMsg('Delete failed: ' + x.message) } }
  return <div className={page}>
    <div className="flex flex-wrap justify-between gap-2"><h1 className="text-2xl font-semibold">Budgets</h1><input className={inp} type="month" value={ym} onChange={e => setYm(e.target.value)}/></div>
    <form onSubmit={save} className="flex flex-wrap gap-2">
      <select className={inp} value={cat} onChange={e => setCat(e.target.value)}><option value="overall">Overall monthly</option>{CATS.map(c => <option key={c}>{c}</option>)}</select>
      <input className={inp} type="number" min="0" step="0.01" placeholder="Budget amount" value={amt} onChange={e => setAmt(e.target.value)}/>
      <button className={btn}>Save budget</button></form>
    {msg && <p className="text-sm">{msg}</p>}
    {list.length === 0 && <p className="text-slate-500 py-8">No budgets for this month. Set one above; setting the same category again edits it.</p>}
    <div className="grid md:grid-cols-2 gap-4">{list.map(b => { const spent = spentIn(b.category), pct = utilization(spent, b.amount), st = budgetStatus(pct)
      return <div key={b.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
        <div className="flex justify-between"><b>{b.category === 'overall' ? 'Overall' : b.category}</b><button className="text-xs text-red-500" onClick={() => del(b.id)}>Delete</button></div>
        <div className="h-2 rounded bg-slate-200 dark:bg-slate-800"><div className={`h-2 rounded ${COLOR[st]}`} style={{ width: Math.min(pct,100) + '%' }}/></div>
        <p className="text-sm">{formatMoney(spent)} of {formatMoney(b.amount)} · {pct.toFixed(0)}% · {st === 'exceeded' ? 'Over by ' + formatMoney(-remainingBudget(b.amount, spent)) : formatMoney(remainingBudget(b.amount, spent)) + ' left'}</p></div> })}</div></div>
}
