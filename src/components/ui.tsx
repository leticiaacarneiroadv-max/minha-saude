import type { ReactNode } from 'react'

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <header className="relative overflow-hidden rounded-b-[2rem] bg-gradient-to-br from-brand-700 via-brand-600 to-mint-500 px-5 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))] text-white shadow-soft">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-12 right-16 h-28 w-28 rounded-full bg-white/10" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-white/85">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  )
}

export const Section = ({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) => (
  <section className="space-y-3">
    <div className="flex items-center justify-between px-1">
      <h2 className="text-lg font-bold text-brand-800 dark:text-brand-200">{title}</h2>
      {action}
    </div>
    {children}
  </section>
)

export const Empty = ({ children }: { children: ReactNode }) => (
  <div className="card text-center text-sm text-slate-500 dark:text-slate-400">{children}</div>
)

export function Ring({ value, max, label, size = 92 }: { value: number; max: number; label: string; size?: number }) {
  const pct = Math.min(value / max, 1)
  const r = size / 2 - 8
  const c = 2 * Math.PI * r
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth="8" fill="none" className="text-brand-100 dark:text-slate-700" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="url(#rg)" strokeWidth="8" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} className="transition-all duration-500" />
        <defs><linearGradient id="rg"><stop offset="0" stopColor="#0891b2" /><stop offset="1" stopColor="#10b981" /></linearGradient></defs>
      </svg>
      <div className="absolute text-center leading-tight">
        <div className="text-lg font-extrabold">{label}</div>
      </div>
    </div>
  )
}

export function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <button onClick={() => onChange(!checked)} className={`flex min-h-[56px] w-full items-center gap-3 rounded-2xl px-4 text-left font-semibold transition active:scale-[.98] ${checked ? 'bg-mint-100 text-mint-700 dark:bg-mint-700/30 dark:text-mint-200' : 'bg-brand-50 dark:bg-slate-700'}`}>
      <span className={`grid h-7 w-7 place-items-center rounded-full border-2 ${checked ? 'border-mint-500 bg-mint-500 text-white' : 'border-brand-300'}`}>{checked && '✓'}</span>
      {children}
    </button>
  )
}
