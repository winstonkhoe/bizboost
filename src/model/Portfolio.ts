import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {BaseModel} from './BaseModel';
import {User} from './User';

const PORTFOLIO_COLLECTION = 'portfolios';

export interface PortfolioView {
  portfolio: Portfolio;
  user: User;
}

export class Portfolio extends BaseModel {
  id?: string;
  uri?: string;
  userId?: string;
  description?: string;
  thumbnail?: string;

  constructor({id, uri, userId, description, thumbnail}: Partial<Portfolio>) {
    super();
    this.id = id;
    this.uri = uri;
    this.userId = userId;
    this.description = description;
    this.thumbnail = thumbnail;
  }

  toFirestore() {
    // const {thumbnail, uri, description, userId, ...rest} = this;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {id, userId, ...rest} = this;
    if (!userId) {
      throw Error('Portfolio userId is undefined');
    }

    return {
      ...rest,
      userId: User.getDocumentReference(userId),
    };
  }

  private static fromSnapshot(
    doc:
      | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
      | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Portfolio {
    const data = doc.data();
    if (data && doc.exists) {
      console.log('doc.id:' + doc.id);
      return new Portfolio({
        id: doc.id,
        description: data?.description,
        uri: data?.uri,
        userId: data?.userId?.id,
        thumbnail: data?.thumbnail,
      });
    }
    throw Error("Error, document doesn't exist!");
  }

  private static fromQuerySnapshot(
    querySnapshots: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Portfolio[] {
    return querySnapshots.docs.map(Portfolio.fromSnapshot);
  }

  static getCollectionReference = () => {
    return firestore().collection(PORTFOLIO_COLLECTION);
  };

  static getDocumentReference(documentId: string) {
    Portfolio.setFirestoreSettings();
    return Portfolio.getCollectionReference().doc(documentId);
  }

  async insert() {
    try {
      const data = this.toFirestore();
      await Portfolio.getCollectionReference().add({
        ...data,
        // createdAt: new Date().getTime(),
      });
    } catch (error) {
      console.log(error);
      throw Error('Error!');
    }
  }

  static async getByUserId(userId: string): Promise<Portfolio[] | undefined> {
    const querySnapshot = await Portfolio.getCollectionReference()
      .where('userId', '==', User.getDocumentReference(userId))
      .get();

    if (!querySnapshot.empty) {
      return Portfolio.fromQuerySnapshot(querySnapshot);
    }
    return [];
  }

  static async getAll(): Promise<Portfolio[]> {
    const querySnapshot = await this.getCollectionReference().get();

    if (!querySnapshot.empty) {
      return this.fromQuerySnapshot(querySnapshot);
    }
    return [];
  }

  async updateThumbnail(thumbnailUrl: string) {
    try {
      const {id} = this;
      if (!id) {
        throw Error('Invalid id');
      }
      await Portfolio.getDocumentReference(id).update({
        thumbnail: thumbnailUrl,
      });
      this.thumbnail = thumbnailUrl;
    } catch (error) {
      console.log(error);
      throw Error('Portfolio.update error ' + error);
    }
  }
}
