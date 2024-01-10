import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {BaseModel, UpdateFields} from './BaseModel';
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
import {showToast} from '../helpers/toast';
import {ToastType} from '../providers/ToastProvider';
import {ErrorMessage} from '../constants/errorMessage';

export const TRANSACTION_COLLECTION = 'transactions';

export enum BasicStatus {
  pending = 'Pending',
  approved = 'Approved',
  rejected = 'Rejected',
}

export enum PaymentStatus {
  proofWaitingForVerification = 'Waiting For Verification',
  proofApproved = 'Proof Approved',
  proofRejected = 'Proof Rejected',
  withdrawalRequested = 'Withdrawal Requested',
  withdrawn = 'Withdrawn',
}

export enum TransactionStatus {
  // public
  notRegistered = 'Not Registered',
  registrationPending = 'Registration Pending',
  registrationRejected = 'Registration Rejected',
  registrationApproved = 'Registration Approved',

  // private
  offering = 'Offering',
  offerWaitingForPayment = 'Offer Approved (Waiting For Payment)', // Jadi di tampilanya ttp "offering" textnya, tapi ini buat penanda kalo CC uda approved, tapi BP tinggal bayar. Nah kalo yang approve BP duluan, BP bisa lgsg bayar aja gausah pindah2 status
  offerApproved = 'Offer Approved',
  offerRejected = 'Offer Rejected',

  brainstormSubmitted = 'Brainstorm Submitted',
  brainstormRejected = 'Brainstorm Rejected',
  brainstormApproved = 'Brainstorm Approved',

  contentSubmitted = 'Content Submitted',
  contentRejected = 'Content Rejected',
  contentApproved = 'Content Approved',

  engagementSubmitted = 'Engagement Submitted',
  engagementRejected = 'Engagement Rejected',

  completed = 'Completed',

  reported = 'Reported', //reported by bp
  terminated = 'Terminated', //expired or timeline miss
}

