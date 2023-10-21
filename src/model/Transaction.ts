import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {BaseModel} from './BaseModel';
import {User} from './User';
import {CAMPAIGN_COLLECTION, Campaign} from './Campaign';

export const TRANSACTION_COLLECTION = 'transactions';

export enum TransactionStatus {
  notRegistered = 'Not Registered',
  registrationPending = 'Registration Pending',
  registrationRejected = 'Registration Rejected',
  registrationApproved = 'Registration Approved',

  // TODO: add other status: brainstorming, draft, final content, engagement, payment, etc
}

export class Transaction extends BaseModel {
  id?: string; // CampaignId + ContentCreatorId
  contentCreatorId?: string;
  campaignId?: string;
  status?: TransactionStatus;

  constructor({
    id,
    contentCreatorId,
    campaignId,
    status,
  }: Partial<Transaction>) {
    super();
    // this.id = id;
    if (campaignId && contentCreatorId) {
      this.id = campaignId + contentCreatorId;
    }
    this.contentCreatorId = contentCreatorId;
    this.campaignId = campaignId;
    this.status = status;
  }

  async insert() {
    return await this.updateStatus(TransactionStatus.registrationPending);
  }

  async updateStatus(status: TransactionStatus) {
    try {
      const {id, ...rest} = this;
      const data = {
        ...rest,
        contentCreatorId: User.getDocumentReference(
          this.contentCreatorId ?? '',
        ),
        campaignId: Campaign.getDocumentReference(this.campaignId ?? ''),
        status: status,
      };

      await firestore().collection(TRANSACTION_COLLECTION).doc(id).set(data);
      return true;
    } catch (error) {
      console.log(error);
    }
    throw Error('Error!');
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
