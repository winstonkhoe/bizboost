import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {BaseModel} from './BaseModel';
import {SocialPlatform, User, UserRole} from './User';
import {
  Campaign,
  CampaignPlatform,
  CampaignStep,
  campaignIndexMap,
} from './Campaign';
import {StatusType} from '../components/atoms/StatusTag';
import {isEqualDate} from '../utils/date';
import {StepperState} from '../components/atoms/Stepper';

export const TRANSACTION_COLLECTION = 'transactions';

export enum BasicStatus {
  pending = 'Pending',
  approved = 'Approved',
  rejected = 'Rejected',
}

export enum TransactionStatus {
  // public
  notRegistered = 'Not Registered',
  registrationPending = 'Registration Pending',
  registrationRejected = 'Registration Rejected',
  registrationApproved = 'Registration Approved',

  // private
  offering = 'Offering',
  offeringApproved = 'Offering Approved',
  offerRejected = 'Offering Rejected', // soft delete

  // TODO: add other status: brainstorming, draft, final content, engagement, payment, etc

  brainstormSubmitted = 'Brainstorm Submitted',
  brainstormRejected = 'Brainstorm Rejected',
  brainstormApproved = 'Brainstorm Approved',

  contentSubmitted = 'Content Submitted',
  contentRejected = 'Content Rejected',
  contentApproved = 'Content Approved',

  engagementSubmitted = 'Engagement Submitted',
  engagementRejected = 'Engagement Rejected',

  completed = 'completed',

  reported = 'Reported', //reported by bp
  terminated = 'Terminated', //expired or timeline miss
}

export enum RejectionType {
  mismatch = 'Mismatch',
  unreachableLink = 'Unreachable Link',
}

type RejectionTypeLabelMap = {
  [key in RejectionType]: string;
};

type TransactionStatusMap = {
  [key in TransactionStatus]: StatusType;
};

type TransactionStatusStepperStateMap = {
  [key in TransactionStatus]: StepperState;
};

type TransactionStatusCampaignStepMap = {
  [key in TransactionStatus]?: CampaignStep;
};

type TransactionStatusIndexMap = {
  [key in TransactionStatus]: number;
};

type BasicStatusMap = {
  [key in BasicStatus]: StatusType;
};

export const rejectionTypeLabelMap: RejectionTypeLabelMap = {
  [RejectionType.mismatch]: "Content doesn't meet task requirements",
  [RejectionType.unreachableLink]:
    'Link cannot be opened (access, invalid link, etc)',
};

export const basicStatusTypeMap: BasicStatusMap = {
  [BasicStatus.pending]: StatusType.warning,
  [BasicStatus.approved]: StatusType.success,
  [BasicStatus.rejected]: StatusType.danger,
};

export const transactionStatusIndexMap: TransactionStatusIndexMap = {
  [TransactionStatus.notRegistered]:
    campaignIndexMap[CampaignStep.Registration],
  [TransactionStatus.registrationPending]:
    campaignIndexMap[CampaignStep.Registration],
  [TransactionStatus.registrationRejected]:
    campaignIndexMap[CampaignStep.Registration],
  [TransactionStatus.registrationApproved]:
    campaignIndexMap[CampaignStep.Brainstorming],

  [TransactionStatus.offering]: campaignIndexMap[CampaignStep.Registration],
  [TransactionStatus.offerRejected]:
    campaignIndexMap[CampaignStep.Registration],
  [TransactionStatus.offeringApproved]:
    campaignIndexMap[CampaignStep.Brainstorming],

  [TransactionStatus.brainstormSubmitted]:
    campaignIndexMap[CampaignStep.Brainstorming],
  [TransactionStatus.brainstormRejected]:
    campaignIndexMap[CampaignStep.Brainstorming],
  [TransactionStatus.brainstormApproved]:
    campaignIndexMap[CampaignStep.ContentSubmission],

  [TransactionStatus.contentSubmitted]:
    campaignIndexMap[CampaignStep.ContentSubmission],
  [TransactionStatus.contentRejected]:
    campaignIndexMap[CampaignStep.ContentSubmission],
  [TransactionStatus.contentApproved]:
    campaignIndexMap[CampaignStep.EngagementResultSubmission],

  [TransactionStatus.engagementSubmitted]:
    campaignIndexMap[CampaignStep.EngagementResultSubmission],
  [TransactionStatus.engagementRejected]:
    campaignIndexMap[CampaignStep.EngagementResultSubmission],

  [TransactionStatus.completed]: campaignIndexMap[CampaignStep.Completed],

  [TransactionStatus.reported]: campaignIndexMap[CampaignStep.Registration] - 1,
  [TransactionStatus.terminated]:
    campaignIndexMap[CampaignStep.Registration] - 1,
};

