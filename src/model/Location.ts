import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {BaseModel} from './BaseModel';

const LOCATION_COLLECTION = 'locations';

export class Location extends BaseModel {
  id?: string;
  latitude?: number;
  longitude?: number;

  constructor({id, latitude, longitude}: Partial<Location>) {
    super();
    this.id = id;
    this.latitude = latitude;
    this.longitude = longitude;
    // Add your non-static methods here
  }

  private static fromSnapshot(
    doc:
      | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
      | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Location {
    const data = doc.data();
    if (data && doc.exists) {
      return new Location({
        id: doc.id,
        latitude: data?.latitude,
        longitude: data?.longitude,
      });
    }
    throw Error("Error, document doesn't exist!");
  }

  private static fromQuerySnapshot(
    querySnapshots: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Location[] {
    return querySnapshots.docs.map(this.fromSnapshot);
  }

  static getCollectionReference =
    (): FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData> => {
      return firestore().collection(LOCATION_COLLECTION);
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

  static async setLocation(documentId: string, data: Location): Promise<void> {
    await this.getDocumentReference(documentId).set({
      ...data,
    });
  }

  static async getById(documentId: string): Promise<Location | undefined> {
    const snapshot = await this.getDocumentReference(documentId).get();
    if (snapshot.exists) {
      return this.fromSnapshot(snapshot);
    }
  }

  static async getAll(): Promise<Location[]> {
    const querySnapshot = await this.getCollectionReference().get();

    if (!querySnapshot.empty) {
      return this.fromQuerySnapshot(querySnapshot);
    }
    return [];
  }
}