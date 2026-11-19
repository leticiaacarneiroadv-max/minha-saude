import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowDown, ArrowUp, Minus, Plus } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { db, type Bio as BioT } from '../db'
import { fmtDate, todayStr } from '../lib/dates'
import { Empty, PageHeader, Section } from '../components/ui'

const FIELDS: { k: keyof BioT; label: string; unit: string; goodWhen: 'up' | 'down' | 'none' }[] = [
  { k: 'weight', label: 'Peso', unit: 'kg', goodWhen: 'none' },
  { k: 'fat', label: 'Gordura', unit: '%', goodWhen: 'down' },
  { k: 'lean', label: 'Massa magra', unit: 'kg', goodWhen: 'up' },
  { k: 'muscle', label: 'Massa muscular', unit: 'kg', goodWhen: 'up' },
  { k: 'visceral', label: 'Gordura visceral', unit: '', goodWhen: 'down' },
  { k: 'water', label: 'Água', unit: '%', goodWhen: 'up' },
  { k: 'bmr', label: 'TMB', unit: 'kcal', goodWhen: 'up' },
]

function Delta({ cur, prev, good }: { cur?: number; prev?: number; good: 'up' | 'down' | 'none' }) {
  if (cur == null || prev == null) return null
  const d = +(cur - prev).toFixed(2)
  if (d === 0) return <Minus size={14} className="text-slate-400" />
  const better = good === 'none' ? null : (d > 0) === (good === 'up')
  const color = better === null ? 'text-slate-500' : better ? 'text-mint-600' : 'text-red-500'
  return <span className={`flex items-center text-xs font-bold ${color}`}>{d > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}{Math.abs(d)}</span>
}

export default function Bio() {
  const all = (useLiveQuery(() => db.bio.toArray(), []) ?? []).sort((a, b) => a.date.localeCompare(b.date))
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({ date: todayStr() })
  const [metric, setMetric] = useState<keyof BioT>('fat')
  const cur = all[all.length - 1]
  const prev = all[all.length - 2]

  const save = async () => {
    const e: BioT = { date: form.date || todayStr() }
    FIELDS.forEach(({ k }) => { if (form[k] && form[k] !== '') (e as any)[k] = Number(form[k].replace(',', '.')) })
    await db.bio.add(e)
    setForm({ date: todayStr() }); setAdding(false)
  }

  return (
    <>
      <PageHeader title="Bioimpedância" subtitle={cur ? `Última: ${fmtDate(cur.date)}` : 'Sem medições'}
        right={<button className="rounded-full bg-white/20 p-2.5" onClick={() => setAdding(!adding)} aria-label="Nova medição"><Plus size={22} /></button>} />
      <main className="space-y-5 px-4 pt-5">
        {adding && (
          <div className="card space-y-3">
            <div><label className="label">Data</label><input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              {FIELDS.map(({ k, label, unit }) => (
                <div key={k}><label className="label">{label} {unit && `(${unit})`}</label><input inputMode="decimal" className="input" value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
              ))}
            </div>
            <p className="text-xs text-slate-500">Deixe em branco o que o aparelho não informou.</p>
            <button className="btn-primary w-full" onClick={save}>Salvar medição</button>
          </div>
        )}

        {!cur ? <Empty>Nenhuma medição. Toque no + para cadastrar.</Empty> : (
          <>
            <Section title={prev ? `Comparação com ${fmtDate(prev.date)}` : 'Última medição'}>
              <div className="grid grid-cols-2 gap-3">
                {FIELDS.filter(({ k }) => cur[k] != null).map(({ k, label, unit, goodWhen }) => (
                  <div key={k} className="card !p-3">
                    <div className="label !mb-0">{label}</div>
                    <div className="flex items-end justify-between"><div className="text-2xl font-extrabold">{String(cur[k])}<span className="text-xs font-semibold text-slate-500"> {unit}</span></div>
                      <Delta cur={cur[k] as number} prev={prev?.[k] as number} good={goodWhen} /></div>
                  </div>
                ))}
              </div>
            </Section>
            <Section title="Evolução">
              <div className="card">
                <div className="mb-3 flex gap-2 overflow-x-auto">{FIELDS.map(({ k, label }) => (
                  <button key={k} onClick={() => setMetric(k)} className={`chip shrink-0 ${metric === k ? '!bg-brand-600 !text-white' : ''}`}>{label}</button>))}</div>
                <div className="h-44"><ResponsiveContainer><LineChart data={all.filter((b) => b[metric] != null).map((b) => ({ d: b.date.slice(5), v: b[metric] }))}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="d" fontSize={11} /><YAxis width={34} fontSize={11} domain={['auto', 'auto']} /><Tooltip />
                  <Line dataKey="v" stroke="#0891b2" strokeWidth={3} dot={{ fill: '#10b981' }} /></LineChart></ResponsiveContainer></div>
              </div>
            </Section>
          </>
        )}
      </main>
    </>
  )
}
