import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {BaseModel} from './BaseModel';
import {User, UserRole} from './User';
import {Campaign} from './Campaign';
import {StatusType} from '../components/atoms/StatusTag';

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
  brainstormApproved = 'Brainstorm Approved',
  brainstormRejected = 'Brainstorm Rejected',

  contentSubmitted = 'Content Submitted',
  contentApproved = 'Content Approved',
  contentRejected = 'Content Rejected',
}

type TransactionStatusMap = {
  [key in TransactionStatus]: StatusType;
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
};

interface Brainstorm {
  status: BasicStatus;
  content: string;
  createdAt: number;
  rejectReason?: string;
  updatedAt?: number; //either approved or rejected
}

export class Transaction extends BaseModel {
  id?: string; // CampaignId + ContentCreatorId
  contentCreatorId?: string;
  campaignId?: string;
  businessPeopleId?: string; // buat mempermudah fetch all transaction BP
  offeredPrice?: number;
  importantNotes?: string[];
  brainstorms?: Brainstorm[];
  status?: TransactionStatus;
  updatedAt?: number;

  constructor({
    contentCreatorId,
    campaignId,
    businessPeopleId,
    offeredPrice,
    importantNotes,
    brainstorms,
    status,
    updatedAt,
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
    this.status = status;
    this.updatedAt = updatedAt;
  }

  toString(): string {
    return `
      Transaction ID: ${this.id}
      Content Creator ID: ${this.contentCreatorId}
      Campaign ID: ${this.campaignId}
      Business People ID: ${this.businessPeopleId}
      Offered Price: ${this.offeredPrice}
      Important Notes: ${this.importantNotes?.join(', ') || 'N/A'}
      Status: ${this.status}
      Updated At: ${
        this.updatedAt ? new Date(this.updatedAt).toLocaleString() : 'N/A'
      }
    `;
  }

  private static fromSnapshot(
    doc:
      | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
      | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Transaction {
    const data = doc.data();
    if (data && doc.exists) {
      return new Transaction({
        id: doc.id,
        contentCreatorId: data.contentCreatorId?.id,
        businessPeopleId: data.businessPeopleId?.id,
        campaignId: data.campaignId.id,
        offeredPrice: data.offeredPrice,
        importantNotes: data.importantNotes,
        brainstorms: data.brainstorms,
        status: data.status,
        updatedAt: data.updatedAt,
      });
    }

    throw Error("Error, document doesn't exist!");
  }

  static getCampaignCollections =
    (): FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData> => {
      return firestore().collection(TRANSACTION_COLLECTION);
    };

  static getDocumentReference(
    documentId: string,
  ): FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData> {
    //TODO: tidy up, move somewhere else neater
    firestore().settings({
      ignoreUndefinedProperties: true,
    });
    return this.getCampaignCollections().doc(documentId);
  }

  async register() {
    return await this.updateStatus(TransactionStatus.registrationPending);
  }

  async offer() {
    try {
      const {id, ...rest} = this;
      const data = {
        ...rest,
        contentCreatorId: User.getDocumentReference(
          this.contentCreatorId ?? '',
        ),
        campaignId: Campaign.getDocumentReference(this.campaignId ?? ''),
        businessPeopleId: User.getDocumentReference(
          this.businessPeopleId ?? '',
        ),
        status: TransactionStatus.offering,
        updatedAt: new Date().getTime(),
      };

      const docRef = await firestore()
        .collection(TRANSACTION_COLLECTION)
        .add(data);
      this.id = docRef.id;
      return true;
    } catch (error) {
      console.log(error);
    }
    throw Error('Error!');
  }

  async updateStatus(status: TransactionStatus) {
    try {
      this.status = status;

      const {id, ...rest} = this;
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
        updatedAt: new Date().getTime(),
      };
      await firestore().collection(TRANSACTION_COLLECTION).doc(id).set(data);
      return true;
    } catch (error) {
      console.log(error);
    }
    throw Error('Error!');
  }

  static getAllTransactionsByCampaign(
    campaignId: string,
    onComplete: (transactions: Transaction[]) => void,
  ) {
    try {
      const unsubscribe = firestore()
        .collection(TRANSACTION_COLLECTION)
        .where(
          'campaignId',
          '==',
          firestore().collection('campaigns').doc(campaignId),
        )
        .onSnapshot(
          querySnapshot => {
            if (querySnapshot.empty) {
              onComplete([]);
            }

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

  static getAllTransactionsByCCBP(
    businessPeopleId: string,
    contentCreatorId: string,
    onComplete: (transactions: Transaction[]) => void,
  ) {
    try {
      const unsubscribe = firestore()
        .collection(TRANSACTION_COLLECTION)
        .where(
          'businessPeopleId',
          '==',
          firestore().collection('users').doc(businessPeopleId),
        )
        .where(
          'contentCreatorId',
          '==',
          firestore().collection('users').doc(contentCreatorId),
        )
        .onSnapshot(
          querySnapshot => {
            if (querySnapshot.empty) {
              onComplete([]);
            }

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
    role: UserRole,
    onComplete: (transactions: Transaction[]) => void,
  ) {
    try {
      const unsubscribe = firestore()
        .collection(TRANSACTION_COLLECTION)
        .where(
          role === UserRole.BusinessPeople
            ? 'businessPeopleId'
            : 'contentCreatorId',
          '==',
          firestore().collection('users').doc(userId),
        )
        .onSnapshot(
          querySnapshot => {
            if (querySnapshot.empty) {
              onComplete([]);
            }

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
    const unsubscribe = firestore()
      .collection(TRANSACTION_COLLECTION)
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
