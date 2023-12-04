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
  // PendingPayment = 'Pending Payment'
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
  title?: string;
  description?: string;
  type?: CampaignType;
  locations?: string[];
  categories?: string[];
  platformTasks?: CampaignPlatform[];
  fee?: number;
  criterias?: string[];
  slot?: number;
  image?: string;
  timeline?: CampaignTimeline[];
  createdAt?: number;
  importantInformation?: string[];
  paymentProofImage?: string;

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
    paymentProofImage,
  }: Partial<Campaign>) {
    super();
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.description = description;
    this.type = type;
    this.locations = locations;
    this.categories = categories;
    this.platformTasks = platformTasks;
    this.fee = fee;
    this.criterias = criterias;
    this.slot = slot;
    this.image = image;
    this.timeline = timeline;
    this.createdAt = createdAt;
    this.importantInformation = importantInformation;
    this.paymentProofImage = paymentProofImage;
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
        paymentProofImage: data.paymentProofImage,
      });
    }

    throw Error("Error, document doesn't exist!");
  }

  private static fromQuerySnapshot(
    querySnapshots: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Campaign[] {
    return querySnapshots.docs.map(this.fromSnapshot);
  }

  static getCollectionReference = () => {
    return firestore().collection(CAMPAIGN_COLLECTION);
  };

  static getDocumentReference(documentId: string) {
    this.setFirestoreSettings();
    return this.getCollectionReference().doc(documentId);
  }

  static async getAll(): Promise<Campaign[]> {
    try {
      console.log('model:Campaign getAll');
      const campaigns = await this.getCollectionReference()
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
      const campaigns = await this.getCollectionReference()
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
      return this.getCollectionReference()
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

  static async getById(id: string): Promise<Campaign> {
    try {
      const snapshot = await this.getDocumentReference(id).get();
      if (!snapshot.exists) {
        //TODO: throw error ilangin aja deh keknya ribet handlingnya
        throw Error('Campaign not found!');
      }

      const campaign = this.fromSnapshot(snapshot);
      return campaign;
    } catch (error) {}
    throw Error('Error!');
  }

  static getByIdReactive(
    id: string,
    onComplete: (campaign: Campaign | undefined) => void,
  ) {
    const unsubscribe = this.getDocumentReference(id).onSnapshot(
      docSnapshot => {
        if (!docSnapshot.exists) {
          onComplete(undefined);
        } else {
          onComplete(this.fromSnapshot(docSnapshot));
        }
      },
      error => {
        onComplete(undefined);
        console.log(error.message);
      },
    );

    return unsubscribe;
  }

  //todo: GATAU namanya yang bagus apa
  toMapObject() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    return data;
  }

  async insert() {
    try {
      const data = this.toMapObject();

      await Campaign.getCollectionReference().add(data);
      return true;
    } catch (error) {
      console.log(error);
    }
    throw Error('Error!');
  }

  async update() {
    Campaign.getDocumentReference(this.id || '').update(this.toMapObject());
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
      timeline => CampaignStep.ResultSubmission === timeline.step,
    )!!;
  }

  isTimelineAvailable(step: CampaignStep): boolean {
    return (
      this.timeline?.find(timeline => step === timeline.step) !== undefined
    );
  }
}