export enum RejectionType {
  contentMismatch = 'Content Mismatch',
  unreachableLink = 'Unreachable Link',
  incompleteSubmission = 'Incomplete Submission',
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

type PaymentStatusMap = {
  [key in PaymentStatus]: StatusType;
};

export const rejectionTypeLabelMap: RejectionTypeLabelMap = {
  [RejectionType.contentMismatch]: "Content doesn't meet task requirements",
  [RejectionType.unreachableLink]:
    'Link cannot be opened (access, invalid link, etc)',
  [RejectionType.incompleteSubmission]:
    'Submission is missing required elements',
};

export const paymentStatusTypeMap: PaymentStatusMap = {
  [PaymentStatus.proofWaitingForVerification]: StatusType.warning,
  [PaymentStatus.proofApproved]: StatusType.success,
  [PaymentStatus.proofRejected]: StatusType.danger,
  [PaymentStatus.withdrawalRequested]: StatusType.warning,
  [PaymentStatus.withdrawn]: StatusType.success,
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
  [TransactionStatus.offerWaitingForPayment]:
    campaignIndexMap[CampaignStep.Registration],
  [TransactionStatus.offerRejected]:
    campaignIndexMap[CampaignStep.Registration],
  [TransactionStatus.offerApproved]:
    campaignIndexMap[CampaignStep.Brainstorming],

  [TransactionStatus.brainstormSubmitted]:
    campaignIndexMap[CampaignStep.Brainstorming],
  [TransactionStatus.brainstormRejected]:
    campaignIndexMap[CampaignStep.Brainstorming],
  [TransactionStatus.brainstormApproved]:
    campaignIndexMap[CampaignStep.ContentCreation],

  [TransactionStatus.contentSubmitted]:
    campaignIndexMap[CampaignStep.ContentCreation],
  [TransactionStatus.contentRejected]:
    campaignIndexMap[CampaignStep.ContentCreation],
  [TransactionStatus.contentApproved]:
    campaignIndexMap[CampaignStep.ResultSubmission],

  [TransactionStatus.engagementSubmitted]:
    campaignIndexMap[CampaignStep.ResultSubmission],
  [TransactionStatus.engagementRejected]:
    campaignIndexMap[CampaignStep.ResultSubmission],

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
  [TransactionStatus.offerWaitingForPayment]: StatusType.warning,
  [TransactionStatus.offerApproved]: StatusType.success,
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
    [TransactionStatus.offerWaitingForPayment]: StepperState.warning,
    [TransactionStatus.offerApproved]: StepperState.success,
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
    [TransactionStatus.offerApproved]: CampaignStep.Registration,
    [TransactionStatus.offerRejected]: CampaignStep.Registration,

    [TransactionStatus.brainstormSubmitted]: CampaignStep.Brainstorming,
    [TransactionStatus.brainstormApproved]: CampaignStep.Brainstorming,
    [TransactionStatus.brainstormRejected]: CampaignStep.Brainstorming,

    [TransactionStatus.contentSubmitted]: CampaignStep.ContentCreation,
    [TransactionStatus.contentApproved]: CampaignStep.ContentCreation,
    [TransactionStatus.contentRejected]: CampaignStep.ContentCreation,

    [TransactionStatus.engagementSubmitted]: CampaignStep.ResultSubmission,
    [TransactionStatus.engagementRejected]: CampaignStep.ResultSubmission,

    [TransactionStatus.completed]: CampaignStep.Completed,
  };

interface Rejection {
  reason: string;
  type: RejectionType;
}

export interface BrainstormContent {
  platform: SocialPlatform;
  tasks: string[];
}

export interface Brainstorm {
  status: BasicStatus;
  content: BrainstormContent[];
  createdAt: number;
  rejection?: Rejection;
  updatedAt?: number; //either approved or rejected
}

interface ContentTask {
  uri: string[];
}

export interface TransactionContent {
  platform: SocialPlatform;
  tasks: ContentTask[];
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
  status: PaymentStatus;
}
interface EngagementTask {
  uri: string[];
  attachments: string[];
}

export interface TransactionEngagement {
  platform: SocialPlatform;
  tasks: EngagementTask[];
}

export interface Engagement {
  status: BasicStatus;
  content: TransactionEngagement[];
  createdAt: number;
  rejection?: Rejection;
  updatedAt?: number; //either approved or rejected
}

export class Transaction extends BaseModel {
  id?: string; // CampaignId + ContentCreatorId
  contentCreatorId?: string;
  campaignId?: string;
  businessPeopleId?: string; // buat mempermudah fetch all transaction BP
  transactionAmount?: number;
  importantNotes?: string[];
  brainstorms?: Brainstorm[];
  contents?: Content[];
  engagements?: Engagement[];
  status: TransactionStatus;
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
    transactionAmount,
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
    this.transactionAmount = transactionAmount;
    this.importantNotes = importantNotes;
    this.brainstorms = brainstorms;
    this.contents = contents;
    this.engagements = engagements;
    this.status = status || TransactionStatus.notRegistered;
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
        transactionAmount: data.transactionAmount,
        importantNotes: data.importantNotes,
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

  static getById(
    id: string,
    onComplete: (transaction: Transaction | null) => void,
  ) {
    try {
      return Transaction.getDocumentReference(id).onSnapshot(
        docSnapshot => {
          if (docSnapshot.exists) {
            onComplete(Transaction.fromSnapshot(docSnapshot));
            return;
          }
          onComplete(null);
        },
        error => {
          console.log(error);
        },
      );
    } catch (error) {
      console.error(error);
      throw Error('Transaction.getById Error: ' + error);
    }
  }

  static getCollectionReference = () => {
    return firestore().collection(TRANSACTION_COLLECTION);
  };

  static getDocumentReference = (documentId: string) => {
    Transaction.setFirestoreSettings();
    return this.getCollectionReference().doc(documentId);
  };

  async insert(status: TransactionStatus) {
    try {
      const {id, contentCreatorId, businessPeopleId, campaignId, ...rest} =
        this;
      if (!id) {
        throw Error('Missing id');
      }

      if (!contentCreatorId) {
        throw Error('Missing content creator id');
      }

      if (!businessPeopleId) {
        throw Error('Missing business people id');
      }

      if (!campaignId) {
        throw Error('Missing campaign id');
      }

      const data = {
        ...rest,
        contentCreatorId: User.getDocumentReference(contentCreatorId),
        campaignId: Campaign.getDocumentReference(campaignId),
        businessPeopleId: User.getDocumentReference(businessPeopleId),
        status: status,
        createdAt: new Date().getTime(),
      };
      await Transaction.getDocumentReference(id).set(data);
    } catch (error) {
      console.error('Error in Transaction.insert:', error);
      throw Error('Transaction.insert err!');
    }
  }

