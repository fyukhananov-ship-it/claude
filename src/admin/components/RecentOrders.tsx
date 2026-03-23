const ordersData = [
  {
    client: 'Ресторан «Белуга»',
    items: 'Круассаны x24, Наполеон x2',
    total: '₽18,400',
    status: 'Доставлен',
    statusColor: '#10B981',
    time: '2 ч назад',
  },
  {
    client: 'Отель Marriott',
    items: 'Мини маффины x100, Эклер x50',
    total: '₽42,500',
    status: 'В производстве',
    statusColor: '#FFBA00',
    time: '3 ч назад',
  },
  {
    client: 'Кафе «Сладкоежка»',
    items: 'Тирамису x20, Захер x15',
    total: '₽26,000',
    status: 'Доставлен',
    statusColor: '#10B981',
    time: '5 ч назад',
  },
  {
    client: 'Кондитерская «Лакомка»',
    items: 'Красный бархат x3, Чизкейк x2',
    total: '₽35,800',
    status: 'Ожидает оплаты',
    statusColor: '#DC3545',
    time: '6 ч назад',
  },
  {
    client: 'Кофейня Surf Coffee',
    items: 'Синнабон x30, Круассан миндальный x20',
    total: '₽12,900',
    status: 'Доставлен',
    statusColor: '#10B981',
    time: '8 ч назад',
  },
  {
    client: 'Ресторан «Пушкин»',
    items: 'Финансье x40, Макарон ассорти x30',
    total: '₽28,600',
    status: 'В доставке',
    statusColor: '#259AE6',
    time: '10 ч назад',
  },
];

const RecentOrders = () => {
  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
        Последние заказы
      </h4>

      <div>
        {ordersData.map((order, key) => (
          <div
            className="flex items-center gap-5 py-3 px-7.5 hover:bg-gray-3 dark:hover:bg-meta-4"
            key={key}
          >
            <div className="flex flex-1 items-center justify-between">
              <div className="flex-1">
                <h5 className="font-medium text-black dark:text-white">
                  {order.client}
                </h5>
                <p className="text-sm text-bodydark2">{order.items}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: order.statusColor }}
                  ></span>
                  <span className="text-xs text-bodydark2">{order.status}</span>
                  <span className="text-xs text-bodydark2">· {order.time}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="font-medium text-black dark:text-white">
                  {order.total}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentOrders;
