declare module "firebase/firestore" {
  export type Firestore = object;

  export type DocumentReference = {
    id: string;
  };

  export type CollectionReference = {
    id?: string;
  };

  export type Query = object;

  export type QueryDocumentSnapshot = {
    id: string;
    data: () => Record<string, unknown>;
  };

  export type DocumentSnapshot = {
    exists: () => boolean;
    data: () => Record<string, unknown>;
  };

  export type QuerySnapshot = {
    docs: QueryDocumentSnapshot[];
  };

  export function addDoc(
    reference: CollectionReference,
    data: Record<string, unknown>,
  ): Promise<DocumentReference>;

  export function collection(
    firestore: Firestore,
    path: string,
    ...pathSegments: string[]
  ): CollectionReference;
  export function collection(
    reference: DocumentReference,
    path: string,
    ...pathSegments: string[]
  ): CollectionReference;

  export function deleteDoc(reference: DocumentReference): Promise<void>;

  export function doc(
    firestore: Firestore,
    path: string,
    ...pathSegments: string[]
  ): DocumentReference;

  export function getDoc(reference: DocumentReference): Promise<DocumentSnapshot>;
  export function getDocs(query: Query): Promise<QuerySnapshot>;
  export function getFirestore(app?: unknown): Firestore;
  export function query(
    reference: CollectionReference,
    ...queryConstraints: Query[]
  ): Query;
  export function serverTimestamp(): unknown;
  export function setDoc(
    reference: DocumentReference,
    data: Record<string, unknown>,
    options?: { merge?: boolean },
  ): Promise<void>;
  export function where(fieldPath: string, opStr: string, value: unknown): Query;
}
