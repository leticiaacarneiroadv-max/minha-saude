import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { applyTheme, getTheme, type Theme } from '../lib/theme'
import { buildSummary, exportBackup, importJSON, restoreBackup } from '../lib/io'
import { clearAll, loadSample } from '../db/sample'
import { PageHeader, Section } from '../components/ui'
import { todayStr } from '../lib/dates'

export default function Ajustes() {
  const [theme, setTheme] = useState<Theme>(getTheme())
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')
  const file = useRef<HTMLInputElement>(null)

  const download = (name: string, content: string, type = 'application/json') => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click()
  }
  const copySummary = async () => { await navigator.clipboard.writeText(await buildSummary()); setMsg('Resumo copiado! Cole na conversa com o Claude.') }
  const doImport = async () => { const r = await importJSON(text); setMsg(r.ok ? `✓ ${r.summary}` : `✗ ${r.error}`); if (r.ok) setText('') }

  return (
    <>
      <PageHeader title="Ajustes" right={<Link to="/" className="rounded-full bg-white/20 p-2.5" aria-label="Voltar"><ArrowLeft size={22} /></Link>} />
      <main className="space-y-6 px-4 pt-5">
        {msg && <div className="card font-semibold text-brand-700 dark:text-brand-200">{msg}</div>}
        <Section title="Aparência">
          <div className="grid grid-cols-3 gap-2">
            {(['auto', 'light', 'dark'] as Theme[]).map((t) => (
              <button key={t} className={`btn ${theme === t ? 'bg-gradient-to-r from-brand-600 to-mint-500 text-white' : 'bg-white dark:bg-slate-800'}`} onClick={() => { setTheme(t); applyTheme(t) }}>{{ auto: 'Auto', light: 'Claro', dark: 'Escuro' }[t]}</button>
            ))}
          </div>
        </Section>
        <Section title="Importar do Claude">
          <div className="card space-y-3">
            <textarea className="input !py-3 font-mono text-xs" rows={6} placeholder='Cole aqui o JSON (workout_plan, meal_plan, shopping_list, strategy ou bioimpedance)' value={text} onChange={(e) => setText(e.target.value)} />
            <button className="btn-primary w-full" disabled={!text.trim()} onClick={doImport}>Importar</button>
            <button className="btn-soft w-full" onClick={async () => setText(await navigator.clipboard.readText())}>Colar da área de transferência</button>
          </div>
        </Section>
        <Section title="Para levar à conversa">
          <button className="btn-primary w-full" onClick={copySummary}>Copiar resumo em texto</button>
        </Section>
        <Section title="Backup">
          <div className="card space-y-2">
            <button className="btn-primary w-full" onClick={async () => download(`minha-saude-${todayStr()}.json`, await exportBackup())}>Baixar backup (.json)</button>
            <button className="btn-soft w-full" onClick={() => file.current?.click()}>Restaurar backup</button>
            <input ref={file} type="file" accept="application/json" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { await restoreBackup(await f.text()); setMsg('✓ Backup restaurado.') } catch (err) { setMsg('✗ ' + (err as Error).message) } }} />
          </div>
        </Section>
        <Section title="Dados de exemplo">
          <div className="card space-y-2">
            <p className="text-sm text-slate-500">Dados fictícios só para testar.</p>
            <button className="btn-soft w-full" onClick={async () => { await loadSample(); setMsg('✓ Exemplo carregado.') }}>Carregar exemplo</button>
            <button className="btn w-full bg-red-50 text-red-600" onClick={async () => { if (confirm('Apagar TODOS os dados deste aparelho?')) { await clearAll(); setMsg('Tudo apagado.') } }}>Apagar tudo</button>
          </div>
        </Section>
      </main>
    </>
  )
}
