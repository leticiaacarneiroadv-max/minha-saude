import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getKV, type Dish, type MealPlan } from '../db'
import { Empty, PageHeader, Section } from '../components/ui'

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']

function DishCard({ title, dish }: { title: string; dish?: Dish }) {
  if (!dish) return null
  return (
    <div className="card">
      <div className="label">{title}</div>
      <div className="text-lg font-extrabold leading-tight">{dish.name}</div>
      {dish.ingredients.length > 0 && <div className="mt-1 text-sm text-slate-500">{dish.ingredients.join(' · ')}</div>}
      <div className="mt-2 flex flex-wrap gap-2">
        {dish.protein != null && <span className="chip">~{dish.protein} g proteína</span>}
        {dish.notes && <span className="chip !bg-brand-100 !text-brand-700">{dish.notes}</span>}
      </div>
    </div>
  )
}

export default function Dieta() {
  const meals = useLiveQuery(() => getKV<MealPlan>('meals'), [])
  const [w, setW] = useState(0)
  const [d, setD] = useState(Math.min(Math.max(new Date().getDay() - 1, 0), 4))

  return (
    <>
      <PageHeader title="Dieta" subtitle="Marmitas, cafés e lanches" />
      <main className="space-y-5 px-4 pt-5">
        {!meals ? <Empty>Nenhum cardápio ainda. Carregue o exemplo ou importe um <code>meal_plan.json</code> em Ajustes.</Empty> : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {meals.weeks.map((_, i) => (
                <button key={i} onClick={() => setW(i)} className={`btn ${w === i ? 'bg-gradient-to-r from-brand-600 to-mint-500 text-white shadow-soft' : 'bg-white dark:bg-slate-800'}`}>Semana {i + 1}</button>
              ))}
            </div>
            <div className="flex gap-2">
              {DAYS.map((n, i) => (
                <button key={n} onClick={() => setD(i)} className={`btn flex-1 !px-0 ${d === i ? 'bg-mint-500 text-white' : 'bg-brand-50 dark:bg-slate-700'}`}>{n}</button>
              ))}
            </div>
            <Section title={`${DAYS[d]} · semana ${w + 1}`}>
              <DishCard title="Café da manhã" dish={meals.weeks[w]?.days[d]?.breakfast} />
              <DishCard title="Almoço (marmita)" dish={meals.weeks[w]?.days[d]?.lunch} />
              <DishCard title="Lanche da tarde" dish={meals.weeks[w]?.days[d]?.snack} />
            </Section>
            <div className="card"><div className="label">Jantar e fim de semana</div><div className="text-sm">{meals.freeNotes || 'Livres, sem contagem.'}</div></div>
          </>
        )}
      </main>
    </>
  )
}
