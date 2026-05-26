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
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  onAuthStateChanged,
  OAuthProvider,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";

import { auth, hasFirebaseConfig } from "@/lib/firebase";
import {
  UI_LOADING_TIMEOUT_MS,
  withTimeout,
} from "@/lib/async-timeout";
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
  }) => Promise<AppUser>;
  loginOrSignupWithEmail: (input: {
    email: string;
    password: string;
  }) => Promise<AppUser>;
  loginWithApple: () => Promise<AppUser>;
  loginWithGoogle: () => Promise<AppUser>;
  signup: (input: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<AppUser>;
  resetPassword: (email: string) => Promise<string>;
  tryDemo: () => Promise<AppUser>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const LOCAL_USER_KEY = "dsiq.local.user";
const LOCAL_PASSWORD_PREFIX = "dsiq.local.password:";
const appleProvider = new OAuthProvider("apple.com");
const googleProvider = new GoogleAuthProvider();

appleProvider.addScope("email");
appleProvider.addScope("name");
appleProvider.setCustomParameters({
  locale: "en",
});

googleProvider.addScope("email");
googleProvider.addScope("profile");
googleProvider.setCustomParameters({
  prompt: "select_account",
});

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

async function signInWithSocialProvider(
  provider: GoogleAuthProvider | OAuthProvider,
  authProvider: "apple" | "google",
) {
  if (!auth) {
    throw new Error("Firebase Auth is not available.");
  }

  await setPersistence(auth, browserLocalPersistence);
  const credential = await signInWithPopup(auth, provider);

  await syncFirebaseUserRecordSafely({
    uid: credential.user.uid,
    email: credential.user.email,
    displayName: credential.user.displayName,
    reason: "login",
    authProvider,
  });

  return mapFirebaseUser(credential.user);
}

async function syncFirebaseUserRecordSafely(
  input: Parameters<typeof syncFirebaseUserRecord>[0],
) {
  try {
    await withTimeout(
      syncFirebaseUserRecord(input),
      UI_LOADING_TIMEOUT_MS,
      "Firebase user profile sync timed out.",
    );
  } catch (error) {
    console.warn("Firebase user profile sync failed.", error);
  }
}

function getAuthCode(error: unknown) {
  return typeof error === "object" && error && "code" in error
    ? String(error.code)
    : "";
}

function getSocialAccountMessage(methods: string[]) {
  if (methods.includes("google.com")) {
    return "This email is already registered with Google. Please continue with Google.";
  }

  if (methods.includes("apple.com")) {
    return "This email is already registered with Apple. Please continue with Apple.";
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const authMode: "firebase" | "local" = hasFirebaseConfig ? "firebase" : "local";
  const [user, setUser] = useState<AppUser | null>(() =>
    authMode === "local" ? readLocalUser() : null,
  );
  const [isLoading, setIsLoading] = useState(authMode === "firebase");
  const authMessage =
    authMode === "local"
      ? "Running in local demo auth mode. Add Firebase keys later to switch to real authentication."
      : null;

  useEffect(() => {
    if (authMode === "local") {
      return;
    }

    if (!auth) {
      setIsLoading(false);
      return;
    }

    const loadingTimeout = window.setTimeout(() => {
      setIsLoading(false);
    }, UI_LOADING_TIMEOUT_MS);

    const unsubscribe = onAuthStateChanged(auth, (nextUser: User | null) => {
      window.clearTimeout(loadingTimeout);
      setUser(nextUser ? mapFirebaseUser(nextUser) : null);
      setIsLoading(false);
    });

    return () => {
      window.clearTimeout(loadingTimeout);
      unsubscribe();
    };
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
          return nextUser;
        }

        if (!auth) {
          throw new Error("Firebase Auth is not available.");
        }

        await setPersistence(
          auth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence,
        );
        const credential = await signInWithEmailAndPassword(auth, email, password);
        await syncFirebaseUserRecordSafely({
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: credential.user.displayName,
          reason: "login",
          authProvider: "password",
        });
        const nextUser = mapFirebaseUser(credential.user);
        setUser(nextUser);
        return nextUser;
      },
      loginOrSignupWithEmail: async ({ email, password }) => {
        const normalizedEmail = email.trim().toLowerCase();

        if (authMode === "local") {
          const storedPassword = window.localStorage.getItem(
            `${LOCAL_PASSWORD_PREFIX}${normalizedEmail}`,
          );

          if (storedPassword && storedPassword !== password) {
            throw new Error("Email or password is incorrect.");
          }

          const nextUser = {
            uid: `local-${normalizedEmail}`,
            email: normalizedEmail,
            displayName: normalizedEmail.split("@")[0],
          };

          if (!storedPassword) {
            window.localStorage.setItem(
              `${LOCAL_PASSWORD_PREFIX}${normalizedEmail}`,
              password,
            );
          }

          writeLocalUser(nextUser);
          setUser(nextUser);
          return nextUser;
        }

        if (!auth) {
          throw new Error("Firebase Auth is not available.");
        }

        await setPersistence(auth, browserLocalPersistence);

        try {
          const credential = await signInWithEmailAndPassword(
            auth,
            normalizedEmail,
            password,
          );
          await syncFirebaseUserRecordSafely({
            uid: credential.user.uid,
            email: credential.user.email,
            displayName: credential.user.displayName,
            reason: "login",
            authProvider: "password",
          });
          const nextUser = mapFirebaseUser(credential.user);
          setUser(nextUser);
          return nextUser;
        } catch (signInError) {
          const signInCode = getAuthCode(signInError);

          if (
            signInCode.includes("wrong-password") ||
            signInCode.includes("invalid-credential")
          ) {
            const methods = await withTimeout(
              fetchSignInMethodsForEmail(auth, normalizedEmail),
              UI_LOADING_TIMEOUT_MS,
              "Firebase sign-in method lookup timed out.",
            );
            const socialMessage = getSocialAccountMessage(methods);

            if (socialMessage) {
              throw new Error(socialMessage);
            }

            if (methods.includes("password")) {
              throw new Error("Email or password is incorrect.");
            }
          } else if (!signInCode.includes("user-not-found")) {
            throw signInError;
          }
        }

        try {
          const credential = await createUserWithEmailAndPassword(
            auth,
            normalizedEmail,
            password,
          );
          await syncFirebaseUserRecordSafely({
            uid: credential.user.uid,
            email: credential.user.email,
            displayName: credential.user.displayName,
            reason: "signup",
            authProvider: "password",
          });
          const nextUser = mapFirebaseUser(credential.user);
          setUser(nextUser);
          return nextUser;
        } catch (createError) {
          const createCode = getAuthCode(createError);

          if (createCode.includes("email-already-in-use")) {
            const methods = await withTimeout(
              fetchSignInMethodsForEmail(auth, normalizedEmail),
              UI_LOADING_TIMEOUT_MS,
              "Firebase sign-in method lookup timed out.",
            );
            const socialMessage = getSocialAccountMessage(methods);

            if (socialMessage) {
              throw new Error(socialMessage);
            }

            throw new Error("Email or password is incorrect.");
          }

          throw createError;
        }
      },
      loginWithApple: async () => {
        if (authMode === "local") {
          throw new Error(
            "Apple sign-in needs Firebase keys and Apple enabled in Firebase Authentication.",
          );
        }

        const nextUser = await signInWithSocialProvider(appleProvider, "apple");
        setUser(nextUser);
        return nextUser;
      },
      loginWithGoogle: async () => {
        if (authMode === "local") {
          throw new Error(
            "Google sign-in needs Firebase keys and Google enabled in Firebase Authentication.",
          );
        }

        const nextUser = await signInWithSocialProvider(googleProvider, "google");
        setUser(nextUser);
        return nextUser;
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
          return nextUser;
        }

        if (!auth) {
          throw new Error("Firebase Auth is not available.");
        }

        const credential = await createUserWithEmailAndPassword(auth, email, password);

        if (fullName.trim()) {
          await withTimeout(
            updateProfile(credential.user, { displayName: fullName.trim() }),
            undefined,
            "Firebase profile update timed out.",
          );
        }

        await syncFirebaseUserRecordSafely({
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: fullName.trim() || credential.user.displayName,
          reason: "signup",
          authProvider: "password",
        });

        const nextUser = mapFirebaseUser({
            ...credential.user,
            displayName: fullName.trim() || credential.user.displayName,
          });
        setUser(nextUser);
        return nextUser;
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

        await withTimeout(
          sendPasswordResetEmail(auth, email),
          undefined,
          "Password reset request timed out.",
        );
        return "Password reset instructions have been sent to your email.";
      },
      tryDemo: async () => {
        const nextUser = {
          uid: "local-demo-user",
          email: "demo@dsiq.local",
          displayName: "Demo User",
        };

        writeLocalUser(nextUser);
        setUser(nextUser);
        return nextUser;
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

        await withTimeout(
          signOut(auth),
          undefined,
          "Sign out timed out.",
        );
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
          await withTimeout(
            deleteFirebaseUserRecord(auth.currentUser.uid),
            undefined,
            "Firebase account record deletion timed out.",
          );
          await withTimeout(
            deleteUser(auth.currentUser),
            undefined,
            "Firebase account deletion timed out.",
          );
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
