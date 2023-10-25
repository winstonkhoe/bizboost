import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {ErrorMessage} from '../constants/errorMessage';
import {handleError} from '../utils/error';
import {BaseModel} from './BaseModel';
import {
  AccessToken,
  GraphRequest,
  GraphRequestManager,
  LoginManager,
  LoginResult,
} from 'react-native-fbsdk-next';

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

export type SocialData = {
  username?: string;
  followersCount?: number;
};

export class User extends BaseModel {
  id?: string;
  email?: string;
  password?: string;
  phone?: string;
  contentCreator?: ContentCreator;
  businessPeople?: BusinessPeople;
  instagram?: SocialData;
  tiktok?: SocialData;
  joinedAt?: FirebaseFirestoreTypes.Timestamp | number;

  constructor({
    id,
    email,
    password,
    phone,
    contentCreator,
    businessPeople,
    joinedAt,
    instagram,
    tiktok,
  }: Partial<User>) {
    super();
    this.id = id;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.contentCreator = contentCreator;
    this.businessPeople = businessPeople;
    this.joinedAt = joinedAt;
    this.instagram = instagram;
    this.tiktok = tiktok;
    // Add your non-static methods here
  }

  private static fromSnapshot(
    doc:
      | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
      | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): User {
    const data = doc.data();
    if (data && doc.exists) {
      return new User({
        id: doc.id,
        email: data?.email,
        phone: data?.phone,
        contentCreator: data?.contentCreator,
        businessPeople: data?.businessPeople,
        joinedAt: data?.joinedAt?.seconds,
      });
    }

    throw Error("Error, document doesn't exist!");
  }

