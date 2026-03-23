const productData = [
  {
    name: 'Круассан классический',
    category: 'Выпечка',
    orders: 342,
    revenue: '₽256,500',
    growth: 12.5,
  },
  {
    name: '«Наполеон» пластовый',
    category: 'Торты пластовые',
    orders: 185,
    revenue: '₽740,000',
    growth: 8.3,
  },
  {
    name: 'Амареттини',
    category: 'Печенье',
    orders: 278,
    revenue: '₽139,000',
    growth: 15.2,
  },
  {
    name: '«Тирамису» порционный',
    category: 'Торты порционные',
    orders: 156,
    revenue: '₽312,000',
    growth: -2.4,
  },
  {
    name: 'Брауни с карамелью',
    category: 'Ягодные пироги',
    orders: 198,
    revenue: '₽198,000',
    growth: 6.7,
  },
];

const TableOne = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Топ продуктов
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Продукт
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Категория
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Заказы
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Выручка
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Рост
            </h5>
          </div>
        </div>

        {productData.map((product, key) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-5 ${
              key === productData.length - 1
                ? ''
                : 'border-b border-stroke dark:border-strokedark'
            }`}
            key={key}
          >
            <div className="flex items-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white font-medium">
                {product.name}
              </p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{product.category}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{product.orders}</p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-meta-3">{product.revenue}</p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className={product.growth >= 0 ? 'text-meta-3' : 'text-meta-1'}>
                {product.growth >= 0 ? '+' : ''}{product.growth}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOne;
