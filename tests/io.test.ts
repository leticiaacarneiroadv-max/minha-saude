import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../src/db'
import { exportBackup, importJSON, restoreBackup } from '../src/lib/io'

beforeEach(async () => { await Promise.all(db.tables.map((t) => t.clear())) })

describe('importação', () => {
  it('importa shopping_list', async () => {
    const r = await importJSON(JSON.stringify({ schema: 'shopping_list', version: 1, items: [{ section: 'Carnes', name: 'Coxão duro', qty: '1 kg' }] }))
    expect(r.ok).toBe(true)
    expect(await db.shop.count()).toBe(1)
  })
  it('importa estratégia sem inventar campos', async () => {
    await importJSON(JSON.stringify({ schema: 'strategy', version: 1, kind: 'treino', date: '2026-11-01' }))
    const s = (await db.strategies.toArray())[0]
    expect(s.better).toBe('')
    expect(s.guidelines).toEqual([])
  })
  it('rejeita JSON inválido, schema desconhecido e versão errada', async () => {
    expect((await importJSON('{oi')).ok).toBe(false)
    expect((await importJSON('{"schema":"x"}')).ok).toBe(false)
    expect((await importJSON('{"schema":"meal_plan","version":9,"weeks":[]}')).ok).toBe(false)
  })
  it('bioimpedância mantém vazios os campos ausentes', async () => {
    await importJSON(JSON.stringify({ schema: 'bioimpedance', version: 1, entries: [{ date: '2026-11-01', weight: 58.5 }] }))
    const b = (await db.bio.toArray())[0]
    expect(b.weight).toBe(58.5)
    expect(b.fat).toBeUndefined()
  })
})

describe('backup', () => {
  it('exporta e restaura ida e volta', async () => {
    await db.daily.put({ date: '2026-11-01', waterMl: 1500, treadmillMin: 20, mobility: true, core: false })
    const json = await exportBackup()
    await db.daily.clear()
    await restoreBackup(json)
    expect((await db.daily.get('2026-11-01'))?.waterMl).toBe(1500)
  })
})
