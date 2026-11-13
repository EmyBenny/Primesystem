import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_PRODUCTS } from '../data/catalogSeed';
import { subscribeProducts } from '../services/firestoreService';
import { Product } from '../types';

interface ProductsContextValue {
  products: Product[];
  loading: boolean;
  fromFirestore: boolean;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

const CATALOG_CACHE_KEY = 'psg_catalog_cache_v2';

function readCachedCatalog(): { products: Product[]; fromFirestore: boolean } | null {
  try {
    const raw = localStorage.getItem(CATALOG_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { products?: Product[]; fromFirestore?: boolean };
    if (Array.isArray(parsed.products) && parsed.products.length > 0) {
      return {
        products: parsed.products,
        fromFirestore: Boolean(parsed.fromFirestore),
      };
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const initialCache = readCachedCatalog();
  const [products, setProducts] = useState<Product[]>(
    initialCache?.products ?? DEFAULT_PRODUCTS
  );
  const [loading, setLoading] = useState(false);
  const [fromFirestore, setFromFirestore] = useState(
    initialCache?.fromFirestore ?? false
  );

  useEffect(() => {
    const unsub = subscribeProducts(
      (list, isLive) => {
        setProducts(list);
        setFromFirestore(isLive);
        setLoading(false);
        try {
          localStorage.setItem(
            CATALOG_CACHE_KEY,
            JSON.stringify({ products: list, fromFirestore: isLive })
          );
        } catch {
          // ignore storage quota errors
        }
      },
      () => {
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading, fromFirestore }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used inside ProductsProvider');
  return ctx;
}
