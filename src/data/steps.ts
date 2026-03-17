export interface Step {
  number: number
  title: string
  description: string
}

export const steps: Step[] = [
  {
    number: 1,
    title: 'Оставьте заявку',
    description: 'Заполните форму на сайте или позвоните нам по телефону',
  },
  {
    number: 2,
    title: 'Обсудим детали',
    description: 'Менеджер свяжется для уточнения ассортимента и объёмов',
  },
  {
    number: 3,
    title: 'Дегустация',
    description: 'Предоставим образцы продукции для оценки качества',
  },
  {
    number: 4,
    title: 'Начало поставок',
    description: 'Регулярная доставка по согласованному графику',
  },
]
