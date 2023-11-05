import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {BaseModel} from './BaseModel';

const AUTH_METHOD_COLLECTION = 'authMethods';

export enum Provider {
  EMAIL = 'Email',
  GOOGLE = 'Google',
  FACEBOOK = 'Facebook',
}

export type Providers = Provider.EMAIL | Provider.GOOGLE | Provider.FACEBOOK;

export class AuthMethod extends BaseModel {
  id?: string;
  email?: string;
  method?: Providers;

  constructor({id, email, method}: Partial<AuthMethod>) {
    super();
    this.id = id;
    this.email = email;
    this.method = method;
    this.toJSON = this.toJSON.bind(this);
    // Add your non-static methods here
  }

  private static fromSnapshot(
    doc:
      | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
      | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): AuthMethod {
    const data = doc.data();
    if (data && doc.exists) {
      return new AuthMethod({
        id: doc.id,
        email: data?.email,
        method: data?.method,
      });
    }
    throw Error("Error, document doesn't exist!");
  }

  private static fromQuerySnapshot(
    querySnapshots: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): AuthMethod[] {
    return querySnapshots.docs.map(this.fromSnapshot);
  }

  static getCollectionReference =
    (): FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData> => {
      return firestore().collection(AUTH_METHOD_COLLECTION);
    };

  static getDocumentReference(
    documentId: string,
  ): FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData> {
    //TODO: tidy up, move somewhere else neater
    firestore().settings({
      ignoreUndefinedProperties: true,
    });
    return this.getCollectionReference().doc(documentId);
  }

  static async setAuthMethod(
    documentId: string,
    data: AuthMethod,
  ): Promise<void> {
    await this.getDocumentReference(documentId).set({
      ...data,
    });
  }

  static async getById(documentId: string): Promise<AuthMethod | undefined> {
    const snapshot = await this.getDocumentReference(documentId).get();
    if (snapshot.exists) {
      return this.fromSnapshot(snapshot);
    }
  }

  static async getByEmail(email: string): Promise<AuthMethod | undefined> {
    const querySnapshot = await this.getCollectionReference()
      .where('email', '==', email.toLowerCase())
      .get();

    if (!querySnapshot.empty) {
      const documentSnapshot = querySnapshot.docs[0];
      return this.fromSnapshot(documentSnapshot);
    }
  }
}
