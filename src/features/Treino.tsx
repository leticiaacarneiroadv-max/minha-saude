import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Timer, TrendingUp, AlertTriangle } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { db, getKV, type Exercise, type ExLog, type WorkoutPlan } from '../db'
import { todayStr, weekProgress } from '../lib/dates'
import { Empty, PageHeader, Section } from '../components/ui'

function RestTimer({ seconds, runKey }: { seconds: number; runKey: number }) {
  const [left, setLeft] = useState(0)
  useEffect(() => { if (runKey) setLeft(seconds) }, [runKey, seconds])
  useEffect(() => {
    if (left <= 0) return
    const t = setTimeout(() => setLeft((l) => l - 1), 1000)
    if (left === 1 && navigator.vibrate) navigator.vibrate([200, 100, 200])
    return () => clearTimeout(t)
  }, [left])
  if (left <= 0) return null
  return (
    <div className="fixed inset-x-4 bottom-28 z-30 mx-auto flex max-w-xl items-center justify-between rounded-3xl bg-gradient-to-r from-brand-700 to-mint-500 p-4 text-white shadow-soft">
      <div className="flex items-center gap-2 font-semibold"><Timer /> Descanso</div>
      <div className="text-3xl font-extrabold tabular-nums">{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</div>
      <button className="rounded-xl bg-white/20 px-3 py-2 font-semibold" onClick={() => setLeft(0)}>Pular</button>
    </div>
  )
}

function ExerciseCard({ ex, date, onSetDone }: { ex: Exercise; date: string; onSetDone: (rest: number) => void }) {
  const id = `${date}|${ex.name}`
  const log = useLiveQuery(() => db.exLogs.get(id), [id])
  const history = useLiveQuery(() => db.exLogs.where('exercise').equals(ex.name).toArray(), [ex.name]) ?? []
  const sets = Array.from({ length: ex.sets }, (_, i) => log?.sets[i] ?? { done: false })
  const [chart, setChart] = useState(false)

  const save = (p: Partial<ExLog>) => db.exLogs.put({ id, date, exercise: ex.name, sets, ...log, ...p })
  const setSet = (i: number, p: object) => save({ sets: sets.map((s, j) => (j === i ? { ...s, ...p } : s)) })

  const painful = history.filter((h) => (h.pain ?? 0) >= 5).length >= 2
  const series = history.filter((h) => h.sets.some((s) => s.done && s.load)).sort((a, b) => a.date.localeCompare(b.date))
    .map((h) => ({ d: h.date.slice(5), carga: Math.max(...h.sets.filter((s) => s.done).map((s) => s.load ?? 0)) }))

  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-lg font-extrabold leading-tight">{ex.name}</div>
          <div className="text-sm text-slate-500">{ex.sets} × {ex.reps} · descanso {ex.rest}s</div>
          {ex.notes && <div className="mt-1 text-sm text-brand-700 dark:text-brand-200">{ex.notes}</div>}
        </div>
        <button className="btn-soft !min-h-[40px] !px-3" onClick={() => setChart(!chart)} aria-label="Progressão"><TrendingUp size={18} /></button>
      </div>
      {painful && <div className="flex items-center gap-2 rounded-xl bg-amber-100 p-2 text-sm font-semibold text-amber-900"><AlertTriangle size={16} /> Esse exercício já gerou dor mais de uma vez.</div>}
      {chart && (series.length > 1 ? (
        <div className="h-36"><ResponsiveContainer><LineChart data={series}><XAxis dataKey="d" fontSize={11} /><YAxis width={28} fontSize={11} /><Tooltip /><Line dataKey="carga" stroke="#10b981" strokeWidth={3} dot /></LineChart></ResponsiveContainer></div>
      ) : <div className="text-sm text-slate-500">Ainda sem histórico suficiente para o gráfico.</div>)}

      <div className="space-y-2">
        {sets.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-6 text-center text-sm font-bold text-slate-400">{i + 1}</div>
            <input inputMode="decimal" placeholder="kg" className="input !px-2 text-center" value={s.load ?? ''} onChange={(e) => setSet(i, { load: e.target.value === '' ? undefined : Number(e.target.value.replace(',', '.')) })} />
            <input inputMode="numeric" placeholder="reps" className="input !px-2 text-center" value={s.reps ?? ''} onChange={(e) => setSet(i, { reps: e.target.value === '' ? undefined : Number(e.target.value) })} />
            <button onClick={() => { setSet(i, { done: !s.done }); if (!s.done) onSetDone(ex.rest) }}
              className={`btn !px-4 ${s.done ? 'bg-mint-500 text-white' : 'bg-brand-50 text-brand-700 dark:bg-slate-700'}`}>{s.done ? '✓' : 'OK'}</button>
          </div>
        ))}
      </div>

      <div>
        <div className="label">Dor ciático/lombar: {log?.pain ?? '—'} / 10</div>
        <input type="range" min={0} max={10} value={log?.pain ?? 0} onChange={(e) => save({ pain: Number(e.target.value) })} className="w-full accent-brand-600" />
      </div>
      <input className="input" placeholder="Anotação do exercício" value={log?.note ?? ''} onChange={(e) => save({ note: e.target.value })} />
    </div>
  )
}

