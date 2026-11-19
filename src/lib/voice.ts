// Ditado por voz (Web Speech API, pt-BR). Retorna função para parar, ou null se não houver suporte.
export function startDictation(onText: (t: string) => void, onEnd: () => void): (() => void) | null {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SR) return null
  const r = new SR()
  r.lang = 'pt-BR'
  r.interimResults = false
  r.onresult = (e: any) => onText(Array.from(e.results).map((x: any) => x[0].transcript).join(' '))
  r.onend = onEnd
  r.start()
  return () => r.stop()
}
