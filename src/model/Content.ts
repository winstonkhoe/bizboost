import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {BaseModel} from './BaseModel';
import {User} from './User';

const CONTENT_COLLECTION = 'contents';

export interface ContentView {
  content: Content;
  user: User;
}

export class Content extends BaseModel {
  id?: string;
  uri?: string;
  userId?: string;
  description?: string;
  thumbnail?: string;

  constructor({id, uri, userId, description, thumbnail}: Partial<Content>) {
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
  ): Content {
    const data = doc.data();
    if (data && doc.exists) {
      return new Content({
        id: doc.id,
        description: data?.description,
        uri: data?.uri,
        userId: data?.userId?.id,
        thumbnail: data?.thumbnail,
      });
    }
    throw Error("Error, document doesn't exist!");
  }

  static async updateContentData(
    documentId: string,
    data: Content,
  ): Promise<void> {
    await this.getDocumentReference(documentId).update({
      ...data,
      id: undefined,
      userId: User.getDocumentReference(data.userId!!),
    });
  }

  private static fromQuerySnapshot(
    querySnapshots: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Content[] {
    return querySnapshots.docs.map(this.fromSnapshot);
  }

  static getCollectionReference = () => {
    return firestore().collection(CONTENT_COLLECTION);
  };

  static getDocumentReference(documentId: string) {
    this.setFirestoreSettings();
    return this.getCollectionReference().doc(documentId);
  }

  static async setContent(documentId: string, data: Content): Promise<void> {
    await this.getDocumentReference(documentId).set({
      ...data,
    });
  }

  static async getById(documentId: string): Promise<Content | undefined> {
    const snapshot = await this.getDocumentReference(documentId).get();
    if (snapshot.exists) {
      return this.fromSnapshot(snapshot);
    }
  }

  static async getByUserId(userId: string): Promise<Content[] | undefined> {
    const querySnapshot = await this.getCollectionReference()
      .where('userId', '==', User.getDocumentReference(userId))
      .get();

    if (!querySnapshot.empty) {
      return this.fromQuerySnapshot(querySnapshot);
    }
    return [];
  }

  static async getAll(): Promise<Content[]> {
    const querySnapshot = await this.getCollectionReference().get();

    if (!querySnapshot.empty) {
      return this.fromQuerySnapshot(querySnapshot);
    }
    return [];
  }

  async update() {
    try {
      if (this.id) {
        await Content.updateContentData(this.id, this);
        return true;
      }
      return false;
    } catch (error) {
      console.log(error);
    }
    return false;
  }
}
