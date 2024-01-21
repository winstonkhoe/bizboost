import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {SocialPlatform, User} from './User';
import {BaseModel} from './BaseModel';
import {Location} from './Location';
import {Category} from './Category';
import {
  Transaction,
  TransactionStatus,
  transactionStatusIndexMap,
} from './Transaction';

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
  ContentCreation = 'Content Creation',
  ResultSubmission = 'Result Submission',
  Completed = 'Completed',
}

type CampainStepIndexMap = {
  [key in CampaignStep]: number;
};

export const campaignIndexMap: CampainStepIndexMap = {
  [CampaignStep.Registration]: 0,
  [CampaignStep.Brainstorming]: 1,
  [CampaignStep.ContentCreation]: 2,
  [CampaignStep.ResultSubmission]: 3,
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
  title: string;
  description: string;
  type: CampaignType;
  locations: string[];
  categories: string[];
  platformTasks: CampaignPlatform[];
  fee?: number;
  criterias: string[];
  slot: number;
  image?: string;
  timeline: CampaignTimeline[];
  createdAt?: number;
  importantInformation: string[];

  constructor({
    id,
    userId,
    title,
    description,
    type,
    locations,
    categories,
    platformTasks,
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
    this.title = title || '';
    this.description = description || '';
    this.type = type || CampaignType.Public;
    this.locations = locations || [];
    this.categories = categories || [];
    this.platformTasks = platformTasks || [];
    this.fee = fee;
    this.criterias = criterias || [];
    this.slot = slot || 1;
    this.image = image;
    this.timeline = timeline || [];
    this.createdAt = createdAt;
    this.importantInformation = importantInformation || [];
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
        platformTasks: data.platformTasks,
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
    return querySnapshots.docs.map(Campaign.fromSnapshot);
  }

  static getCollectionReference = () => {
    return firestore().collection(CAMPAIGN_COLLECTION);
  };

  static getDocumentReference(documentId: string) {
    Campaign.setFirestoreSettings();
    return Campaign.getCollectionReference().doc(documentId);
  }

  static sortByTimelineStart(a: Campaign, b: Campaign) {
    return a.getTimelineStart()?.start - b.getTimelineStart()?.start || 0;
  }

  static getAll(
    callback: (campaigns: Campaign[]) => void,
    type: CampaignType = CampaignType.Public,
  ) {
    try {
      return Campaign.getCollectionReference()
        .where('type', '==', type)
        .onSnapshot(
          querySnapshots => {
            callback(Campaign.fromQuerySnapshot(querySnapshots));
          },
          (error: Error) => {
            console.log(error.message);
            callback([]);
          },
        );
    } catch (error) {
      console.log(error);
      callback([]);
    }
  }

  static async getUserCampaigns(userId: string): Promise<Campaign[]> {
    try {
      const userRef = User.getDocumentReference(userId);
      const campaigns = await Campaign.getCollectionReference()
        .where('userId', '==', userRef)
        .get();
      if (campaigns.empty) {
        throw Error('No Campaigns!');
      }
      return campaigns.docs.map(Campaign.fromSnapshot);
    } catch (error) {
      throw Error('Campaign.getUserCampaigns err' + error);
    }
  }

  static async getRegistrationCampaignByUser(
    userId: string,
  ): Promise<Campaign[]> {
    try {
      // Get today's timestamp in milliseconds
      const todayTimestamp = new Date().getTime();

      const campaigns = await Campaign.getUserCampaigns(userId);

      const validCampaigns = campaigns.filter(campaign => {
        if (campaign.timeline) {
          const registrationStep = campaign.timeline.find(
            step => step.step === CampaignStep.Registration,
          );

          return (
            registrationStep &&
            todayTimestamp >= registrationStep.start &&
            todayTimestamp <= registrationStep.end
          );
        }
        return false;
      });

      return validCampaigns;
    } catch (error) {
      throw Error('Error!');
    }
  }

  static getUserCampaignsReactive(
    userId: string,
    callback: (campaigns: Campaign[]) => void,
  ) {
    try {
      const userRef = User.getDocumentReference(userId);
      return Campaign.getCollectionReference()
        .where('userId', '==', userRef)
        .onSnapshot(
          querySnapshots => {
            const userCampaigns = Campaign.fromQuerySnapshot(querySnapshots);
            callback(userCampaigns);
          },
          (error: Error) => {
            callback([]);
            console.log('getUserCampaignsReactive', error.message);
          },
        );
    } catch (error) {
      console.log('getUserCampaignsReactive', error);
      callback([]);
    }
  }

  static async getById(id: string): Promise<Campaign | null> {
    try {
      const snapshot = await Campaign.getDocumentReference(id).get();
      if (!snapshot.exists) {
        return null;
      }
      return Campaign.fromSnapshot(snapshot);
    } catch (error) {
      console.log('Campaign.getById error', error);
    }
    return null;
  }

  static getByIdReactive(
    id: string,
    onComplete: (campaign: Campaign | undefined) => void,
  ) {
    return Campaign.getDocumentReference(id).onSnapshot(
      docSnapshot => {
        if (!docSnapshot.exists) {
          onComplete(undefined);
        } else {
          onComplete(Campaign.fromSnapshot(docSnapshot));
        }
      },
      error => {
        onComplete(undefined);
        console.log(error.message);
      },
    );
  }

  //todo: GATAU namanya yang bagus apa
  toFirestore() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {id, fee, userId, ...rest} = this;
    if (!userId) {
      throw Error('Campaign userId is undefined');
    }
    const data = {
      ...rest,
      fee: rest.type === CampaignType.Public ? fee : undefined,
      userId: User.getDocumentReference(userId),
      locations: this.locations?.map(locId =>
        Location.getDocumentReference(locId),
      ),
      categories: this.categories?.map(categoryId =>
        Category.getDocumentReference(categoryId),
      ),
    };

    return data;
  }

  async insert() {
    try {
      const data = this.toFirestore();
      await Campaign.getCollectionReference().add({
        ...data,
        createdAt: new Date().getTime(),
      });
    } catch (error) {
      console.log(error);
      throw Error('Error!');
    }
  }

  getActiveTimeline(): CampaignTimeline {
    const now = new Date().getTime();
    return this.timeline.find(
      timeline => timeline.start <= now && now <= timeline.end,
    )!!;
  }

  getTimelineStart(): CampaignTimeline {
    return this.timeline.find(
      timeline => CampaignStep.Registration === timeline.step,
    )!!;
  }

  getTimelineEnd(): CampaignTimeline {
    return this.timeline.find(
      timeline => CampaignStep.ResultSubmission === timeline.step,
    )!!;
  }

  isTimelineAvailable(step: CampaignStep): boolean {
    return this.timeline.find(timeline => step === timeline.step) !== undefined;
  }

  isPublic() {
    return this.type === CampaignType.Public;
  }

  isPrivate() {
    return this.type === CampaignType.Private;
  }

  async isRegisterable() {
    const {id, slot} = this;
    if (!id) {
      return false;
    }
    const registeredSlot = await new Promise<number>((resolve, reject) => {
      try {
        const unsubscribe = Transaction.getAllTransactionsByCampaign(
          id,
          transactions => {
            unsubscribe();
            resolve(transactions.filter(t => t.isRegistered()).length);
          },
        );
      } catch (error) {
        console.log(error);
        reject(-1);
      }
    });
    const isSlotAvailable = registeredSlot !== -1 && registeredSlot < slot;

    const now = new Date().getTime();
    return this.getTimelineStart()?.end >= now && isSlotAvailable;
  }

  isUpcomingOrRegistration() {
    const now = new Date().getTime();
    console.log(
      'isUpcomingOrRegistration',
      this.title,
      now < this.getTimelineStart()?.end,
    );
    return now < this.getTimelineStart()?.end;
  }

  isOngoing() {
    const now = new Date().getTime();
    return now < this.getTimelineEnd()?.end;
  }

  isCompleted() {
    const now = new Date().getTime();
    return now > this.getTimelineEnd()?.end;
  }
}
