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

  private static fromSnapshot(
    doc:
      | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
      | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Portfolio {
    const data = doc.data();
    if (data && doc.exists) {
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

  async updatePortfolioData(
    documentId: string,
    data: Portfolio,
  ): Promise<void> {
    await Portfolio.getDocumentReference(documentId).update({
      ...data,
      id: undefined,
      userId: User.getDocumentReference(data.userId!!),
    });
  }

  private static fromQuerySnapshot(
    querySnapshots: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Portfolio[] {
    return querySnapshots.docs.map(this.fromSnapshot);
  }

  static getCollectionReference = () => {
    return firestore().collection(PORTFOLIO_COLLECTION);
  };

  static getDocumentReference(documentId: string) {
    this.setFirestoreSettings();
    return this.getCollectionReference().doc(documentId);
  }

  // TODO: gakepake
  static async setPortfolio(
    documentId: string,
    data: Portfolio,
  ): Promise<void> {
    await this.getDocumentReference(documentId).set({
      ...data,
    });
  }

  // TODO: gakepake
  static async getById(documentId: string): Promise<Portfolio | undefined> {
    const snapshot = await this.getDocumentReference(documentId).get();
    if (snapshot.exists) {
      return this.fromSnapshot(snapshot);
    }
  }

  static async getByUserId(userId: string): Promise<Portfolio[] | undefined> {
    const querySnapshot = await this.getCollectionReference()
      .where('userId', '==', User.getDocumentReference(userId))
      .get();

    if (!querySnapshot.empty) {
      return this.fromQuerySnapshot(querySnapshot);
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

  async update() {
    try {
      const {id, userId, ...rest} = this;
      if (!id) {
        throw Error('Invalid id');
      }
      if (!userId) {
        throw Error('Invalid user id');
      }
      await Portfolio.getDocumentReference(id).update({
        ...rest,
        userId: User.getDocumentReference(userId),
      });
    } catch (error) {
      console.log(error);
      throw Error('Portfolio.update error ' + error);
    }
  }
}
