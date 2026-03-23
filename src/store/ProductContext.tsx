import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import * as store from './productStore'
import type { CatalogCategory, CatalogProduct } from './productStore'

interface ProductContextType {
  catalog: CatalogCategory[]
  loading: boolean
  error: string | null
  addCategory: (category: Pick<CatalogCategory, 'name' | 'icon'>) => Promise<void>
  updateCategory: (id: string, updates: Partial<Pick<CatalogCategory, 'name' | 'icon'>>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  addProduct: (categoryId: string, product: Pick<CatalogProduct, 'name' | 'description' | 'weight'>, imageFile?: File) => Promise<void>
  updateProduct: (categoryId: string, productId: string, updates: Partial<Pick<CatalogProduct, 'name' | 'description' | 'weight'>>, imageFile?: File) => Promise<void>
  deleteProduct: (categoryId: string, productId: string) => Promise<void>
  refreshCatalog: () => Promise<void>
}

const ProductContext = createContext<ProductContextType | null>(null)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<CatalogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshCatalog = useCallback(async () => {
    try {
      setError(null)
      const data = await store.getCatalog()
      setCatalog(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load catalog')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCatalog()
  }, [refreshCatalog])

  const addCategory = async (category: Pick<CatalogCategory, 'name' | 'icon'>) => {
    await store.addCategory(category)
    await refreshCatalog()
  }

  const updateCategory = async (id: string, updates: Partial<Pick<CatalogCategory, 'name' | 'icon'>>) => {
    await store.updateCategory(id, updates)
    await refreshCatalog()
  }

  const deleteCategory = async (id: string) => {
    await store.deleteCategory(id)
    await refreshCatalog()
  }

  const addProduct = async (categoryId: string, product: Pick<CatalogProduct, 'name' | 'description' | 'weight'>, imageFile?: File) => {
    await store.addProduct(categoryId, product, imageFile)
    await refreshCatalog()
  }

  const updateProduct = async (categoryId: string, productId: string, updates: Partial<Pick<CatalogProduct, 'name' | 'description' | 'weight'>>, imageFile?: File) => {
    await store.updateProduct(categoryId, productId, updates, imageFile)
    await refreshCatalog()
  }

  const deleteProduct = async (categoryId: string, productId: string) => {
    await store.deleteProduct(categoryId, productId)
    await refreshCatalog()
  }

  const value: ProductContextType = {
    catalog,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
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
