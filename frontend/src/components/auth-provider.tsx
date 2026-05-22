"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth, hasFirebaseConfig } from "@/lib/firebase";
import {
  deleteFirebaseUserRecord,
  syncFirebaseUserRecord,
} from "@/lib/firebase-user-records";

type AppUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

type AuthContextValue = {
  user: AppUser | null;
  isLoading: boolean;
  authMode: "firebase" | "local";
  authMessage: string | null;
  login: (input: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => Promise<void>;
  signup: (input: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  resetPassword: (email: string) => Promise<string>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const LOCAL_USER_KEY = "dsiq.local.user";
const LOCAL_PASSWORD_PREFIX = "dsiq.local.password:";

const AuthContext = createContext<AuthContextValue | null>(null);

function mapFirebaseUser(user: {
  uid: string;
  email: string | null;
  displayName: string | null;
}): AppUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  };
}

function readLocalUser(): AppUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(LOCAL_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AppUser;
  } catch {
    return null;
  }
}

function writeLocalUser(user: AppUser | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!user) {
    window.localStorage.removeItem(LOCAL_USER_KEY);
    return;
  }

  window.localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
}

function clearLocalDemoAccount(uid?: string | null, email?: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  const keysToDelete: string[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key) {
      continue;
    }

    const isDemoKey =
      key.startsWith("dsiq.") ||
      key.startsWith(LOCAL_PASSWORD_PREFIX) ||
      (uid ? key.includes(uid) : false) ||
      (email ? key.includes(email.toLowerCase()) : false);

    if (isDemoKey) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => {
    window.localStorage.removeItem(key);
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authMode: "firebase" | "local" = hasFirebaseConfig ? "firebase" : "local";
  const authMessage =
    authMode === "local"
      ? "Running in local demo auth mode. Add Firebase keys later to switch to real authentication."
      : null;

  useEffect(() => {
    if (authMode === "local") {
      setUser(readLocalUser());
      setIsLoading(false);
      return;
    }

    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser ? mapFirebaseUser(nextUser) : null);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [authMode]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      authMode,
      authMessage,
      login: async ({ email, password, rememberMe }) => {
        if (authMode === "local") {
          const storedPassword = window.localStorage.getItem(
            `${LOCAL_PASSWORD_PREFIX}${email.toLowerCase()}`,
          );

          if (!storedPassword) {
            throw new Error("No local account found for this email. Create one first.");
          }

          if (storedPassword !== password) {
            throw new Error("Incorrect password.");
          }

          const storedUser = readLocalUser();
          const nextUser = {
            uid: `local-${email.toLowerCase()}`,
            email,
            displayName: storedUser?.displayName || email.split("@")[0],
          };

          writeLocalUser(nextUser);
          setUser(nextUser);
          return;
        }

        if (!auth) {
          throw new Error("Firebase Auth is not available.");
        }

        await setPersistence(
          auth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence,
        );
        const credential = await signInWithEmailAndPassword(auth, email, password);
        await syncFirebaseUserRecord({
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: credential.user.displayName,
          reason: "login",
        });
        setUser(mapFirebaseUser(credential.user));
      },
      signup: async ({ fullName, email, password }) => {
        if (authMode === "local") {
          const nextUser = {
            uid: `local-${email.toLowerCase()}`,
            email,
            displayName: fullName.trim() || email.split("@")[0],
          };

          window.localStorage.setItem(
            `${LOCAL_PASSWORD_PREFIX}${email.toLowerCase()}`,
            password,
          );
          writeLocalUser(nextUser);
          setUser(nextUser);
          return;
        }

        if (!auth) {
          throw new Error("Firebase Auth is not available.");
        }

        const credential = await createUserWithEmailAndPassword(auth, email, password);

        if (fullName.trim()) {
          await updateProfile(credential.user, { displayName: fullName.trim() });
        }

        await syncFirebaseUserRecord({
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: fullName.trim() || credential.user.displayName,
          reason: "signup",
        });

        setUser(
          mapFirebaseUser({
            ...credential.user,
            displayName: fullName.trim() || credential.user.displayName,
          }),
        );
      },
      resetPassword: async (email) => {
        if (authMode === "local") {
          const storedPassword = window.localStorage.getItem(
            `${LOCAL_PASSWORD_PREFIX}${email.toLowerCase()}`,
          );

          if (!storedPassword) {
            throw new Error("No local account found for this email.");
          }

          return "Local demo mode: use the same password you created for this account.";
        }

        if (!auth) {
          throw new Error("Firebase Auth is not available.");
        }

        await sendPasswordResetEmail(auth, email);
        return "Password reset instructions have been sent to your email.";
      },
      logout: async () => {
        if (authMode === "local") {
          writeLocalUser(null);
          setUser(null);
          return;
        }

        if (!auth) {
          return;
        }

        await signOut(auth);
        setUser(null);
      },
      deleteAccount: async () => {
        if (authMode === "local") {
          clearLocalDemoAccount(user?.uid, user?.email);
          writeLocalUser(null);
          setUser(null);
          return;
        }

        if (!auth?.currentUser) {
          throw new Error("No active account was found to delete.");
        }

        try {
          await deleteFirebaseUserRecord(auth.currentUser.uid);
          await deleteUser(auth.currentUser);
          setUser(null);
        } catch (error) {
          if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "auth/requires-recent-login"
          ) {
            throw new Error(
              "For security, please log in again before deleting your account.",
            );
          }

          throw error instanceof Error
            ? error
            : new Error("We could not delete your account right now.");
        }
      },
    }),
    [authMessage, authMode, isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return value;
}
