import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Mic, Copy, RefreshCw } from 'lucide-react'
import { db, getKV, type MealPlan } from '../db'
import { buildReadequacaoText } from '../lib/readequar'
import { startDictation } from '../lib/voice'
import { Empty, PageHeader, Section } from '../components/ui'

export default function Compras() {
  const items = useLiveQuery(() => db.shop.toArray(), []) ?? []
  const meals = useLiveQuery(() => getKV<MealPlan>('meals'), [])
  const strat = useLiveQuery(() => db.strategies.where('kind').equals('dieta').last(), [])
  const [motivo, setMotivo] = useState('')
  const [rec, setRec] = useState(false)
  const [msg, setMsg] = useState('')
  const sections = [...new Set(items.map((i) => i.section))]
  const total = items.reduce((s, i) => s + (i.price ?? 0), 0)

  const dictate = () => {
    const stop = startDictation((t) => setMotivo((m) => (m ? m + ' ' : '') + t), () => setRec(false))
    if (!stop) return setMsg('Seu navegador não suporta ditado por voz. Digite o motivo.')
    setRec(true)
  }
  const copy = async () => {
    const text = buildReadequacaoText(meals, strat, items, motivo)
    try { await navigator.clipboard.writeText(text); setMsg('Copiado! Cole na conversa com o Claude.') } catch { setMsg('Não consegui copiar automaticamente.') }
  }

  return (
    <>
      <PageHeader title="Compras" subtitle={`${items.filter((i) => i.checked).length} de ${items.length} itens${total ? ` · R$ ${total.toFixed(2).replace('.', ',')}` : ''}`} />
      <main className="space-y-5 px-4 pt-5">
        {items.length === 0 && <Empty>Lista vazia. Carregue o exemplo ou importe um <code>shopping_list.json</code> em Ajustes.</Empty>}
        {sections.map((sec) => (
          <Section key={sec} title={sec} action={
            <button className="btn-soft !min-h-[36px] !px-3 text-xs" onClick={() => { const f = prompt(`Readequar toda a seção "${sec}": o que houve?`); if (f) items.filter((i) => i.section === sec).forEach((i) => db.shop.update(i.id!, { flag: f })) }}>
              <RefreshCw size={14} /> Readequar
            </button>}>
            <div className="card space-y-2 !p-2">
              {items.filter((i) => i.section === sec).map((i) => (
                <div key={i.id} className={`rounded-2xl p-2 ${i.checked ? 'bg-mint-100/70 dark:bg-mint-700/20' : ''}`}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => db.shop.update(i.id!, { checked: !i.checked })} aria-label="Marcar"
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 ${i.checked ? 'border-mint-500 bg-mint-500 text-white' : 'border-brand-300'}`}>{i.checked && '✓'}</button>
                    <div className="flex-1 leading-tight"><div className={`font-semibold ${i.checked ? 'line-through opacity-60' : ''}`}>{i.name}</div>{i.qty && <div className="text-xs text-slate-500">{i.qty}</div>}</div>
                    <input inputMode="decimal" placeholder="R$" className="input !min-h-[40px] !w-20 !px-2 text-center" value={i.price ?? ''}
                      onChange={(e) => db.shop.update(i.id!, { price: e.target.value === '' ? undefined : Number(e.target.value.replace(',', '.')) })} />
                    <button className={`rounded-xl px-2 py-2 ${i.flag ? 'bg-amber-100 text-amber-800' : 'bg-brand-50 text-brand-700 dark:bg-slate-700'}`} aria-label="Readequar item"
                      onClick={() => { const f = prompt(`Readequar "${i.name}": o que houve? (ex.: caro)`, i.flag ?? ''); if (f !== null) db.shop.update(i.id!, { flag: f || undefined }) }}><RefreshCw size={16} /></button>
                  </div>
                  {i.flag && <div className="mt-1 pl-12 text-xs font-semibold text-amber-700 dark:text-amber-300">Readequar: {i.flag}</div>}
                </div>
              ))}
            </div>
          </Section>
        ))}

        <Section title="Pedir readequação">
          <div className="card space-y-3">
            <textarea className="input !py-3" rows={3} placeholder="Ex.: patinho a R$ 70, o que posso fazer com coxão duro?" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            <div className="flex gap-2">
              <button className={`btn flex-1 ${rec ? 'animate-pulse bg-red-500 text-white' : 'btn-soft'}`} onClick={dictate}><Mic size={18} /> {rec ? 'Ouvindo…' : 'Falar'}</button>
              <button className="btn-primary flex-1" onClick={copy}><Copy size={18} /> Copiar texto</button>
            </div>
            {msg && <div className="text-sm font-semibold text-brand-700 dark:text-brand-200">{msg}</div>}
          </div>
        </Section>
      </main>
    </>
  )
}
