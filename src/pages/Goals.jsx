import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { subscribe, create, patch, remove } from '../services/db'
import { formatMoney } from '../utils/finance'
import { inp, btn, page } from '../components/ui'
const blank = { goalName:'', targetAmount:'', currentAmount:'0', targetDate:'', description:'' }
export default function Goals() {
  const { user } = useAuth(), [goals, setGoals] = useState([]), [f, setF] = useState(blank), [editId, setEditId] = useState(null), [msg, setMsg] = useState('')
  useEffect(() => subscribe('savingsGoals', user.uid, setGoals, e => setMsg(e.message)), [user.uid])
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const save = async (e) => { e.preventDefault()
    const t = Number(f.targetAmount), c = Number(f.currentAmount)
    if (!f.goalName.trim() || !(t > 0) || !(c >= 0)) return setMsg('Enter a name, a target above 0 and a saved amount of 0 or more.')
    if (!f.targetDate || (!editId && f.targetDate < new Date().toISOString().slice(0,10))) return setMsg('Pick a target date that is not in the past.')
    try { const d = { goalName:f.goalName.trim(), targetAmount:t, currentAmount:c, targetDate:f.targetDate, description:f.description }
      editId ? await patch('savingsGoals', editId, user.uid, d) : await create('savingsGoals', user.uid, d); setF(blank); setEditId(null); setMsg('Saved') } catch (x) { setMsg('Save failed: ' + x.message) } }
  const addSavings = async (g) => { const v = Number(window.prompt('Amount to add')); if (!(v > 0)) return
    try { await patch('savingsGoals', g.id, user.uid, { goalName:g.goalName, targetAmount:g.targetAmount, currentAmount:g.currentAmount + v, targetDate:g.targetDate, description:g.description || '' }) } catch (x) { setMsg('Update failed: ' + x.message) } }
  const del = async (id) => { if (window.confirm('Delete this goal?')) try { await remove('savingsGoals', id) } catch (x) { setMsg('Delete failed: ' + x.message) } }
  return <div className={page}><h1 className="text-2xl font-semibold">Savings goals</h1>
    <form onSubmit={save} className="flex flex-wrap gap-2">
      <input className={inp} placeholder="Goal name" value={f.goalName} onChange={set('goalName')}/>
      <input className={inp} type="number" min="1" placeholder="Target" value={f.targetAmount} onChange={set('targetAmount')}/>
      <input className={inp} type="number" min="0" placeholder="Saved so far" value={f.currentAmount} onChange={set('currentAmount')}/>
      <input className={inp} type="date" value={f.targetDate} onChange={set('targetDate')}/>
      <input className={inp} placeholder="Description" value={f.description} onChange={set('description')}/>
      <button className={btn}>{editId ? 'Update' : 'Create goal'}</button></form>
    {msg && <p className="text-sm">{msg}</p>}
    {goals.length === 0 && <p className="text-slate-500 py-8">No goals yet. Create one above.</p>}
    <div className="grid md:grid-cols-2 gap-4">{goals.map(g => { const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100)
      return <div key={g.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
        <div className="flex justify-between"><b>{g.goalName}</b><span className="text-xs text-slate-500">by {g.targetDate}</span></div>
        <div className="h-2 rounded bg-slate-200 dark:bg-slate-800"><div className="h-2 rounded bg-emerald-500" style={{ width: pct + '%' }}/></div>
        <p className="text-sm">{formatMoney(g.currentAmount)} of {formatMoney(g.targetAmount)} · {pct.toFixed(0)}% · {formatMoney(Math.max(0, g.targetAmount - g.currentAmount))} to go</p>
        <div className="text-xs flex gap-3"><button className="text-emerald-600" onClick={() => addSavings(g)}>Add savings</button>
          <button onClick={() => { setEditId(g.id); setF({ goalName:g.goalName, targetAmount:g.targetAmount, currentAmount:g.currentAmount, targetDate:g.targetDate, description:g.description || '' }) }}>Edit</button>
          <button className="text-red-500" onClick={() => del(g.id)}>Delete</button></div></div> })}</div></div>
}
