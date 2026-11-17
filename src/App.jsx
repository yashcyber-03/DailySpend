import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { firebaseConfigured } from './firebase/config'
import Layout from './components/Layout'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Goals from './pages/Goals'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
const Protected = ({ children }) => { const { user, loading } = useAuth(); return loading ? <p className="p-8">Loading…</p> : user ? children : <Navigate to="/login" replace /> }
export default function App() {
  if (!firebaseConfigured) return <div className="p-8 max-w-xl"><h1 className="text-xl font-semibold">Firebase not configured</h1><p>Copy .env.example to .env and fill in your Firebase web app values, then restart.</p></div>
  return <Routes><Route path="/login" element={<Auth mode="login"/>}/><Route path="/register" element={<Auth mode="register"/>}/><Route path="/forgot" element={<Auth mode="forgot"/>}/>
    <Route element={<Protected><Layout/></Protected>}><Route path="/" element={<Dashboard/>}/><Route path="/expenses" element={<Transactions type="expense"/>}/><Route path="/income" element={<Transactions type="income"/>}/>
      <Route path="/budgets" element={<Budgets/>}/><Route path="/goals" element={<Goals/>}/><Route path="/analytics" element={<Analytics/>}/><Route path="/settings" element={<Settings/>}/></Route>
    <Route path="*" element={<Navigate to="/" replace/>}/></Routes>
}