export const transactionStatusTypeMap: TransactionStatusMap = {
  [TransactionStatus.notRegistered]: StatusType.warning,
  [TransactionStatus.registrationPending]: StatusType.warning,
  [TransactionStatus.registrationRejected]: StatusType.danger,
  [TransactionStatus.registrationApproved]: StatusType.success,

  [TransactionStatus.offering]: StatusType.warning,
  [TransactionStatus.offeringApproved]: StatusType.success,
  [TransactionStatus.offerRejected]: StatusType.danger,

  [TransactionStatus.brainstormSubmitted]: StatusType.warning,
  [TransactionStatus.brainstormApproved]: StatusType.success,
  [TransactionStatus.brainstormRejected]: StatusType.danger,

  [TransactionStatus.contentSubmitted]: StatusType.warning,
  [TransactionStatus.contentApproved]: StatusType.success,
  [TransactionStatus.contentRejected]: StatusType.danger,

  [TransactionStatus.engagementSubmitted]: StatusType.warning,
  [TransactionStatus.engagementRejected]: StatusType.danger,

  [TransactionStatus.completed]: StatusType.success,

  [TransactionStatus.reported]: StatusType.danger,
  [TransactionStatus.terminated]: StatusType.terminated,
};

export const transactionStatusStepperStateMap: TransactionStatusStepperStateMap =
  {
    [TransactionStatus.notRegistered]: StepperState.warning,
    [TransactionStatus.registrationPending]: StepperState.warning,
    [TransactionStatus.registrationRejected]: StepperState.danger,
    [TransactionStatus.registrationApproved]: StepperState.success,

    [TransactionStatus.offering]: StepperState.warning,
    [TransactionStatus.offeringApproved]: StepperState.success,
    [TransactionStatus.offerRejected]: StepperState.danger,

    [TransactionStatus.brainstormSubmitted]: StepperState.warning,
    [TransactionStatus.brainstormApproved]: StepperState.success,
    [TransactionStatus.brainstormRejected]: StepperState.danger,

    [TransactionStatus.contentSubmitted]: StepperState.warning,
    [TransactionStatus.contentApproved]: StepperState.success,
    [TransactionStatus.contentRejected]: StepperState.danger,

    [TransactionStatus.engagementSubmitted]: StepperState.warning,
    [TransactionStatus.engagementRejected]: StepperState.danger,

    [TransactionStatus.completed]: StepperState.success,

    [TransactionStatus.reported]: StepperState.danger,
    [TransactionStatus.terminated]: StepperState.terminated,
  };

export const transactionStatusCampaignStepMap: TransactionStatusCampaignStepMap =
  {
    [TransactionStatus.registrationPending]: CampaignStep.Registration,
    [TransactionStatus.registrationRejected]: CampaignStep.Registration,
    [TransactionStatus.registrationApproved]: CampaignStep.Registration,

    [TransactionStatus.offering]: CampaignStep.Registration,
    [TransactionStatus.offeringApproved]: CampaignStep.Registration,
    [TransactionStatus.offerRejected]: CampaignStep.Registration,

    [TransactionStatus.brainstormSubmitted]: CampaignStep.Brainstorming,
    [TransactionStatus.brainstormApproved]: CampaignStep.Brainstorming,
    [TransactionStatus.brainstormRejected]: CampaignStep.Brainstorming,

    [TransactionStatus.contentSubmitted]: CampaignStep.ContentSubmission,
    [TransactionStatus.contentApproved]: CampaignStep.ContentSubmission,
    [TransactionStatus.contentRejected]: CampaignStep.ContentSubmission,

    [TransactionStatus.engagementSubmitted]:
      CampaignStep.EngagementResultSubmission,
    [TransactionStatus.engagementRejected]:
      CampaignStep.EngagementResultSubmission,

    [TransactionStatus.completed]: CampaignStep.Completed,
  };

