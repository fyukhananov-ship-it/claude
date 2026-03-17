export interface Product {
  id: string
  name: string
  description: string
  icon: string
}

export const products: Product[] = [
  {
    id: 'cake-piece',
    name: 'Порционные торты и пирожные',
    description: 'Тирамису, Дживара Лактэ, Будапешт и другие рецептуры для ресторанов и отелей',
    icon: 'CakeSlice',
  },
  {
    id: 'cake-slab',
    name: 'Пластовые торты',
    description: 'Торты для нарезки — для шведского стола, банкетов и десертных витрин',
    icon: 'Cake',
  },
  {
    id: 'cookies',
    name: 'Печенье',
    description: 'Классическое европейское печенье для комплиментов от заведения и кофейных пауз',
    icon: 'Cookie',
  },
  {
    id: 'muffins',
    name: 'Кексы и маффины',
    description: 'Свежая выпечка для завтраков, кофеен и буфетного обслуживания',
    icon: 'Croissant',
  },
  {
    id: 'petitfours',
    name: 'Мини-пирожные',
    description: 'Элегантные птифуры для фуршетов, кейтеринга и десертных сетов',
    icon: 'Cherry',
  },
  {
    id: 'wedding',
    name: 'Свадебные торты',
    description: 'Торты на заказ с доставкой к назначенному времени торжества',
    icon: 'Heart',
  },
  {
    id: 'corporate',
    name: 'Корпоративные торты',
    description: 'Торты с логотипом и тематическим дизайном для мероприятий',
    icon: 'Award',
  },
  {
    id: 'custom',
    name: 'Выпечка и полуфабрикаты',
    description: 'Готовая выпечка и кондитерские полуфабрикаты для вашего заведения',
    icon: 'ChefHat',
  },
]
