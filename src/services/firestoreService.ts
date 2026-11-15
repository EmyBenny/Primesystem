import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { DEFAULT_PRODUCTS } from '../data/catalogSeed';
import {
  db,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  CartItem,
  DestinationRegion,
  Inquiry,
  InquiryStatus,
  Order,
  OrderItem,
  OrderStatus,
  OrderType,
  Product,
  UserProfile,
} from '../types';

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(100000 + Math.random() * 899999);
  return `PSG-${year}-${suffix}`;
}

export function subscribeProducts(
  onData: (products: Product[], fromFirestore: boolean) => void,
  onError?: (err: Error) => void
) {
  const path = 'products';
  const q = query(collection(db, path), orderBy('name', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData(DEFAULT_PRODUCTS, false);
        return;
      }
      const list: Product[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Product, 'id'>),
      }));
      onData(list, true);
    },
    (error) => {
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function fetchProductById(productId: string): Promise<Product | null> {
  const path = `products/${productId}`;
  try {
    const snap = await getDoc(doc(db, 'products', productId));
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<Product, 'id'>) };
    }
    return DEFAULT_PRODUCTS.find((p) => p.id === productId) ?? null;
  } catch (error) {
    const fallback = DEFAULT_PRODUCTS.find((p) => p.id === productId);
    if (fallback) return fallback;
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function seedCatalogProducts(): Promise<number> {
  const path = 'products';
  try {
    const existing = await getDocs(collection(db, path));
    const existingIds = new Set(existing.docs.map((d) => d.id));
    const batch = writeBatch(db);
    let count = 0;

    for (const product of DEFAULT_PRODUCTS) {
      if (!existingIds.has(product.id)) {
        const ref = doc(db, path, product.id);
        batch.set(ref, {
          sku: product.sku,
          name: product.name,
          category: product.category,
          division: product.division,
          description: product.description,
          specifications: product.specifications.slice(0, 10),
          priceUsd: Number(product.priceUsd),
          unit: product.unit,
          stockStatus: product.stockStatus,
          bookable: Boolean(product.bookable),
          imageUrl: product.imageUrl,
          featured: Boolean(product.featured),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        count += 1;
      }
    }
    if (count > 0) {
      await batch.commit();
    }
    return count;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveProduct(
  productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string,
  existingCreatedAt?: unknown
): Promise<string> {
  const id =
    existingId && /^[a-zA-Z0-9_-]+$/.test(existingId)
      ? existingId
      : `psg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const path = `products/${id}`;

  const cleanPayload = {
    sku: productData.sku.trim().slice(0, 40),
    name: productData.name.trim().slice(0, 140),
    category: productData.category,
    division: productData.division.trim().slice(0, 80),
    description: productData.description.trim().slice(0, 1500),
    specifications: productData.specifications
      .map((s) => s.trim().slice(0, 160))
      .filter(Boolean)
      .slice(0, 10),
    priceUsd: Math.max(0, Number(productData.priceUsd)),
    unit: productData.unit.trim().slice(0, 40),
    stockStatus: productData.stockStatus,
    bookable: Boolean(productData.bookable),
    imageUrl: productData.imageUrl.trim().slice(0, 350000),
    featured: Boolean(productData.featured),
    createdAt: existingCreatedAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    if (existingId && existingCreatedAt) {
      await setDoc(doc(db, 'products', id), cleanPayload);
    } else {
      await setDoc(doc(db, 'products', id), {
        ...cleanPayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function deleteProductById(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export interface CreateOrderInput {
  userId: string;
  orderType: OrderType;
  customerName: string;
  companyName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  destinationRegion: DestinationRegion;
  bookingDate: string;
  notes: string;
  cartItems: CartItem[];
}

export async function createOrderWithItems(input: CreateOrderInput): Promise<Order> {
  const orderId = `ord-${Date.now()}-${Math.floor(100 + Math.random() * 899)}`;
  const invoiceNumber = generateInvoiceNumber();
  const path = `orders/${orderId}`;

  const subtotalUsd = input.cartItems.reduce(
    (sum, item) => sum + Number(item.product.priceUsd) * item.quantity,
    0
  );
  const taxRate = input.destinationRegion === 'Japan' ? 0.1 : 0;
  const taxUsd = Number((subtotalUsd * taxRate).toFixed(2));
  const totalUsd = Number((subtotalUsd + taxUsd).toFixed(2));
  const itemCount = input.cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const orderDoc = {
    userId: input.userId,
    invoiceNumber,
    orderType: input.orderType,
    customerName: input.customerName.trim().slice(0, 120),
    companyName: input.companyName.trim().slice(0, 140),
    customerEmail: input.customerEmail.trim().slice(0, 160),
    customerPhone: input.customerPhone.trim().slice(0, 40),
    shippingAddress: input.shippingAddress.trim().slice(0, 300),
    destinationRegion: input.destinationRegion,
    bookingDate: (input.bookingDate || '').trim().slice(0, 40),
    notes: (input.notes || '').trim().slice(0, 600),
    subtotalUsd,
    taxUsd,
    totalUsd,
    itemCount,
    status: 'Confirmed' as OrderStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const batch = writeBatch(db);
  const orderRef = doc(db, 'orders', orderId);
  batch.set(orderRef, orderDoc);

  const itemRecords: OrderItem[] = input.cartItems.map((ci, idx) => {
    const itemId = `item-${idx + 1}-${Date.now()}`;
    const lineTotalUsd = Number((Number(ci.product.priceUsd) * ci.quantity).toFixed(2));
    const itemPayload = {
      orderId,
      userId: input.userId,
      productId: ci.product.id,
      sku: ci.product.sku.slice(0, 40),
      productName: ci.product.name.slice(0, 140),
      category: ci.product.category.slice(0, 80),
      unit: ci.product.unit.slice(0, 40),
      quantity: ci.quantity,
      unitPriceUsd: Number(ci.product.priceUsd),
      lineTotalUsd,
    };
    batch.set(doc(db, 'orders', orderId, 'items', itemId), itemPayload);
    return { id: itemId, ...itemPayload };
  });

  try {
    await batch.commit();
    return {
      id: orderId,
      ...orderDoc,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: itemRecords,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchOrderItems(
  orderId: string,
  userId: string,
  isAdminUser: boolean
): Promise<OrderItem[]> {
  const path = `orders/${orderId}/items`;
  try {
    const colRef = collection(db, 'orders', orderId, 'items');
    const q = isAdminUser
      ? query(colRef)
      : query(colRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<OrderItem, 'id'>),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchOrderByInvoiceNumber(invoiceNumber: string): Promise<Order | null> {
  const clean = invoiceNumber.trim().toUpperCase();
  if (!/^PSG-[0-9]{4}-[0-9]{4,8}$/.test(clean)) {
    return null;
  }
  const path = 'orders';
  try {
    const q = query(collection(db, path), where('invoiceNumber', '==', clean));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    const orderData = docSnap.data() as Omit<Order, 'id'>;
    const items = await fetchOrderItems(docSnap.id, orderData.userId, false);
    return {
      id: docSnap.id,
      ...orderData,
      items,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeUserOrders(
  userId: string,
  onData: (orders: Order[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'orders';
  const q = query(collection(db, path), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const orders: Order[] = snapshot.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }))
        .sort((a, b) => {
          const tA = (a.createdAt as { toMillis?: () => number })?.toMillis?.() ?? 0;
          const tB = (b.createdAt as { toMillis?: () => number })?.toMillis?.() ?? 0;
          return tB - tA;
        });
      onData(orders);
    },
    (error) => {
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeAllOrders(
  onData: (orders: Order[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'orders';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const orders: Order[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Order, 'id'>),
      }));
      onData(orders);
    },
    (error) => {
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createInquiry(input: Omit<Inquiry, 'id' | 'status' | 'createdAt'>): Promise<string> {
  const inquiryId = `inq-${Date.now()}-${Math.floor(100 + Math.random() * 899)}`;
  const path = `inquiries/${inquiryId}`;
  try {
    await setDoc(doc(db, 'inquiries', inquiryId), {
      userId: input.userId,
      name: input.name.trim().slice(0, 120),
      company: input.company.trim().slice(0, 140),
      email: input.email.trim().slice(0, 160),
      phone: input.phone.trim().slice(0, 40),
      market: input.market,
      division: input.division.trim().slice(0, 80),
      message: input.message.trim().slice(0, 2000),
      status: 'New' as InquiryStatus,
      createdAt: serverTimestamp(),
    });
    return inquiryId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeAllInquiries(
  onData: (inquiries: Inquiry[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'inquiries';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Inquiry[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Inquiry, 'id'>),
      }));
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function updateInquiryStatus(
  inquiryId: string,
  status: InquiryStatus
): Promise<void> {
  const path = `inquiries/${inquiryId}`;
  try {
    await updateDoc(doc(db, 'inquiries', inquiryId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function upsertUserProfile(profile: Omit<UserProfile, 'updatedAt'>): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(
      doc(db, 'users', profile.uid),
      {
        uid: profile.uid,
        displayName: profile.displayName.slice(0, 120),
        email: profile.email.slice(0, 160),
        companyName: (profile.companyName || '').slice(0, 140),
        phone: (profile.phone || '').slice(0, 40),
        shippingAddress: (profile.shippingAddress || '').slice(0, 300),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export interface AdminSecurityDoc {
  algorithm: 'PBKDF2-SHA256';
  iterations: number;
  saltHex: string;
  hashHex: string;
  updatedBy: string;
  updatedAt?: unknown;
}

export async function fetchAdminSecurityRecord(): Promise<AdminSecurityDoc | null> {
  const path = 'adminSecurity/master';
  try {
    const snap = await getDoc(doc(db, 'adminSecurity', 'master'));
    if (!snap.exists()) return null;
    return snap.data() as AdminSecurityDoc;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveAdminSecurityRecord(record: {
  algorithm: 'PBKDF2-SHA256';
  iterations: number;
  saltHex: string;
  hashHex: string;
  updatedBy: string;
}): Promise<void> {
  const path = 'adminSecurity/master';
  try {
    await setDoc(doc(db, 'adminSecurity', 'master'), {
      algorithm: record.algorithm,
      iterations: record.iterations,
      saltHex: record.saltHex,
      hashHex: record.hashHex,
      updatedBy: record.updatedBy,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

