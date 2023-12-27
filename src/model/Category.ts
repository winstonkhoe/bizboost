import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {BaseModel} from './BaseModel';

const CATEGORY_COLLECTION = 'categories';

export class Category extends BaseModel {
  id?: string;
  alias?: string;
  image?: string;

  constructor({id, alias, image}: Partial<Category>) {
    super();
    this.id = id;
    this.alias = alias;
    this.image = image;
    // Add your non-static methods here
  }

  private static fromSnapshot(
    doc:
      | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
      | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Category {
    const data = doc.data();
    if (data && doc.exists) {
      return new Category({
        id: doc.id,
        alias: data?.alias,
        image: data?.image,
      });
    }
    throw Error("Error, document doesn't exist!");
  }

  private static fromQuerySnapshot(
    querySnapshots: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Category[] {
    return querySnapshots.docs.map(this.fromSnapshot);
  }

  static getCollectionReference = () => {
    return firestore().collection(CATEGORY_COLLECTION);
  };

  static getDocumentReference(documentId: string) {
    Category.setFirestoreSettings();
    return Category.getCollectionReference().doc(documentId);
  }

  static async setCategory(documentId: string, data: Category): Promise<void> {
    await Category.getDocumentReference(documentId).set({
      ...data,
    });
  }

  static async getById(documentId: string): Promise<Category | null> {
    const snapshot = await Category.getDocumentReference(documentId).get();
    if (!snapshot.exists) {
      return null;
    }
    return Category.fromSnapshot(snapshot);
  }

  // TODO: check, remove unused method (yang dipake cuma getall kayaknya)
  static async getAll(): Promise<Category[]> {
    const querySnapshot = await Category.getCollectionReference().get();
    return Category.fromQuerySnapshot(querySnapshot);
  }
}
