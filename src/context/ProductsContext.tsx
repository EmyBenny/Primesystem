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

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [fromFirestore, setFromFirestore] = useState(false);

  useEffect(() => {
    const unsub = subscribeProducts(
      (list, isLive) => {
        setProducts(list);
        setFromFirestore(isLive);
        setLoading(false);
      },
      () => {
        setProducts(DEFAULT_PRODUCTS);
        setFromFirestore(false);
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
