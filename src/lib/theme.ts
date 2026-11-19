export type Theme = 'auto' | 'light' | 'dark'
export const getTheme = (): Theme => {
  try { return (localStorage.getItem('theme') as Theme) || 'auto' } catch { return 'auto' }
}
export function applyTheme(t: Theme = getTheme()) {
  try { localStorage.setItem('theme', t) } catch { /* sem storage */ }
  const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
}
