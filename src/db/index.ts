import Dexie, { type Table } from 'dexie'

export interface Exercise { name: string; sets: number; reps: string; rest: number; notes?: string }
export interface WorkoutDay { key: string; label: string; weekday: number | null; focus: string; exercises: Exercise[] }
export interface WorkoutPlan { blockName: string; startDate: string; weeks: number; days: WorkoutDay[] }
export interface SetLog { done: boolean; load?: number; reps?: number }
export interface ExLog { id: string; date: string; exercise: string; sets: SetLog[]; pain?: number; note?: string }
export interface SessionLog { date: string; dayKey: string; pain?: number; note?: string }
export interface Daily { date: string; waterMl: number; treadmillMin: number; mobility: boolean; core: boolean; bowel?: boolean; satiety?: number }
export interface Dish { name: string; ingredients: string[]; protein?: number; notes?: string }
export interface MealDay { breakfast?: Dish; lunch?: Dish; snack?: Dish }
export interface MealPlan { weeks: { days: MealDay[] }[]; freeNotes?: string }
export interface ShopItem { id?: number; section: string; name: string; qty?: string; checked: boolean; price?: number; flag?: string }
export interface Strategy { id?: number; kind: 'dieta' | 'treino'; date: string; better: string; worse: string; attention: string; guidelines: string[]; blockWeeks?: number }
export interface Bio { id?: number; date: string; weight?: number; fat?: number; lean?: number; muscle?: number; visceral?: number; water?: number; bmr?: number; extras?: Record<string, string> }
export interface KV { key: string; value: unknown }

class AppDB extends Dexie {
  kv!: Table<KV, string>
  exLogs!: Table<ExLog, string>
  sessions!: Table<SessionLog, string>
  daily!: Table<Daily, string>
  shop!: Table<ShopItem, number>
  strategies!: Table<Strategy, number>
  bio!: Table<Bio, number>
  constructor() {
    super('minha-saude')
    this.version(1).stores({
      kv: 'key',
      exLogs: 'id, date, exercise',
      sessions: 'date',
      daily: 'date',
      shop: '++id, section',
      strategies: '++id, kind, date',
      bio: '++id, date',
    })
  }
}
export const db = new AppDB()

export async function getKV<T>(key: string): Promise<T | undefined> {
  return (await db.kv.get(key))?.value as T | undefined
}
export const setKV = (key: string, value: unknown) => db.kv.put({ key, value })
