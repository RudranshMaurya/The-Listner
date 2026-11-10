import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { ref, onValue, get, set } from 'firebase/database';
import { auth, googleProvider, db } from '../lib/firebase';
import type { UserProfile, UserRole, Wallet } from '../types';
import { getUserProfile, saveUserProfile, subscribeToWallet } from '../lib/database';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile | null;
  role: UserRole | null;
  wallet: Wallet | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubWallet: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Subscribe to live wallet
        unsubWallet = subscribeToWallet(user.uid, (w) => {
          setWallet(w);
        });

        // Listen to live profile in RTDB
        const profileRef = ref(db, `profiles/${user.uid}`);
        const unsubProfile = onValue(profileRef, async (snapshot) => {
          if (snapshot.exists()) {
            const p = snapshot.val() as UserProfile;
            setProfile(p);
            checkAdminStatus(user.uid, p);
          } else {
            // Check if profile exists in users or create placeholder
            const p = await getUserProfile(user.uid);
            if (p) {
              setProfile(p);
              checkAdminStatus(user.uid, p);
            } else {
              setProfile(null);
              setIsAdmin(false);
            }
          }
          setLoading(false);
        });

        return () => {
          unsubProfile();
          if (unsubWallet) unsubWallet();
        };
      } else {
        setProfile(null);
        setWallet(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubWallet) unsubWallet();
    };
  }, []);

  const checkAdminStatus = async (uid: string, p: UserProfile | null) => {
    try {
      // Check admin node in RTDB or role in profile
      const adminSnap = await get(ref(db, `admin/config/admins/${uid}`));
      const isConfigAdmin = adminSnap.exists() && adminSnap.val() === true;
      const isRoleAdmin = p?.role === 'admin';
      setIsAdmin(isConfigAdmin || isRoleAdmin);
    } catch {
      setIsAdmin(p?.role === 'admin');
    }
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const existing = await getUserProfile(user.uid);

      if (!existing) {
        // First login: profile not yet completed, will be guided to onboarding
        const initialProfile: UserProfile = {
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || "User",
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          role: "talker", // default placeholder, chosen in onboarding
          createdAt: Date.now(),
          onboardingCompleted: false
        };
        await saveUserProfile(initialProfile);
        setProfile(initialProfile);
        return initialProfile;
      } else {
        setProfile(existing);
        return existing;
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setProfile(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const effectiveRole = data.role || profile?.role || (localStorage.getItem('tl_selected_role') as UserRole) || 'talker';
    if (data.role) {
      localStorage.setItem('tl_selected_role', data.role);
    }

    // 1. Immediate optimistic state update so UI and navigation never freeze
    const updated: UserProfile = {
      ...(profile || {
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || 'User',
        photoURL: currentUser.photoURL || '',
        role: effectiveRole,
        createdAt: Date.now(),
        onboardingCompleted: false
      }),
      ...data,
      role: data.role || profile?.role || effectiveRole,
      updatedAt: Date.now()
    };
    setProfile(updated);

    // 2. Persist to Firebase in background/try-catch
    try {
      await saveUserProfile({ ...data, uid: currentUser.uid });
    } catch (err) {
      console.warn('Background saveUserProfile sync:', err);
    }
  };

  const refreshProfile = async () => {
    if (!currentUser) return;
    const p = await getUserProfile(currentUser.uid);
    setProfile(p);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        role: profile?.role || null,
        wallet,
        isAdmin,
        loading,
        loginWithGoogle,
        logout,
        updateProfileData,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
