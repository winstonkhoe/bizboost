import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  CREDENTIALS_INVALID,
  EMAIL_ALREADY_EXISTS,
  EMAIL_INVALID,
  GOOGLE_ERROR,
  LOGIN_FAILED,
  PASSWORD_EMPTY,
} from '../constants/errorMessage';

const USER_COLLECTION = 'users';

export enum UserRole {
  ContentCreator = 'Content Creator',
  BusinessPeople = 'Business People',
  Admin = 'Admin',
}

export type UserRoles =
  | UserRole.ContentCreator
  | UserRole.BusinessPeople
  | UserRole.Admin
  | undefined;

export type ContentCreator = {
  fullname: string;
  profilePicture?: string;
};

export type BusinessPeople = {
  fullname: string;
  profilePicture?: string;
};

export class User {
  email: string = '';
  password?: string;
  phone?: string;
  contentCreator?: ContentCreator;
  businessPeople?: BusinessPeople;
  joinedAt?: FirebaseFirestoreTypes.Timestamp | number;

  static getDocumentReference(
    documentId: string,
  ): FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData> {
    return firestore().collection(USER_COLLECTION).doc(documentId);
  }

  static async createUserWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    return await auth().createUserWithEmailAndPassword(email, password);
  }

  static async setUserData(documentId: string, data: User): Promise<void> {
    await this.getDocumentReference(documentId).set({
      ...data,
      joinedAt: firestore.Timestamp.now(),
    });
  }

  static async updateUserData(documentId: string, data: User): Promise<void> {
    await this.getDocumentReference(documentId).update(data);
  }

  static getUserData(
    documentId: string,
    callback: (user: User | null) => void,
  ): void {
    this.getDocumentReference(documentId)
      .get()
      .then(documentSnapshot => {
        console.log('User exists: ', documentSnapshot.exists);
        if (documentSnapshot.exists) {
          const userData = documentSnapshot.data();
          console.log('User data: ', userData);
          const user: User = {
            email: userData?.email,
            phone: userData?.phone,
            contentCreator: userData?.contentCreator,
            businessPeople: userData?.businessPeople,
            joinedAt: userData?.joinedAt?.seconds,
          };
          callback(user);
        } else {
          callback(null);
        }
      });
  }

  static async signUpContentCreator({
    email,
    password,
    phone,
    contentCreator,
  }: User) {
    try {
      if (!password) {
        throw Error(PASSWORD_EMPTY);
      }
      const userCredential = await this.createUserWithEmailAndPassword(
        email,
        password,
      );
      await this.setUserData(userCredential.user.uid, {
        email: email.toLowerCase(),
        phone: phone,
        contentCreator: contentCreator,
      });

      return true;
    } catch (error: any) {
      console.log(error);
      if (error.code === 'auth/email-already-in-use') {
        throw Error(EMAIL_ALREADY_EXISTS);
      }

      if (error.code === 'auth/invalid-email') {
        throw Error(EMAIL_INVALID);
      }

      return false;
    }
  }

  static async signUpBusinessPeople({
    email,
    password,
    phone,
    businessPeople,
  }: User) {
    try {
      if (!password) {
        throw Error(PASSWORD_EMPTY);
      }
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      await this.setUserData(userCredential.user.uid, {
        email: email.toLowerCase(),
        phone: phone,
        businessPeople: businessPeople,
      });

      return true;
    } catch (error: any) {
      console.log(error);
      if (error.code === 'auth/email-already-in-use') {
        throw Error(EMAIL_ALREADY_EXISTS);
      }

      if (error.code === 'auth/invalid-email') {
        throw Error(EMAIL_INVALID);
      }

      return false;
    }
  }

  static async signUpWithGoogle() {
    const {idToken} = await GoogleSignin.signIn();

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    try {
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      if (!userCredential.additionalUserInfo?.isNewUser) {
        console.log('User Exists');
      } else {
        console.log("User doesn't exist");

        const user = userCredential.user;
        const email = user.email;
        const fullname = user.displayName;
        const profilePicture = user.photoURL;
        if (!email || !fullname || !profilePicture) {
          throw Error(GOOGLE_ERROR);
        }
        await this.setUserData(user.uid, {
          email: email,
          businessPeople: {
            fullname: fullname,
            profilePicture: profilePicture,
          },
        });
      }

      return true;
    } catch (error: any) {
      console.log(error);

      return false;
    }
  }

  static async login(email: string, password: string) {
    try {
      await auth().signInWithEmailAndPassword(email, password);

      return true;
    } catch (error: any) {
      console.log('err: ' + error);
      if (error.code === 'auth/user-not-found') {
        throw Error(CREDENTIALS_INVALID);
      }

      if (error.code === 'auth/wrong-password') {
        throw Error(CREDENTIALS_INVALID);
      }

      throw Error(LOGIN_FAILED);
      //   return false
    }
  }

  static async loginWithGoogle() {
    const {idToken} = await GoogleSignin.signIn();

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    try {
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );

      if (!userCredential.additionalUserInfo?.isNewUser) {
        console.log('User Exists');

        return true;
      } else {
        // TODO: optimize? (redirect to register page after signing in with google acc that doesn't exist)
        userCredential.user.delete();
        console.log('user gaada, acc diapus lg');
        throw Error("User doesn't exist");
      }
    } catch (error: any) {
      console.log(error);

      return false;
    }
  }
}
