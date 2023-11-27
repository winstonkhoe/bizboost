import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {SocialPlatform, User} from './User';
import {BaseModel} from './BaseModel';
import {Location} from './Location';
import {Category} from './Category';

export interface CampaignTask {
  name: string;
  quantity: number;
  type?: string;
  description?: string;
}

export type CampaignPlatform = {name: SocialPlatform; tasks: CampaignTask[]};

export enum CampaignStep {
  Registration = 'Registration',
  Brainstorming = 'Brainstorming',
  ContentSubmission = 'Content Submission',
  EngagementResultSubmission = 'Engagement Result Submission',
  Completed = 'Completed',
}

type CampainStepIndexMap = {
  [key in CampaignStep]: number;
};

export const campaignIndexMap: CampainStepIndexMap = {
  [CampaignStep.Registration]: 0,
  [CampaignStep.Brainstorming]: 1,
  [CampaignStep.ContentSubmission]: 2,
  [CampaignStep.EngagementResultSubmission]: 3,
  [CampaignStep.Completed]: 4,
};

export interface CampaignTimeline {
  step: CampaignStep;
  start: number;
  end: number;
}

export enum CampaignType {
  Public = 'Public',
  Private = 'Private',
}

export const CAMPAIGN_COLLECTION = 'campaigns';

export class Campaign extends BaseModel {
  id?: string;
  userId?: string;
  title?: string;
  description?: string;
  type?: CampaignType;
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
      console.log('model:Campaign getAll');
      const campaigns = await this.getCampaignCollections()
        .where('type', '==', CampaignType.Public)
        .get();
      if (campaigns.empty) {
        throw Error('No Campaigns!');
      }
      return campaigns.docs.map(this.fromSnapshot);
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
      return campaigns.docs.map(this.fromSnapshot);
    } catch (error) {
      throw Error('Error!');
    }
  }

  static getUserCampaignsReactive(
    userId: string,
    callback: (campaigns: Campaign[]) => void,
  ): (() => void) | undefined {
    try {
      const userRef = User.getDocumentReference(userId);
      return this.getCampaignCollections()
        .where('userId', '==', userRef)
        .onSnapshot(
          querySnapshots => {
            const userCampaigns = this.fromQuerySnapshot(querySnapshots);
            callback(userCampaigns);
          },
          (error: Error) => {
            callback([]);
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

  getActiveTimeline(): CampaignTimeline {
    const now = new Date().getTime();
    return this.timeline?.find(
      timeline => timeline.start <= now && now <= timeline.end,
    )!!;
  }

  getTimelineStart(): CampaignTimeline {
    return this.timeline?.find(
      timeline => CampaignStep.Registration === timeline.step,
    )!!;
  }

  getTimelineEnd(): CampaignTimeline {
    return this.timeline?.find(
      timeline => CampaignStep.EngagementResultSubmission === timeline.step,
    )!!;
  }
}
