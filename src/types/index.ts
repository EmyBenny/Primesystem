export type ProductCategory =
  | 'Glass Doors & Windows'
  | 'Aluminium Systems'
  | 'Security Glass'
  | 'Architectural Ceilings'
  | 'Heavy Machinery'
  | 'Swimming Pool Systems';

export type StockStatus = 'In Stock' | 'Made to Order' | 'Pre-Order';

export type OrderType = 'order' | 'booking';

export type OrderStatus =
  | 'Confirmed'
  | 'In Fabrication'
  | 'Dispatched'
  | 'Completed'
  | 'Cancelled';

export type DestinationRegion =
  | 'Japan'
  | 'Europe'
  | 'Asia'
  | 'Taiwan'
  | 'International';

export type InquiryStatus = 'New' | 'Reviewed' | 'Quoted' | 'Closed';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  division: string;
  description: string;
  specifications: string[];
  priceUsd: number;
  unit: string;
  stockStatus: StockStatus;
  bookable: boolean;
  imageUrl: string;
  featured: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  userId: string;
  productId: string;
  sku: string;
  productName: string;
  category: string;
  unit: string;
  quantity: number;
  unitPriceUsd: number;
  lineTotalUsd: number;
}

export interface Order {
  id: string;
  userId: string;
  invoiceNumber: string;
  orderType: OrderType;
  customerName: string;
  companyName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  destinationRegion: DestinationRegion;
  bookingDate: string;
  notes: string;
  subtotalUsd: number;
  taxUsd: number;
  totalUsd: number;
  itemCount: number;
  status: OrderStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
  items?: OrderItem[];
}

export interface Inquiry {
  id: string;
  userId: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  market: 'Japan' | 'Europe' | 'Asia' | 'Taiwan' | 'Other';
  division: string;
  message: string;
  status: InquiryStatus;
  createdAt?: unknown;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  companyName?: string;
  phone?: string;
  shippingAddress?: string;
  updatedAt?: unknown;
}
