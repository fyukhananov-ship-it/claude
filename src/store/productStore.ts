import { catalog, type CatalogCategory, type CatalogProduct } from '../data/catalog'

const STORAGE_KEY = 'lv-catalog'

export type { CatalogCategory, CatalogProduct }

function readFromStorage(): CatalogCategory[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CatalogCategory[]
  } catch {
    return null
  }
}

function writeToStorage(data: CatalogCategory[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getCatalog(): CatalogCategory[] {
  const stored = readFromStorage()
  if (stored) return stored
  // Seed from hardcoded data on first run
  writeToStorage(catalog)
  return [...catalog]
}

export function saveCatalog(categories: CatalogCategory[]): CatalogCategory[] {
  writeToStorage(categories)
  return categories
}

// Category CRUD
export function addCategory(category: CatalogCategory): CatalogCategory[] {
  const data = getCatalog()
  data.push(category)
  return saveCatalog(data)
}

export function updateCategory(id: string, updates: Partial<CatalogCategory>): CatalogCategory[] {
  const data = getCatalog()
  const idx = data.findIndex(c => c.id === id)
  if (idx !== -1) {
    data[idx] = { ...data[idx], ...updates, id }
  }
  return saveCatalog(data)
}

export function deleteCategory(id: string): CatalogCategory[] {
  const data = getCatalog().filter(c => c.id !== id)
  return saveCatalog(data)
}

// Product CRUD
export function addProduct(categoryId: string, product: CatalogProduct): CatalogCategory[] {
  const data = getCatalog()
  const cat = data.find(c => c.id === categoryId)
  if (cat) {
    cat.products.push(product)
  }
  return saveCatalog(data)
}

export function updateProduct(categoryId: string, productId: string, updates: Partial<CatalogProduct>): CatalogCategory[] {
  const data = getCatalog()
  const cat = data.find(c => c.id === categoryId)
  if (cat) {
    const idx = cat.products.findIndex(p => p.id === productId)
    if (idx !== -1) {
      cat.products[idx] = { ...cat.products[idx], ...updates, id: productId }
    }
  }
  return saveCatalog(data)
}

export function deleteProduct(categoryId: string, productId: string): CatalogCategory[] {
  const data = getCatalog()
  const cat = data.find(c => c.id === categoryId)
  if (cat) {
    cat.products = cat.products.filter(p => p.id !== productId)
  }
  return saveCatalog(data)
}

// Stats
export function getTotalProductCount(): number {
  return getCatalog().reduce((sum, cat) => sum + cat.products.length, 0)
}

export function getCategoryCount(): number {
  return getCatalog().length
}
