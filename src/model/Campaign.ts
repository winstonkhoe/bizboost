import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {User} from './User';
import {BaseModel} from './BaseModel';
import {Location} from './Location';
import {Category} from './Category';

export type CampaignPlatform = {name: string; tasks: string[]};

export enum CampaignStep {
  Registration = 'Registration',
  Brainstorming = 'Brainstorming',
  ContentSubmission = 'Content Submission',
  EngagementResultSubmission = 'Engagement Result Submission',
}

export type CampaignSteps =
  | CampaignStep.Registration
  | CampaignStep.Brainstorming
  | CampaignStep.ContentSubmission
  | CampaignStep.EngagementResultSubmission;

export interface CampaignTimeline {
  step: CampaignSteps;
  start: number;
  end: number;
}

export enum CampaignType {
  Public = 'Public',
  Private = 'Private',
}

export type CampaignTypes = CampaignType.Public | CampaignType.Private;

export const CAMPAIGN_COLLECTION = 'campaigns';

export class Campaign extends BaseModel {
  id?: string;
  userId?: string;
  title?: string;
  description?: string;
  type?: CampaignTypes;
  locations?: string[];
  categories?: string[];
  platforms?: CampaignPlatform[];
  fee?: number;
  criterias?: string[];
  slot?: number;
  image?: string;
  timeline?: CampaignTimeline[];
  createdAt?: number;
  importantInformation?: string[];

  constructor({
    id,
    userId,
    title,
    description,
    type,
    locations,
    categories,
    platforms,
    fee,
    criterias,
    slot,
    image,
    timeline,
    createdAt,
    importantInformation,
  }: Partial<Campaign>) {
    super();
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.description = description;
    this.type = type;
    this.locations = locations;
    this.categories = categories;
    this.platforms = platforms;
    this.fee = fee;
    this.criterias = criterias;
    this.slot = slot;
    this.image = image;
    this.timeline = timeline;
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
        locations:
          data?.locations?.map(
            (locationRef: FirebaseFirestoreTypes.DocumentReference) =>
              locationRef.id,
          ) || [],
        categories:
          data?.categories?.map(
            (categoryRef: FirebaseFirestoreTypes.DocumentReference) =>
              categoryRef.id,
          ) || [],
        platforms: data.platforms,
        fee: data.fee,
        criterias: data.criterias,
        slot: data.slot,
        image: data.image,
        timeline: data.timeline,
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
          querySnapshots => {
            const userCampaigns = this.fromQuerySnapshot(querySnapshots);
            callback(userCampaigns, subscriber);
          },
          (error: Error) => {
            callback([], subscriber);
            console.log('getUserCampaignsReactive', error.message);
          },
        );
    } catch (error) {
      console.log('getUserCampaignsReactive', error);
    }
  }
  static getDocumentReference(
    documentId: string,
  ): FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData> {
    return this.getCampaignCollections().doc(documentId);
  }
  static async getById(id: string): Promise<Campaign> {
    try {
      const snapshot = await this.getDocumentReference(id).get();
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
      const {id, ...rest} = this;
      const data = {
        ...rest,
        userId: User.getDocumentReference(this.userId ?? ''),
        locations: this.locations?.map(locId =>
          Location.getDocumentReference(locId),
        ),
        categories: this.categories?.map(categoryId =>
          Category.getDocumentReference(categoryId),
        ),
        createdAt: new Date().getTime(),
      };

      await Campaign.getCampaignCollections().add(data);
      return true;
    } catch (error) {
      console.log(error);
    }
    throw Error('Error!');
  }
}
