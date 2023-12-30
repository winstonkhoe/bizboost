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
    return querySnapshots.docs.map(Location.fromSnapshot);
  }

  static getCollectionReference = () => {
    return firestore().collection(LOCATION_COLLECTION);
  };

  static getDocumentReference(documentId: string) {
    Location.setFirestoreSettings();
    return Location.getCollectionReference().doc(documentId);
  }

  static async getAll(): Promise<Location[]> {
    const querySnapshot = await Location.getCollectionReference().get();

    if (!querySnapshot.empty) {
      return Location.fromQuerySnapshot(querySnapshot);
    }
    return [];
  }
}
