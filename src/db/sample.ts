import { db, setKV, type MealPlan, type WorkoutPlan } from './index'
import { todayStr } from '../lib/dates'

// Dados FICTÍCIOS só para testar o app. Podem ser apagados em Ajustes.
const d = (name: string, ingredients: string[], protein?: number, notes?: string) => ({ name, ingredients, protein, notes })

export const samplePlan: WorkoutPlan = {
  blockName: 'Bloco exemplo',
  startDate: todayStr(),
  weeks: 6,
  days: [
    { key: 'A', label: 'Treino A', weekday: 1, focus: 'Inferiores (exemplo)', exercises: [
      { name: 'Agachamento no smith', sets: 4, reps: '8-10', rest: 90 },
      { name: 'Leg press', sets: 3, reps: '10-12', rest: 90, notes: 'Pés altos' },
      { name: 'Cadeira extensora', sets: 3, reps: '12-15', rest: 60 },
    ] },
    { key: 'B', label: 'Treino B', weekday: 2, focus: 'Superiores (exemplo)', exercises: [
      { name: 'Supino inclinado', sets: 4, reps: '8-10', rest: 90 },
      { name: 'Puxada frontal', sets: 4, reps: '10-12', rest: 75 },
      { name: 'Elevação lateral', sets: 3, reps: '12-15', rest: 60 },
    ] },
    { key: 'C', label: 'Treino C', weekday: 3, focus: 'Glúteos (exemplo)', exercises: [
      { name: 'Elevação pélvica', sets: 4, reps: '8-12', rest: 90 },
      { name: 'Mesa flexora', sets: 3, reps: '10-12', rest: 60 },
    ] },
  ],
}

export const sampleMeals: MealPlan = {
  weeks: [0, 1, 2].map((w) => ({
    days: Array.from({ length: 5 }, (_, i) => ({
      breakfast: d('Ovos mexidos com tapioca', ['2 ovos', 'tapioca', 'café sem lactose'], 14),
      lunch: d(['Frango com arroz e brócolis', 'Carne moída com purê de batata', 'Peixe com legumes'][(i + w) % 3],
        ['proteína', 'carboidrato', 'legumes'], 35, 'Congela bem · micro-ondas'),
      snack: d('Iogurte sem lactose com fruta', ['iogurte zero lactose', 'banana'], 10),
    })),
  })),
  freeNotes: 'Jantar e fim de semana: livres.',
}

export async function loadSample() {
  await setKV('plan', samplePlan)
  await setKV('meals', sampleMeals)
  await db.shop.clear()
  await db.shop.bulkAdd([
    { section: 'Carnes', name: 'Peito de frango', qty: '2 kg', checked: false },
    { section: 'Carnes', name: 'Carne moída', qty: '1 kg', checked: false },
    { section: 'Hortifruti', name: 'Brócolis', qty: '3 maços', checked: false },
    { section: 'Hortifruti', name: 'Banana', qty: '1 dúzia', checked: false },
    { section: 'Mercearia', name: 'Arroz', qty: '2 kg', checked: false },
    { section: 'Mercearia', name: 'Tapioca', qty: '1 pct', checked: false },
    { section: 'Congelados', name: 'Legumes congelados', qty: '2 pct', checked: false },
    { section: 'Laticínios', name: 'Iogurte zero lactose', qty: '6 un', checked: false },
  ])
  await db.strategies.clear()
  await db.strategies.bulkAdd([
    { kind: 'dieta', date: todayStr(), better: 'Exemplo: mais constância nas marmitas.', worse: '', attention: 'Exemplo: variar as fontes de proteína.', guidelines: ['Exemplo de diretriz 1', 'Exemplo de diretriz 2'] },
    { kind: 'treino', date: todayStr(), better: '', worse: '', attention: 'Exemplo: observar o ciático.', guidelines: ['Exemplo: progredir carga a cada 2 semanas'], blockWeeks: 6 },
  ])
}

export async function clearAll() {
  await Promise.all([db.kv.clear(), db.exLogs.clear(), db.sessions.clear(), db.daily.clear(), db.shop.clear(), db.strategies.clear(), db.bio.clear()])
}
