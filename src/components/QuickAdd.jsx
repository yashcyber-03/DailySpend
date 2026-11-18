import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { addTransaction, updateTransaction } from '../services/transactions'
import { CATS, SOURCES, METHODS, today } from '../utils/constants'
import { inp, btn, EASE } from './ui'
const blank = type => ({ type, title:'', amount:'', category:(type === 'expense' ? CATS : SOURCES)[0], date:today(), paymentMethod:'UPI', notes:'' })
const symbol = () => (0).toLocaleString('en-IN', { style:'currency', currency:localStorage.getItem('currency') || 'INR', minimumFractionDigits:0 }).replace(/[\d.,\s]/g, '')
export default function QuickAdd({ open, onClose, editing }) {
  const { user } = useAuth()
  const [f, setF] = useState(blank('expense')), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => { if (!open) return; setErr('')
    setF(editing ? { type:editing.type, title:editing.title, amount:editing.amount, category:editing.category, date:editing.date, paymentMethod:editing.paymentMethod || 'UPI', notes:editing.notes || '' } : blank('expense'))
    const esc = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', esc); return () => window.removeEventListener('keydown', esc) }, [open, editing])
  const cats = f.type === 'expense' ? CATS : SOURCES
  const chip = on => `rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${on ? 'bg-[#3DD68C] text-black' : 'bg-slate-100 dark:bg-[#272727]'}`
  const save = async (e) => { e.preventDefault()
    if (!(Number(f.amount) > 0)) return setErr('Enter an amount above 0.')
    setBusy(true); setErr('')
    try { const d = { ...f, title:f.title.trim() || f.category, paymentMethod:f.type === 'expense' ? f.paymentMethod : '' }
      editing ? await updateTransaction(editing.id, user.uid, d) : await addTransaction(user.uid, d); onClose() }
    catch (x) { setErr('Could not save. ' + x.message) } finally { setBusy(false) } }
  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 md:items-center" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.3 }} onClick={onClose}>
    <motion.form role="dialog" aria-modal="true" aria-label={editing ? 'Edit transaction' : 'Add transaction'} onSubmit={save} onClick={e => e.stopPropagation()} initial={{ y:48, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:48, opacity:0 }} transition={{ duration:0.4, ease:EASE }}
      className="w-full max-w-md space-y-4 rounded-t-2xl border border-slate-200 bg-white p-5 text-slate-900 dark:border-[#313131] dark:bg-[#1F1F1F] dark:text-white md:rounded-2xl">
      <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">{editing ? 'Edit' : 'Add'} {f.type}</h2>
        <div className="flex items-center gap-2">{!editing && <div role="group" aria-label="Type" className="flex gap-1 rounded-xl border border-slate-200 p-1 dark:border-[#313131]">
          {['expense', 'income'].map(t => <button type="button" key={t} aria-pressed={f.type === t} onClick={() => setF({ ...blank(t), amount:f.amount, title:f.title })} className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize ${f.type === t ? 'bg-slate-100 dark:bg-[#313131]' : 'text-slate-500 dark:text-[#9B9B9B]'}`}>{t}</button>)}</div>}
          <button type="button" aria-label="Close" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 dark:text-[#9B9B9B]"><X size={18} /></button></div></div>
      <div className="flex items-center justify-center gap-1 py-2"><span className="text-2xl text-slate-500 dark:text-[#9B9B9B]">{symbol()}</span>
        <input autoFocus type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="0" aria-label="Amount" value={f.amount} onChange={e => setF({ ...f, amount:e.target.value })} className="w-44 bg-transparent text-center text-4xl font-semibold outline-none" /></div>
      <input className={inp + ' w-full'} placeholder={f.type === 'expense' ? 'What was it for? (optional)' : 'Title (optional)'} value={f.title} onChange={e => setF({ ...f, title:e.target.value })} />
      <div className="flex flex-wrap gap-2" role="group" aria-label="Category">{cats.map(c => <button type="button" key={c} aria-pressed={f.category === c} className={chip(f.category === c)} onClick={() => setF({ ...f, category:c })}>{c}</button>)}</div>
      {f.type === 'expense' && <div className="flex flex-wrap gap-2" role="group" aria-label="Payment method">{METHODS.map(m => <button type="button" key={m} aria-pressed={f.paymentMethod === m} className={chip(f.paymentMethod === m)} onClick={() => setF({ ...f, paymentMethod:m })}>{m}</button>)}</div>}
      <div className="flex gap-2"><input className={inp + ' w-40'} type="date" aria-label="Date" value={f.date} onChange={e => setF({ ...f, date:e.target.value })} /><input className={inp + ' min-w-0 flex-1'} placeholder="Notes (optional)" value={f.notes} onChange={e => setF({ ...f, notes:e.target.value })} /></div>
      {err && <p className="text-sm text-[#FF8A7A]">{err}</p>}
      <button disabled={busy} className={btn + ' w-full py-3'}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Save ' + f.type}</button>
    </motion.form></motion.div>}</AnimatePresence>
}
