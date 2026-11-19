# Esquemas JSON (versão 1)

Todo arquivo tem `schema` e `version`. Campos que não existirem ficam vazios no app; nada é inventado.

## workout_plan
```json
{ "schema": "workout_plan", "version": 1, "blockName": "Bloco 1", "startDate": "2026-11-23", "weeks": 6,
  "days": [ { "key": "A", "label": "Treino A", "weekday": 1, "focus": "Inferiores",
    "exercises": [ { "name": "Leg press", "sets": 3, "reps": "10-12", "rest": 90, "notes": "Pés altos" } ] } ] }
```
`weekday`: 0 = domingo … 6 = sábado (ou `null`).

## meal_plan
```json
{ "schema": "meal_plan", "version": 1, "freeNotes": "Jantar e fim de semana livres.",
  "weeks": [ { "days": [ { "breakfast": { "name": "Ovos com tapioca", "ingredients": ["2 ovos"], "protein": 14 },
    "lunch": { "name": "Frango com arroz", "ingredients": [], "protein": 35, "notes": "Congela bem" },
    "snack": { "name": "Iogurte zero lactose", "ingredients": [] } } ] } ] }
```
`weeks` tem 3 semanas; `days` vai de segunda (índice 0) a sexta (índice 4).

## shopping_list
```json
{ "schema": "shopping_list", "version": 1, "items": [ { "section": "Carnes", "name": "Coxão duro", "qty": "1 kg" } ] }
```
Seções sugeridas: Carnes, Hortifruti, Mercearia, Congelados, Laticínios.

## strategy
```json
{ "schema": "strategy", "version": 1, "kind": "dieta", "date": "2026-11-23",
  "better": "…", "worse": "…", "attention": "…", "guidelines": ["…"], "blockWeeks": 6 }
```
`kind`: `"dieta"` ou `"treino"`.

## bioimpedance
```json
{ "schema": "bioimpedance", "version": 1, "entries": [ { "date": "2026-11-20", "weight": 58.5, "fat": 24.1,
  "lean": 44.2, "muscle": 41.0, "visceral": 3, "water": 52, "bmr": 1320, "extras": { "Idade corporal": "22" } } ] }
```
