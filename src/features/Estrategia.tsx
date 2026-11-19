import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Strategy } from '../db'
import { fmtDate } from '../lib/dates'
import { Empty, PageHeader } from '../components/ui'

function StrategyView({ s, old }: { s: Strategy; old?: boolean }) {
  return (
    <div className={`card space-y-3 ${old ? 'opacity-80' : ''}`}>
      <div className="flex items-center justify-between"><span className="chip">{fmtDate(s.date)}</span>{s.blockWeeks && <span className="chip !bg-brand-100 !text-brand-700">bloco de {s.blockWeeks} semanas</span>}</div>
      {([['👍 Melhorou', s.better], ['👎 Piorou', s.worse], ['👀 Atenção', s.attention]] as const).map(([t, v]) => v && (
        <div key={t}><div className="label">{t}</div><div className="text-sm">{v}</div></div>
      ))}
      {s.guidelines.length > 0 && <div><div className="label">Diretrizes</div><ul className="list-disc space-y-1 pl-5 text-sm">{s.guidelines.map((g, i) => <li key={i}>{g}</li>)}</ul></div>}
    </div>
  )
}

export default function Estrategia() {
  const [kind, setKind] = useState<'dieta' | 'treino'>('dieta')
  const list = (useLiveQuery(() => db.strategies.where('kind').equals(kind).toArray(), [kind]) ?? []).sort((a, b) => b.date.localeCompare(a.date))
  return (
    <>
      <PageHeader title="Estratégia" subtitle="O que o Claude definiu para o mês" />
      <main className="space-y-5 px-4 pt-5">
        <div className="grid grid-cols-2 gap-2">
          {(['dieta', 'treino'] as const).map((k) => (
            <button key={k} onClick={() => setKind(k)} className={`btn capitalize ${kind === k ? 'bg-gradient-to-r from-brand-600 to-mint-500 text-white shadow-soft' : 'bg-white dark:bg-slate-800'}`}>{k}</button>
          ))}
        </div>
        {list.length === 0 ? <Empty>Sem estratégia de {kind}. Importe um <code>strategy.json</code> em Ajustes.</Empty> : (
          <>
            <StrategyView s={list[0]} />
            {list.length > 1 && <><h2 className="px-1 text-lg font-bold text-brand-800 dark:text-brand-200">Anteriores</h2>{list.slice(1).map((s) => <StrategyView key={s.id} s={s} old />)}</>}
          </>
        )}
      </main>
    </>
  )
}
