import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { subscribeTransactions, deleteTransaction } from '../services/transactions'
import { CATS, SOURCES } from '../utils/constants'
import { formatMoney, toCSV } from '../utils/finance'
import { inp, btn, page } from '../components/ui'
import QuickAdd from '../components/QuickAdd'
export default function Transactions() {
  const { user } = useAuth()
  const [all, setAll] = useState([]), [msg, setMsg] = useState(''), [type, setType] = useState(''), [q, setQ] = useState(''), [cat, setCat] = useState('')
  const [from, setFrom] = useState(''), [to, setTo] = useState(''), [sort, setSort] = useState('date-desc'), [edit, setEdit] = useState(null), [open, setOpen] = useState(false)
  useEffect(() => subscribeTransactions(user.uid, setAll, e => setMsg('Load failed: ' + e.message)), [user.uid])
  const cats = type === 'income' ? SOURCES : type === 'expense' ? CATS : [...new Set([...CATS, ...SOURCES])]
  const rows = useMemo(() => all.filter(t => (!type || t.type === type) && (!q || (t.title + (t.notes || '')).toLowerCase().includes(q.toLowerCase())) && (!cat || t.category === cat) && (!from || t.date >= from) && (!to || t.date <= to))
    .sort((a, b) => ({ 'date-desc':b.date.localeCompare(a.date), 'date-asc':a.date.localeCompare(b.date), 'amt-desc':b.amount - a.amount, 'amt-asc':a.amount - b.amount })[sort]), [all, type, q, cat, from, to, sort])
  const del = async (id) => { if (!window.confirm('Delete this entry?')) return; try { await deleteTransaction(id); setMsg('Deleted') } catch (x) { setMsg('Delete failed: ' + x.message) } }
  const csv = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([toCSV(rows)], { type:'text/csv' })); a.download = 'transactions.csv'; a.click() }
  const tab = k => `rounded-lg px-3 py-1.5 text-xs font-semibold ${type === k ? 'bg-slate-100 dark:bg-[#313131]' : 'text-slate-500 dark:text-[#9B9B9B]'}`
  return <div className={page}>
    <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-2xl font-semibold">All transactions</h1><button className={btn} onClick={() => { setEdit(null); setOpen(true) }}>Add</button></div>
    {msg && <p className="text-sm">{msg}</p>}
    <div className="flex flex-wrap gap-2">
      <div role="group" aria-label="Type" className="flex gap-1 rounded-xl border border-slate-200 p-1 dark:border-[#313131]">{[['', 'All'], ['expense', 'Expenses'], ['income', 'Income']].map(([k, l]) => <button key={k} className={tab(k)} aria-pressed={type === k} onClick={() => { setType(k); setCat('') }}>{l}</button>)}</div>
      <input className={inp} placeholder="Search" value={q} onChange={e => setQ(e.target.value)} />
      <select className={inp} value={cat} onChange={e => setCat(e.target.value)}><option value="">All categories</option>{cats.map(c => <option key={c}>{c}</option>)}</select>
      <input className={inp} type="date" aria-label="From" value={from} onChange={e => setFrom(e.target.value)} /><input className={inp} type="date" aria-label="To" value={to} onChange={e => setTo(e.target.value)} />
      <select className={inp} value={sort} onChange={e => setSort(e.target.value)}><option value="date-desc">Newest</option><option value="date-asc">Oldest</option><option value="amt-desc">Highest amount</option><option value="amt-asc">Lowest amount</option></select>
      <button className={inp} onClick={csv}>Export CSV</button></div>
    <ul className="divide-y divide-slate-200 dark:divide-[#313131]">
      {rows.length === 0 && <li className="py-8 text-slate-500 dark:text-[#9B9B9B]">Nothing here yet. Tap Add to create your first entry.</li>}
      {rows.map(t => <li key={t.id} className="flex items-center justify-between gap-2 py-2"><span className="min-w-0"><span className="block truncate">{t.title}</span><span className="block text-xs text-slate-500 dark:text-[#9B9B9B]">{t.category} · {t.date}{t.paymentMethod ? ' · ' + t.paymentMethod : ''}</span></span>
        <span className="whitespace-nowrap"><span className={t.type === 'income' ? 'text-emerald-600 dark:text-[#3DD68C]' : ''}>{t.type === 'income' ? '+' : '−'}{formatMoney(t.amount)}</span>
          <button className="ml-3 text-xs text-emerald-600 dark:text-[#3DD68C]" onClick={() => { setEdit(t); setOpen(true) }}>Edit</button><button className="ml-3 text-xs text-[#FF8A7A]" onClick={() => del(t.id)}>Delete</button></span></li>)}</ul>
    <QuickAdd open={open} editing={edit} onClose={() => setOpen(false)} />
  </div>
}
