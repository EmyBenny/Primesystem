import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../data/catalogSeed';
import { useProducts } from '../context/ProductsContext';
import { ProductCard } from '../components/ProductCard';
import { ProductCategory, StockStatus } from '../types';

export function ProductsPage() {
  const { products, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCat = searchParams.get('category') || 'All';
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [stockFilter, setStockFilter] = useState<'All' | StockStatus>('All');
  const [queryText, setQueryText] = useState('');

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat =
        selectedCategory === 'All' || p.category === (selectedCategory as ProductCategory);
      const matchesStock =
        stockFilter === 'All' || p.stockStatus === stockFilter;
      const q = queryText.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCat && matchesStock && matchesSearch;
    });
  }, [products, selectedCategory, stockFilter, queryText]);

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16 space-y-10">
      {/* Page Header */}
      <div className="border-b border-[#E2D8C5] pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-medium uppercase tracking-wider text-[#5A1418]">
            E-Commerce & Fabrication Storefront
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#1F1815]">
            Architectural Systems, Machinery & Building Supply
          </h1>
          <p className="text-sm text-[#584B44] leading-relaxed">
            Purchase ready-to-ship inventory or book custom manufacturing runs and heavy equipment allocations. Every confirmed transaction automatically issues a numbered Prime System Group invoice receipt.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full lg:w-80 relative">
          <Search className="w-4 h-4 text-[#7C6E65] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="search"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search SKU, glass, aluminium, machinery..."
            aria-label="Search products"
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FFFDF7] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
          />
        </div>
      </div>

      {/* Interactive Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EFE7D6] border border-[#E2D8C5]">
          <button
            type="button"
            onClick={() => handleCategoryChange('All')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-[#5A1418] text-[#FAF6EA]'
                : 'text-[#584B44] hover:text-[#1F1815]'
            }`}
          >
            All Systems
          </button>
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#5A1418] text-[#FAF6EA]'
                  : 'text-[#584B44] hover:text-[#1F1815]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-[#7C6E65]">Availability:</span>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as 'All' | StockStatus)}
            aria-label="Filter by availability"
            className="px-3 py-1.5 text-xs font-medium bg-[#FFFDF7] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
          >
            <option value="All">All Availability</option>
            <option value="In Stock">In Stock</option>
            <option value="Made to Order">Made to Order</option>
            <option value="Pre-Order">Pre-Order</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs font-mono tabular-nums text-[#7C6E65]">
        Showing {filteredProducts.length} of {products.length} catalog items
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-96 bg-[#F3ECE0] border border-[#E2D8C5] animate-pulse"
            />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-[#FFFDF7] border border-[#E2D8C5] space-y-3">
          <p className="text-base font-semibold text-[#1F1815]">
            No products matched your filter criteria.
          </p>
          <p className="text-sm text-[#584B44]">
            Try clearing your search term or selecting another architectural division.
          </p>
          <button
            type="button"
            onClick={() => {
              handleCategoryChange('All');
              setStockFilter('All');
              setQueryText('');
            }}
            className="px-4 py-2 text-xs font-semibold bg-[#5A1418] text-[#FAF6EA] cursor-pointer"
          >
            Reset Catalog Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
