import { createContext, useContext, useState, type ReactNode } from 'react'
import * as store from './productStore'
import type { CatalogCategory, CatalogProduct } from './productStore'

interface ProductContextType {
  catalog: CatalogCategory[]
  addCategory: (category: CatalogCategory) => void
  updateCategory: (id: string, updates: Partial<CatalogCategory>) => void
  deleteCategory: (id: string) => void
  addProduct: (categoryId: string, product: CatalogProduct) => void
  updateProduct: (categoryId: string, productId: string, updates: Partial<CatalogProduct>) => void
  deleteProduct: (categoryId: string, productId: string) => void
  refreshCatalog: () => void
}

const ProductContext = createContext<ProductContextType | null>(null)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<CatalogCategory[]>(() => store.getCatalog())

  const refreshCatalog = () => setCatalog(store.getCatalog())

  const value: ProductContextType = {
    catalog,
    addCategory: (category) => setCatalog(store.addCategory(category)),
    updateCategory: (id, updates) => setCatalog(store.updateCategory(id, updates)),
    deleteCategory: (id) => setCatalog(store.deleteCategory(id)),
    addProduct: (categoryId, product) => setCatalog(store.addProduct(categoryId, product)),
    updateProduct: (categoryId, productId, updates) => setCatalog(store.updateProduct(categoryId, productId, updates)),
    deleteProduct: (categoryId, productId) => setCatalog(store.deleteProduct(categoryId, productId)),
    refreshCatalog,
  }

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts(): ProductContextType {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProducts must be used within ProductProvider')
  return ctx
}
