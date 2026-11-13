import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MessageCircle, Minus, Plus, ShoppingBag } from 'lucide-react';
import { COMPANY_INFO } from '../data/catalogSeed';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { fetchProductById } from '../services/firestoreService';
import { Product } from '../types';
import { ResilientImage } from '../components/ResilientImage';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { products } = useProducts();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(
    () => products.find((p) => p.id === id) || null
  );
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(!product);

  useEffect(() => {
    if (!id) return;
    const fromContext = products.find((p) => p.id === id);
    if (fromContext) {
      setProduct(fromContext);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchProductById(id)
      .then((found) => setProduct(found))
      .finally(() => setLoading(false));
  }, [id, products]);

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16">
        <div className="h-96 bg-[#F3ECE0] border border-[#E2D8C5]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#1F1815]">Product Not Found</h1>
        <p className="text-sm text-[#584B44]">
          The requested item is unavailable or has been archived from the catalog.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#5A1418] text-[#FAF6EA]"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const whatsappText = encodeURIComponent(
    `Hello Prime System Group Japan, I am inquiring about ${product.name} (SKU: ${product.sku}) for ${quantity} ${product.unit}.`
  );

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16 space-y-10">
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-xs font-medium text-[#584B44] hover:text-[#5A1418]"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Products Catalog
      </Link>

      {/* Contiguous Purchase & Specification Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Sticky Gallery Left */}
        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <div className="aspect-[4/3] bg-[#EFE7D6] border border-[#E2D8C5] overflow-hidden">
            <ResilientImage
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Sticky Purchase Module Right */}
        <div className="lg:col-span-6 space-y-6 bg-[#FFFDF7] border border-[#E2D8C5] p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#7C6E65]">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{product.sku}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#5A1418] font-medium">{product.stockStatus}</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#1F1815]">
            {product.name}
          </h1>

          <div className="pt-2 pb-4 border-b border-[#E2D8C5] flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-[#5A1418]">
              ${product.priceUsd.toLocaleString('en-US')}
            </span>
            <span className="text-sm text-[#7C6E65]">{product.unit}</span>
          </div>

          <p className="text-sm text-[#584B44] leading-relaxed">
            {product.description}
          </p>

          {/* Technical Specifications */}
          {product.specifications.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#7C6E65]">
                Engineering Specifications
              </div>
              <ul className="divide-y divide-[#E2D8C5] border-t border-b border-[#E2D8C5] text-sm text-[#1F1815]">
                {product.specifications.map((spec) => (
                  <li key={spec} className="py-2.5">
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity Stepper & Dual Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-[#7C6E65]">
                Quantity ({product.unit})
              </span>
              <div className="flex items-center border border-[#E2D8C5] bg-[#FAF6EA]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-2.5 text-[#584B44] hover:text-[#1F1815] cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 text-sm font-mono tabular-nums font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="p-2.5 text-[#584B44] hover:text-[#1F1815] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => addItem(product, quantity, 'order', true)}
                className="inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold bg-[#5A1418] text-[#FAF6EA] hover:bg-[#400D10] transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Order Bag
              </button>
              <button
                type="button"
                onClick={() => addItem(product, quantity, 'booking', true)}
                className="inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold border border-[#5A1418] text-[#5A1418] hover:bg-[#5A1418] hover:text-[#FAF6EA] transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Book Fabrication Slot
              </button>
            </div>

            <a
              href={`${COMPANY_INFO.whatsappLink}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium bg-[#F3ECE0] border border-[#E2D8C5] text-[#1F1815] hover:border-[#5A1418] transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#5A1418]" />
              Ask Engineering Desk on WhatsApp ({COMPANY_INFO.whatsappNumber})
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
