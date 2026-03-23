import React from 'react';
import CardDataStats from '../../components/CardDataStats';
import ChartOne from '../../components/Charts/ChartOne';
import ChartThree from '../../components/Charts/ChartThree';
import ChartTwo from '../../components/Charts/ChartTwo';
import RecentOrders from '../../components/RecentOrders';
import TableOne from '../../components/Tables/TableOne';
import { useProducts } from '../../../store/ProductContext';

const ECommerce: React.FC = () => {
  const { catalog } = useProducts();

  const totalProducts = catalog.reduce((sum, cat) => sum + cat.products.length, 0);
  const totalCategories = catalog.length;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats title="Категорий" total={String(totalCategories)} rate="" levelUp={false}>
          <svg
            className="fill-primary dark:fill-white"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.5 1.5H3.5C2.4 1.5 1.5 2.4 1.5 3.5V9.5C1.5 10.6 2.4 11.5 3.5 11.5H9.5C10.6 11.5 11.5 10.6 11.5 9.5V3.5C11.5 2.4 10.6 1.5 9.5 1.5ZM10 9.5C10 9.8 9.8 10 9.5 10H3.5C3.2 10 3 9.8 3 9.5V3.5C3 3.2 3.2 3 3.5 3H9.5C9.8 3 10 3.2 10 3.5V9.5ZM18.5 1.5H12.5C11.4 1.5 10.5 2.4 10.5 3.5V9.5C10.5 10.6 11.4 11.5 12.5 11.5H18.5C19.6 11.5 20.5 10.6 20.5 9.5V3.5C20.5 2.4 19.6 1.5 18.5 1.5ZM19 9.5C19 9.8 18.8 10 18.5 10H12.5C12.2 10 12 9.8 12 9.5V3.5C12 3.2 12.2 3 12.5 3H18.5C18.8 3 19 3.2 19 3.5V9.5ZM9.5 10.5H3.5C2.4 10.5 1.5 11.4 1.5 12.5V18.5C1.5 19.6 2.4 20.5 3.5 20.5H9.5C10.6 20.5 11.5 19.6 11.5 18.5V12.5C11.5 11.4 10.6 10.5 9.5 10.5ZM10 18.5C10 18.8 9.8 19 9.5 19H3.5C3.2 19 3 18.8 3 18.5V12.5C3 12.2 3.2 12 3.5 12H9.5C9.8 12 10 12.2 10 12.5V18.5ZM18.5 10.5H12.5C11.4 10.5 10.5 11.4 10.5 12.5V18.5C10.5 19.6 11.4 20.5 12.5 20.5H18.5C19.6 20.5 20.5 19.6 20.5 18.5V12.5C20.5 11.4 19.6 10.5 18.5 10.5ZM19 18.5C19 18.8 18.8 19 18.5 19H12.5C12.2 19 12 18.8 12 18.5V12.5C12 12.2 12.2 12 12.5 12H18.5C18.8 12 19 12.2 19 12.5V18.5Z"
              fill=""
            />
          </svg>
        </CardDataStats>
        <CardDataStats title="Товаров в каталоге" total={String(totalProducts)} rate="" levelUp={false}>
          <svg
            className="fill-primary dark:fill-white"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 1L2 5V17L11 21L20 17V5L11 1ZM11 2.66L17.94 5.73L11 8.8L4.06 5.73L11 2.66ZM3.5 6.87L10.25 9.86V19.13L3.5 16.14V6.87ZM11.75 19.13V9.86L18.5 6.87V16.14L11.75 19.13Z"
              fill=""
            />
          </svg>
        </CardDataStats>
        {catalog.slice(0, 2).map((cat) => (
          <CardDataStats
            key={cat.id}
            title={cat.name.split(',')[0]}
            total={String(cat.products.length) + ' поз.'}
            rate=""
            levelUp={false}
          >
            <svg
              className="fill-primary dark:fill-white"
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 2.99066 21.3813 3.85003 21.3813H18.1157C18.975 21.3813 19.8 21.0031 20.35 20.3844C20.9 19.7656 21.2094 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5625 19.8344 18.15 19.8344H3.85003C3.43753 19.8344 3.05941 19.6625 2.78441 19.3531C2.50941 19.0438 2.37191 18.6313 2.44066 18.2188L4.12503 3.43751C4.19378 2.71563 4.81253 2.16563 5.56878 2.16563H16.4313C17.1532 2.16563 17.7719 2.71563 17.875 3.43751L19.5938 18.2531C19.6282 18.6656 19.4907 19.0438 19.2157 19.3531Z"
                fill=""
              />
            </svg>
          </CardDataStats>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <ChartOne />
        <ChartTwo />
        <ChartThree />
        <div className="col-span-12 xl:col-span-8">
          <TableOne />
        </div>
        <RecentOrders />
      </div>
    </>
  );
};

export default ECommerce;
