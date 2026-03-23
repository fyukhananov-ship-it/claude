import { useProducts } from '../../../store/ProductContext';

const TableOne = () => {
  const { catalog } = useProducts();

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Категории каталога
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-4">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Категория
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Товаров
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              С фото
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Доля
            </h5>
          </div>
        </div>

        {catalog.map((cat, key) => {
          const totalProducts = catalog.reduce((s, c) => s + c.products.length, 0);
          const withImage = cat.products.filter((p) => p.image).length;
          const share = totalProducts > 0
            ? Math.round((cat.products.length / totalProducts) * 100)
            : 0;

          return (
            <div
              className={`grid grid-cols-3 sm:grid-cols-4 ${
                key === catalog.length - 1
                  ? ''
                  : 'border-b border-stroke dark:border-strokedark'
              }`}
              key={cat.id}
            >
              <div className="flex items-center p-2.5 xl:p-5">
                <p className="font-medium text-black dark:text-white">
                  {cat.name}
                </p>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="text-black dark:text-white">{cat.products.length}</p>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="text-meta-3">
                  {withImage}/{cat.products.length}
                </p>
              </div>

              <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                <p className="text-meta-5">{share}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TableOne;