interface Brainstorm {
  status: BasicStatus;
  content: string;
  createdAt: number;
  rejectReason?: string;
  updatedAt?: number; //either approved or rejected
}

interface ContentTask {
  uri: string[];
}

export interface TransactionContent {
  platform: SocialPlatform;
  tasks: ContentTask[];
}

interface Rejection {
  reason: string;
  type: RejectionType;
}

export interface Content {
  status: BasicStatus;
  content: TransactionContent[];
  createdAt: number;
  rejection?: Rejection;
  updatedAt?: number; //either approved or rejected
}

export interface Payment {
  proofImage?: string;
  status: BasicStatus;
}

export class Transaction extends BaseModel {
  id?: string; // CampaignId + ContentCreatorId
  contentCreatorId?: string;
  campaignId?: string;
  businessPeopleId?: string; // buat mempermudah fetch all transaction BP
  offeredPrice?: number;
  importantNotes?: string[];
  brainstorms?: Brainstorm[];
  contents?: Content[];
  engagements?: Content[];
  status?: TransactionStatus;
  createdAt?: number;
  updatedAt?: number;
  lastCheckedAt?: number;
  contentRevisionLimit?: number;
  platformTasks?: CampaignPlatform[];
  payment?: Payment;

  constructor({
    contentCreatorId,
    campaignId,
    businessPeopleId,
    offeredPrice,
    importantNotes,
    brainstorms,
    contents,
    engagements,
    status,
    createdAt,
    updatedAt,
    lastCheckedAt,
    contentRevisionLimit,
    platformTasks,
    payment,
  }: Partial<Transaction>) {
    super();
    // this.id = id;
    if (campaignId && contentCreatorId) {
      this.id = campaignId + contentCreatorId;
    }
    this.contentCreatorId = contentCreatorId;
    this.businessPeopleId = businessPeopleId;
    this.campaignId = campaignId;
    this.offeredPrice = offeredPrice;
    this.importantNotes = importantNotes;
    this.brainstorms = brainstorms;
    this.contents = contents;
    this.engagements = engagements;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.lastCheckedAt = lastCheckedAt;
    this.contentRevisionLimit = contentRevisionLimit;
    this.platformTasks = platformTasks;
    this.payment = payment;
  }