  async update(fields?: Partial<Transaction> | UpdateFields) {
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
      throw Error('Transaction.update error ' + error);
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
            onComplete(querySnapshot.docs.map(this.fromSnapshot));
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
    console.log(role + ' : ' + userId);
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
            onComplete(querySnapshot.docs.map(this.fromSnapshot));
          },
          error => {
            console.log(error);
          },
        );

      return unsubscribe;
    } catch (error) {
      console.error(error);
      throw Error('Transaction.getAllTransactionsByRole err ' + error);
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
            onComplete(querySnapshot.docs.map(this.fromSnapshot));
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
          }),
        );
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
      [
        TransactionStatus.completed,
        TransactionStatus.terminated,
        TransactionStatus.reported,
      ].find(s => s === status)
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
      if (!campaign) {
        return false;
      }
      const activeStep = campaign.getActiveTimeline()?.step;
      const campaignHaveBrainstorming =
        campaign.timeline?.find(
          timeline => CampaignStep.Brainstorming === timeline.step,
        ) !== undefined;
      const indexOffset = !campaignHaveBrainstorming
        ? Math.abs(
            campaignIndexMap[CampaignStep.Brainstorming] -
              campaignIndexMap[CampaignStep.ContentCreation],
          )
        : 0;
      const isTerminated =
        now.getTime() > campaign?.getTimelineEnd()?.end ||
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
        try {
          await this.terminate();
        } catch (error) {
          console.log(error);
        }
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
    return this.insert(TransactionStatus.registrationPending);
  }

  async approve() {
    const {status} = this;
    if (!status) {
      throw Error('Missing status');
    }
    if (TransactionStatus.brainstormSubmitted === status) {
      return this.approveBrainstorm()
        .then(() => {
          showToast({
            type: ToastType.success,
            message: 'Brainstorm approved',
          });
        })
        .catch(err => {
          showToast({
            type: ToastType.danger,
            message: 'Failed to approve brainstorm',
          });
          console.log('approve brainstorm err:', err);
        });
    }
    if (TransactionStatus.contentSubmitted === status) {
      return this.approveContent()
        .then(() => {
          showToast({
            type: ToastType.success,
            message: 'Content approved',
          });
        })
        .catch(err => {
          showToast({
            type: ToastType.danger,
            message: 'Failed to approve content',
          });
          console.log('approve content err:', err);
        });
    }
    if (TransactionStatus.engagementSubmitted === status) {
      return this.approveEngagement()
        .then(() => {
          showToast({
            type: ToastType.success,
            message: 'Engagement approved',
          });
        })
        .catch(err => {
          showToast({
            type: ToastType.danger,
            message: 'Failed to approve engagement',
          });
          console.log('approve engagement err:', err);
        });
    }
  }

  async reject(rejection: Rejection) {
    const {status} = this;
    if (!status) {
      throw Error('Missing status');
    }
    if (TransactionStatus.brainstormSubmitted === status) {
      return this.rejectBrainstorm(rejection)
        .then(() => {
          showToast({
            type: ToastType.success,
            message: 'Brainstorm rejected',
          });
        })
        .catch(err => {
          showToast({
            type: ToastType.danger,
            message: 'Failed to reject brainstorm',
          });
          console.log('reject brainstorm err:', err);
        });
    }
    if (TransactionStatus.contentSubmitted === status) {
      return this.rejectContent(rejection)
        .then(() => {
          showToast({
            type: ToastType.success,
            message: 'Content rejected',
          });
        })
        .catch(err => {
          showToast({
            type: ToastType.danger,
            message: 'Failed to reject content',
          });
          console.log('reject content err:', err);
        });
    }
    if (TransactionStatus.engagementSubmitted === status) {
      return this.rejectEngagement(rejection)
        .then(() => {
          showToast({
            type: ToastType.success,
            message: 'Engagement rejected',
          });
        })
        .catch(err => {
          showToast({
            type: ToastType.danger,
            message: 'Failed to reject engagement',
          });
          console.log('reject engagement err:', err);
        });
    }
  }

  async terminate() {
    try {
      const currentUnixTimestamp = new Date().getTime();
      await this.update({
        status: TransactionStatus.terminated,
        updatedAt: currentUnixTimestamp,
        lastCheckedAt: currentUnixTimestamp,
      });
    } catch (error) {
      console.log('terminate err', error);
      throw Error('Transaction.terminate err');
    }
  }

  async approveRegistration() {
    const {campaignId, contentCreatorId} = this;
    if (!campaignId) {
      throw Error('Missing campaign id');
    }
    if (!contentCreatorId) {
      throw Error('Missing content creator id');
    }
    const contentCreator = await User.getById(contentCreatorId);
    const campaign = await Campaign.getById(campaignId);
    if (!contentCreator || !campaign) {
      throw Error(ErrorMessage.GENERAL);
    }
    try {
      if (contentCreator && campaign) {
        let newStatus: TransactionStatus;
        // TODO: ditest lagi
        if (this.status === TransactionStatus.registrationPending) {
          newStatus = TransactionStatus.registrationApproved;
        } else {
          newStatus = TransactionStatus.offerApproved;
        }
        await this.update({
          status: newStatus,
          contentRevisionLimit:
            contentCreator.contentCreator?.contentRevisionLimit,
          platformTasks: campaign.platformTasks,
        });
      }
    } catch (error) {
      console.log('approveRegistration err', error);
      throw Error(ErrorMessage.GENERAL);
    }
  }

  async rejectRegistration() {
    try {
      await this.update({
        status: TransactionStatus.terminated,
        lastCheckedAt: new Date().getTime(),
      });
    } catch (error) {
      console.log('rejectRegistration err', error);
      throw Error(ErrorMessage.GENERAL);
    }
  }

  async offer() {
    return this.insert(TransactionStatus.offering);
  }

  async submitBrainstorm(content: BrainstormContent[]) {
    const brainstorm: Brainstorm = {
      status: BasicStatus.pending,
      content: content,
      createdAt: new Date().getTime(),
    };
    try {
      await this.update({
        status: TransactionStatus.brainstormSubmitted,
        brainstorms: firestore.FieldValue.arrayUnion(brainstorm),
      });
    } catch (error) {
      console.log('submitBrainstorm error', error);
      throw Error('submitBrainstorm error' + error);
    }
  }

  async rejectBrainstorm(rejection: Rejection) {
    const {brainstorms} = this;
    if (!brainstorms || brainstorms.length === 0) {
      throw Error('Transaction.rejectBrainstorm - Missing brainstorms');
    }
    try {
      let latestBrainstorm = this.getLatestBrainstorm();
      if (latestBrainstorm) {
        latestBrainstorm = {
          ...latestBrainstorm,
          status: BasicStatus.rejected,
          rejection: rejection,
          updatedAt: new Date().getTime(),
        };
        const brainstormIndex = this.getBrainstormIndex(latestBrainstorm);
        if (brainstormIndex < 0) {
          throw Error('Transaction.rejectBrainstorm brainstorm not found');
        }
        brainstorms[brainstormIndex] = latestBrainstorm;
        await this.update({
          status: TransactionStatus.brainstormRejected,
          brainstorms: brainstorms,
        });
      }
    } catch (error) {
      console.log('rejectBrainstorm error', error);
      throw Error('Transaction.rejectBrainstorm error' + error);
    }
  }

  async approveBrainstorm() {
    const {brainstorms} = this;
    if (!brainstorms || brainstorms.length === 0) {
      throw Error('Transaction.approveBrainstorm - Missing brainstorms');
    }
    try {
      let latestBrainstorm = this.getLatestBrainstorm();
      if (latestBrainstorm) {
        latestBrainstorm = {
          ...latestBrainstorm,
          status: BasicStatus.approved,
          updatedAt: new Date().getTime(),
        };
        const brainstormIndex = this.getBrainstormIndex(latestBrainstorm);
        if (brainstormIndex < 0) {
          throw Error('Transaction.approveBrainstorm brainstorm not found');
        }
        brainstorms[brainstormIndex] = latestBrainstorm;
        await this.update({
          status: TransactionStatus.brainstormApproved,
          brainstorms: brainstorms,
        });
      }
    } catch (error) {
      console.log('approveBrainstorm error', error);
      throw Error('Transaction.approveBrainstorm error ' + error);
    }
  }

  async submitContent(content: TransactionContent[]) {
    try {
      await this.update({
        status: TransactionStatus.contentSubmitted,
        contents: firestore.FieldValue.arrayUnion({
          status: BasicStatus.pending,
          content: content,
          createdAt: new Date().getTime(),
        }),
      });
    } catch (error) {
      console.log('submitContent error', error);
      throw Error('Transaction.submitContent error' + error);
    }
  }

  async rejectContent(rejection: Rejection) {
    const {contents} = this;
    if (!contents || contents.length === 0) {
      throw Error('Transaction.rejectContent - Missing contents');
    }
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
        if (contentIndex < 0) {
          throw Error('Transaction.rejectContent - content not found');
        }
        contents[contentIndex] = latestContent;
        await this.update({
          status: TransactionStatus.contentRejected,
          contents: contents,
        });
      }
    } catch (error) {
      console.log('rejectContent error', error);
      throw Error('Transaction.rejectContent error ' + error);
    }
  }

  async approveContent() {
    const {contents} = this;
    if (!contents || contents.length === 0) {
      throw Error('Transaction.approveContent - Missing contents');
    }
    try {
      let latestContent = this.getLatestContentSubmission();
      if (latestContent) {
        latestContent = {
          ...latestContent,
          status: BasicStatus.approved,
          updatedAt: new Date().getTime(),
        };
        const contentIndex = this.getContentIndex(latestContent);
        if (contentIndex < 0) {
          throw Error('Transaction.approveContent - content not found');
        }
        contents[contentIndex] = latestContent;
        await this.update({
          status: TransactionStatus.contentApproved,
          contents: contents,
        });
      }
    } catch (error) {
      console.log('approveContent error', error);
      throw Error('Transaction.approveContent error ' + error);
    }
  }

  async submitEngagement(transactionEngagements: TransactionEngagement[]) {
    try {
      await this.update({
        status: TransactionStatus.engagementSubmitted,
        engagements: firestore.FieldValue.arrayUnion({
          status: BasicStatus.pending,
          content: transactionEngagements,
          createdAt: new Date().getTime(),
        }),
      });
    } catch (error) {
      console.log('submitEngagement error', error);
      throw Error('Transaction.submitEngagement error' + error);
    }
  }

  async rejectEngagement(rejection: Rejection) {
    const {engagements} = this;
    if (!engagements || engagements.length === 0) {
      throw Error('Transaction.rejectEngagement - Missing engagements');
    }
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
        if (engagementIndex < 0) {
          throw Error('Transaction.rejectEngagement - engagement not found');
        }
        engagements[engagementIndex] = latestEngagement;
        await this.update({
          status: TransactionStatus.engagementRejected,
          engagements: engagements,
        });
      }
    } catch (error) {
      console.log('rejectEngagement error', error);
      throw Error('Transaction.rejectEngagement error ' + error);
    }
  }

  async approveEngagement() {
    const {engagements} = this;
    if (!engagements || engagements.length === 0) {
      throw Error('Transaction.approveEngagement - Missing engagements');
    }
    try {
      let latestEngagement = this.getLatestEngagementSubmission();
      if (latestEngagement) {
        latestEngagement = {
          ...latestEngagement,
          status: BasicStatus.approved,
          updatedAt: new Date().getTime(),
        };
        const engagementIndex = this.getEngagementIndex(latestEngagement);
        if (engagementIndex < 0) {
          throw Error('Transaction.approveEngagement - engagement not found');
        }
        engagements[engagementIndex] = latestEngagement;
        await this.update({
          status: TransactionStatus.completed,
          engagements: engagements,
        });
      }
    } catch (error) {
      console.log('approveEngagement error', error);
      throw Error('Transaction.approveEngagement error ' + error);
    }
  }

  async submitProof(imageUrl: string) {
    try {
      await this.update({
        payment: {
          proofImage: imageUrl,
          status: PaymentStatus.proofWaitingForVerification,
        },
        updatedAt: new Date().getTime(),
      });
    } catch (error) {
      console.log(error);
      throw Error('Transaction.submitProof err!');
    }
  }

  async approveProof() {
    try {
      await this.update({
        'payment.status': PaymentStatus.proofApproved,
        updatedAt: new Date().getTime(),
      });
    } catch (error) {
      console.log(error);
      throw Error('Transaction.approveProof err!');
    }
  }

  async rejectProof() {
    try {
      await this.update({
        'payment.status': PaymentStatus.proofRejected,
        updatedAt: new Date().getTime(),
      });
    } catch (error) {
      console.log(error);
      throw Error('Transaction.rejectProof err!');
    }
  }

  async requestWithdrawal() {
    try {
      await this.update({
        'payment.status': PaymentStatus.withdrawalRequested,
        updatedAt: new Date().getTime(),
      });
    } catch (error) {
      console.log(error);
      throw Error('Transaction.requestWithdrawal err!');
    }
  }

  async acceptWithdrawal() {
    try {
      await this.update({
        'payment.status': PaymentStatus.withdrawn,
        updatedAt: new Date().getTime(),
      });
    } catch (error) {
      console.log(error);
      throw Error('Transaction.acceptWithdrawal err!');
    }
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

  getRemainingRevisionCount() {
    const {contentRevisionLimit = 0, contents = []} = this;
    return Math.max(
      contentRevisionLimit -
        contents.filter(
          c => c.rejection?.type === RejectionType.contentMismatch,
        ).length,
      0,
    );
  }

  isApprovable() {
    const {status, payment} = this;
    return (
      status &&
      [
        TransactionStatus.registrationPending,
        TransactionStatus.brainstormSubmitted,
        TransactionStatus.contentSubmitted,
        TransactionStatus.engagementSubmitted,
      ].findIndex(
        transactionStatus =>
          transactionStatus === status &&
          payment?.status !== PaymentStatus.proofWaitingForVerification,
      ) >= 0
    );
  }

  isTerminated() {
    const {status} = this;
    return status === TransactionStatus.terminated;
  }

  isOngoing() {
    const {status} = this;
    return (
      status &&
      [
        TransactionStatus.terminated,
        TransactionStatus.reported,
        TransactionStatus.completed,
      ].findIndex(transactionStatus => transactionStatus === status) === -1
    );
  }

  isCompleted() {
    const {status} = this;
    return status === TransactionStatus.completed;
  }

  isWaitingAdminAction() {
    const {payment} = this;
    return (
      [
        PaymentStatus.proofWaitingForVerification,
        PaymentStatus.withdrawalRequested,
      ].findIndex(paymentStatus => paymentStatus === payment?.status) >= 0
    );
  }

  isPaymentProofSubmitable() {
    const {status, payment} = this;
    if (
      [
        TransactionStatus.registrationPending,
        TransactionStatus.offerWaitingForPayment,
      ].findIndex(transactionStatus => transactionStatus === status) >= 0
    ) {
      if (!payment?.status) {
        return true;
      }
      return (
        [PaymentStatus.proofRejected].findIndex(
          paymentStatus => paymentStatus === payment?.status,
        ) >= 0
      );
    }
    return false;
  }

  isWaitingBusinessPeopleAction() {
    const {status, payment} = this;
    if (this.isTerminated() || this.isCompleted()) {
      return false;
    }
    if (
      [
        TransactionStatus.registrationPending,
        TransactionStatus.offerWaitingForPayment,
      ].findIndex(transactionStatus => transactionStatus === status) >= 0
    ) {
      if (!payment?.status) {
        return true;
      }
      return (
        [PaymentStatus.proofRejected].findIndex(
          paymentStatus => paymentStatus === payment?.status,
        ) >= 0
      );
    }
    return (
      [
        TransactionStatus.brainstormSubmitted,
        TransactionStatus.contentSubmitted,
        TransactionStatus.engagementSubmitted,
      ].findIndex(transactionStatus => transactionStatus === status) >= 0
    );
  }

  async isWaitingContentCreatorAction() {
    const {status, campaignId} = this;
    if (this.isTerminated() || this.isCompleted()) {
      return false;
    }
    if (
      [
        TransactionStatus.brainstormRejected,
        TransactionStatus.contentRejected,
        TransactionStatus.engagementRejected,
      ].findIndex(transactionStatus => transactionStatus === status) >= 0
    ) {
      return true;
    }

    if (campaignId) {
      try {
        const campaign = await Campaign.getById(campaignId);
        if (campaign) {
          const campaignActiveTimeline = campaign.getActiveTimeline();
          const currentTransactionStep =
            transactionStatusCampaignStepMap[status];
          const isContentCreatorNotSubmitCurrentActiveTimeline =
            campaignActiveTimeline &&
            currentTransactionStep &&
            currentTransactionStep !== campaignActiveTimeline.step;

          return isContentCreatorNotSubmitCurrentActiveTimeline;
        }
      } catch (error) {
        console.log('error', error);
      }
    }

    return false;
  }

  isWaitingBrainstormSubmission() {
    return (
      !this?.getLatestBrainstorm() ||
      this?.getLatestBrainstorm()?.status === BasicStatus.rejected
    );
  }

  isWaitingContentSubmission() {
    return (
      !this?.getLatestContentSubmission() ||
      this?.getLatestContentSubmission()?.status === BasicStatus.rejected
    );
  }

  isWaitingEngagementSubmission() {
    return (
      !this?.getLatestEngagementSubmission() ||
      this?.getLatestEngagementSubmission()?.status === BasicStatus.rejected
    );
  }
}
