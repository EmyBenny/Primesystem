import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  completeGoogleRedirectResult,
  createAdminEmailPasswordAccount,
  db,
  signInWithAdminEmailPassword,
  signInWithGooglePopup,
  signInWithGoogleRedirect,
  signOutUser,
  testFirestoreConnection,
} from '../lib/firebase';
import { UserProfile } from '../types';
import { fetchUserProfile } from '../services/firestoreService';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: () => Promise<User | null>;
  signInRedirect: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  createAccountWithEmail: (email: string, password: string) => Promise<User>;
  recheckAdminRole: () => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const resolveAdminStatus = useCallback(async (currentUser: User | null): Promise<boolean> => {
    if (!currentUser) return false;
    const isBootstrapped =
      currentUser.emailVerified &&
      currentUser.email === BOOTSTRAPPED_ADMIN_EMAIL;
    if (isBootstrapped) return true;
    try {
      const adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));
      return adminSnap.exists();
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    testFirestoreConnection();
    completeGoogleRedirectResult().catch(() => {
      // Ignore redirect completion errors if none pending
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const adminOk = await resolveAdminStatus(currentUser);
        setIsAdmin(adminOk);

        try {
          const userProf = await fetchUserProfile(currentUser.uid);
          setProfile(userProf);
        } catch {
          setProfile(null);
        }
      } else {
        setIsAdmin(false);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [resolveAdminStatus]);

  const signIn = async () => {
    const result = await signInWithGooglePopup();
    return result.user;
  };

  const signInRedirect = async () => {
    await signInWithGoogleRedirect();
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithAdminEmailPassword(email, password);
    return result.user;
  };

  const createAccountWithEmail = async (email: string, password: string) => {
    const result = await createAdminEmailPasswordAccount(email, password);
    return result.user;
  };

  const recheckAdminRole = async () => {
    const adminOk = await resolveAdminStatus(auth.currentUser);
    setIsAdmin(adminOk);
    return adminOk;
  };

  const logout = async () => {
    await signOutUser();
  };

  const refreshProfile = async () => {
    if (!user) return;
    const userProf = await fetchUserProfile(user.uid);
    setProfile(userProf);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        signIn,
        signInRedirect,
        signInWithEmail,
        createAccountWithEmail,
        recheckAdminRole,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