  private static fromSnapshot(
    doc:
      | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
      | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Transaction {
    const data = doc.data();
    if (data && doc.exists) {
      const transaction = new Transaction({
        id: doc.id,
        contentCreatorId: data.contentCreatorId?.id,
        businessPeopleId: data.businessPeopleId?.id,
        campaignId: data.campaignId.id,
        brainstorms: data.brainstorms,
        contents: data.contents,
        engagements: data.engagements,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        lastCheckedAt: data.lastCheckedAt,
        contentRevisionLimit: data.contentRevisionLimit,
        platformTasks: data.platformTasks,
        payment: data.payment,
      });
      transaction.updateTermination();
      return transaction;
    }

    throw Error("Error, document doesn't exist!");
  }

  static getCollectionReference = () => {
    return firestore().collection(TRANSACTION_COLLECTION);
  };

  static getDocumentReference = (documentId: string) => {
    this.setFirestoreSettings();
    return this.getCollectionReference().doc(documentId);
  };

  async insert(status: TransactionStatus) {
    try {
      const {id, ...rest} = this;
      if (!id) {
        throw Error('Missing id');
      }
      const data = {
        ...rest,
        contentCreatorId: User.getDocumentReference(
          this.contentCreatorId ?? '',
        ),
        campaignId: Campaign.getDocumentReference(this.campaignId ?? ''),
        businessPeopleId: User.getDocumentReference(
          this.businessPeopleId ?? '',
        ),
        status: status,
        createdAt: new Date().getTime(),
      };
      await Transaction.getDocumentReference(id).set(data);
    } catch (error) {
      console.log(error);
    }
    throw Error('Transaction.insert err!');
  }

  async update(fields?: Partial<Transaction>) {
    try {
      const {id} = this;
      if (!id) {
        throw Error('Missing id');
      }
      await Transaction.getDocumentReference(id).update({
        ...fields,
      });
    } catch (error) {
      console.log(error);
      throw Error('Transaction.update err!');
    }
  }

  async updateStatus(
    status: TransactionStatus,
    additionalFields?: Partial<Transaction>,
  ) {
    try {
      const {id} = this;
      if (!id) {
        throw Error('Missing id');
      }
      await this.update({
        status: status,
        updatedAt: new Date().getTime(),
        ...additionalFields,
      });
    } catch (error) {
      console.log('updateStatus err', error);
    }
    throw Error('Transaction.updateStatus err!');
  }

  static getById(
    id: string,
    onComplete: (transaction: Transaction | null) => void,
  ) {
    try {
      const unsubscribe = Transaction.getCollectionReference()
        .doc(id)
        .onSnapshot(
          docSnapshot => {
            if (docSnapshot.exists) {
              onComplete && onComplete(Transaction.fromSnapshot(docSnapshot));
              return;
            }
            onComplete && onComplete(null);
          },
          error => {
            console.log(error);
          },
        );

      return unsubscribe;
    } catch (error) {
      console.error(error);
      throw Error('Error!');
    }
  }

  static getAllTransactionsByCampaign(
    campaignId: string,
    onComplete: (transactions: Transaction[]) => void,
  ) {
    try {
      const unsubscribe = Transaction.getCollectionReference()
        .where(
          'campaignId',
          '==',
          firestore().collection('campaigns').doc(campaignId),
        )
        .onSnapshot(
          querySnapshot => {
            if (querySnapshot.empty) {
              onComplete([]);
            } else {
              onComplete(querySnapshot.docs.map(this.fromSnapshot));
            }
          },
          error => {
            console.log(error);
          },
        );

      return unsubscribe;
    } catch (error) {
      console.error(error);
      throw Error('Error!');
    }
  }

  static getAllTransactionsByRole(
    userId: string,
    role: UserRole | undefined,
    onComplete: (transactions: Transaction[]) => void,
  ) {
    try {
      const unsubscribe = Transaction.getCollectionReference()
        .where(
          role === UserRole.BusinessPeople
            ? 'businessPeopleId'
            : role === UserRole.ContentCreator
            ? 'contentCreatorId'
            : '',
          '==',
          firestore().collection('users').doc(userId),
        )
        .onSnapshot(
          querySnapshot => {
            if (querySnapshot.empty) {
              onComplete([]);
            } else {
              onComplete(querySnapshot.docs.map(this.fromSnapshot));
            }
          },
          error => {
            console.log(error);
          },
        );

      return unsubscribe;
    } catch (error) {
      console.error(error);
      throw Error('Error!');
    }
  }

  static getAllTransactionsWithPayment(
    onComplete: (transactions: Transaction[]) => void,
  ) {
    try {
      const unsubscribe = Transaction.getCollectionReference()
        .orderBy('payment')
        .onSnapshot(
          querySnapshot => {
            if (querySnapshot.empty) {
              onComplete([]);
            } else {
              onComplete(querySnapshot.docs.map(this.fromSnapshot));
            }
          },
          error => {
            console.log(error);
          },
        );

      return unsubscribe;
    } catch (error) {
      console.error(error);
      throw Error('Error!');
    }
  }

  static getTransactionByContentCreator(
    campaignId: string,
    contentCreatorId: string,
    onComplete: (transaction: Transaction) => void,
  ) {
    const id = campaignId + contentCreatorId;
    const unsubscribe = Transaction.getDocumentReference(id).onSnapshot(
      docSnapshot => {
        if (docSnapshot.exists) {
          onComplete(Transaction.fromSnapshot(docSnapshot));
          return;
        }
        onComplete(
          new Transaction({
            campaignId,
            contentCreatorId,
            status: TransactionStatus.notRegistered,
          }),
        );
      },
      error => {
        console.log(error);
      },
    );

    return unsubscribe;
  }

  static getTransactionStatusByContentCreator(
    campaignId: string,
    contentCreatorId: string,
    onComplete: (status: TransactionStatus) => void,
  ) {
    const id = campaignId + contentCreatorId;
    const unsubscribe = Transaction.getCollectionReference()
      .doc(id)
      .onSnapshot(
        docSnapshot => {
          let status: TransactionStatus;
          if (!docSnapshot.exists) {
            status = TransactionStatus.notRegistered;
            return;
          }
          let transaction = docSnapshot.data() as Transaction;
          status = transaction.status || TransactionStatus.notRegistered;

          onComplete(status);
        },
        error => {
          console.log(error);
        },
      );

    return unsubscribe;
  }

  async updateTermination(): Promise<boolean> {
    const {campaignId, lastCheckedAt, status} = this;
    if (
      !campaignId ||
      [TransactionStatus.terminated, TransactionStatus.reported].find(
        s => s === status,
      )
    ) {
      return false;
    }
    const now = new Date();
    if (lastCheckedAt) {
      const lastCheck = new Date(lastCheckedAt);
      if (isEqualDate(lastCheck, now)) {
        return false;
      }
    }
    try {
      const campaign = await Campaign.getById(campaignId);
      const activeStep = campaign.getActiveTimeline()?.step;
      const campaignHaveBrainstorming =
        campaign.timeline?.find(
          timeline => CampaignStep.Brainstorming === timeline.step,
        ) !== undefined;
      const indexOffset = !campaignHaveBrainstorming
        ? Math.abs(
            campaignIndexMap[CampaignStep.Brainstorming] -
              campaignIndexMap[CampaignStep.ContentSubmission],
          )
        : 0;
      const isTerminated =
        now.getTime() > campaign?.getTimelineEnd().end ||
        transactionStatusIndexMap[status || TransactionStatus.notRegistered] <
          campaignIndexMap[activeStep] - indexOffset;

      console.log(
        'campaignHaveBrainstorming',
        campaignHaveBrainstorming,
        'index offset',
        indexOffset,
        'transaction index',
        transactionStatusIndexMap[status || TransactionStatus.notRegistered],
        'minimalIndex',
        campaignIndexMap[activeStep] - indexOffset,
      );
      if (isTerminated) {
        console.log('updateTermination | ', this.id, ' got terminated');
        await this.updateStatus(TransactionStatus.terminated, {
          lastCheckedAt: new Date().getTime(),
        });
        return true;
      }
      console.log('updateTermination | ', this.id, ' update lastCheckedAt');
      await this.update({
        lastCheckedAt: new Date().getTime(),
      });
      return false;
    } catch (error) {
      console.log('updateTermination err: ', error);
    }
    return false;
  }

  async register() {
    return await this.insert(TransactionStatus.registrationPending);
  }

  async approveRegistration(): Promise<boolean> {
    const {campaignId, contentCreatorId} = this;
    if (!campaignId) {
      throw Error('Missing campaign id');
    }
    if (!contentCreatorId) {
      throw Error('Missing content creator id');
    }
    try {
      const contentCreator = await User.getById(contentCreatorId);
      const campaign = await Campaign.getById(campaignId);
      if (contentCreator && campaign) {
        await this.updateStatus(TransactionStatus.registrationApproved, {
          contentRevisionLimit:
            contentCreator.contentCreator?.contentRevisionLimit,
          platformTasks: campaign.platformTasks,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.log('approveRegistration err', error);
    }
    return false;
  }

  async offer() {
    return await this.insert(TransactionStatus.offering);
  }

  getLatestBrainstorm(): Brainstorm | null {
    const {brainstorms} = this;
    if (brainstorms && brainstorms?.length > 0) {
      return brainstorms.reduce((latest, brainstorm) => {
        return brainstorm.createdAt > latest.createdAt ? brainstorm : latest;
      }, brainstorms[0]);
    }
    return null;
  }

  getBrainstormIndex(brainstorm: Brainstorm): number {
    const {brainstorms} = this;
    if (brainstorms && brainstorms?.length > 0) {
      return brainstorms.findIndex(
        currentBrainstorm =>
          currentBrainstorm.createdAt === brainstorm.createdAt,
      );
    }
    return -1;
  }

  async submitBrainstorm(content: string): Promise<boolean> {
    const {id} = this;
    if (id) {
      const brainstorm: Brainstorm = {
        status: BasicStatus.pending,
        content: content,
        createdAt: new Date().getTime(),
      };
      try {
        await Transaction.getDocumentReference(id).update({
          status: TransactionStatus.brainstormSubmitted,
          brainstorms: firestore.FieldValue.arrayUnion(brainstorm),
        });
        return true;
      } catch (error) {
        console.log('submitBrainstorm error', error);
        return false;
      }
    }
    throw Error('Missing transaction id');
  }

  async rejectBrainstorm(rejectReason: string): Promise<boolean> {
    const {id, brainstorms} = this;
    if (id && brainstorms && brainstorms.length > 0) {
      try {
        let latestBrainstorm = this.getLatestBrainstorm();
        if (latestBrainstorm) {
          latestBrainstorm = {
            ...latestBrainstorm,
            status: BasicStatus.rejected,
            rejectReason: rejectReason,
            updatedAt: new Date().getTime(),
          };
          const brainstormIndex = this.getBrainstormIndex(latestBrainstorm);
          if (brainstormIndex >= 0) {
            brainstorms[brainstormIndex] = latestBrainstorm;
            await Transaction.getDocumentReference(id).update({
              status: TransactionStatus.brainstormRejected,
              brainstorms: brainstorms,
            });
            return true;
          }
        }
      } catch (error) {
        console.log('rejectBrainstorm error', error);
        return false;
      }
    }
    throw Error('Missing transaction id or brainstorms');
  }

  async approveBrainstorm(): Promise<boolean> {
    const {id, brainstorms} = this;
    if (id && brainstorms && brainstorms.length > 0) {
      try {
        let latestBrainstorm = this.getLatestBrainstorm();
        if (latestBrainstorm) {
          latestBrainstorm = {
            ...latestBrainstorm,
            status: BasicStatus.approved,
            updatedAt: new Date().getTime(),
          };
          const brainstormIndex = this.getBrainstormIndex(latestBrainstorm);
          if (brainstormIndex >= 0) {
            brainstorms[brainstormIndex] = latestBrainstorm;
            await Transaction.getDocumentReference(id).update({
              status: TransactionStatus.brainstormApproved,
              brainstorms: brainstorms,
            });
            return true;
          }
        }
      } catch (error) {
        console.log('approveBrainstorm error', error);
        return false;
      }
    }
    throw Error('Missing transaction id or brainstorms');
  }

  async submitContent(content: TransactionContent[]): Promise<boolean> {
    const {id} = this;
    if (id) {
      try {
        await Transaction.getDocumentReference(id).update({
          status: TransactionStatus.contentSubmitted,
          contents: firestore.FieldValue.arrayUnion({
            status: BasicStatus.pending,
            content: content,
            createdAt: new Date().getTime(),
          }),
        });
        return true;
      } catch (error) {
        console.log('submitContent error', error);
        return false;
      }
    }
    throw Error('Missing transaction id');
  }

  getLatestContentSubmission() {
    const {contents} = this;
    if (contents && contents?.length > 0) {
      return contents.reduce((latest, content) => {
        return content.createdAt > latest.createdAt ? content : latest;
      }, contents[0]);
    }
    return null;
  }

  getContentIndex(content: Content): number {
    const {contents} = this;
    if (contents && contents?.length > 0) {
      return contents.findIndex(
        currentContent => currentContent.createdAt === content.createdAt,
      );
    }
    return -1;
  }

  async rejectContent(rejection: Rejection): Promise<boolean> {
    const {id, contents} = this;
    if (id && contents && contents.length > 0) {
      try {
        let latestContent = this.getLatestContentSubmission();
        if (latestContent) {
          latestContent = {
            ...latestContent,
            status: BasicStatus.rejected,
            rejection: rejection,
            updatedAt: new Date().getTime(),
          };
          const contentIndex = this.getContentIndex(latestContent);
          if (contentIndex >= 0) {
            contents[contentIndex] = latestContent;
            await Transaction.getDocumentReference(id).update({
              status: TransactionStatus.contentRejected,
              contents: contents,
            });
            return true;
          }
        }
      } catch (error) {
        console.log('rejectContent error', error);
        return false;
      }
    }
    throw Error('Missing transaction id or contents');
  }

  async approveContent(): Promise<boolean> {
    const {id, contents} = this;
    if (id && contents && contents.length > 0) {
      try {
        let latestContent = this.getLatestContentSubmission();
        if (latestContent) {
          latestContent = {
            ...latestContent,
            status: BasicStatus.approved,
            updatedAt: new Date().getTime(),
          };
          const contentIndex = this.getContentIndex(latestContent);
          if (contentIndex >= 0) {
            contents[contentIndex] = latestContent;
            await Transaction.getDocumentReference(id).update({
              status: TransactionStatus.contentApproved,
              contents: contents,
            });
            return true;
          }
        }
      } catch (error) {
        console.log('approveContent error', error);
        return false;
      }
    }
    throw Error('Missing transaction id or contents');
  }

  async submitEngagement(content: Content): Promise<boolean> {
    const {id} = this;
    if (id) {
      try {
        await Transaction.getDocumentReference(id).update({
          status: TransactionStatus.engagementSubmitted,
          engagements: firestore.FieldValue.arrayUnion(content),
        });
        return true;
      } catch (error) {
        console.log('submitEngagement error', error);
        return false;
      }
    }
    throw Error('Missing transaction id');
  }

  getLatestEngagementSubmission() {
    const {engagements} = this;
    if (engagements && engagements?.length > 0) {
      return engagements.reduce((latest, engagement) => {
        return engagement.createdAt > latest.createdAt ? engagement : latest;
      }, engagements[0]);
    }
    return null;
  }

  getEngagementIndex(engagement: Content): number {
    const {engagements} = this;
    if (engagements && engagements?.length > 0) {
      return engagements.findIndex(
        currentEngagement =>
          currentEngagement.createdAt === engagement.createdAt,
      );
    }
    return -1;
  }

  async rejectEngagement(rejection: Rejection): Promise<boolean> {
    const {id, engagements} = this;
    if (id && engagements && engagements.length > 0) {
      try {
        let latestEngagement = this.getLatestEngagementSubmission();
        if (latestEngagement) {
          latestEngagement = {
            ...latestEngagement,
            status: BasicStatus.rejected,
            rejection: rejection,
            updatedAt: new Date().getTime(),
          };
          const engagementIndex = this.getEngagementIndex(latestEngagement);
          if (engagementIndex >= 0) {
            engagements[engagementIndex] = latestEngagement;
            await Transaction.getDocumentReference(id).update({
              status: TransactionStatus.engagementRejected,
              engagements: engagements,
            });
            return true;
          }
        }
      } catch (error) {
        console.log('rejectEngagement error', error);
        return false;
      }
    }
    throw Error('Missing transaction id or engagements');
  }

  async approveEngagement(): Promise<boolean> {
    const {id, engagements} = this;
    if (id && engagements && engagements.length > 0) {
      try {
        let latestEngagement = this.getLatestEngagementSubmission();
        if (latestEngagement) {
          latestEngagement = {
            ...latestEngagement,
            status: BasicStatus.approved,
            updatedAt: new Date().getTime(),
          };
          const engagementIndex = this.getEngagementIndex(latestEngagement);
          if (engagementIndex >= 0) {
            engagements[engagementIndex] = latestEngagement;
            await Transaction.getDocumentReference(id).update({
              status: TransactionStatus.completed,
              engagements: engagements,
            });
            return true;
          }
        }
      } catch (error) {
        console.log('approveEngagement error', error);
        return false;
      }
    }
    throw Error('Missing transaction id or engagements');
  }

  getRemainingRevisionCount() {
    const {contentRevisionLimit = 0, contents = []} = this;
    return Math.max(
      contentRevisionLimit -
        contents.filter(c => c.rejection?.type === RejectionType.mismatch)
          .length,
      0,
    );
  }

  //   static async getTransactionStatusByContentCreator(
  //     campaignId: string,
  //     contentCreatorId: string,
  //   ): Promise<TransactionStatus> {
  //     try {
  //       const transactions = await firestore()
  //         .collection(TRANSACTION_COLLECTION)
  //         .where(
  //           'campaignId',
  //           '==',
  //           firestore().collection('campaigns').doc(campaignId),
  //         )
  //         .where(
  //           'contentCreatorId',
  //           '==',
  //           firestore().collection('users').doc(contentCreatorId),
  //         )
  //         .get();
  //       if (transactions.empty) {
  //         return TransactionStatus.notRegistered;
  //       }
  //       let transaction = transactions.docs[0].data() as Transaction;
  //       return transaction.status || TransactionStatus.notRegistered;
  //     } catch (error) {
  //       console.error(error);
  //       throw Error('Error!');
  //     }
  //   }
}