  static getDocumentReference(
    documentId: string,
  ): FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData> {
    //TODO: tidy up, move somewhere else neater
    firestore().settings({
      ignoreUndefinedProperties: true,
    });
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

  static async getById(documentId: string): Promise<User | undefined> {
    const snapshot = await this.getDocumentReference(documentId).get();
    if (snapshot.exists) {
      const userData = snapshot.data();
      const user = new User({
        email: userData?.email,
        phone: userData?.phone,
        contentCreator: userData?.contentCreator,
        businessPeople: userData?.businessPeople,
        joinedAt: userData?.joinedAt?.seconds,
      });

      return user;
    }
  }

  static async getUser(documentId: string): Promise<User | null> {
    try {
      const documentSnapshot = await this.getDocumentReference(
        documentId,
      ).get();
      console.log('User exists: ', documentSnapshot.exists);

      if (documentSnapshot.exists) {
        const userData = documentSnapshot.data();
        console.log('User data: ', userData);

        const user = new User({
          email: userData?.email,
          phone: userData?.phone,
          contentCreator: userData?.contentCreator,
          businessPeople: userData?.businessPeople,
          joinedAt: userData?.joinedAt?.seconds,
        });

        return user;
      } else {
        return null;
      }
    } catch (error) {
      throw error; // Handle the error appropriately
    }
  }

  static getUserDataReactive(
    documentId: string,
    callback: (user: User | null, unsubscribe: () => void) => void,
  ): void {
    try {
      const subscriber = this.getDocumentReference(documentId).onSnapshot(
        (
          documentSnapshot: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
        ) => {
          const user = this.fromSnapshot(documentSnapshot);
          callback(user, subscriber);
        },
        (error: Error) => {
          console.log(error);
        },
      );
    } catch (error) {
      throw Error('Error!');
    }
  }

  static async signUpContentCreator({
    email,
    password,
    phone,
    contentCreator,
  }: User) {
    try {
      if (!password || !email) {
        throw Error(ErrorMessage.MISSING_FIELDS);
      }
      const userCredential = await this.createUserWithEmailAndPassword(
        email,
        password,
      );
      await this.setUserData(
        userCredential.user.uid,
        new User({
          email: email.toLowerCase(),
          phone: phone,
          contentCreator: contentCreator,
        }),
      );

      return true;
    } catch (error: any) {
      console.log(error);
      handleError(error.code);

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
      if (!password || !email) {
        throw Error(ErrorMessage.MISSING_FIELDS);
      }
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      await this.setUserData(
        userCredential.user.uid,
        new User({
          email: email.toLowerCase(),
          phone: phone,
          businessPeople: businessPeople,
        }),
      );

      return true;
    } catch (error: any) {
      console.log(error);
      handleError(error.code);

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
          throw Error(ErrorMessage.GOOGLE_ERROR);
        }
        await this.setUserData(
          user.uid,
          new User({
            email: email,
            businessPeople: {
              fullname: fullname,
              profilePicture: profilePicture,
            },
          }),
        );
      }

      return true;
    } catch (error: any) {
      console.log(error);
      handleError(error.code);
      return false;
    }
  }

  static async signUpWithFacebook(finishCallback: (result: boolean) => void) {
    const result: LoginResult = await LoginManager.logInWithPermissions([
      'pages_show_list',
      'instagram_basic',
      'business_management',
    ]);

    if (result.isCancelled) {
      throw Error(ErrorMessage.FACEBOOK_SIGN_IN_CANCEL);
    }

    const fbAccessToken: AccessToken | null =
      await AccessToken.getCurrentAccessToken();

    if (!fbAccessToken) {
      throw Error(ErrorMessage.FACEBOOK_ACCESS_TOKEN_ERROR);
    }

    const facebookCredential = auth.FacebookAuthProvider.credential(
      fbAccessToken.accessToken,
    );
    const userCredential: FirebaseAuthTypes.UserCredential =
      await auth().signInWithCredential(facebookCredential);

    console.log('lewatin ini');
    if (!userCredential.additionalUserInfo?.isNewUser) {
      console.log('lewatin 1');
      throw Error(ErrorMessage.USER_EXISTS);
    } else {
      console.log('lewatin 2');
      const user = userCredential.user;
      console.log(userCredential.user);

      const instagramDataCallback = async (error?: Object, result?: any) => {
        if (error) {
          console.log('Error fetching data: ' + error.toString());
          return false;
        } else {
          const fullname = user.displayName;
          const followersCount = result?.followers_count;
          const instagramUsername = result?.username;
          const instagramName = result?.name;
          // const instagramMediaIds = result?.media.data;
          const profilePicture = result?.profile_picture_url;
          try {
            await this.setUserData(
              user.uid,
              new User({
                instagram: {
                  username: instagramUsername,
                  followersCount: followersCount,
                },
                businessPeople: {
                  fullname: fullname || instagramName,
                  profilePicture: profilePicture,
                },
              }),
            );
            console.log('before callback success');
            finishCallback(true);
          } catch (error) {
            finishCallback(false);
          }
          console.log(result);
        }
      };

      const userInstagramBusinessAccountCallback = async (
        error?: Object,
        result?: any,
      ) => {
        if (error) {
          console.log('Error fetching data: ' + error.toString());
          finishCallback(false);
        } else {
          const instagramBusinessAccount = result?.instagram_business_account;
          const instagramId = instagramBusinessAccount?.id;
          const getInstagramDataRequest = new GraphRequest(
            `/${instagramId}`,
            {
              parameters: {
                fields: {
                  string:
                    'id,followers_count,media_count,username,website,biography,name,media,profile_picture_url',
                },
              },
            },
            instagramDataCallback,
          );
          await new GraphRequestManager()
            .addRequest(getInstagramDataRequest)
            .start();
        }
      };

      const userFacebookPagesListCallback = async (
        error?: Object,
        result?: any,
      ) => {
        if (error) {
          console.log('Error fetching data: ' + error.toString());
          finishCallback(false);
        } else {
          const data = result?.data;
          if (data && data?.length > 0) {
            const page = data?.[0];
            if (page) {
              const page_id = page?.id;
              const getInstagramBusinessAccountRequest = new GraphRequest(
                `/${page_id}`,
                {
                  parameters: {
                    fields: {
                      string: 'instagram_business_account',
                    },
                  },
                },
                userInstagramBusinessAccountCallback,
              );
              await new GraphRequestManager()
                .addRequest(getInstagramBusinessAccountRequest)
                .start();
            }
          }
          console.log(result);
        }
      };
      const getUserFacebookPagesListRequest = new GraphRequest(
        '/me/accounts',
        {},
        userFacebookPagesListCallback,
      );

      await new GraphRequestManager()
        .addRequest(getUserFacebookPagesListRequest)
        .start();
    }
  }

  static async login(email: string, password: string) {
    try {
      await auth().signInWithEmailAndPassword(email, password);

      return true;
    } catch (error: any) {
      console.log('err: ' + error);
      handleError(error.code, ErrorMessage.LOGIN_FAILED);
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

  static async signOut() {
    await auth().signOut();
  }
}