export default function Treino() {
  const plan = useLiveQuery(() => getKV<WorkoutPlan>('plan'), [])
  const date = todayStr()
  const wd = new Date().getDay()
  const [sel, setSel] = useState<string | null>(null)
  const [timer, setTimer] = useState({ rest: 60, k: 0 })
  const tick = useRef(0)
  const session = useLiveQuery(() => db.sessions.get(date), [date])

  if (!plan) return (<><PageHeader title="Treino" /><main className="px-4 pt-5"><Empty>Nenhum plano de treino. Vá em Ajustes e carregue os dados de exemplo ou importe um <code>workout_plan.json</code>.</Empty></main></>)

  const todayKey = plan.days.find((d) => d.weekday === wd)?.key
  const day = plan.days.find((d) => d.key === (sel ?? todayKey ?? plan.days[0].key))!
  const wp = weekProgress(plan.startDate, plan.weeks)

  return (
    <>
      <PageHeader title="Treino" subtitle={`${plan.blockName} · semana ${wp.current} de ${wp.total}`} />
      <main className="space-y-5 px-4 pt-5">
        <div className="h-3 overflow-hidden rounded-full bg-brand-100 dark:bg-slate-700">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-mint-500" style={{ width: `${(wp.current / wp.total) * 100}%` }} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {plan.days.map((d) => (
            <button key={d.key} onClick={() => setSel(d.key)} className={`btn shrink-0 ${d.key === day.key ? 'bg-gradient-to-r from-brand-600 to-mint-500 text-white shadow-soft' : 'bg-white dark:bg-slate-800'}`}>
              {d.key}{d.key === todayKey && <span className="chip !bg-white/30 !text-inherit">hoje</span>}
            </button>
          ))}
        </div>
        <Section title={`${day.label} · ${day.focus}`}>
          {day.exercises.map((ex) => (
            <ExerciseCard key={ex.name} ex={ex} date={date} onSetDone={(rest) => setTimer({ rest, k: ++tick.current })} />
          ))}
          <div className="card space-y-2">
            <div className="label">Dor da sessão: {session?.pain ?? '—'} / 10</div>
            <input type="range" min={0} max={10} value={session?.pain ?? 0} onChange={(e) => db.sessions.put({ ...session, date, dayKey: day.key, pain: Number(e.target.value) })} className="w-full accent-brand-600" />
            <input className="input" placeholder="Como foi o treino?" value={session?.note ?? ''} onChange={(e) => db.sessions.put({ ...session, date, dayKey: day.key, note: e.target.value })} />
          </div>
        </Section>
      </main>
      <RestTimer seconds={timer.rest} runKey={timer.k} />
    </>
  )
}
