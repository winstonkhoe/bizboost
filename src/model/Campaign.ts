import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

export type CampaignPlatform = {name: string; tasks: string[]};

export class Campaign {
  id: string = '';
  userId: string;
  title: string;
  description: string;
  type: 'Public' | 'Private';
  locations: string[];
  platforms: CampaignPlatform[];
  fee: number;
  criterias: string[];
  slot: number;
  image: string;
  start: FirebaseFirestoreTypes.Timestamp;
  end: FirebaseFirestoreTypes.Timestamp;
  createdAt: FirebaseFirestoreTypes.Timestamp;

  constructor(
    userId: string,
    title: string,
    description: string,
    type: 'Public' | 'Private',
    locations: string[],
    platforms: CampaignPlatform[],
    fee: number,
    criterias: string[],
    slot: number,
    image: string,
    start: FirebaseFirestoreTypes.Timestamp,
    end: FirebaseFirestoreTypes.Timestamp,
    createdAt: FirebaseFirestoreTypes.Timestamp,
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
    this.id = id;
  }

  private static fromSnapshot(
    doc:
      | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
      | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Campaign {
    const data = doc.data();
    if (data && doc.exists) {
      return new Campaign(
        data.userId,
        data.title,
        data.description,
        data.type,
        data.locations,
        data.platforms,
        data.fee,
        data.criterias,
        data.slot,
        data.image,
        data.start,
        data.end,
        data.createdAt,
        doc.id,
      );
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
      return campaigns.docs.map(doc => {
        const data = doc.data();
        return new Campaign(
          data.userId,
          data.title,
          data.description,
          data.type,
          data.locations,
          data.platforms,
          data.fee,
          data.criterias,
          data.slot,
          data.image,
          data.start,
          data.end,
          data.createdAt,
          doc.id,
        );
      });
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
