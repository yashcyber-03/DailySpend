import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Plus, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { subscribeTransactions } from '../services/transactions'
import { subscribe } from '../services/db'
import { totals, inRange, rangeFor, byCategory, byMonth, utilization, remainingBudget, budgetStatus, formatMoney, toCSV } from '../utils/finance'
import QuickAdd from '../components/QuickAdd'
import CategoryRing from '../components/CategoryRing'
import { inp, btn, page, card, EASE } from '../components/ui'
const COLORS = ['#3DD68C', '#7C9CFF', '#F5B544', '#FF8A7A', '#8A8A8A', '#C084FC']
const BAR = { normal:'#3DD68C', warning:'#F5B544', exceeded:'#FF8A7A' }
const NOTE = { normal:'On track', warning:'Approaching your limit', exceeded:'Over budget' }
const RANGES = [['today','Today'],['week','Week'],['month','Month'],['lastMonth','Last month'],['quarter','Quarter'],['year','Year'],['custom','Custom']]
const tip = { contentStyle:{ background:'#272727', border:'none', borderRadius:8, color:'#fff', fontSize:12 }, cursor:{ fill:'rgba(155,155,155,0.12)' } }
const fade = (i = 0) => ({ initial:{ opacity:0, y:16 }, animate:{ opacity:1, y:0 }, transition:{ duration:0.5, delay:i * 0.06, ease:EASE } })
export default function Dashboard() {
  const { user } = useAuth()
  const [tx, setTx] = useState([]), [budgets, setBudgets] = useState([]), [loaded, setLoaded] = useState(false), [sheet, setSheet] = useState(false), [err, setErr] = useState('')
  const [range, setRange] = useState('month'), [from, setFrom] = useState(''), [to, setTo] = useState(''), [pickYm, setPickYm] = useState(new Date().toISOString().slice(0, 7))
  useEffect(() => { const a = subscribeTransactions(user.uid, d => { setTx(d); setLoaded(true) }, e => { setErr('Could not load transactions. ' + e.message); setLoaded(true) }), b = subscribe('budgets', user.uid, setBudgets, e => setErr(e.message)); return () => { a(); b() } }, [user.uid])
  const shown = useMemo(() => range === 'pick' ? tx.filter(t => t.date.slice(0, 7) === pickYm) : range === 'custom' ? tx.filter(t => (!from || t.date >= from) && (!to || t.date <= to)) : inRange(tx, ...rangeFor(range)), [tx, range, from, to, pickYm])
  const t = totals(shown), cats = byCategory(shown), months = byMonth(shown)
  const ym = new Date().toISOString().slice(0, 7), [y, m] = ym.split('-').map(Number)
  const overall = budgets.find(b => b.year === y && b.month === m && b.category === 'overall')
  const spentMonth = tx.filter(x => x.type === 'expense' && x.date.slice(0, 7) === ym).reduce((s, x) => s + Number(x.amount), 0)
  const pct = overall ? utilization(spentMonth, overall.amount) : 0, st = budgetStatus(pct)
  const h = new Date().getHours(), hello = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening', first = (user.displayName || '').split(' ')[0]
  const csv = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([toCSV(shown)], { type:'text/csv' })); a.download = 'dailyspend.csv'; a.click() }
  const shiftMonth = (v, d) => { const [yy, mm] = v.split('-').map(Number), dt = new Date(yy, mm - 1 + d, 1); return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') }
  const lab = d => { const [yy, mm] = shiftMonth(pickYm, d).split('-').map(Number); return new Date(yy, mm - 1, 1).toLocaleString('en-IN', { month:'long' }) }
  const go = d => { setRange('pick'); setPickYm(shiftMonth(pickYm, d)) }
  const atNow = pickYm >= new Date().toISOString().slice(0, 7)
  const arrow = 'grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition-colors duration-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-[#9B9B9B] dark:hover:text-white'
  const stat = (label, value, Icon, color, i) => <motion.div {...fade(i)} className={card + ' p-4'}><div className="flex items-center gap-2 text-sm text-slate-500 dark:text-[#9B9B9B]"><Icon size={16} color={color} weight="bold" />{label}</div><p className="mt-1 text-xl font-semibold">{formatMoney(value)}</p></motion.div>
  if (!loaded) return <div className={page}><div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-[#272727]" /><div className="h-32 animate-pulse rounded-2xl bg-slate-200 dark:bg-[#272727]" /><div className="grid grid-cols-3 gap-3">{[0, 1, 2].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-[#272727]" />)}</div>{err && <p className="text-sm text-[#FF8A7A]">{err}</p>}</div>
  return <div className={page}>
    <motion.div {...fade(0)} className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-semibold">{hello}{first ? ', ' + first : ''}</h1><p className="text-sm text-slate-500 dark:text-[#9B9B9B]">Here is where your money stands.</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Date range" className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-[#313131] dark:bg-[#1F1F1F]">
          {RANGES.map(([k, l]) => <button key={k} onClick={() => { setRange(k); setPickYm(new Date().toISOString().slice(0, 7)) }} aria-pressed={range === k} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${range === k ? 'bg-slate-100 dark:bg-[#313131]' : 'text-slate-500 dark:text-[#9B9B9B]'}`}>{l}</button>)}</div>
        {range === 'custom' && <><input className={inp} type="date" value={from} onChange={e => setFrom(e.target.value)} aria-label="From" /><input className={inp} type="date" value={to} onChange={e => setTo(e.target.value)} aria-label="To" /></>}
        <button className={inp} onClick={csv}>Export CSV</button></div></motion.div>
    {(range === 'month' || range === 'pick') && <motion.div {...fade(1)} className="flex items-center justify-center gap-3 text-sm">
      <button className={arrow} aria-label="Previous month" onClick={() => go(-1)}><CaretLeft size={16} /></button>
      <button className="text-slate-500 dark:text-[#9B9B9B]" onClick={() => go(-1)}>{lab(-1)}</button>
      <span className="text-lg font-semibold" aria-live="polite">{lab(0)} {pickYm.slice(0, 4)}</span>
      <button className="text-slate-500 disabled:invisible dark:text-[#9B9B9B]" disabled={atNow} onClick={() => go(1)}>{lab(1)}</button>
      <button className={arrow + ' disabled:invisible'} disabled={atNow} aria-label="Next month" onClick={() => go(1)}><CaretRight size={16} /></button></motion.div>}
    {err && <p className="text-sm text-[#FF8A7A]">{err}</p>}
    <motion.div {...fade(1)} className={card + ' flex flex-wrap items-end justify-between gap-3 p-6'}>
      <div><p className="text-sm text-slate-500 dark:text-[#9B9B9B]">Total balance</p><p className="text-4xl font-semibold">{formatMoney(t.balance)}</p></div>
      <span className={`rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold dark:bg-[#272727] ${t.savings >= 0 ? 'text-emerald-600 dark:text-[#3DD68C]' : 'text-[#FF8A7A]'}`}>{t.savings >= 0 ? '+' : '−'}{formatMoney(Math.abs(t.savings))} in this range</span></motion.div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{stat('Income', t.income, ArrowDownLeft, '#3DD68C', 2)}{stat('Expenses', t.expenses, ArrowUpRight, '#FF8A7A', 3)}{stat('Savings', t.savings, PiggyBank, '#7C9CFF', 4)}</div>
    {tx.length === 0 ? <motion.div {...fade(5)} className={card + ' p-8 text-center'}><h2 className="text-xl font-semibold">Start tracking your money</h2><p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-[#9B9B9B]">Add your first expense or income and your charts appear here.</p>
      <div className="mt-4 flex justify-center gap-2"><button className={btn} onClick={() => setSheet(true)}>Add your first transaction</button></div></motion.div>
    : shown.length === 0 ? <p className="py-8 text-sm text-slate-500 dark:text-[#9B9B9B]">No transactions in this range. Try a wider date range.</p>
    : <div className="grid gap-3 lg:grid-cols-5">
      <motion.div {...fade(5)} className={card + ' p-4 lg:col-span-3'}><p className="font-semibold">Income vs expenses</p><div className="mt-2 h-56"><ResponsiveContainer><BarChart data={months}><XAxis dataKey="month" tick={{ fill:'#9B9B9B', fontSize:12 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill:'#9B9B9B', fontSize:12 }} axisLine={false} tickLine={false} width={44} /><Tooltip {...tip} formatter={v => formatMoney(v)} /><Bar dataKey="income" fill="#3DD68C" radius={[4, 4, 0, 0]} /><Bar dataKey="expenses" fill="#5A5A5A" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></motion.div>
      <CategoryRing tx={shown} i={6} />
      </div>}
    <div className="grid gap-3 lg:grid-cols-5">
      <motion.div {...fade(7)} className={card + ' p-4 lg:col-span-2'}><p className="font-semibold">Monthly budget</p>
        {overall ? <><div className="mt-3 h-2 overflow-hidden rounded-lg bg-slate-200 dark:bg-[#313131]"><motion.div className="h-2 origin-left rounded-lg" style={{ background:BAR[st] }} initial={{ scaleX:0 }} animate={{ scaleX:Math.min(pct, 100) / 100 }} transition={{ duration:0.8, ease:EASE }} /></div>
          <p className="mt-2 text-xs text-slate-500 dark:text-[#9B9B9B]">{formatMoney(spentMonth)} of {formatMoney(overall.amount)} · {pct.toFixed(0)}% used · {formatMoney(remainingBudget(overall.amount, spentMonth))} left</p><p className="mt-1 text-xs font-semibold" style={{ color:BAR[st] }}>{NOTE[st]}</p></>
          : <p className="mt-2 text-sm text-slate-500 dark:text-[#9B9B9B]">Set a monthly budget to track how much is left.</p>}
        <Link to="/budgets" className="mt-3 inline-block text-xs font-semibold text-emerald-600 dark:text-[#3DD68C]">{overall ? 'Manage budgets' : 'Set a budget'}</Link></motion.div>
      <motion.div {...fade(8)} className={card + ' p-4 lg:col-span-3'}><div className="mb-2 flex items-center justify-between"><p className="font-semibold">Recent transactions</p><Link to="/transactions" className="text-xs font-semibold text-emerald-600 dark:text-[#3DD68C]">See all</Link></div>
        <ul className="space-y-2">{shown.length === 0 && <li className="text-sm text-slate-500 dark:text-[#9B9B9B]">Nothing in this range yet.</li>}
          {shown.slice(0, 5).map(x => <li key={x.id} className="flex items-center justify-between gap-2 text-sm"><span className="flex min-w-0 items-center gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 dark:bg-[#272727]">{x.type === 'income' ? <ArrowDownLeft size={16} color="#3DD68C" weight="bold" /> : <ArrowUpRight size={16} color="#FF8A7A" weight="bold" />}</span><span className="min-w-0"><span className="block truncate">{x.title}</span><span className="block text-xs text-slate-500 dark:text-[#9B9B9B]">{x.category} · {x.date}</span></span></span>
            <span className={x.type === 'income' ? 'text-emerald-600 dark:text-[#3DD68C]' : ''}>{x.type === 'income' ? '+' : '−'}{formatMoney(x.amount)}</span></li>)}</ul></motion.div></div><button aria-label="Add transaction" onClick={() => setSheet(true)} className="fixed bottom-20 right-4 z-20 grid h-14 w-14 place-items-center rounded-full bg-[#3DD68C] text-black transition-transform duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 md:bottom-8 md:right-8"><Plus size={28} weight="bold" /></button>
    <QuickAdd open={sheet} onClose={() => setSheet(false)} />
  </div>
}
