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

  constructor({id, uri, userId, description}: Partial<Content>) {
    super();
    this.id = id;
    this.uri = uri;
    this.userId = userId;
    this.description = description;
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
      });
    }
    throw Error("Error, document doesn't exist!");
  }

  private static fromQuerySnapshot(
    querySnapshots: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Content[] {
    return querySnapshots.docs.map(this.fromSnapshot);
  }

  static getCollectionReference =
    (): FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData> => {
      return firestore().collection(CONTENT_COLLECTION);
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
}
