/**
 * useProducts — загрузка товаров и категорий + фильтрация + сортировка
 *
 * Мёржит локальные данные из products.json с динамическими из Google Таблицы.
 */

import { useState, useMemo } from 'react'
import { useFetch }          from './useFetch'
import { useSheetsPrices }   from './useSheetsPrices'

const PAGE_SIZE = 8

export function useProducts({ initialCategory = 'all' } = {}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [sort,           setSort]           = useState('default')
  const [visibleCount,   setVisibleCount]   = useState(PAGE_SIZE)

  const { data: productsData, loading: loadingP, error: errorP } = useFetch('/data/products.json')
  const { data: categoriesData                                  } = useFetch('/data/categories.json')

  // Данные из Google Таблицы
  const { productsMap, loading: loadingPrices } = useSheetsPrices()

  const allProducts = useMemo(() => {
    const base = productsData?.products ?? []
    const merged = !Object.keys(productsMap).length
      ? base
      : base.map(p => {
          const s = productsMap[p.id]
          if (!s) return p

          const mergeSpecs = (baseSpecs, sheetSpecs) => {
            if (!sheetSpecs) return baseSpecs
            if (typeof sheetSpecs === 'object' && typeof baseSpecs === 'object') {
              return { ...baseSpecs, ...sheetSpecs }
            }
            return sheetSpecs || baseSpecs
          }

          return {
            ...p,
            ...(s.name            !== null ? { name:            s.name            } : {}),
            ...(s.price           !== null ? { price:           s.price           } : {}),
            ...(s.oldPrice        !== null ? { oldPrice:        s.oldPrice        } : {}),
            ...(s.description     !== null ? { description:     s.description     } : {}),
            ...(s.badge           !== null ? { badge:           s.badge           } : {}),
            ...(s.category        !== null ? { category:        s.category        } : {}),
            ...(s.image           !== null ? { image:           s.image           } : {}),
            ...(s.inStock         !== null ? { inStock:         s.inStock         } : {}),
            ...(s.featured        !== null ? { featured:        s.featured        } : {}),
            ...(s.wildberriesLink !== null ? { wildberriesLink: s.wildberriesLink } : {}),
            mainInfo:       mergeSpecs(p.mainInfo,       s.mainInfo),
            generalSpecs:   mergeSpecs(p.generalSpecs,   s.generalSpecs),
            materials:      s.materials ?? p.materials,
            additionalInfo: mergeSpecs(p.additionalInfo, s.additionalInfo),
            dimensions:     mergeSpecs(p.dimensions,     s.dimensions),
          }
        })
    return merged.filter(p => p.name?.trim())
  }, [productsData, productsMap])

  const categories = useMemo(() => {
    const base = categoriesData?.categories ?? []
    return base.map(cat => ({
      ...cat,
      count: cat.id === 'all'
        ? allProducts.length
        : allProducts.filter(p => p.category === cat.id).length,
    }))
  }, [categoriesData, allProducts])

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return allProducts
    return allProducts.filter(p => p.category === activeCategory)
  }, [allProducts, activeCategory])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sort === 'price-asc')  return arr.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') return arr.sort((a, b) => b.price - a.price)
    if (sort === 'new')        return arr.sort((a, b) => (b.badge === 'Новинка') - (a.badge === 'Новинка'))
    return arr
  }, [filtered, sort])

  const products = useMemo(() => sorted.slice(0, visibleCount), [sorted, visibleCount])
  const hasMore  = visibleCount < sorted.length
  const showMore = () => setVisibleCount(n => n + PAGE_SIZE)

  const handleSetCategory = (cat) => { setActiveCategory(cat); setVisibleCount(PAGE_SIZE) }
  const handleSetSort     = (s)   => { setSort(s);             setVisibleCount(PAGE_SIZE) }

  return {
    products,
    categories,
    loading: loadingP || loadingPrices,
    error:   errorP,
    activeCategory,
    setActiveCategory: handleSetCategory,
    sort,
    setSort: handleSetSort,
    visibleCount,
    showMore,
    hasMore,
    totalFiltered: sorted.length,
  }
}
