import { z } from 'zod'
import { db, setKV, type Bio } from '../db'

const dish = z.object({ name: z.string(), ingredients: z.array(z.string()).default([]), protein: z.number().optional(), notes: z.string().optional() })
const mealDay = z.object({ breakfast: dish.optional(), lunch: dish.optional(), snack: dish.optional() })

export const schemas = {
  workout_plan: z.object({
    schema: z.literal('workout_plan'), version: z.literal(1),
    blockName: z.string(), startDate: z.string(), weeks: z.number().int().positive(),
    days: z.array(z.object({
      key: z.string(), label: z.string(), weekday: z.number().int().min(0).max(6).nullable(), focus: z.string().default(''),
      exercises: z.array(z.object({ name: z.string(), sets: z.number().int().positive(), reps: z.string(), rest: z.number().nonnegative(), notes: z.string().optional() })),
    })),
  }),
  meal_plan: z.object({ schema: z.literal('meal_plan'), version: z.literal(1), weeks: z.array(z.object({ days: z.array(mealDay) })), freeNotes: z.string().optional() }),
  shopping_list: z.object({
    schema: z.literal('shopping_list'), version: z.literal(1),
    items: z.array(z.object({ section: z.string(), name: z.string(), qty: z.string().optional() })),
  }),
  strategy: z.object({
    schema: z.literal('strategy'), version: z.literal(1), kind: z.enum(['dieta', 'treino']), date: z.string(),
    better: z.string().default(''), worse: z.string().default(''), attention: z.string().default(''),
    guidelines: z.array(z.string()).default([]), blockWeeks: z.number().int().positive().optional(),
  }),
  bioimpedance: z.object({
    schema: z.literal('bioimpedance'), version: z.literal(1),
    entries: z.array(z.object({
      date: z.string(), weight: z.number().optional(), fat: z.number().optional(), lean: z.number().optional(), muscle: z.number().optional(),
      visceral: z.number().optional(), water: z.number().optional(), bmr: z.number().optional(), extras: z.record(z.string(), z.string()).optional(),
    })),
  }),
}

export type ImportResult = { ok: true; kind: keyof typeof schemas; summary: string } | { ok: false; error: string }

/** Valida e grava um JSON importado. Campos ausentes continuam vazios. */
export async function importJSON(text: string): Promise<ImportResult> {
  let raw: any
  try { raw = JSON.parse(text) } catch { return { ok: false, error: 'Isso não parece um JSON válido.' } }
  const kind = raw?.schema as keyof typeof schemas
  if (!kind || !(kind in schemas)) return { ok: false, error: 'Campo "schema" ausente ou desconhecido.' }
  const r = schemas[kind].safeParse(raw)
  if (!r.success) return { ok: false, error: `${kind}: ${r.error.issues[0].path.join('.') || 'raiz'} — ${r.error.issues[0].message}` }
  const d: any = r.data
  switch (kind) {
    case 'workout_plan': await setKV('plan', { blockName: d.blockName, startDate: d.startDate, weeks: d.weeks, days: d.days }); return { ok: true, kind, summary: `Plano "${d.blockName}" com ${d.days.length} dias.` }
    case 'meal_plan': await setKV('meals', { weeks: d.weeks, freeNotes: d.freeNotes }); return { ok: true, kind, summary: `Cardápio de ${d.weeks.length} semanas.` }
    case 'shopping_list': await db.shop.clear(); await db.shop.bulkAdd(d.items.map((i: any) => ({ ...i, checked: false }))); return { ok: true, kind, summary: `${d.items.length} itens na lista.` }
    case 'strategy': { const { schema: _s, version: _v, ...s } = d; await db.strategies.add(s); return { ok: true, kind, summary: `Estratégia de ${d.kind} adicionada.` } }
    case 'bioimpedance': await db.bio.bulkAdd(d.entries as Bio[]); return { ok: true, kind, summary: `${d.entries.length} medição(ões) adicionada(s).` }
  }
}

export async function exportBackup() {
  const [kv, exLogs, sessions, daily, shop, strategies, bio] = await Promise.all([db.kv.toArray(), db.exLogs.toArray(), db.sessions.toArray(), db.daily.toArray(), db.shop.toArray(), db.strategies.toArray(), db.bio.toArray()])
  return JSON.stringify({ schema: 'backup', version: 1, exportedAt: new Date().toISOString(), kv, exLogs, sessions, daily, shop, strategies, bio }, null, 2)
}

export async function restoreBackup(text: string) {
  const b = JSON.parse(text)
  if (b?.schema !== 'backup' || b.version !== 1) throw new Error('Arquivo de backup inválido.')
  await Promise.all([db.kv.clear(), db.exLogs.clear(), db.sessions.clear(), db.daily.clear(), db.shop.clear(), db.strategies.clear(), db.bio.clear()])
  await Promise.all([db.kv.bulkPut(b.kv), db.exLogs.bulkPut(b.exLogs), db.sessions.bulkPut(b.sessions), db.daily.bulkPut(b.daily), db.shop.bulkPut(b.shop), db.strategies.bulkPut(b.strategies), db.bio.bulkPut(b.bio)])
}

export async function buildSummary() {
  const [logs, daily, bio] = await Promise.all([db.exLogs.toArray(), db.daily.toArray(), db.bio.toArray()])
  const last = (n: number, a: any[]) => a.sort((x, y) => y.date.localeCompare(x.date)).slice(0, n)
  const out: string[] = ['RESUMO DE ACOMPANHAMENTO']
  out.push('\nÚltimas cargas/dor:')
  last(15, logs).forEach((l) => { const s = l.sets.filter((x: any) => x.done); out.push(`- ${l.date} ${l.exercise}: ${s.map((x: any) => `${x.load ?? '?'}kg×${x.reps ?? '?'}`).join(', ') || 'sem séries'}${l.pain != null ? ` | dor ${l.pain}/10` : ''}${l.note ? ` | ${l.note}` : ''}`) })
  out.push('\nÚltimos dias (água / intestino / saciedade):')
  last(14, daily).forEach((d) => out.push(`- ${d.date}: ${(d.waterMl / 1000).toFixed(2)} L | intestino ${d.bowel == null ? '—' : d.bowel ? 'sim' : 'não'} | saciedade ${d.satiety ?? '—'}`))
  out.push('\nBioimpedância:')
  last(3, bio).forEach((b) => out.push(`- ${b.date}: peso ${b.weight ?? '—'} | gordura ${b.fat ?? '—'}% | massa magra ${b.lean ?? '—'} | músculo ${b.muscle ?? '—'}`))
  return out.join('\n')
}
