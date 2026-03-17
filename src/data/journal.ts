export interface JournalArticle {
  id: string
  category: string
  categoryColor: 'sage' | 'warm' | 'neutral'
  title: string
  excerpt: string
  date: string
}

export const articles: JournalArticle[] = [
  {
    id: 'cost-optimization',
    category: 'Советы',
    categoryColor: 'sage',
    title: 'Как сократить расходы на десертное меню без потери качества',
    excerpt: 'Рассказываем, почему для большинства заведений закупка готовой кондитерской продукции выгоднее собственного производства. Разбираем экономику десертного направления.',
    date: '12 марта 2026',
  },
  {
    id: 'trends-2026',
    category: 'Тренды',
    categoryColor: 'warm',
    title: 'Тренды десертного меню 2026: что предлагать гостям',
    excerpt: 'Порционные десерты, авторские муссовые пирожные и возвращение классики — главные направления сезона для ресторанов и отелей.',
    date: '5 марта 2026',
  },
  {
    id: 'tiramisu-guide',
    category: 'Продукция',
    categoryColor: 'neutral',
    title: 'Тирамису: от классического рецепта до ресторанной подачи',
    excerpt: 'История популярного десерта, секреты идеальной текстуры и варианты порционной подачи для ресторанного меню и кейтеринга.',
    date: '27 февраля 2026',
  },
]
