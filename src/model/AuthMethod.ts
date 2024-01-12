import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {BaseModel} from './BaseModel';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {User} from './User';
import {ErrorMessage} from '../constants/errorMessage';

const AUTH_METHOD_COLLECTION = 'authMethods';

export enum Provider {
  EMAIL = 'Email',
  GOOGLE = 'Google',
  FACEBOOK = 'Facebook',
}

export type Providers = Provider.EMAIL | Provider.GOOGLE | Provider.FACEBOOK;

interface GetUserCredentialByProviderProps {
  provider: Providers;
  token: string | null;
  email?: string;
  password?: string;
}

export class AuthMethod extends BaseModel {
  id?: string;
  providerId?: string;
  email?: string;
  method?: Providers;

  constructor({id, email, method, providerId}: Partial<AuthMethod>) {
    super();
    this.id = id;
    this.email = email;
    this.method = method;
    this.providerId = providerId;
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
        providerId: data?.providerId,
        email: data?.email?.toLocaleLowerCase(),
        method: data?.method,
      });
    }
    throw Error("Error, document doesn't exist!");
  }

  static getCollectionReference = () => {
    return firestore().collection(AUTH_METHOD_COLLECTION);
  };

  static getDocumentReference(documentId: string) {
    AuthMethod.setFirestoreSettings();
    return AuthMethod.getCollectionReference().doc(documentId);
  }

  async insert() {
    const {id, ...rest} = this;
    if (!id) {
      throw Error(ErrorMessage.MISSING_FIELDS);
    }
    await AuthMethod.getDocumentReference(id).set(rest);
  }

  static async getByProviderId(
    providerId: string,
  ): Promise<AuthMethod | undefined> {
    const querySnapshot = await AuthMethod.getCollectionReference()
      .where('providerId', '==', providerId)
      .get();

    if (!querySnapshot.empty) {
      const documentSnapshot = querySnapshot.docs[0];
      return AuthMethod.fromSnapshot(documentSnapshot);
    }
  }

  static async getByEmail(email: string): Promise<AuthMethod | undefined> {
    const querySnapshot = await AuthMethod.getCollectionReference()
      .where('email', '==', email.toLowerCase())
      .get();

    if (!querySnapshot.empty) {
      const documentSnapshot = querySnapshot.docs[0];
      return AuthMethod.fromSnapshot(documentSnapshot);
    }
  }

  static async getUserCredentialByProvider({
    provider,
    token,
    email,
    password,
  }: GetUserCredentialByProviderProps): Promise<FirebaseAuthTypes.UserCredential> {
    if (Provider.EMAIL === provider) {
      if (!password || !email) {
        throw Error(ErrorMessage.MISSING_FIELDS);
      }
      const userCredential = await User.createUserWithEmailAndPassword(
        email,
        password,
      );
      return userCredential;
    }
    let credential;
    if (Provider.FACEBOOK === provider) {
      credential = auth.FacebookAuthProvider.credential(token);
    }

    if (Provider.GOOGLE === provider) {
      credential = auth.GoogleAuthProvider.credential(token);
    }

    if (!credential) {
      throw Error(ErrorMessage.PROVIDER_ERROR);
    }
    return await auth().signInWithCredential(credential);
  }
}
