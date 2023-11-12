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
import {AuthMethod, Provider, Providers} from './AuthMethod';
import {Category} from './Category';
import {Location} from './Location';

const USER_COLLECTION = 'users';

export enum UserRole {
  ContentCreator = 'Content Creator',
  BusinessPeople = 'Business People',
  Admin = 'Admin',
}

export enum SocialPlatform {
  Instagram = 'Instagram',
  Tiktok = 'Tiktok',
}

export enum UserStatus {
  Active = 'Active',
  Suspended = 'Suspended',
}

export type SocialPlatforms = SocialPlatform.Instagram | SocialPlatform.Tiktok;

// TODO: @win win kayaknya ini mayan memusingkan deh ada UserRoles dan UserRole, kenapa ga yang di UserRole tambah undefined aja?
export type UserRoles =
  | UserRole.ContentCreator
  | UserRole.BusinessPeople
  | UserRole.Admin
  | undefined;

export interface ContentCreatorPreference {
  contentRevisionLimit?: number;
  postingSchedules: number[];
  preferences: string[];
}

export type BaseUserData = {
  fullname: string;
  profilePicture?: string;
};

export type ContentCreator = BaseUserData &
  ContentCreatorPreference & {
    specializedCategoryIds: string[];
    preferredLocationIds: string[];
  };

export type BusinessPeople = BaseUserData;

export type SocialData = {
  username?: string;
  followersCount?: number;
};

export interface UserAuthProviderData {
  token: string;
  id: string;
  email?: string;
  name?: string;
  photo?: string;
  instagram?: SocialData;
}

export interface SignupContentCreatorProps extends Partial<User> {
  token: string | null;
  providerId?: string;
  provider: Providers;
}

export class User extends BaseModel {
  id?: string;
  email?: string;
  password?: string;
  phone?: string;
  contentCreator?: ContentCreator;
  businessPeople?: BusinessPeople;
  instagram?: SocialData;
  tiktok?: SocialData;
  joinedAt?: number;
  isAdmin?: boolean;
  status?: UserStatus;

