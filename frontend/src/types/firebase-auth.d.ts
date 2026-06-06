declare module "firebase/auth" {
  export type Auth = {
    currentUser: User | null;
  };

  export type User = {
    delete?: () => Promise<void>;
    displayName: string | null;
    email: string | null;
    emailVerified?: boolean;
    photoURL?: string | null;
    providerData: { providerId: string }[];
    providerId?: string;
    uid: string;
  };

  export type UserCredential = {
    user: User;
  };

  export type AuthCredential = object;
  export type AuthProvider = object;

  export const browserLocalPersistence: unknown;
  export const browserSessionPersistence: unknown;

  export const EmailAuthProvider: {
    credential: (email: string, password: string) => AuthCredential;
  };

  export class GoogleAuthProvider {
    addScope(scope: string): void;
    setCustomParameters(parameters: Record<string, string>): void;
  }

  export class OAuthProvider {
    constructor(providerId: string);
    addScope(scope: string): void;
    setCustomParameters(parameters: Record<string, string>): void;
  }

  export function confirmPasswordReset(
    auth: Auth,
    oobCode: string,
    newPassword: string,
  ): Promise<void>;
  export function createUserWithEmailAndPassword(
    auth: Auth,
    email: string,
    password: string,
  ): Promise<UserCredential>;
  export function deleteUser(user: User): Promise<void>;
  export function fetchSignInMethodsForEmail(
    auth: Auth,
    email: string,
  ): Promise<string[]>;
  export function getAuth(app?: unknown): Auth;
  export function onAuthStateChanged(
    auth: Auth,
    callback: (user: User | null) => void,
  ): () => void;
  export function reauthenticateWithCredential(
    user: User,
    credential: AuthCredential,
  ): Promise<UserCredential>;
  export function sendPasswordResetEmail(
    auth: Auth,
    email: string,
    actionCodeSettings?: unknown,
  ): Promise<void>;
  export function setPersistence(
    auth: Auth,
    persistence: unknown,
  ): Promise<void>;
  export function signInWithEmailAndPassword(
    auth: Auth,
    email: string,
    password: string,
  ): Promise<UserCredential>;
  export function signInWithPopup(
    auth: Auth,
    provider: AuthProvider,
  ): Promise<UserCredential>;
  export function signOut(auth: Auth): Promise<void>;
  export function updatePassword(user: User, newPassword: string): Promise<void>;
  export function updateProfile(
    user: User,
    profile: { displayName?: string | null; photoURL?: string | null },
  ): Promise<void>;
  export function verifyPasswordResetCode(
    auth: Auth,
    code: string,
  ): Promise<string>;
}
