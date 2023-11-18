import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {BaseModel} from './BaseModel';
import {User, UserRole} from './User';
import {Campaign} from './Campaign';

export const TRANSACTION_COLLECTION = 'transactions';

export enum TransactionStatus {
  notRegistered = 'Not Registered',
  registrationPending = 'Registration Pending',
  registrationRejected = 'Registration Rejected',
  registrationApproved = 'Registration Approved',

  // TODO: add other status: brainstorming, draft, final content, engagement, payment, etc
  done = 'Done',
}

export class Transaction extends BaseModel {
  id?: string; // CampaignId + ContentCreatorId
  contentCreatorId?: string;
  campaignId?: string;
  businessPeopleId?: string; // buat mempermudah fetch all transaction BP
  status?: TransactionStatus;
  updatedAt?: number;

  constructor({
    contentCreatorId,
    campaignId,
    businessPeopleId,
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
    this.status = status;
    this.updatedAt = updatedAt;
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
        status: data.status,
        updatedAt: data.updatedAt,
      });
    }

    throw Error("Error, document doesn't exist!");
  }

  async insert() {
    return await this.updateStatus(TransactionStatus.registrationPending);
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
