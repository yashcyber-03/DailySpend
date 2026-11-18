import { NavLink, Outlet } from 'react-router-dom'
import { SquaresFour, Wallet, Target, ChartBar, GearSix } from '@phosphor-icons/react'
const L = [['/','Dashboard',SquaresFour],['/budgets','Budgets',Wallet],['/goals','Goals',Target],['/analytics','Analytics',ChartBar],['/settings','Settings',GearSix]]
export default function Layout() {
  return <div className="min-h-screen md:flex bg-slate-50 dark:bg-[#181818]">
    <nav aria-label="Main" className="fixed bottom-0 inset-x-0 z-10 flex justify-around border-t border-slate-200 bg-white p-2 dark:border-[#313131] dark:bg-[#1F1F1F] md:sticky md:top-0 md:h-screen md:w-20 md:flex-col md:items-center md:justify-start md:gap-2 md:border-t-0 md:border-r md:py-6">
      <div className="hidden md:grid mb-4 h-8 w-8 place-items-center rounded-lg bg-[#3DD68C] text-sm font-semibold text-black">D</div>
      {L.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'} title={label} aria-label={label}
        className={({ isActive }) => `grid h-10 w-10 place-items-center rounded-lg transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${isActive ? 'bg-slate-100 text-slate-900 dark:bg-[#313131] dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-[#9B9B9B] dark:hover:text-white'}`}>
        {({ isActive }) => <Icon size={20} weight={isActive ? 'fill' : 'regular'} />}</NavLink>)}
    </nav>
    <main className="min-w-0 flex-1 overflow-x-hidden pb-20 md:pb-0"><Outlet /></main></div>
}
