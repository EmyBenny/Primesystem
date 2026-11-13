import { Link } from 'react-router-dom';
import { Calendar, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <article className="group flex flex-col bg-[#FFFDF7] border border-[#E2D8C5] transition-transform duration-200 hover:-translate-y-0.5">
      <Link
        to={`/products/${product.id}`}
        className="block aspect-[4/3] w-full overflow-hidden bg-[#EFE7D6] border-b border-[#E2D8C5]"
      >
        <ResilientImage
          src={product.imageUrl}
          alt={product.name}
          fallbackTitle={product.category}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          priority={product.featured}
        />
      </Link>

      <div className="flex-1 flex flex-col p-5 space-y-3">
        {/* Zero-pill unboxed metadata */}
        <div className="flex items-center justify-between gap-2 text-xs text-[#7C6E65]">
          <span className="truncate">{product.category}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums whitespace-nowrap shrink-0">
            {product.stockStatus}
          </span>
        </div>

        <Link to={`/products/${product.id}`} className="block">
          <h3 className="text-base font-semibold text-[#1F1815] leading-snug group-hover:text-[#5A1418] transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-[#584B44] line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="pt-2 mt-auto border-t border-[#E2D8C5]/70 flex items-baseline justify-between gap-3">
          <div>
            <span className="text-base font-bold font-mono tabular-nums text-[#5A1418]">
              ${product.priceUsd.toLocaleString('en-US')}
            </span>
            <span className="text-xs text-[#7C6E65] ml-1">{product.unit}</span>
          </div>
          <span className="text-xs font-mono text-[#7C6E65]">{product.sku}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => addItem(product, 1, 'order', true)}
            className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold bg-[#5A1418] text-[#FAF6EA] hover:bg-[#400D10] transition-colors cursor-pointer whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Order Now
          </button>
          <button
            type="button"
            onClick={() => addItem(product, 1, 'booking', true)}
            className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium border border-[#5A1418] text-[#5A1418] hover:bg-[#5A1418] hover:text-[#FAF6EA] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5" />
            Book Item
          </button>
        </div>
      </div>
    </article>
  );
}
