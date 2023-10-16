import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {User} from './User';
import {BaseModel} from './BaseModel';

export type CampaignPlatform = {name: string; tasks: string[]};

export enum CampaignType {
  Public = 'Public',
  Private = 'Private',
}

export type CampaignTypes = CampaignType.Public | CampaignType.Private;

const CAMPAIGN_COLLECTION = 'campaigns';

export class Campaign extends BaseModel {
  id?: string = '';
  userId?: string;
  title?: string;
  description?: string;
  type?: CampaignTypes;
  locations?: string[];
  platforms?: CampaignPlatform[];
  fee?: number;
  criterias?: string[];
  slot?: number;
  image?: string;
  start?: FirebaseFirestoreTypes.Timestamp | number | Date;
  end?: FirebaseFirestoreTypes.Timestamp | number | Date;
  createdAt?: FirebaseFirestoreTypes.Timestamp | number | Date;
  importantInformation?: string[];

  constructor({
    userId,
    title,
    description,
    type,
    locations,
    platforms,
    fee,
    criterias,
    slot,
    image,
    start,
    end,
    createdAt,
    importantInformation,
  }: Partial<Campaign>) {
    super();
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
  }

  private static fromSnapshot(
    doc:
      | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
      | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Campaign {
    const data = doc.data();
    if (data && doc.exists) {
      return new Campaign({
        id: doc.id,
        userId: data.userId.id,
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
      });
    }

    throw Error("Error, document doesn't exist!");
  }

  private static fromQuerySnapshot(
    querySnapshots: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Campaign[] {
    return querySnapshots.docs.map(this.fromSnapshot);
  }

  static getCampaignCollections =
    (): FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData> => {
      return firestore().collection(CAMPAIGN_COLLECTION);
    };

  static async getAll(): Promise<Campaign[]> {
    try {
      const campaigns = await this.getCampaignCollections()
        .where('type', '==', CampaignType.Public)
        .get();
      if (campaigns.empty) {
        throw Error('No Campaigns!');
      }
      return campaigns.docs.map(doc => this.fromSnapshot(doc));
    } catch (error) {
      throw Error('Error!');
    }
  }

  static async getUserCampaigns(userId: string): Promise<Campaign[]> {
    try {
      const userRef = User.getDocumentReference(userId);
      const campaigns = await this.getCampaignCollections()
        .where('userId', '==', userRef)
        .get();
      if (campaigns.empty) {
        throw Error('No Campaigns!');
      }
      return campaigns.docs.map(doc => this.fromSnapshot(doc));
    } catch (error) {
      throw Error('Error!');
    }
  }

  static getUserCampaignsReactive(
    userId: string,
    callback: (campaigns: Campaign[], unsubscribe: () => void) => void,
  ): void {
    try {
      const userRef = User.getDocumentReference(userId);
      const subscriber = this.getCampaignCollections()
        .where('userId', '==', userRef)
        .onSnapshot(
          (
            querySnapshots: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
          ) => {
            const userCampaigns = this.fromQuerySnapshot(querySnapshots);
            callback(userCampaigns, subscriber);
          },
          (error: Error) => {
            throw Error(error.message);
          },
        );
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
  }

  async insert() {
    try {
      const data = {
        ...this,
        userId: User.getDocumentReference(this.userId ?? ''),
        createdAt: new Date(),
      };
      await Campaign.getCampaignCollections().add(data);
      return true;
    } catch (error) {
      console.log(error);
    }
    throw Error('Error!');
  }
}
