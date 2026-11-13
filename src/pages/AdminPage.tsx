import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  FileText,
  ImagePlus,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MessageSquare,
  Package,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import { processImageFile } from '../utils/imageUpload';
import {
  ADMIN_LOGIN_EMAIL,
  BOOTSTRAP_ADMIN_PASSWORD_HASH,
  hashAdminPassword,
  verifyAdminPassword,
} from '../utils/passwordCrypto';
import {
  FIREBASE_DATABASE_ID,
  FIREBASE_PROJECT_ID,
  updateAdminFirebasePassword,
} from '../lib/firebase';
import {
  CATEGORY_IMAGES,
  PRODUCT_CATEGORIES,
} from '../data/catalogSeed';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import {
  AdminSecurityDoc,
  deleteProductById,
  fetchAdminSecurityRecord,
  saveAdminSecurityRecord,
  saveProduct,
  seedCatalogProducts,
  subscribeAllInquiries,
  subscribeAllOrders,
  updateInquiryStatus,
  updateOrderStatus,
} from '../services/firestoreService';
import {
  Inquiry,
  InquiryStatus,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
  StockStatus,
} from '../types';
import { ResilientImage } from '../components/ResilientImage';
import { InvoiceReceiptModal } from '../components/InvoiceReceiptModal';

type AdminTab = 'overview' | 'products' | 'orders' | 'bookings' | 'inquiries' | 'security';

const ADMIN_UNLOCK_SESSION_KEY = 'psg_admin_unlocked_uid_v1';

const ORDER_STATUSES: OrderStatus[] = [
  'Confirmed',
  'In Fabrication',
  'Dispatched',
  'Completed',
  'Cancelled',
];

const INQUIRY_STATUSES: InquiryStatus[] = ['New', 'Reviewed', 'Quoted', 'Closed'];

