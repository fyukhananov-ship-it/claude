import { apiFetch, apiUpload, STRAPI_URL } from '../lib/strapi'
import type { StrapiResponse } from '../lib/strapi'

export interface CatalogProduct {
  id: string
  name: string
  description: string
  weight: string
  image?: string
}

export interface CatalogCategory {
  id: string
  name: string
  icon: string
  products: CatalogProduct[]
}

// --- Strapi response types ---

interface StrapiImage {
  url: string
}

interface StrapiProduct {
  id: number
  documentId: string
  name: string
  description: string | null
  weight: string | null
  image: StrapiImage | null
}

interface StrapiCategory {
  id: number
  documentId: string
  name: string
  icon: string
  sortOrder: number | null
  products: StrapiProduct[]
}

// --- Mappers ---

function mapProduct(p: StrapiProduct): CatalogProduct {
  const imageUrl = p.image?.url
    ? (p.image.url.startsWith('http') ? p.image.url : `${STRAPI_URL}${p.image.url}`)
    : undefined

  return {
    id: p.documentId,
    name: p.name,
    description: p.description || '',
    weight: p.weight || '',
    image: imageUrl,
  }
}

function mapCategory(c: StrapiCategory): CatalogCategory {
  return {
    id: c.documentId,
    name: c.name,
    icon: c.icon,
    products: (c.products || []).map(mapProduct),
  }
}

// --- CRUD ---

export async function getCatalog(): Promise<CatalogCategory[]> {
  const res = await apiFetch<StrapiResponse<StrapiCategory[]>>(
    '/categories?populate=products.image&sort=sortOrder:asc&pagination[pageSize]=100'
  )
  return res.data.map(mapCategory)
}

export async function addCategory(category: Pick<CatalogCategory, 'name' | 'icon'>): Promise<void> {
  await apiFetch('/categories', {
    method: 'POST',
    body: JSON.stringify({ data: { name: category.name, icon: category.icon } }),
  })
}

export async function updateCategory(documentId: string, updates: Partial<Pick<CatalogCategory, 'name' | 'icon'>>): Promise<void> {
  await apiFetch(`/categories/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({ data: updates }),
  })
}

export async function deleteCategory(documentId: string): Promise<void> {
  // Strapi cascading delete is not automatic — delete products first
  const res = await apiFetch<StrapiResponse<StrapiCategory>>(
    `/categories/${documentId}?populate=products`
  )
  const products = res.data.products || []
  await Promise.all(products.map(p => apiFetch(`/products/${p.documentId}`, { method: 'DELETE' })))
  await apiFetch(`/categories/${documentId}`, { method: 'DELETE' })
}

export async function addProduct(
  categoryDocumentId: string,
  product: Pick<CatalogProduct, 'name' | 'description' | 'weight'>,
  imageFile?: File
): Promise<void> {
  if (imageFile) {
    const formData = new FormData()
    formData.append('data', JSON.stringify({
      name: product.name,
      description: product.description,
      weight: product.weight,
      category: categoryDocumentId,
    }))
    formData.append('files.image', imageFile)
    await apiUpload('/products', formData)
  } else {
    await apiFetch('/products', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          name: product.name,
          description: product.description,
          weight: product.weight,
          category: categoryDocumentId,
        },
      }),
    })
  }
}

export async function updateProduct(
  _categoryDocumentId: string,
  productDocumentId: string,
  updates: Partial<Pick<CatalogProduct, 'name' | 'description' | 'weight'>>,
  imageFile?: File
): Promise<void> {
  if (imageFile) {
    const formData = new FormData()
    formData.append('data', JSON.stringify(updates))
    formData.append('files.image', imageFile)
    // Strapi v5: upload with entry update via upload endpoint
    const uploadRes = await fetch(`${STRAPI_URL}/upload`, {
      method: 'POST',
      body: (() => {
        const fd = new FormData()
        fd.append('files', imageFile)
        fd.append('ref', 'api::product.product')
        fd.append('refId', productDocumentId)
        fd.append('field', 'image')
        return fd
      })(),
    })
    if (!uploadRes.ok) throw new Error('Image upload failed')
    // Also update other fields
    if (Object.keys(updates).length > 0) {
      await apiFetch(`/products/${productDocumentId}`, {
        method: 'PUT',
        body: JSON.stringify({ data: updates }),
      })
    }
  } else {
    await apiFetch(`/products/${productDocumentId}`, {
      method: 'PUT',
      body: JSON.stringify({ data: updates }),
    })
  }
}

export async function deleteProduct(_categoryDocumentId: string, productDocumentId: string): Promise<void> {
  await apiFetch(`/products/${productDocumentId}`, { method: 'DELETE' })
}

// --- Stats ---

export async function getTotalProductCount(): Promise<number> {
  const res = await apiFetch<StrapiResponse<unknown[]>>('/products?pagination[pageSize]=1')
  return res.meta?.pagination?.total || 0
}

export async function getCategoryCount(): Promise<number> {
  const res = await apiFetch<StrapiResponse<unknown[]>>('/categories?pagination[pageSize]=1')
  return res.meta?.pagination?.total || 0
}
