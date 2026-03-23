import { useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { useProducts } from '../../store/ProductContext';
import type { CatalogCategory, CatalogProduct } from '../../store/productStore';

const ICON_OPTIONS = ['Cookie', 'CakeSlice', 'Cake', 'Slice', 'Cherry', 'ChefHat'];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const emptyProduct: Omit<CatalogProduct, 'id'> = {
  name: '',
  description: '',
  weight: '',
  image: '',
};

const Products = () => {
  const {
    catalog,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();

  const [selectedCatId, setSelectedCatId] = useState<string>(catalog[0]?.id || '');
  const [editingProduct, setEditingProduct] = useState<(CatalogProduct & { isNew?: boolean }) | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', icon: 'Cookie', editId: '' });

  const selectedCategory = catalog.find((c) => c.id === selectedCatId);

  // Category handlers
  const handleAddCategory = () => {
    setCatForm({ name: '', icon: 'Cookie', editId: '' });
    setShowCatForm(true);
  };

  const handleEditCategory = (cat: CatalogCategory) => {
    setCatForm({ name: cat.name, icon: cat.icon, editId: cat.id });
    setShowCatForm(true);
  };

  const handleSaveCategory = () => {
    if (!catForm.name.trim()) return;
    if (catForm.editId) {
      updateCategory(catForm.editId, { name: catForm.name, icon: catForm.icon });
    } else {
      const newCat: CatalogCategory = {
        id: generateId(),
        name: catForm.name,
        icon: catForm.icon,
        products: [],
      };
      addCategory(newCat);
      setSelectedCatId(newCat.id);
    }
    setShowCatForm(false);
  };

  const handleDeleteCategory = (id: string) => {
    if (!confirm('Удалить категорию и все её товары?')) return;
    deleteCategory(id);
    if (selectedCatId === id) {
      setSelectedCatId(catalog.find((c) => c.id !== id)?.id || '');
    }
  };

  // Product handlers
  const handleAddProduct = () => {
    setEditingProduct({ id: generateId(), ...emptyProduct, isNew: true });
  };

  const handleEditProduct = (product: CatalogProduct) => {
    setEditingProduct({ ...product });
  };

  const handleSaveProduct = () => {
    if (!editingProduct || !selectedCatId || !editingProduct.name.trim()) return;
    const { isNew, ...productData } = editingProduct as CatalogProduct & { isNew?: boolean };
    if (isNew) {
      addProduct(selectedCatId, productData);
    } else {
      updateProduct(selectedCatId, productData.id, productData);
    }
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    if (!confirm('Удалить товар?')) return;
    deleteProduct(selectedCatId, productId);
  };

  return (
    <>
      <Breadcrumb pageName="Продукция" />

      {/* Category management */}
      <div className="mb-6 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Категории
          </h4>
          <button
            onClick={handleAddCategory}
            className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90"
          >
            + Добавить категорию
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {catalog.map((cat) => (
            <div
              key={cat.id}
              className={`group flex items-center gap-2 rounded-full px-4 py-2 cursor-pointer transition-all ${
                selectedCatId === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-2 text-black dark:bg-meta-4 dark:text-white hover:bg-primary hover:text-white'
              }`}
              onClick={() => setSelectedCatId(cat.id)}
            >
              <span className="text-sm font-medium">{cat.name}</span>
              <span className="text-xs opacity-60">({cat.products.length})</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditCategory(cat);
                }}
                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Редактировать"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.5 1.75L12.25 3.5L10.5 1.75ZM11.375 0.583L7.292 4.666C7.10514 4.85262 6.97791 5.09085 6.927 5.35L6.417 7.583L8.65 7.073C8.909 7.022 9.147 6.895 9.334 6.708L13.417 2.625C13.5224 2.51963 13.6062 2.39492 13.6636 2.25791C13.7209 2.12091 13.7508 1.97411 13.7515 1.8258C13.7522 1.67749 13.7236 1.53042 13.6675 1.3929C13.6114 1.25538 13.5288 1.12991 13.4244 1.02554C13.3201 0.921175 13.1946 0.838621 13.0571 0.782483C12.9196 0.726344 12.7725 0.697812 12.6242 0.698488C12.4759 0.699163 12.3291 0.729032 12.1921 0.786414C12.0551 0.843795 11.9304 0.927567 11.825 1.033L11.375 0.583Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12.25 8.75V11.375C12.25 11.7065 12.1183 12.0245 11.8839 12.2589C11.6495 12.4933 11.3315 12.625 11 12.625H2.625C2.29348 12.625 1.97554 12.4933 1.74112 12.2589C1.5067 12.0245 1.375 11.7065 1.375 11.375V3C1.375 2.66848 1.5067 2.35054 1.74112 2.11612C1.97554 1.8817 2.29348 1.75 2.625 1.75H5.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(cat.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                title="Удалить"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.75 3.5H12.25M5.25 6.125V10.125M8.75 6.125V10.125M2.625 3.5L3.5 11.375C3.5 11.7065 3.6317 12.0245 3.86612 12.2589C4.10054 12.4933 4.41848 12.625 4.75 12.625H9.25C9.58152 12.625 9.89946 12.4933 10.1339 12.2589C10.3683 12.0245 10.5 11.7065 10.5 11.375L11.375 3.5M4.375 3.5V2.625C4.375 2.29348 4.5067 1.97554 4.74112 1.74112C4.97554 1.5067 5.29348 1.375 5.625 1.375H8.375C8.70652 1.375 9.02446 1.5067 9.25888 1.74112C9.4933 1.97554 9.625 2.29348 9.625 2.625V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Category form modal */}
        {showCatForm && (
          <div className="mt-4 border-t border-stroke pt-4 dark:border-strokedark">
            <h5 className="mb-3 font-medium text-black dark:text-white">
              {catForm.editId ? 'Редактировать категорию' : 'Новая категория'}
            </h5>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                  Название
                </label>
                <input
                  type="text"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full rounded border border-stroke bg-transparent py-2 px-4 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  placeholder="Название категории"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                  Иконка
                </label>
                <select
                  value={catForm.icon}
                  onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                  className="rounded border border-stroke bg-transparent py-2 px-4 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                >
                  {ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveCategory}
                  className="rounded bg-primary py-2 px-6 text-white hover:bg-opacity-90"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setShowCatForm(false)}
                  className="rounded border border-stroke py-2 px-6 hover:bg-gray dark:border-strokedark"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products table */}
      {selectedCategory && (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between p-6 border-b border-stroke dark:border-strokedark">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              {selectedCategory.name}
              <span className="ml-2 text-sm font-normal text-bodydark2">
                ({selectedCategory.products.length} товаров)
              </span>
            </h4>
            <button
              onClick={handleAddProduct}
              className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90"
            >
              + Добавить товар
            </button>
          </div>

          {/* Product form */}
          {editingProduct && (
            <div className="p-6 border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
              <h5 className="mb-4 font-medium text-black dark:text-white">
                {editingProduct.isNew ? 'Новый товар' : 'Редактирование'}
              </h5>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                    Название *
                  </label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full rounded border border-stroke bg-white py-2 px-4 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    placeholder="Название товара"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                    Вес / объём
                  </label>
                  <input
                    type="text"
                    value={editingProduct.weight}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, weight: e.target.value })
                    }
                    className="w-full rounded border border-stroke bg-white py-2 px-4 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    placeholder="например: 75 г"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                    Описание
                  </label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, description: e.target.value })
                    }
                    rows={2}
                    className="w-full rounded border border-stroke bg-white py-2 px-4 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    placeholder="Описание товара"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                    URL изображения (необязательно)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.image || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, image: e.target.value })
                    }
                    className="w-full rounded border border-stroke bg-white py-2 px-4 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    placeholder="/claude/image.jpg или https://..."
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleSaveProduct}
                  className="rounded bg-primary py-2 px-6 text-white hover:bg-opacity-90"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="rounded border border-stroke py-2 px-6 hover:bg-gray dark:border-strokedark"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}

          {/* Products list */}
          <div className="p-6">
            {selectedCategory.products.length === 0 ? (
              <p className="text-center text-bodydark2 py-8">
                В этой категории пока нет товаров
              </p>
            ) : (
              <div className="flex flex-col">
                {/* Header */}
                <div className="grid grid-cols-12 rounded-sm bg-gray-2 dark:bg-meta-4">
                  <div className="col-span-4 p-2.5 xl:p-5">
                    <h5 className="text-sm font-medium uppercase">Название</h5>
                  </div>
                  <div className="col-span-4 p-2.5 xl:p-5">
                    <h5 className="text-sm font-medium uppercase">Описание</h5>
                  </div>
                  <div className="col-span-2 p-2.5 text-center xl:p-5">
                    <h5 className="text-sm font-medium uppercase">Вес</h5>
                  </div>
                  <div className="col-span-2 p-2.5 text-center xl:p-5">
                    <h5 className="text-sm font-medium uppercase">Действия</h5>
                  </div>
                </div>

                {/* Rows */}
                {selectedCategory.products.map((product, idx) => (
                  <div
                    key={product.id}
                    className={`grid grid-cols-12 ${
                      idx !== selectedCategory.products.length - 1
                        ? 'border-b border-stroke dark:border-strokedark'
                        : ''
                    }`}
                  >
                    <div className="col-span-4 flex items-center p-2.5 xl:p-5">
                      <div className="flex items-center gap-3">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        )}
                        <p className="font-medium text-black dark:text-white">
                          {product.name}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-4 flex items-center p-2.5 xl:p-5">
                      <p className="text-sm text-bodydark2 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                    <div className="col-span-2 flex items-center justify-center p-2.5 xl:p-5">
                      <p className="text-black dark:text-white">{product.weight}</p>
                    </div>
                    <div className="col-span-2 flex items-center justify-center gap-3 p-2.5 xl:p-5">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="hover:text-primary"
                        title="Редактировать"
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.5 2.25L15.75 4.5M14.625 0.75L9.375 6C9.135 6.238 8.972 6.543 8.907 6.875L8.25 9.75L11.125 9.093C11.457 9.028 11.762 8.865 12 8.625L17.25 3.375C17.3854 3.2395 17.4926 3.07919 17.5662 2.90301C17.6398 2.72684 17.6783 2.53842 17.6792 2.34803C17.6801 2.15764 17.6434 1.96886 17.5714 1.79198C17.4995 1.6151 17.3938 1.45375 17.2594 1.31713C17.125 1.18052 16.9648 1.07321 16.7887 0.999619C16.6126 0.926027 16.4243 0.887506 16.234 0.886572C16.0436 0.885637 15.8549 0.922323 15.6781 0.99418C15.5013 1.06604 15.3399 1.17176 15.2025 1.306L14.625 0.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M15.75 11.25V14.625C15.75 15.0228 15.592 15.4044 15.3107 15.6857C15.0294 15.967 14.6478 16.125 14.25 16.125H3.375C2.97718 16.125 2.59564 15.967 2.31434 15.6857C2.03304 15.4044 1.875 15.0228 1.875 14.625V3.75C1.875 3.35218 2.03304 2.97064 2.31434 2.68934C2.59564 2.40804 2.97718 2.25 3.375 2.25H6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="hover:text-danger"
                        title="Удалить"
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.25 4.5H15.75M6.75 7.875V13.125M11.25 7.875V13.125M3.375 4.5L4.5 14.625C4.5 15.0228 4.65804 15.4044 4.93934 15.6857C5.22064 15.967 5.60218 16.125 6 16.125H12C12.3978 16.125 12.7794 15.967 13.0607 15.6857C13.342 15.4044 13.5 15.0228 13.5 14.625L14.625 4.5M5.625 4.5V3.375C5.625 2.97718 5.78304 2.59564 6.06434 2.31434C6.34564 2.03304 6.72718 1.875 7.125 1.875H10.875C11.2728 1.875 11.6544 2.03304 11.9357 2.31434C12.217 2.59564 12.375 2.97718 12.375 3.375V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Products;
