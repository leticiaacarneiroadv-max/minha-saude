import type { MealPlan, ShopItem, Strategy } from '../db'

export function buildReadequacaoText(meals: MealPlan | undefined, strat: Strategy | undefined, items: ShopItem[], motivo: string) {
  const marcados = items.filter((i) => i.flag || i.checked === false && i.price != null)
  const linhas = marcados.map((i) => `- ${i.name}${i.qty ? ` (${i.qty})` : ''}${i.price != null ? ` — paguei R$ ${i.price.toFixed(2).replace('.', ',')}` : ''}${i.flag ? ` — ${i.flag}` : ''}`)
  const cardapio = meals ? meals.weeks.map((w, i) => `Semana ${i + 1}: ` + w.days.map((d) => d.lunch?.name ?? '—').join(' | ')).join('\n') : '(sem cardápio)'
  return [
    'Preciso readequar meu cardápio/lista de compras por causa de preço.',
    motivo ? `Motivo: ${motivo}` : '',
    '', 'Itens para readequar:', linhas.join('\n') || '(nenhum marcado)',
    '', 'Cardápio atual (almoços):', cardapio,
    '', 'Estratégia do mês:', strat ? `${strat.attention}\n${strat.guidelines.map((g) => '• ' + g).join('\n')}` : '(sem estratégia)',
    '', 'Devolva em JSON no formato meal_plan.json e/ou shopping_list.json (versão 1).',
  ].filter((l) => l !== undefined).join('\n')
}
