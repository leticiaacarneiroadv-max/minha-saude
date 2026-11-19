import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { Settings, Droplets, Footprints } from 'lucide-react'
import { db, getKV, type Daily, type MealPlan, type WorkoutPlan } from '../db'
import { todayStr, WEEKDAYS, weekProgress } from '../lib/dates'
import { Check, Empty, PageHeader, Ring, Section } from '../components/ui'

const GOAL_ML = 3000

export default function Hoje() {
  const date = todayStr()
  const wd = new Date().getDay()
  const plan = useLiveQuery(() => getKV<WorkoutPlan>('plan'), [])
  const meals = useLiveQuery(() => getKV<MealPlan>('meals'), [])
  const daily: Daily = useLiveQuery(() => db.daily.get(date), [date]) ?? { date, waterMl: 0, treadmillMin: 0, mobility: false, core: false }
  const save = (p: Partial<Daily>) => db.daily.put({ ...daily, ...p })

  const day = plan?.days.find((d) => d.weekday === wd)
  const weekIdx = plan ? (weekProgress(plan.startDate, 99).current - 1) % 3 : 0
  const mealDay = meals?.weeks[weekIdx]?.days[wd - 1]

  return (
    <>
      <PageHeader title="Hoje" subtitle={`${WEEKDAYS[wd]} · ${date.split('-').reverse().join('/')}`}
        right={<Link to="/ajustes" className="rounded-full bg-white/20 p-2.5" aria-label="Ajustes"><Settings size={22} /></Link>} />
      <main className="space-y-6 px-4 pt-5">
        {wd === 5 && (
          <div className="rounded-3xl bg-gradient-to-r from-amber-100 to-orange-100 p-4 font-semibold text-amber-900 shadow-soft">
            🛒 Sexta: dia de montar o cardápio da semana.
          </div>
        )}

        <Section title="Treino de hoje">
          {day ? (
            <Link to="/treino" className="card block">
              <div className="flex items-center justify-between">
                <div><div className="text-xl font-extrabold">{day.label}</div><div className="text-sm text-slate-500">{day.focus}</div></div>
                <span className="chip">{day.exercises.length} exercícios</span>
              </div>
              <div className="btn-primary mt-4 w-full">Começar treino</div>
            </Link>
          ) : <Empty>{plan ? 'Sem treino marcado para hoje.' : 'Nenhum plano de treino ainda. Importe um em Ajustes.'}</Empty>}
        </Section>

        <Section title="Marmita e lanches">
          {mealDay ? (
            <div className="card space-y-3">
              {([['Café da manhã', mealDay.breakfast], ['Almoço (marmita)', mealDay.lunch], ['Lanche da tarde', mealDay.snack]] as const).map(([t, m]) => m && (
                <div key={t}>
                  <div className="label">{t}</div>
                  <div className="font-semibold">{m.name}</div>
                  {m.protein != null && <span className="chip mt-1">~{m.protein} g de proteína</span>}
                </div>
              ))}
            </div>
          ) : <Empty>Sem cardápio para hoje. Jantar e fim de semana são livres.</Empty>}
        </Section>

        <Section title="Água">
          <div className="card flex items-center gap-4">
            <Ring value={daily.waterMl} max={GOAL_ML} label={`${(daily.waterMl / 1000).toFixed(2).replace('.', ',')} L`} size={110} />
            <div className="flex-1 space-y-2">
              <div className="text-sm text-slate-500">Meta: 3 a 4 L</div>
              <div className="flex gap-2">
                <button className="btn-primary flex-1" onClick={() => save({ waterMl: daily.waterMl + 250 })}><Droplets size={18} /> +250 ml</button>
                <button className="btn-soft" onClick={() => save({ waterMl: Math.max(0, daily.waterMl - 250) })}>−</button>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Checklist do dia">
          <div className="card space-y-2">
            <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-3 dark:bg-slate-700">
              <Footprints className="text-brand-600" />
              <div className="flex-1 font-semibold">Esteira</div>
              <button className="btn-soft !min-h-[40px] !px-3" onClick={() => save({ treadmillMin: Math.max(0, daily.treadmillMin - 5) })}>−5</button>
              <div className="w-14 text-center text-lg font-extrabold">{daily.treadmillMin}<span className="text-xs font-semibold"> min</span></div>
              <button className="btn-soft !min-h-[40px] !px-3" onClick={() => save({ treadmillMin: daily.treadmillMin + 5 })}>+5</button>
            </div>
            <Check checked={daily.mobility} onChange={(v) => save({ mobility: v })}>Mobilidade</Check>
            <Check checked={daily.core} onChange={(v) => save({ core: v })}>Core</Check>
          </div>
        </Section>

        <Section title="Como foi hoje">
          <div className="card space-y-3">
            <div>
              <div className="label">Intestino</div>
              <div className="flex gap-2">
                {[['Sim', true], ['Não', false]].map(([l, v]) => (
                  <button key={String(l)} onClick={() => save({ bowel: v as boolean })}
                    className={`btn flex-1 ${daily.bowel === v ? 'bg-gradient-to-r from-brand-600 to-mint-500 text-white' : 'bg-brand-50 dark:bg-slate-700'}`}>{l as string}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="label">Saciedade (0–5)</div>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => save({ satiety: n })}
                    className={`btn flex-1 !px-0 ${daily.satiety === n ? 'bg-gradient-to-r from-brand-600 to-mint-500 text-white' : 'bg-brand-50 dark:bg-slate-700'}`}>{n}</button>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </main>
    </>
  )
}
