import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {ErrorMessage} from '../constants/errorMessage';
import {handleError} from '../utils/error';
import {BaseModel, UpdateFields} from './BaseModel';
import {
  AccessToken,
  GraphRequest,
  GraphRequestManager,
  LoginManager,
  LoginResult,
} from 'react-native-fbsdk-next';
import {AuthMethod, Provider} from './AuthMethod';
import {Category} from './Category';
import {Location} from './Location';
import {deleteFileByURL} from '../helpers/storage';
import {StatusType} from '../components/atoms/StatusTag';

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

type UserStatusMap = {
  [key in UserStatus]: StatusType;
};
export const userStatusTypeMap: UserStatusMap = {
  [UserStatus.Active]: StatusType.success,
  [UserStatus.Suspended]: StatusType.danger,
};
export interface BankAccountInformation {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
}

export interface ContentCreatorPreference {
  contentRevisionLimit?: number;
  postingSchedules: number[];
  preferences: string[];
}

export type BaseUserData = {
  fullname: string;
  profilePicture?: string;
  rating: number;
  ratedCount: number;
};

export type ContentCreator = BaseUserData &
  ContentCreatorPreference & {
    specializedCategoryIds: string[];
    preferredLocationIds: string[];
    biodata: string;
  };

export type BusinessPeople = BaseUserData;

export type SocialData = {
  username?: string;
  followersCount?: number;
  isSynchronized?: boolean;
  lastSyncAt?: number;
};

