import { useState } from 'react'
import { motion } from 'framer-motion'
import { byCategory } from '../utils/finance'
import { card, EASE } from './ui'
const COLORS = { Food:'#FFAC7A', Groceries:'#9DEB8F', Transportation:'#8FD0F2', Shopping:'#E879A8', Entertainment:'#B57BF2', Education:'#6BB57B', Health:'#7CE0C3', 'Bills and Utilities':'#E6E68A', Travel:'#6B72D6', 'Personal Care':'#F2A6D6', Rent:'#8FA8F2', Other:'#8A8A8A',
  Salary:'#3DD68C', Freelancing:'#8FD0F2', Business:'#B57BF2', Investments:'#E6E68A', Allowance:'#FFAC7A', Gifts:'#E879A8' }
const R = 80, SW = 22, C = 2 * Math.PI * R, GAP = SW + 8
const cur = () => localStorage.getItem('currency') || 'INR'
const money = n => new Intl.NumberFormat('en-IN', { style:'currency', currency:cur(), maximumFractionDigits:0 }).format(n)
const compact = n => new Intl.NumberFormat('en-IN', { style:'currency', currency:cur(), notation:'compact', maximumFractionDigits:1 }).format(n)
export default function CategoryRing({ tx, i = 0 }) {
  const [type, setType] = useState('expense'), [active, setActive] = useState(null)
  const data = byCategory(tx, type).sort((a, b) => b.value - a.value)
  const total = data.reduce((s, d) => s + d.value, 0)
  let acc = 0
  const segs = data.map(d => { const arc = (d.value / total) * C, len = Math.max(0.1, arc - GAP), start = acc + GAP / 2; acc += arc; return { ...d, len, start, color:COLORS[d.name] || '#8A8A8A' } })
  const picked = data.find(d => d.name === active)
  const tab = k => `rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${type === k ? 'bg-slate-100 dark:bg-[#313131]' : 'text-slate-500 dark:text-[#9B9B9B]'}`
  return <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:i * 0.06, ease:EASE }} className={card + ' p-4 lg:col-span-2'}>
    <div className="flex items-center justify-between"><p className="font-semibold">By category</p>
      <div role="group" aria-label="Type" className="flex gap-1 rounded-xl border border-slate-200 p-1 dark:border-[#313131]">
        <button className={tab('expense')} aria-pressed={type === 'expense'} onClick={() => { setType('expense'); setActive(null) }}>Expenses</button>
        <button className={tab('income')} aria-pressed={type === 'income'} onClick={() => { setType('income'); setActive(null) }}>Income</button></div></div>
    {total === 0 ? <p className="py-10 text-center text-sm text-slate-500 dark:text-[#9B9B9B]">No {type === 'expense' ? 'expenses' : 'income'} in this range.</p> : <>
      <div className="relative mx-auto my-4 h-48 w-48">
        <motion.svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="Breakdown by category" initial={{ opacity:0, rotate:-150 }} animate={{ opacity:1, rotate:-90 }} transition={{ duration:0.9, ease:EASE }}>
          {segs.map(s => <circle key={s.name} cx="100" cy="100" r={R} fill="none" stroke={s.color} strokeWidth={SW} strokeLinecap="round" strokeDasharray={`${s.len} ${C - s.len}`} strokeDashoffset={-s.start}
            onMouseEnter={() => setActive(s.name)} onMouseLeave={() => setActive(null)} style={{ cursor:'pointer', opacity:active && active !== s.name ? 0.3 : 1, transition:'opacity 300ms cubic-bezier(0.22,1,0.36,1)' }} />)}</motion.svg>
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center"><p className="text-xs text-slate-500 dark:text-[#9B9B9B]">{picked ? picked.name : type === 'expense' ? 'Spent' : 'Earned'}</p><p className="text-2xl font-semibold">{compact(picked ? picked.value : total)}</p></div></div>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">{segs.map(s => <li key={s.name}><button className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1 text-left transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        onMouseEnter={() => setActive(s.name)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(s.name)} onBlur={() => setActive(null)}>
        <span className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background:s.color }} /><span className="truncate text-slate-500 dark:text-[#9B9B9B]">{s.name}</span></span><span className="font-semibold">{money(s.value)}</span></button></li>)}</ul></>}
  </motion.div>
}
