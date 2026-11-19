import { useEffect } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { CalendarCheck, Dumbbell, Salad, ShoppingCart, Compass, Activity } from 'lucide-react'
import Hoje from '../features/Hoje'
import Treino from '../features/Treino'
import Dieta from '../features/Dieta'
import Compras from '../features/Compras'
import Estrategia from '../features/Estrategia'
import Bio from '../features/Bio'
import Ajustes from '../features/Ajustes'

const tabs = [
  { to: '/', label: 'Hoje', icon: CalendarCheck },
  { to: '/treino', label: 'Treino', icon: Dumbbell },
  { to: '/dieta', label: 'Dieta', icon: Salad },
  { to: '/compras', label: 'Compras', icon: ShoppingCart },
  { to: '/estrategia', label: 'Estratégia', icon: Compass },
  { to: '/bio', label: 'Bio', icon: Activity },
]

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return (
    <div className="mx-auto min-h-screen max-w-xl pb-28">
      <Routes>
        <Route path="/" element={<Hoje />} />
        <Route path="/treino" element={<Treino />} />
        <Route path="/dieta" element={<Dieta />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/estrategia" element={<Estrategia />} />
        <Route path="/bio" element={<Bio />} />
        <Route path="/ajustes" element={<Ajustes />} />
      </Routes>
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-xl px-3 pb-[max(.75rem,env(safe-area-inset-bottom))]">
        <div className="flex justify-between rounded-3xl bg-white/95 p-1.5 shadow-soft ring-1 ring-brand-100 backdrop-blur dark:bg-slate-800/95 dark:ring-slate-700">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-semibold transition ${isActive ? 'bg-gradient-to-br from-brand-600 to-mint-500 text-white shadow' : 'text-slate-500 dark:text-slate-400'}`}>
              <Icon size={22} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