  constructor({
    id,
    email,
    password,
    phone,
    contentCreator,
    businessPeople,
    joinedAt,
    isAdmin,
    status,
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
    this.isAdmin = isAdmin;
    this.status = status;
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
        contentCreator: {
          ...data.contentCreator,
          postingSchedules: data.contentCreator?.postingSchedules?.map(
            (schedule: FirebaseFirestoreTypes.Timestamp) => schedule?.seconds,
          ),
          specializedCategoryIds:
            data.contentCreator?.specializedCategoryIds?.map(
              (categoryId: FirebaseFirestoreTypes.DocumentReference) =>
                categoryId.id,
            ) || [],
          preferredLocationIds:
            data.contentCreator?.preferredLocationIds?.map(
              (locationId: FirebaseFirestoreTypes.DocumentReference) =>
                locationId.id,
            ) || [],
        },
        tiktok: data?.tiktok,
        instagram: data?.instagram,
        businessPeople: data?.businessPeople,
        joinedAt: data?.joinedAt,
        isAdmin: data?.isAdmin,
        status: data?.status || UserStatus.Active,
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

  private static mappingUserFields(data: User) {
    return {
      ...data,
      id: undefined,
      email: data.email?.toLocaleLowerCase(),
      contentCreator: data.contentCreator && {
        ...data.contentCreator,
        specializedCategoryIds: data.contentCreator?.specializedCategoryIds.map(
          categoryId => Category.getDocumentReference(categoryId),
        ),
        preferredLocationIds: data.contentCreator?.preferredLocationIds.map(
          locationId => Location.getDocumentReference(locationId),
        ),
      },
    };
  }

  static async setUserData(documentId: string, data: User): Promise<void> {
    await this.getDocumentReference(documentId).set({
      ...this.mappingUserFields(data),
      joinedAt: new Date().getTime(),
    });
  }

  static async updateUserData(documentId: string, data: User): Promise<void> {
    await this.getDocumentReference(documentId).update(
      this.mappingUserFields(data),
    );
  }

  // static async getAll(): Promise<User[]> {
  //   try {
  //     const users = await firestore()
  //       .collection(USER_COLLECTION)
  //       // TODO: kayaknya ga usah pake field lagi deh nanti cek admin pake emailnya aja?
  //       // .where('isAdmin', '!=', true)
  //       .get();
  //     if (users.empty) {
  //       throw Error('No Users!');
  //     }
  //     return users.docs.map(doc => this.fromSnapshot(doc));
  //   } catch (error) {
  //     console.log(error);
  //     throw Error('Error!');
  //   }
  // }

  static getAll(onComplete: (users: User[]) => void) {
    const unsubscribe = firestore()
      .collection(USER_COLLECTION)
      // TODO: kayaknya ga usah pake field lagi deh nanti cek admin pake emailnya aja?
      // .where('isAdmin', '!=', true)
      .onSnapshot(
        querySnapshot => {
          let users: User[] = [];
          if (querySnapshot.empty) {
            return;
          }
          users = querySnapshot.docs.map(doc => this.fromSnapshot(doc));

          onComplete(users);
        },
        error => {
          console.log(error);
        },
      );

    return unsubscribe;
  }

  static async getById(documentId: string): Promise<User | undefined> {
    const snapshot = await this.getDocumentReference(documentId).get();
    if (snapshot.exists) {
      const userData = snapshot.data();
      const user = new User({
        id: snapshot.id,
        email: userData?.email,
        phone: userData?.phone,
        contentCreator: userData?.contentCreator,
        businessPeople: userData?.businessPeople,
        joinedAt: userData?.joinedAt?.seconds,
        isAdmin: userData?.isAdmin,
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
          isAdmin: userData?.isAdmin,
        });

        return user;
      } else {
        return null;
      }
    } catch (error) {
      throw error; // Handle the error appropriately
    }
  }

  // TODO: fix callback and unsubscribe return
  static getUserDataReactive(
    documentId: string,
    callback: (user: User | null) => void,
    onError?: (error?: any) => void,
  ) {
    try {
      const unsubscribe = this.getDocumentReference(documentId).onSnapshot(
        (
          documentSnapshot: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
        ) => {
          try {
            const user = this.fromSnapshot(documentSnapshot);
            callback(user);
          } catch (error) {
            onError && onError(error);
          }
        },
        (error: Error) => {
          onError && onError(error);
          console.log(error);
        },
      );
      return unsubscribe;
    } catch (error) {
      onError && onError(error);
    }
  }

  static async signUp({
    token,
    provider,
    providerId,
    ...user
  }: SignupContentCreatorProps) {
    try {
      const userCredential = await AuthMethod.getUserCredentialByProvider({
        provider: provider,
        token: token,
        email: user.email,
        password: user.password,
      });

      await this.setUserData(
        userCredential.user.uid,
        new User({
          ...user,
          password: undefined,
        }),
      );

      await AuthMethod.setAuthMethod(
        userCredential.user.uid,
        new AuthMethod({
          providerId: providerId,
          email: user.email,
          method: provider,
        }),
      );

      return true;
    } catch (error: any) {
      console.log(error);
      handleError(error.code);

      return false;
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

  static async continueWithGoogle(): Promise<UserAuthProviderData> {
    try {
      const {
        idToken,
        user: {id, name, email, photo},
      } = await GoogleSignin.signIn();
      const authMethod = await AuthMethod.getByProviderId(id);
      if (authMethod) {
        await AuthMethod.getUserCredentialByProvider({
          provider: Provider.GOOGLE,
          token: idToken,
        });
      }
      return {
        id: id,
        token: idToken!!,
        name: name!!,
        email: email,
        photo: photo!!,
      };
    } catch (error) {
      console.log(error);
    }
    return {id: '', token: ''};
  }

  static async continueWithFacebook(
    finishCallback: (data: UserAuthProviderData) => void,
  ): Promise<void> {
    const result: LoginResult = await LoginManager.logInWithPermissions([
      'pages_show_list',
      'instagram_basic',
      'business_management',
      // 'email',
    ]);

    if (result.isCancelled) {
      throw Error(ErrorMessage.FACEBOOK_SIGN_IN_CANCEL);
    }

    const fbAccessToken: AccessToken | null =
      await AccessToken.getCurrentAccessToken();

    if (!fbAccessToken) {
      throw Error(ErrorMessage.FACEBOOK_ACCESS_TOKEN_ERROR);
    } else {
      const data = {
        id: '',
        token: fbAccessToken.accessToken,
      };
      const instagramDataCallback = async (error?: Object, result?: any) => {
        if (error) {
          console.log('Error fetching data: ' + error.toString());
          finishCallback(data);
        } else {
          const facebookId = result?.id;
          const followersCount = result?.followers_count;
          const instagramUsername = result?.username;
          const instagramName = result?.name;
          // const instagramMediaIds = result?.media.data;
          const profilePicture = result?.profile_picture_url;
          const authMethod = await AuthMethod.getByProviderId(facebookId);
          if (authMethod) {
            await AuthMethod.getUserCredentialByProvider({
              provider: Provider.FACEBOOK,
              token: data.token,
            });
            console.log('facebook account detected');
          } else {
            finishCallback({
              ...data,
              id: facebookId,
              name: instagramName,
              photo: profilePicture,
              instagram: {
                username: instagramUsername,
                followersCount: followersCount,
              },
            });
            console.log('instagramDataCallback', result);
          }
        }
      };

      const userInstagramBusinessAccountCallback = async (
        error?: Object,
        result?: any,
      ) => {
        if (error) {
          console.log('Error fetching data: ' + error.toString());
          finishCallback(data);
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
          console.log('userInstagramBusinessAccountCallback', result);
        }
      };

      const userFacebookPagesListCallback = async (
        error?: Object,
        result?: any,
      ) => {
        if (error) {
          console.log('Error fetching data: ' + error.toString());
          finishCallback(data);
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
          console.log('userFacebookPagesListCallback', result);
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

  static async signOut() {
    await auth().signOut();
  }
}
