import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import { auth } from '../utils/firebase';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  permissions: string[];
  hasPermission: (key: string) => boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (user && !user.isAnonymous) {
        // Role + permissions come straight from the signed JWT (verified by the
        // backend), so no extra round-trip is needed.
        const superAdmin = user.role === 'superadmin';
        setIsSuperAdmin(superAdmin);
        setIsAdmin(superAdmin || user.role === 'admin');
        setPermissions(Array.isArray(user.permissions) ? user.permissions : []);
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setPermissions([]);
        if (!user) {
          // Ordinary visitor: mint a local anonymous session.
          signInAnonymously(auth).catch(() => {});
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Super admins implicitly have every permission.
  const hasPermission = (key: string) => isSuperAdmin || permissions.includes(key);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
      throw err;
    }
  };

  const value = {
    currentUser,
    isAdmin,
    isSuperAdmin,
    permissions,
    hasPermission,
    loading,
    error,
    login,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