export interface UserAuthProviderData {
  token: string;
  id: string;
  email?: string;
  name?: string;
  photo?: string;
  instagram?: SocialData;
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
  status: UserStatus;
  bankAccountInformation?: BankAccountInformation;

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
    bankAccountInformation,
  }: Partial<User>) {
    super();
    this.id = id;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.contentCreator = {
      ...contentCreator,
      postingSchedules: contentCreator?.postingSchedules || [],
      preferences: contentCreator?.preferences || [],
      specializedCategoryIds: contentCreator?.specializedCategoryIds || [],
      preferredLocationIds: contentCreator?.preferredLocationIds || [],
      fullname: contentCreator?.fullname || '',
      rating: contentCreator?.rating || 0,
      ratedCount: contentCreator?.ratedCount || 0,
      biodata: contentCreator?.biodata || '',
    };
    this.businessPeople = {
      ...businessPeople,
      fullname: businessPeople?.fullname || '',
      rating: businessPeople?.rating || 0,
      ratedCount: businessPeople?.ratedCount || 0,
    };
    this.joinedAt = joinedAt;
    this.isAdmin = isAdmin;
    this.status = status || UserStatus.Active;
    this.instagram = {
      ...instagram,
      isSynchronized: instagram?.isSynchronized || false,
    };
    this.tiktok = {
      ...tiktok,
      isSynchronized: tiktok?.isSynchronized || false,
    };
    this.bankAccountInformation = bankAccountInformation;
    // Add your non-static methods here
  }

  private static fromSnapshot(
    doc:
      | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
      | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): User {
    const data = doc.data();
    if (data && doc.exists) {
      const user = new User({
        id: doc.id,
        email: data?.email,
        phone: data?.phone,
        contentCreator: {
          ...data.contentCreator,
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
        status: data?.status,
        bankAccountInformation: data.bankAccountInformation,
      });
      user.syncSocialData();
      return user;
    }

    throw Error("Error, document doesn't exist!");
  }

  static getCollectionReference() {
    return firestore().collection(USER_COLLECTION);
  }

  static getDocumentReference(documentId: string) {
    User.setFirestoreSettings();
    return User.getCollectionReference().doc(documentId);
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
      password: undefined,
      confirmPassword: undefined,
      email: data.email?.toLocaleLowerCase(),
      contentCreator: data.contentCreator && {
        ...data.contentCreator,
        specializedCategoryIds: data.contentCreator?.specializedCategoryIds.map(
          Category.getDocumentReference,
        ),
        preferredLocationIds: data.contentCreator?.preferredLocationIds.map(
          Location.getDocumentReference,
        ),
      },
    };
  }

  async update(fields: Partial<User> | UpdateFields) {
    const {id} = this;
    if (!id) {
      throw Error('User id is not defined!');
    }
    await User.getDocumentReference(id).update({
      ...fields,
    });
  }

  async createContentCreatorAccount() {
    const {id} = this;
    if (!id) {
      throw Error('User id is not defined!');
    }
    await User.getDocumentReference(id).update({
      tiktok: this.tiktok,
      instagram: this.instagram,
      contentCreator: {
        ...this.contentCreator,
      },
    });
  }

  async createBusinessPeopleAccount() {
    const {id} = this;
    if (!id) {
      throw Error('User id is not defined!');
    }
    await User.getDocumentReference(id).update({
      businessPeople: {
        ...this.businessPeople,
      },
    });
  }

  async updateProfilePicture(
    activeRole: UserRole | undefined,
    profilePictureUrl: string,
  ): Promise<void> {
    if (activeRole === UserRole.BusinessPeople) {
      const {businessPeople} = this;
      if (!businessPeople) {
        throw Error('Business people is not defined!');
      }

      const {profilePicture} = businessPeople;
      if (profilePicture) {
        await deleteFileByURL(profilePicture);
      }
      await this.update({
        'businessPeople.profilePicture': profilePictureUrl,
      });
      businessPeople.profilePicture = profilePictureUrl;
      return;
    }
    if (activeRole === UserRole.ContentCreator) {
      const {contentCreator} = this;
      if (!contentCreator) {
        throw Error('Business people is not defined!');
      }

      const {profilePicture} = contentCreator;
      if (profilePicture) {
        await deleteFileByURL(profilePicture);
      }
      await this.update({
        'contentCreator.profilePicture': profilePictureUrl,
      });
      contentCreator.profilePicture = profilePictureUrl;
      return;
    }
  }

  async updatePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      // Check if current pasword is correct
      await auth().currentUser?.reauthenticateWithCredential(
        auth.EmailAuthProvider.credential(this.email || '', oldPassword),
      );

      // Jangan pake auth().currentUser yang sama sama yang di atas, karena pas reauthenticate, itu berubah currentUsernya
      await auth().currentUser?.updatePassword(newPassword);
      console.log('Password updated!');
    } catch (error: any) {
      console.log(error.code);
      const code: string = error.code;
      // To format code, contoh weak-password jadi Weak Password, internal-error jadi Internal Error. (Boleh diimprove)
      const formattedCode = code
        .split('/')
        .pop()
        ?.replace('-', ' ')
        .toUpperCase();
      throw Error(`${formattedCode}! Update Password failed!`);
    }
  }

  static getAll(onComplete: (users: User[]) => void) {
    const unsubscribe = firestore()
      .collection(USER_COLLECTION)
      // TODO: kayaknya ga usah pake field lagi deh nanti cek admin pake emailnya aja?
      // .where('isAdmin', '!=', true)
      .onSnapshot(
        querySnapshot => {
          onComplete(querySnapshot.docs.map(User.fromSnapshot));
        },
        error => {
          console.log(error);
        },
      );

    return unsubscribe;
  }

  static async getByIds(documentIds: string[]): Promise<User[]> {
    try {
      const users = await this.getCollectionReference()
        .where(firestore.FieldPath.documentId(), 'in', documentIds)
        .get();
      return users.docs.map(User.fromSnapshot);
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async getById(documentId: string): Promise<User | null> {
    const snapshot = await User.getDocumentReference(documentId).get();
    if (!snapshot.exists) {
      return null;
    }
    return User.fromSnapshot(snapshot);
  }

  // TODO: jadiin satu sama getbyid
  static getUserDataReactive(
    documentId: string,
    callback: (user: User | null) => void,
    onError?: (error?: any) => void,
  ) {
    try {
      const unsubscribe = User.getDocumentReference(documentId).onSnapshot(
        (
          documentSnapshot: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
        ) => {
          try {
            const user = User.fromSnapshot(documentSnapshot);
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

  static async getContentCreators(): Promise<User[]> {
    try {
      const users = await firestore()
        .collection(USER_COLLECTION)
        .where('contentCreator.fullname', '!=', '')
        .get();

      if (users.empty) {
        throw Error('No content creators!');
      }

      return users.docs.map(doc => User.fromSnapshot(doc));
    } catch (error) {
      throw error; // Handle the error appropriately
    }
  }

  static async login(email: string, password: string) {
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      console.log('err: ' + error);
      throw Error('User.login error: ' + error);
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
        return {
          id: id,
          token: '',
        };
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
      throw Error(
        'User.continueWithFacebook error ' +
          ErrorMessage.FACEBOOK_ACCESS_TOKEN_ERROR,
      );
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
            console.log('User.continueWithFacebook facebook account detected');
          } else {
            finishCallback({
              ...data,
              id: facebookId,
              name: instagramName,
              photo: profilePicture,
              instagram: {
                username: instagramUsername,
                followersCount: followersCount,
                isSynchronized: true,
                lastSyncAt: new Date().getTime(),
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

  async syncSocialData() {
    const {id, instagram} = this;
    if (!id || !instagram?.isSynchronized) {
      return;
    }
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    const currentTime = new Date().getTime();
    const lastSyncTime = instagram.lastSyncAt || 0;
    const timeDifference = currentTime - lastSyncTime;

    if (timeDifference < TWO_HOURS) {
      return;
    }
    if (instagram?.isSynchronized === true) {
      try {
        const fbAccessToken = await AccessToken.getCurrentAccessToken();
        if (!fbAccessToken) {
          return;
        }

        const instagramDataCallback = async (error?: Object, result?: any) => {
          if (error) {
            return;
          }
          const followersCount = result?.followers_count;
          const instagramUsername = result?.username;
          await User.getDocumentReference(id).update({
            instagram: {
              username: instagramUsername,
              followersCount: followersCount,
              isSynchronized: true,
              lastSyncAt: new Date().getTime(),
            },
          });
        };

        const userInstagramBusinessAccountCallback = async (
          error?: Object,
          result?: any,
        ) => {
          if (error) {
            return;
          }
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
        };

        const userFacebookPagesListCallback = async (
          error?: Object,
          result?: any,
        ) => {
          if (error) {
            return;
          }
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
        };
        const getUserFacebookPagesListRequest = new GraphRequest(
          '/me/accounts',
          {},
          userFacebookPagesListCallback,
        );

        await new GraphRequestManager()
          .addRequest(getUserFacebookPagesListRequest)
          .start();
      } catch (error) {
        console.error('Error getting Facebook access token:', error);
      }
    }
  }

  async signup(token: string, provider: Provider, providerId: string) {
    try {
      const {email, password} = this;
      const userCredential = await AuthMethod.getUserCredentialByProvider({
        provider: provider,
        token: token,
        email: email,
        password: password,
      });

      await User.getDocumentReference(userCredential.user.uid).set({
        ...User.mappingUserFields(this),
        joinedAt: new Date().getTime(),
      });

      await new AuthMethod({
        id: userCredential.user.uid,
        providerId: providerId,
        email: email,
        method: provider,
      }).insert();
    } catch (error: any) {
      console.log(error);
      throw Error('User.signUp error ' + error);
    }
  }

  async suspend() {
    await this.update({
      status: UserStatus.Suspended,
    });
    this.status = UserStatus.Suspended;
  }

  async activate() {
    await this.update({
      status: UserStatus.Active,
    });
    this.status = UserStatus.Active;
  }

  async updateRating(newRating: number, role: UserRole) {
    const {contentCreator, businessPeople} = this;
    const getNewRating = (
      currentRating: number,
      currentRatedCount: number,
      newRatedCount: number,
    ) => {
      return (
        (currentRating * currentRatedCount) / newRatedCount +
        newRating / newRatedCount
      );
    };
    if (role === UserRole.ContentCreator && contentCreator) {
      const currentRating = contentCreator?.rating;
      const currentRatedCount = contentCreator.ratedCount;
      const newRatedCount = currentRatedCount + 1;
      const calculatedRating = getNewRating(
        currentRating,
        currentRatedCount,
        newRatedCount,
      );
      this.update({
        'contentCreator.rating': calculatedRating,
        'contentCreator.ratedCount': newRatedCount,
      });
      contentCreator.rating = calculatedRating;
      contentCreator.ratedCount = newRatedCount;
    }
    if (role === UserRole.BusinessPeople && businessPeople) {
      const currentRating = businessPeople?.rating;
      const currentRatedCount = businessPeople.ratedCount;
      const newRatedCount = currentRatedCount + 1;
      const calculatedRating = getNewRating(
        currentRating,
        currentRatedCount,
        newRatedCount,
      );
      this.update({
        'businessPeople.rating': calculatedRating,
        'businessPeople.ratedCount': newRatedCount,
      });
      businessPeople.rating = calculatedRating;
      businessPeople.ratedCount = newRatedCount;
    }
  }

  static async signOut() {
    await auth().signOut();
  }
}
