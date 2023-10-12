import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

export type CampaignPlatform = {name: string; tasks: string[]};

export type CampaignType = 'Public' | 'Private';

export class Campaign {
  id: string = '';
  userId: string;
  title: string;
  description: string;
  type: CampaignType;
  locations: string[];
  platforms: CampaignPlatform[];
  fee: number;
  criterias: string[];
  slot: number;
  image: string;
  start: FirebaseFirestoreTypes.Timestamp | number;
  end: FirebaseFirestoreTypes.Timestamp | number;
  createdAt: FirebaseFirestoreTypes.Timestamp | number;
  importantInformation: string[];

  constructor(
    userId: string,
    title: string,
    description: string,
    type: CampaignType,
    locations: string[],
    platforms: CampaignPlatform[],
    fee: number,
    criterias: string[],
    slot: number,
    image: string,
    start: FirebaseFirestoreTypes.Timestamp | number,
    end: FirebaseFirestoreTypes.Timestamp | number,
    createdAt: FirebaseFirestoreTypes.Timestamp | number,
    importantInformation: string[],
    id: string = '',
  ) {
    this.userId = userId;
    this.title = title;
    this.description = description;
    this.type = type;
    this.locations = locations;
    this.platforms = platforms;
    this.fee = fee;
    this.criterias = criterias;
    this.slot = slot;
    this.image = image;
    this.start = start;
    this.end = end;
    this.createdAt = createdAt;
    this.importantInformation = importantInformation;
    this.id = id;
  }

  private static fromSnapshot(
    doc:
      | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
      | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Campaign {
    const data = doc.data();
    if (data && doc.exists) {
      return {
        id: doc.id,
        userId: data.userId?.id,
        title: data.title,
        description: data.description,
        type: data.type,
        locations: data.locations,
        platforms: data.platforms,
        fee: data.fee,
        criterias: data.criterias,
        slot: data.slot,
        image: data.image,
        start: data.start?.seconds,
        end: data.end?.seconds,
        createdAt: data.createdAt?.seconds,
        importantInformation: data.importantInformation,
      } as Campaign;
    }

    throw Error("Error, document doesn't exist!");
  }

  static async getAll(): Promise<Campaign[]> {
    try {
      const campaigns = await firestore()
        .collection('campaigns')
        .where('type', '==', 'Public')
        .get();
      if (campaigns.empty) {
        throw Error('No Campaigns!');
      }
      return campaigns.docs.map(doc => this.fromSnapshot(doc));
    } catch (error) {
      throw Error('Error!');
    }
  }

  static async getById(id: string): Promise<Campaign> {
    try {
      const snapshot = await firestore().collection('campaigns').doc(id).get();
      if (!snapshot.exists) {
        throw Error('Campaign not found!');
      }

      const campaign = this.fromSnapshot(snapshot);
      return campaign;
    } catch (error) {}
    throw Error('Error!');
    // .then(documentSnapshot => {
    //   console.log('User exists: ', documentSnapshot.exists);

    //   if (documentSnapshot.exists) {
    //     console.log('User data: ', documentSnapshot.data());
    //   }
    // });
  }
}
