export const sum = (tx, type) => tx.filter(t => t.type === type).reduce((s, t) => s + Number(t.amount || 0), 0)
export const totals = (tx) => { const income = sum(tx,'income'), expenses = sum(tx,'expense'); return { income, expenses, balance: income - expenses, savings: income - expenses } }
export const remainingBudget = (budget, spent) => budget - spent
export const utilization = (spent, budget) => (budget > 0 ? (spent / budget) * 100 : 0)
export const budgetStatus = (pct) => (pct >= 100 ? 'exceeded' : pct >= 80 ? 'warning' : 'normal')
export const inRange = (tx, from, to) => tx.filter(t => { const d = new Date(t.date); return d >= from && d <= to })
export const rangeFor = (key, now = new Date()) => {
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate()
  switch (key) {
    case 'today': return [new Date(y,m,d), new Date(y,m,d,23,59,59,999)]
    case 'week': return [new Date(y,m,d - now.getDay()), new Date(y,m,d+6-now.getDay(),23,59,59,999)]
    case 'lastMonth': return [new Date(y,m-1,1), new Date(y,m,0,23,59,59,999)]
    case 'quarter': { const q = Math.floor(m/3)*3; return [new Date(y,q,1), new Date(y,q+3,0,23,59,59,999)] }
    case 'year': return [new Date(y,0,1), new Date(y,11,31,23,59,59,999)]
    default: return [new Date(y,m,1), new Date(y,m+1,0,23,59,59,999)]
  }
}
export const byCategory = (tx, type='expense') => Object.entries(tx.filter(t => t.type===type).reduce((a,t)=>({...a,[t.category]:(a[t.category]||0)+Number(t.amount)}),{})).map(([name,value])=>({name,value}))
export const formatMoney = (n, currency=(localStorage.getItem('currency')||'INR')) => new Intl.NumberFormat('en-IN',{style:'currency',currency}).format(n)
export const toCSV = (tx) => ['type,title,amount,category,date,paymentMethod,notes',
  ...tx.map(t => [t.type,t.title,t.amount,t.category,t.date,t.paymentMethod||'',t.notes||''].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n')
export const byMonth = (tx) => { const m = {}
  tx.forEach(t => { const k = t.date.slice(0,7); m[k] = m[k] || { month:k, income:0, expenses:0 }; m[k][t.type==='income'?'income':'expenses'] += Number(t.amount) })
  return Object.values(m).sort((a,b)=>a.month.localeCompare(b.month)).map(x=>({ ...x, savings:x.income-x.expenses })) }
export const byWeekday = (tx) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day,i)=>({ day,
  spent: tx.filter(t=>t.type==='expense' && new Date(t.date).getDay()===i).reduce((s,t)=>s+Number(t.amount),0) }))
