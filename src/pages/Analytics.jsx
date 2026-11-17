import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAuth } from '../context/AuthContext'
import { subscribeTransactions } from '../services/transactions'
import { totals, byCategory, byMonth, byWeekday, formatMoney, toCSV } from '../utils/finance'
import { inp, page } from '../components/ui'
export default function Analytics() {
  const { user } = useAuth(), [all, setAll] = useState([]), [err, setErr] = useState('')
  const [from, setFrom] = useState(new Date().getFullYear() + '-01-01'), [to, setTo] = useState(new Date().toISOString().slice(0,10))
  useEffect(() => subscribeTransactions(user.uid, setAll, e => setErr(e.message)), [user.uid])
  const tx = useMemo(() => all.filter(t => t.date >= from && t.date <= to), [all, from, to])
  const t = totals(tx), cats = byCategory(tx).sort((a,b) => b.value - a.value), months = byMonth(tx)
  const days = Math.max(1, Math.round((new Date(to) - new Date(from)) / 864e5) + 1)
  const csv = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([toCSV(tx)],{type:'text/csv'})); a.download = 'report.csv'; a.click() }
  const stat = (l, v) => <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4"><p className="text-sm text-slate-500">{l}</p><p className="text-lg font-semibold">{v}</p></div>
  const box = (title, chart) => <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4"><p className="mb-2 font-medium">{title}</p><div className="h-60"><ResponsiveContainer>{chart}</ResponsiveContainer></div></div>
  return <div className={page}>
    <div className="flex flex-wrap justify-between gap-2"><h1 className="text-2xl font-semibold">Analytics</h1>
      <div className="flex gap-2"><input className={inp} type="date" value={from} onChange={e => setFrom(e.target.value)}/><input className={inp} type="date" value={to} onChange={e => setTo(e.target.value)}/>
        <button className={inp} onClick={csv}>Export CSV</button></div></div>
    {err && <p className="text-red-500">{err}</p>}
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{stat('Total income', formatMoney(t.income))}{stat('Total expenses', formatMoney(t.expenses))}{stat('Net savings', formatMoney(t.savings))}
      {stat('Avg daily spending', formatMoney(t.expenses / days))}{stat('Top category', cats[0]?.name || '—')}{stat('Transactions', tx.length)}</div>
    {tx.length === 0 ? <p className="text-slate-500 py-8">No transactions in this range.</p> : <div className="grid lg:grid-cols-2 gap-4">
      {box('Income vs expenses', <BarChart data={months}><XAxis dataKey="month"/><YAxis/><Tooltip/><Legend/><Bar dataKey="income" fill="#10b981"/><Bar dataKey="expenses" fill="#ef4444"/></BarChart>)}
      {box('Savings trend', <LineChart data={months}><XAxis dataKey="month"/><YAxis/><Tooltip/><Line dataKey="savings" stroke="#10b981"/></LineChart>)}
      {box('Spending by category', <PieChart><Pie data={cats} dataKey="value" nameKey="name" outerRadius={80}>{cats.map((_, i) => <Cell key={i} fill={`hsl(${i * 47},60%,50%)`}/>)}</Pie><Tooltip/></PieChart>)}
      {box('Spending by weekday', <BarChart data={byWeekday(tx)}><XAxis dataKey="day"/><YAxis/><Tooltip/><Bar dataKey="spent" fill="#6366f1"/></BarChart>)}</div>}</div>
}