function formatDate(ts: unknown): string {
  if (!ts) return '—';
  const maybe = ts as { toDate?: () => Date };
  if (typeof maybe.toDate === 'function') {
    return maybe.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  return '—';
}

export function AdminPage() {
  const {
    user,
    loading: authLoading,
    isAdmin,
    signInWithEmail,
    createAccountWithEmail,
    recheckAdminRole,
    logout,
  } = useAuth();
  const { products, fromFirestore } = useProducts();

  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [operationNotAllowed, setOperationNotAllowed] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);
  const [authError, setAuthError] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');

  // Hashed Admin Password Security Gate State
  const [securityRecord, setSecurityRecord] = useState<AdminSecurityDoc | null>(null);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [passwordUnlocked, setPasswordUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Rotate Password Form State (inside Security tab)
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmNewPwd, setConfirmNewPwd] = useState('');
  const [rotateMsg, setRotateMsg] = useState('');
  const [rotateError, setRotateError] = useState('');

  // Product Form Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Glass Doors & Windows');
  const [division, setDivision] = useState('Construction & Building Materials');
  const [description, setDescription] = useState('');
  const [specsText, setSpecsText] = useState('');
  const [priceUsd, setPriceUsd] = useState('1200');
  const [unit, setUnit] = useState('per unit');
  const [stockStatus, setStockStatus] = useState<StockStatus>('In Stock');
  const [bookable, setBookable] = useState(true);
  const [featured, setFeatured] = useState(true);
  const [imageUrl, setImageUrl] = useState(CATEGORY_IMAGES['Glass Doors & Windows']);
  const [imageMeta, setImageMeta] = useState('');
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!user || !isAdmin) {
      setSecurityRecord(null);
      setPasswordUnlocked(false);
      return;
    }

    let active = true;
    setLoadingSecurity(true);
    fetchAdminSecurityRecord()
      .then(async (rec) => {
        if (!active) return;
        let resolvedRec = rec;
        if (!resolvedRec && user.email?.toLowerCase() === ADMIN_LOGIN_EMAIL) {
          try {
            await saveAdminSecurityRecord({
              ...BOOTSTRAP_ADMIN_PASSWORD_HASH,
              updatedBy: user.uid,
            });
            resolvedRec = {
              ...BOOTSTRAP_ADMIN_PASSWORD_HASH,
              updatedBy: user.uid,
            };
          } catch {
            resolvedRec = {
              ...BOOTSTRAP_ADMIN_PASSWORD_HASH,
              updatedBy: user.uid,
            };
          }
        }
        if (!active) return;
        setSecurityRecord(resolvedRec);
        const unlockedUid = sessionStorage.getItem(ADMIN_UNLOCK_SESSION_KEY);
        if (resolvedRec && unlockedUid === user.uid) {
          setPasswordUnlocked(true);
        } else {
          setPasswordUnlocked(false);
        }
      })
      .catch(() => {
        if (active) setPasswordUnlocked(false);
      })
      .finally(() => {
        if (active) setLoadingSecurity(false);
      });

    return () => {
      active = false;
    };
  }, [user, isAdmin]);

  useEffect(() => {
    if (!user || !isAdmin || !passwordUnlocked) return;
    const unsubOrders = subscribeAllOrders(
      (list) => setOrders(list),
      () => setOrders([])
    );
    const unsubInquiries = subscribeAllInquiries(
      (list) => setInquiries(list),
      () => setInquiries([])
    );
    return () => {
      unsubOrders();
      unsubInquiries();
    };
  }, [user, isAdmin, passwordUnlocked]);

  const handleCreateMasterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPasswordError('');
    if (passwordInput.length < 8) {
      setPasswordError('Admin password must be at least 8 characters long.');
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordBusy(true);
    try {
      const hashed = await hashAdminPassword(passwordInput);
      await saveAdminSecurityRecord({
        ...hashed,
        updatedBy: user.uid,
      });
      setSecurityRecord({
        ...hashed,
        updatedBy: user.uid,
      });
      sessionStorage.setItem(ADMIN_UNLOCK_SESSION_KEY, user.uid);
      setPasswordUnlocked(true);
      setPasswordInput('');
      setConfirmPasswordInput('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Unable to save hashed password.');
    } finally {
      setPasswordBusy(false);
    }
  };

  const handleVerifyMasterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !securityRecord) return;
    setPasswordError('');
    setPasswordBusy(true);
    try {
      const valid = await verifyAdminPassword(passwordInput, securityRecord);
      if (!valid) {
        setFailedAttempts((c) => c + 1);
        setPasswordError('Incorrect admin password. Verification failed.');
        setPasswordBusy(false);
        return;
      }
      sessionStorage.setItem(ADMIN_UNLOCK_SESSION_KEY, user.uid);
      setPasswordUnlocked(true);
      setPasswordInput('');
      setFailedAttempts(0);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Password verification failed.');
    } finally {
      setPasswordBusy(false);
    }
  };

  const handleRotatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !securityRecord) return;
    setRotateError('');
    setRotateMsg('');

    if (newPwd.length < 8) {
      setRotateError('New password must be at least 8 characters.');
      return;
    }
    if (newPwd !== confirmNewPwd) {
      setRotateError('New passwords do not match.');
      return;
    }

    setPasswordBusy(true);
    try {
      const validCurrent = await verifyAdminPassword(currentPwd, securityRecord);
      if (!validCurrent) {
        setRotateError('Current password is incorrect.');
        setPasswordBusy(false);
        return;
      }
      await updateAdminFirebasePassword(currentPwd, newPwd);
      const hashed = await hashAdminPassword(newPwd);
      await saveAdminSecurityRecord({
        ...hashed,
        updatedBy: user.uid,
      });
      setSecurityRecord({
        ...hashed,
        updatedBy: user.uid,
      });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmNewPwd('');
      setRotateMsg('Admin password updated and hashed with PBKDF2-SHA256.');
    } catch (err) {
      setRotateError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setPasswordBusy(false);
    }
  };

  const handleLockPortal = () => {
    sessionStorage.removeItem(ADMIN_UNLOCK_SESSION_KEY);
    setPasswordUnlocked(false);
    setPasswordInput('');
  };

  const handleAdminSignOut = async () => {
    sessionStorage.removeItem(ADMIN_UNLOCK_SESSION_KEY);
    setPasswordUnlocked(false);
    await logout();
  };

  const metrics = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'Cancelled');
    const totalRevenue = activeOrders.reduce((s, o) => s + o.totalUsd, 0);
    const bookingsCount = orders.filter((o) => o.orderType === 'booking').length;
    const openInquiries = inquiries.filter((i) => i.status === 'New').length;
    return {
      totalRevenue,
      ordersCount: orders.length,
      bookingsCount,
      openInquiries,
    };
  }, [orders, inquiries]);

  const openNewProductModal = () => {
    setEditingProduct(null);
    setSku(`PSG-${Math.floor(100 + Math.random() * 899)}`);
    setName('');
    setCategory('Glass Doors & Windows');
    setDivision('Construction & Building Materials');
    setDescription('');
    setSpecsText('');
    setPriceUsd('1200');
    setUnit('per unit');
    setStockStatus('In Stock');
    setBookable(true);
    setFeatured(true);
    setImageUrl(CATEGORY_IMAGES['Glass Doors & Windows']);
    setImageMeta('Studio category preset');
    setPendingFile(null);
    setIsDraggingImage(false);
    setFormError('');
    setShowProductForm(true);
  };

  const openEditProductModal = (p: Product) => {
    setEditingProduct(p);
    setSku(p.sku);
    setName(p.name);
    setCategory(p.category);
    setDivision(p.division);
    setDescription(p.description);
    setSpecsText(p.specifications.join('\n'));
    setPriceUsd(String(p.priceUsd));
    setUnit(p.unit);
    setStockStatus(p.stockStatus);
    setBookable(p.bookable);
    setFeatured(p.featured);
    setImageUrl(p.imageUrl);
    setImageMeta(p.imageUrl.startsWith('data:image') ? 'Uploaded product image' : 'Current catalog image');
    setPendingFile(null);
    setIsDraggingImage(false);
    setFormError('');
    setShowProductForm(true);
  };

  const handleImageFileUpload = async (file: File) => {
    setFormError('');
    setUploadingImage(true);
    try {
      const processed = await processImageFile(file);
      setImageUrl(processed.dataUrl);
      setPendingFile(null);
      setImageMeta(
        `Uploaded: ${processed.fileName} (${processed.width}×${processed.height} · ${processed.sizeKb} KB)`
      );
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to process image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    await handleImageFileUpload(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingImage) setIsDraggingImage(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
  };

  const handleDropImage = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setPendingFile(file);
    await handleImageFileUpload(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSavingProduct(true);
    try {
      const specs = specsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 10);

      await saveProduct(
        {
          sku,
          name,
          category,
          division,
          description,
          specifications: specs,
          priceUsd: Number(priceUsd) || 0,
          unit,
          stockStatus,
          bookable,
          imageUrl: imageUrl.trim() || CATEGORY_IMAGES[category],
          featured,
        },
        editingProduct?.id,
        editingProduct?.createdAt
      );
      setShowProductForm(false);
      setStatusNotice(
        editingProduct ? `Updated "${name}" in Firestore.` : `Added "${name}" to catalog.`
      );
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save product.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleSeedCatalog = async () => {
    setSeeding(true);
    try {
      const count = await seedCatalogProducts();
      setStatusNotice(
        count > 0
          ? `Seeded ${count} initial products into Firestore catalog.`
          : 'All default catalog products are already synced in Firestore.'
      );
    } catch (err) {
      setStatusNotice(err instanceof Error ? err.message : 'Catalog sync failed.');
    } finally {
      setSeeding(false);
    }
  };

  if (authLoading || (user && isAdmin && loadingSecurity)) {
    return (
      <div className="min-h-screen bg-[#FAF6EA] flex items-center justify-center p-6">
        <div className="w-full max-w-md h-56 bg-[#F3ECE0] border border-[#E2D8C5]" />
      </div>
    );
  }

  const handleAdminEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setOperationNotAllowed(false);

    const normalizedEmail = loginEmail.trim().toLowerCase();
    if (!normalizedEmail || !loginPassword) {
      setAuthError('Please enter both your admin email and password.');
      return;
    }

    setSigningIn(true);
    try {
      let signedUser;
      try {
        signedUser = await signInWithEmail(normalizedEmail, loginPassword);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          (msg.includes('auth/user-not-found') || msg.includes('auth/invalid-credential')) &&
          normalizedEmail === ADMIN_LOGIN_EMAIL
        ) {
          const matchesBootstrap = await verifyAdminPassword(
            loginPassword,
            BOOTSTRAP_ADMIN_PASSWORD_HASH
          );
          if (!matchesBootstrap) {
            throw new Error('Invalid email or password.');
          }
          try {
            signedUser = await createAccountWithEmail(normalizedEmail, loginPassword);
          } catch (createErr) {
            const createMsg = createErr instanceof Error ? createErr.message : String(createErr);
            if (createMsg.includes('auth/email-already-in-use')) {
              throw new Error('Invalid password for admin@mail.com.');
            }
            throw createErr;
          }
        } else {
          throw err;
        }
      }

      sessionStorage.setItem(ADMIN_UNLOCK_SESSION_KEY, signedUser.uid);
      setPasswordUnlocked(true);
      setLoginPassword('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('auth/operation-not-allowed')) {
        setOperationNotAllowed(true);
        setAuthError(
          'Email/Password sign-in is not yet enabled in Firebase Authentication for this project.'
        );
      } else if (
        msg.includes('auth/wrong-password') ||
        msg.includes('auth/invalid-credential') ||
        msg.includes('auth/user-not-found')
      ) {
        setAuthError('Invalid admin email or password.');
      } else if (msg.includes('auth/too-many-requests')) {
        setAuthError('Too many failed login attempts. Please wait a moment and try again.');
      } else {
        setAuthError(msg);
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleCopyUid = async (uid: string) => {
    try {
      await navigator.clipboard.writeText(uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    } catch {
      // Clipboard blocked
    }
  };

  const handleRecheckAuthorization = async () => {
    setCheckingRole(true);
    try {
      await recheckAdminRole();
    } finally {
      setCheckingRole(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF6EA] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#FFFDF7] border border-[#E2D8C5] p-8 space-y-6">
          <div className="space-y-2 text-center">
            <div className="text-xs font-mono uppercase tracking-wider text-[#5A1418]">
              Prime System Group · Restricted Admin Portal
            </div>
            <LayoutDashboard className="w-8 h-8 text-[#5A1418] mx-auto" />
            <h1 className="text-2xl font-bold text-[#1F1815]">
              Admin Sign In
            </h1>
            <p className="text-sm text-[#584B44]">
              Enter your administrator email and password to access the management console.
            </p>
          </div>

          <form onSubmit={handleAdminEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#584B44] mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7C6E65] absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@mail.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#FAF6EA] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#584B44] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7C6E65] absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-[#FAF6EA] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((v) => !v)}
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-2.5 text-[#7C6E65] hover:text-[#1F1815] cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 text-left text-xs text-[#5A1418] bg-[#5A1418]/10 border border-[#5A1418]/30 space-y-2">
                <p className="font-medium">{authError}</p>
                {operationNotAllowed && (
                  <div className="space-y-1.5 text-[#1F1815]">
                    <p>
                      Enable the <strong>Email/Password</strong> sign-in provider once in Firebase Console, then click Sign In again:
                    </p>
                    <a
                      href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/providers`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block font-semibold text-[#5A1418] underline"
                    >
                      Open Firebase Auth Providers →
                    </a>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={signingIn}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#5A1418] text-[#FAF6EA] text-sm font-semibold hover:bg-[#400D10] disabled:opacity-60 transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              {signingIn ? 'Verifying Credentials...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    const isAdminEmailUser = user.email?.toLowerCase() === ADMIN_LOGIN_EMAIL;
    return (
      <div className="min-h-screen bg-[#FAF6EA] flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-[#FFFDF7] border border-[#E2D8C5] p-8 text-center space-y-4">
          <ShieldAlert className="w-8 h-8 text-[#5A1418] mx-auto" />
          <h1 className="text-xl font-bold text-[#1F1815]">
            {isAdminEmailUser ? 'Complete One-Time Admin Authorization' : 'Administrator Access Denied'}
          </h1>
          <p className="text-sm text-[#584B44]">
            Signed in as <span className="font-mono text-[#1F1815]">{user.email}</span>.
          </p>

          {isAdminEmailUser ? (
            <div className="text-left p-4 bg-[#F3ECE0] border border-[#E2D8C5] space-y-3 text-xs text-[#1F1815]">
              <p className="leading-relaxed">
                Your Firebase Auth credentials succeeded. To authorize database admin permissions for this account, create a document in Firestore under collection{' '}
                <span className="font-mono font-semibold">admins</span> with document ID equal to your UID:
              </p>
              <div className="flex items-center justify-between gap-2 p-2.5 bg-[#FFFDF7] border border-[#E2D8C5]">
                <span className="font-mono text-[11px] break-all">{user.uid}</span>
                <button
                  type="button"
                  onClick={() => handleCopyUid(user.uid)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold border border-[#E2D8C5] hover:border-[#5A1418] shrink-0 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  {copiedUid ? 'Copied' : 'Copy UID'}
                </button>
              </div>
              <p className="text-[#584B44] font-mono text-[11px]">
                Fields: uid (&quot;{user.uid}&quot;), email (&quot;{user.email}&quot;), role (&quot;admin&quot;), createdAt (timestamp)
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore/databases/${FIREBASE_DATABASE_ID}/data`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#5A1418] underline"
                >
                  Open Firestore Console →
                </a>
                <button
                  type="button"
                  disabled={checkingRole}
                  onClick={handleRecheckAuthorization}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#5A1418] text-[#FAF6EA] hover:bg-[#400D10] cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checkingRole ? 'animate-spin' : ''}`} />
                  {checkingRole ? 'Checking...' : 'Check Authorization Now'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#584B44]">
              This account is not authorized to access the Prime System Group Admin Portal. Sign out to log in with your administrator email and password.
            </p>
          )}

          <button
            type="button"
            onClick={() => handleAdminSignOut()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold border border-[#5A1418] text-[#5A1418] hover:bg-[#5A1418] hover:text-[#FAF6EA] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {isAdminEmailUser ? 'Sign Out' : 'Switch to Admin Login'}
          </button>
        </div>
      </div>
    );
  }

  // Hashed Password Security Gate (First-Time Setup OR Verification)
  if (!passwordUnlocked) {
    return (
      <div className="min-h-screen bg-[#FAF6EA] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#FFFDF7] border border-[#E2D8C5] p-8 space-y-6">
          <div className="space-y-2 text-center">
            <div className="text-xs font-mono uppercase tracking-wider text-[#5A1418]">
              PBKDF2-SHA256 Password Verification
            </div>
            <KeyRound className="w-8 h-8 text-[#5A1418] mx-auto" />
            <h1 className="text-2xl font-bold text-[#1F1815]">
              {securityRecord ? 'Enter Admin Password' : 'Set Hashed Admin Password'}
            </h1>
            <p className="text-xs text-[#584B44]">
              Verified identity: <span className="font-mono text-[#1F1815]">{user.email}</span>
            </p>
          </div>

          {securityRecord ? (
            <form onSubmit={handleVerifyMasterPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#584B44] mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter your admin password"
                    className="w-full px-3 py-2.5 pr-10 text-sm bg-[#FAF6EA] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText((v) => !v)}
                    aria-label={showPasswordText ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-2.5 text-[#7C6E65] hover:text-[#1F1815] cursor-pointer"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="p-3 text-xs text-[#5A1418] bg-[#5A1418]/10 border border-[#5A1418]/30">
                  {passwordError} {failedAttempts > 1 ? `(${failedAttempts} failed attempts)` : ''}
                </div>
              )}

              <button
                type="submit"
                disabled={passwordBusy}
                className="w-full py-3 px-4 bg-[#5A1418] text-[#FAF6EA] text-sm font-semibold hover:bg-[#400D10] disabled:opacity-60 transition-colors cursor-pointer"
              >
                {passwordBusy ? 'Verifying Hash...' : 'Unlock Admin Portal'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateMasterPassword} className="space-y-4">
              <p className="text-xs text-[#584B44] bg-[#F3ECE0] border border-[#E2D8C5] p-3 leading-relaxed">
                Create your admin password. It is cryptographically salted and hashed using PBKDF2-SHA256 (120,000 iterations) before storing in Firestore; plaintext is never stored.
              </p>
              <div>
                <label className="block text-xs font-medium text-[#584B44] mb-1">
                  New Admin Password (min 8 chars) *
                </label>
                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-3 py-2.5 pr-10 text-sm bg-[#FAF6EA] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText((v) => !v)}
                    aria-label={showPasswordText ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-2.5 text-[#7C6E65] hover:text-[#1F1815] cursor-pointer"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#584B44] mb-1">
                  Confirm Password *
                </label>
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-[#FAF6EA] border border-[#E2D8C5] focus:outline-none focus:border-[#5A1418]"
                />
              </div>

              {passwordError && (
                <div className="p-3 text-xs text-[#5A1418] bg-[#5A1418]/10 border border-[#5A1418]/30">
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                disabled={passwordBusy}
                className="w-full py-3 px-4 bg-[#5A1418] text-[#FAF6EA] text-sm font-semibold hover:bg-[#400D10] disabled:opacity-60 transition-colors cursor-pointer"
              >
                {passwordBusy ? 'Hashing & Saving...' : 'Hash Password & Enter Portal'}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-[#E2D8C5] text-center">
            <button
              type="button"
              onClick={() => handleAdminSignOut()}
              className="text-xs font-medium text-[#584B44] hover:text-[#5A1418] cursor-pointer"
            >
              Sign out ({user.email})
            </button>
          </div>
        </div>
      </div>
    );
  }

  const bookingOrders = orders.filter((o) => o.orderType === 'booking');

  return (
    <div className="min-h-screen bg-[#FAF6EA] text-[#1F1815]">
      {/* Standalone Admin Portal Header (Completely separated from storefront) */}
      <header className="no-print bg-[#F3ECE0] border-b border-[#E2D8C5]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold tracking-tight text-[#5A1418] whitespace-nowrap">
              Prime System Group
            </span>
            <span className="text-[#7C6E65]" aria-hidden="true">/</span>
            <span className="text-xs font-mono text-[#584B44] whitespace-nowrap">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleLockPortal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#E2D8C5] bg-[#FFFDF7] text-[#584B44] hover:text-[#5A1418] hover:border-[#5A1418] cursor-pointer whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5" />
              Lock
            </button>
            <button
              type="button"
              onClick={() => handleAdminSignOut()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#E2D8C5] bg-[#FFFDF7] text-[#584B44] hover:text-[#1F1815] cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
      {/* Top Admin Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2D8C5]">
        <div>
          <div className="text-xs font-mono text-[#7C6E65]">
            Operations Console · {user.email}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F1815] mt-1">
            Executive Admin Dashboard
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!fromFirestore && (
            <button
              type="button"
              onClick={handleSeedCatalog}
              disabled={seeding}
              className="px-3.5 py-2 text-xs font-semibold border border-[#5A1418] text-[#5A1418] hover:bg-[#5A1418] hover:text-[#FAF6EA] transition-colors cursor-pointer whitespace-nowrap"
            >
              {seeding ? 'Syncing Catalog...' : 'Sync Default Catalog to Database'}
            </button>
          )}
          <button
            type="button"
            onClick={openNewProductModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#5A1418] text-[#FAF6EA] hover:bg-[#400D10] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </button>
        </div>
      </div>

      {statusNotice && (
        <div className="mt-4 px-4 py-3 text-xs font-medium bg-[#F3ECE0] border border-[#E2D8C5] text-[#5A1418] flex items-center justify-between">
          <span>{statusNotice}</span>
          <button
            type="button"
            onClick={() => setStatusNotice('')}
            className="underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sidebar + Main Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">
        <aside className="lg:col-span-3 bg-[#F3ECE0] border border-[#E2D8C5] p-3 space-y-1">
          {[
            { id: 'overview', label: 'Overview & KPIs', icon: LayoutDashboard },
            { id: 'products', label: `Products (${products.length})`, icon: Package },
            { id: 'orders', label: `Orders & Invoices (${orders.length})`, icon: FileText },
            { id: 'bookings', label: `Bookings (${bookingOrders.length})`, icon: Calendar },
            { id: 'inquiries', label: `Trade Inquiries (${inquiries.length})`, icon: MessageSquare },
            { id: 'security', label: 'Security & Password', icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-left transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#5A1418] text-[#FAF6EA]'
                    : 'text-[#584B44] hover:bg-[#FAF6EA] hover:text-[#1F1815]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        <div className="lg:col-span-9 space-y-8 min-w-0">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-[#FFFDF7] border border-[#E2D8C5]">
                  <div className="text-xs text-[#7C6E65]">Invoiced Revenue</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-[#5A1418] mt-1">
                    ${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="p-5 bg-[#FFFDF7] border border-[#E2D8C5]">
                  <div className="text-xs text-[#7C6E65]">Total Orders & Receipts</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-[#1F1815] mt-1">
                    {metrics.ordersCount}
                  </div>
                </div>
                <div className="p-5 bg-[#FFFDF7] border border-[#E2D8C5]">
                  <div className="text-xs text-[#7C6E65]">Fabrication Bookings</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-[#1F1815] mt-1">
                    {metrics.bookingsCount}
                  </div>
                </div>
                <div className="p-5 bg-[#FFFDF7] border border-[#E2D8C5]">
                  <div className="text-xs text-[#7C6E65]">New Trade Inquiries</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-[#1F1815] mt-1">
                    {metrics.openInquiries}
                  </div>
                </div>
              </div>

              {/* Recent Invoices Table */}
              <div className="bg-[#FFFDF7] border border-[#E2D8C5]">
                <div className="px-5 py-4 border-b border-[#E2D8C5] flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#1F1815]">
                    Recent Orders & Issued Invoices
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-[#5A1418] hover:underline cursor-pointer"
                  >
                    Manage all →
                  </button>
                </div>
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-sm text-[#7C6E65]">
                    No customer orders or bookings recorded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#E2D8C5] bg-[#F3ECE0] text-[#7C6E65] uppercase tracking-wider">
                          <th className="py-3 px-4">Invoice</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2D8C5]">
                        {orders.slice(0, 6).map((o) => (
                          <tr key={o.id} className="hover:bg-[#FAF6EA]">
                            <td className="py-3 px-4 font-mono font-semibold text-[#5A1418]">
                              <button
                                type="button"
                                onClick={() => setSelectedInvoice(o)}
                                className="hover:underline cursor-pointer"
                              >
                                {o.invoiceNumber}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-[#1F1815]">
                              {o.customerName}
                            </td>
                            <td className="py-3 px-4 text-[#584B44]">
                              {o.orderType === 'booking' ? 'Booking' : 'Order'}
                            </td>
                            <td className="py-3 px-4 font-medium text-[#1F1815]">
                              {o.status}
                            </td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold">
                              ${o.totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div className="bg-[#FFFDF7] border border-[#E2D8C5]">
              <div className="px-5 py-4 border-b border-[#E2D8C5] flex items-center justify-between">
                <h2 className="text-base font-bold text-[#1F1815]">
                  Catalog Inventory ({products.length} Items)
                </h2>
                <button
                  type="button"
                  onClick={openNewProductModal}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#5A1418] text-[#FAF6EA] cursor-pointer"
                >
                  + New Product
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E2D8C5] bg-[#F3ECE0] text-[#7C6E65] uppercase tracking-wider">
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4 text-right">Price</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2D8C5]">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FAF6EA]">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#EFE7D6] border border-[#E2D8C5] shrink-0 overflow-hidden">
                              <ResilientImage
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-[#1F1815]">{p.name}</div>
                              <div className="font-mono text-[#7C6E65]">{p.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#584B44] whitespace-nowrap">
                          {p.category}
                        </td>
                        <td className="py-3 px-4 text-[#1F1815] whitespace-nowrap">
                          {p.stockStatus}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold whitespace-nowrap">
                          ${p.priceUsd.toLocaleString('en-US')}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                          <button
                            type="button"
                            onClick={() => openEditProductModal(p)}
                            className="px-2.5 py-1 border border-[#E2D8C5] text-[#1F1815] hover:border-[#5A1418] cursor-pointer"
                          >
                            Edit
                          </button>
                          {fromFirestore && (
                            <button
                              type="button"
                              onClick={() => deleteProductById(p.id)}
                              aria-label={`Delete ${p.name}`}
                              className="p-1 text-[#7C6E65] hover:text-[#5A1418] cursor-pointer align-middle"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3 & 4: ORDERS & BOOKINGS */}
          {(activeTab === 'orders' || activeTab === 'bookings') && (
            <div className="bg-[#FFFDF7] border border-[#E2D8C5]">
              <div className="px-5 py-4 border-b border-[#E2D8C5]">
                <h2 className="text-base font-bold text-[#1F1815]">
                  {activeTab === 'bookings'
                    ? 'Scheduled Fabrication & Machinery Bookings'
                    : 'All Customer Orders & Official Invoices'}
                </h2>
              </div>
              {(activeTab === 'bookings' ? bookingOrders : orders).length === 0 ? (
                <div className="p-8 text-center text-sm text-[#7C6E65]">
                  No records found in this ledger.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E2D8C5] bg-[#F3ECE0] text-[#7C6E65] uppercase tracking-wider">
                        <th className="py-3 px-4">Invoice</th>
                        <th className="py-3 px-4">Client & Market</th>
                        <th className="py-3 px-4">Date / Slot</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Total</th>
                        <th className="py-3 px-4 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2D8C5]">
                      {(activeTab === 'bookings' ? bookingOrders : orders).map((o) => (
                        <tr key={o.id} className="hover:bg-[#FAF6EA]">
                          <td className="py-3 px-4 font-mono font-semibold text-[#5A1418] whitespace-nowrap">
                            {o.invoiceNumber}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#1F1815]">{o.customerName}</div>
                            <div className="text-[#7C6E65]">
                              {o.destinationRegion} · {o.customerPhone}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums text-[#584B44] whitespace-nowrap">
                            {o.bookingDate || formatDate(o.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={o.status}
                              onChange={(e) =>
                                updateOrderStatus(o.id, e.target.value as OrderStatus)
                              }
                              aria-label={`Status for ${o.invoiceNumber}`}
                              className="px-2 py-1 bg-[#FAF6EA] border border-[#E2D8C5] text-xs font-medium focus:outline-none focus:border-[#5A1418]"
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold whitespace-nowrap">
                            ${o.totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedInvoice(o)}
                              className="px-3 py-1 bg-[#5A1418] text-[#FAF6EA] font-semibold cursor-pointer"
                            >
                              Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TRADE INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="bg-[#FFFDF7] border border-[#E2D8C5]">
              <div className="px-5 py-4 border-b border-[#E2D8C5]">
                <h2 className="text-base font-bold text-[#1F1815]">
                  International Trading & Quote Inquiries
                </h2>
              </div>
              {inquiries.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#7C6E65]">
                  No trade inquiries submitted yet.
                </div>
              ) : (
                <div className="divide-y divide-[#E2D8C5]">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="p-5 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="font-semibold text-sm text-[#1F1815]">
                            {inq.name}
                          </span>
                          {inq.company && (
                            <span className="text-xs text-[#584B44] ml-2">
                              · {inq.company}
                            </span>
                          )}
                          <div className="text-xs font-mono text-[#7C6E65] mt-0.5">
                            {inq.market} · {inq.division} · {inq.email} · {inq.phone}
                          </div>
                        </div>
                        <select
                          value={inq.status}
                          onChange={(e) =>
                            updateInquiryStatus(inq.id, e.target.value as InquiryStatus)
                          }
                          aria-label={`Status for inquiry from ${inq.name}`}
                          className="px-2.5 py-1 text-xs font-medium bg-[#FAF6EA] border border-[#E2D8C5]"
                        >
                          {INQUIRY_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="text-sm text-[#584B44] bg-[#FAF6EA] p-3 border border-[#E2D8C5]">
                        {inq.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SECURITY & HASHED PASSWORD */}
          {activeTab === 'security' && (
            <div className="bg-[#FFFDF7] border border-[#E2D8C5] p-6 sm:p-8 space-y-6">
              <div className="border-b border-[#E2D8C5] pb-4 space-y-1">
                <h2 className="text-base font-bold text-[#1F1815]">
                  Admin Password & Cryptographic Hash Settings
                </h2>
                <p className="text-xs text-[#584B44]">
                  Your portal password is protected with a unique 128-bit random salt and 120,000-iteration PBKDF2-SHA256 derivation.
                </p>
              </div>

              {securityRecord && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-[#FAF6EA] border border-[#E2D8C5] p-4">
                  <div>
                    <div className="text-[#7C6E65]">Hash Algorithm</div>
                    <div className="font-mono font-semibold text-[#1F1815] mt-0.5">
                      {securityRecord.algorithm}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#7C6E65]">Key Stretching</div>
                    <div className="font-mono font-semibold tabular-nums text-[#1F1815] mt-0.5">
                      {securityRecord.iterations.toLocaleString()} iterations
                    </div>
                  </div>
                  <div>
                    <div className="text-[#7C6E65]">Stored Salt Prefix</div>
                    <div className="font-mono text-[#5A1418] mt-0.5">
                      {securityRecord.saltHex.slice(0, 12)}...
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleRotatePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-medium text-[#584B44] mb-1">
                    Current Admin Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF6EA] border border-[#E2D8C5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#584B44] mb-1">
                    New Admin Password (min 8 chars) *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF6EA] border border-[#E2D8C5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#584B44] mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmNewPwd}
                    onChange={(e) => setConfirmNewPwd(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF6EA] border border-[#E2D8C5]"
                  />
                </div>

                {rotateError && (
                  <div className="p-3 text-xs text-[#5A1418] bg-[#5A1418]/10 border border-[#5A1418]/30">
                    {rotateError}
                  </div>
                )}
                {rotateMsg && (
                  <div className="p-3 text-xs text-[#1F1815] bg-[#F3ECE0] border border-[#E2D8C5]">
                    {rotateMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordBusy}
                  className="px-5 py-2.5 text-xs font-semibold bg-[#5A1418] text-[#FAF6EA] hover:bg-[#400D10] cursor-pointer"
                >
                  {passwordBusy ? 'Re-Hashing...' : 'Update & Hash Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showProductForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl bg-[#FFFDF7] border border-[#E2D8C5] p-6 sm:p-8 my-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2D8C5] pb-4">
              <h2 className="text-lg font-bold text-[#1F1815]">
                {editingProduct ? `Edit Product (${editingProduct.sku})` : 'Add Catalog Product'}
              </h2>
              <button
                type="button"
                onClick={() => setShowProductForm(false)}
                className="text-xs text-[#584B44] hover:text-[#1F1815] cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#584B44] mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={40}
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF6EA] border border-[#E2D8C5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#584B44] mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const cat = e.target.value as ProductCategory;
                      setCategory(cat);
                      if (!editingProduct) setImageUrl(CATEGORY_IMAGES[cat]);
                    }}
                    className="w-full px-3 py-2 text-sm bg-[#FAF6EA] border border-[#E2D8C5]"
                  >
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#584B44] mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={140}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF6EA] border border-[#E2D8C5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#584B44] mb-1">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF6EA] border border-[#E2D8C5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#584B44] mb-1">
                    Unit *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={40}
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF6EA] border border-[#E2D8C5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#584B44] mb-1">
                    Stock Status *
                  </label>
                  <select
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF6EA] border border-[#E2D8C5]"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Made to Order">Made to Order</option>
                    <option value="Pre-Order">Pre-Order</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#584B44] mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={10}
                  maxLength={1500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF6EA] border border-[#E2D8C5]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#584B44] mb-1">
                  Specifications (one per line, max 10)
                </label>
                <textarea
                  rows={3}
                  value={specsText}
                  onChange={(e) => setSpecsText(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF6EA] border border-[#E2D8C5]"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-[#584B44]">
                    Product Image *
                  </label>
                  {imageMeta && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#5A1418]">
                      <CheckCircle2 className="w-3 h-3" />
                      {imageMeta}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch">
                  {/* Live Image Preview */}
                  <div className="sm:col-span-4 aspect-[4/3] bg-[#EFE7D6] border border-[#E2D8C5] overflow-hidden">
                    <ResilientImage
                      src={imageUrl}
                      alt={name || 'Product preview'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Drag & Drop + Choose File + Upload Zone */}
                  <div
                    onDragEnter={handleDragOver}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDropImage}
                    className={`sm:col-span-8 border-2 border-dashed p-4 flex flex-col items-center justify-center text-center transition-colors ${
                      isDraggingImage
                        ? 'border-[#5A1418] bg-[#5A1418]/10'
                        : 'border-[#E2D8C5] bg-[#FAF6EA] hover:border-[#5A1418]/60'
                    }`}
                  >
                    <ImagePlus className="w-6 h-6 text-[#5A1418] mb-1.5" />
                    <p className="text-xs font-semibold text-[#1F1815]">
                      {uploadingImage
                        ? 'Optimizing & uploading image...'
                        : isDraggingImage
                        ? 'Drop image file to upload'
                        : 'Drag and drop product image here'}
                    </p>
                    <p className="text-[11px] text-[#7C6E65] mt-0.5 mb-3">
                      Supports JPG, PNG, WebP · Auto-optimized for fast storefront loading
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                      aria-label="Choose product image file"
                    />

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-3 py-1.5 text-xs font-medium border border-[#5A1418] text-[#5A1418] bg-[#FFFDF7] hover:bg-[#5A1418] hover:text-[#FAF6EA] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Choose File
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (pendingFile) {
                            handleImageFileUpload(pendingFile);
                          } else {
                            fileInputRef.current?.click();
                          }
                        }}
                        disabled={uploadingImage}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#5A1418] text-[#FAF6EA] hover:bg-[#400D10] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#7C6E65] mb-1">
                    Or enter Image URL / Asset Path directly
                  </label>
                  <input
                    type="text"
                    maxLength={350000}
                    value={imageUrl.startsWith('data:image') ? '' : imageUrl}
                    placeholder={
                      imageUrl.startsWith('data:image')
                        ? 'Uploaded image attached (paste a URL here to replace)'
                        : 'https://... or /assets/...'
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        setImageUrl(e.target.value);
                        setImageMeta('Custom image URL');
                      }
                    }}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#FAF6EA] border border-[#E2D8C5]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs font-medium text-[#1F1815]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookable}
                    onChange={(e) => setBookable(e.target.checked)}
                  />
                  Allow Fabrication Booking
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                  />
                  Featured on Home
                </label>
              </div>

              {formError && (
                <div className="p-3 text-xs text-[#5A1418] bg-[#5A1418]/10 border border-[#5A1418]/30">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="px-4 py-2 text-xs font-medium border border-[#E2D8C5] text-[#584B44] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-5 py-2 text-xs font-semibold bg-[#5A1418] text-[#FAF6EA] hover:bg-[#400D10] cursor-pointer"
                >
                  {savingProduct ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <InvoiceReceiptModal
        order={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
      </div>
    </div>
  );
}
