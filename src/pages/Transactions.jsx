import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { subscribeTransactions, addTransaction, updateTransaction, deleteTransaction } from '../services/transactions'
import { CATS, SOURCES, METHODS, today } from '../utils/constants'
import { formatMoney, toCSV } from '../utils/finance'
import { inp, btn, page } from '../components/ui'
export default function Transactions({ type }) {
  const { user } = useAuth(), isExp = type === 'expense', cats = isExp ? CATS : SOURCES
  const blank = { title:'', amount:'', category:cats[0], date:today(), paymentMethod:'Cash', notes:'' }
  const [all, setAll] = useState([]), [f, setF] = useState(blank), [editId, setEditId] = useState(null), [msg, setMsg] = useState('')
  const [q, setQ] = useState(''), [cat, setCat] = useState(''), [from, setFrom] = useState(''), [to, setTo] = useState(''), [sort, setSort] = useState('date-desc')
  useEffect(() => subscribeTransactions(user.uid, setAll, e => setMsg('Load failed: ' + e.message)), [user.uid])
  const rows = useMemo(() => all.filter(t => t.type === type && (!q || (t.title + (t.notes||'')).toLowerCase().includes(q.toLowerCase())) && (!cat || t.category === cat)
    && (!from || t.date >= from) && (!to || t.date <= to)).sort((a,b) => ({ 'date-desc':b.date.localeCompare(a.date), 'date-asc':a.date.localeCompare(b.date), 'amt-desc':b.amount-a.amount, 'amt-asc':a.amount-b.amount })[sort]), [all,type,q,cat,from,to,sort])
  const save = async (e) => { e.preventDefault()
    if (!f.title.trim() || !(Number(f.amount) > 0) || !f.date) return setMsg('Enter a title, an amount above 0 and a date.')
    try { const d = { ...f, title:f.title.trim(), type }
      editId ? await updateTransaction(editId, user.uid, d) : await addTransaction(user.uid, d)
      setMsg(editId ? 'Updated' : 'Added'); setF(blank); setEditId(null) } catch (x) { setMsg('Save failed: ' + x.message) } }
  const del = async (id) => { if (!window.confirm('Delete this entry?')) return
    try { await deleteTransaction(id); setMsg('Deleted') } catch (x) { setMsg('Delete failed: ' + x.message) } }
  const csv = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([toCSV(rows)],{type:'text/csv'})); a.download = `${type}s.csv`; a.click() }
  const set = k => e => setF({ ...f, [k]: e.target.value })
  return <div className={page}>
    <h1 className="text-2xl font-semibold">{isExp ? 'Expenses' : 'Income'}</h1>
    <form onSubmit={save} className="flex flex-wrap gap-2">
      <input className={inp} placeholder="Title" value={f.title} onChange={set('title')}/>
      <input className={inp} type="number" min="0.01" step="0.01" placeholder="Amount" value={f.amount} onChange={set('amount')}/>
      <select className={inp} value={f.category} onChange={set('category')}>{cats.map(c => <option key={c}>{c}</option>)}</select>
      <input className={inp} type="date" value={f.date} onChange={set('date')}/>
      {isExp && <select className={inp} value={f.paymentMethod} onChange={set('paymentMethod')}>{METHODS.map(c => <option key={c}>{c}</option>)}</select>}
      <input className={inp} placeholder="Notes" value={f.notes} onChange={set('notes')}/>
      <button className={btn}>{editId ? 'Update' : 'Add'}</button>
      {editId && <button type="button" className={inp} onClick={() => { setEditId(null); setF(blank) }}>Cancel</button>}</form>
    {msg && <p className="text-sm">{msg}</p>}
    <div className="flex flex-wrap gap-2">
      <input className={inp} placeholder="Search" value={q} onChange={e=>setQ(e.target.value)}/>
      <select className={inp} value={cat} onChange={e=>setCat(e.target.value)}><option value="">All {isExp ? 'categories' : 'sources'}</option>{cats.map(c => <option key={c}>{c}</option>)}</select>
      <input className={inp} type="date" value={from} onChange={e=>setFrom(e.target.value)}/><input className={inp} type="date" value={to} onChange={e=>setTo(e.target.value)}/>
      <select className={inp} value={sort} onChange={e=>setSort(e.target.value)}><option value="date-desc">Newest</option><option value="date-asc">Oldest</option><option value="amt-desc">Highest amount</option><option value="amt-asc">Lowest amount</option></select>
      <button className={inp} onClick={csv}>Export CSV</button></div>
    <ul className="divide-y divide-slate-200 dark:divide-slate-800">
      {rows.length === 0 && <li className="py-8 text-slate-500">Nothing here yet. Add your first {type} above.</li>}
      {rows.map(t => <li key={t.id} className="py-2 flex justify-between gap-2"><span>{t.title}<span className="block text-xs text-slate-500">{t.category} · {t.date}{t.paymentMethod && isExp ? ' · ' + t.paymentMethod : ''}</span></span>
        <span className="whitespace-nowrap">{formatMoney(t.amount)}
          <button className="text-xs ml-2 text-emerald-600" onClick={() => { setEditId(t.id); setF({ title:t.title, amount:t.amount, category:t.category, date:t.date, paymentMethod:t.paymentMethod||'Cash', notes:t.notes||'' }) }}>Edit</button>
          <button className="text-xs ml-2 text-red-500" onClick={() => del(t.id)}>Delete</button></span></li>)}</ul></div>
}
