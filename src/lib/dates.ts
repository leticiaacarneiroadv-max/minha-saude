export const todayStr = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}
export const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
export const fmtDate = (s: string) => {
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y}`
}
export function weekProgress(start: string, weeks: number) {
  const s = new Date(start + 'T00:00:00').getTime()
  const w = Math.floor((Date.now() - s) / (7 * 864e5)) + 1
  return { current: Math.min(Math.max(w, 1), weeks), total: weeks }
}
