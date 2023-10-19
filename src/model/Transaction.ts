import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {BaseModel} from './BaseModel';
import {User} from './User';
import {Campaign} from './Campaign';

const TRANSACTION_COLLECTION = 'transactions';

export class Transaction extends BaseModel {
  id?: string;
  contentCreatorId?: string;
  campaignId?: string;
  status?: string;

  constructor({
    id,
    contentCreatorId,
    campaignId,
    status,
  }: Partial<Transaction>) {
    super();
    this.id = id;
    this.contentCreatorId = contentCreatorId;
    this.campaignId = campaignId;
    this.status = status;
  }

  async insert() {
    try {
      const {id, ...rest} = this;
      const data = {
        ...rest,
        contentCreatorId: User.getDocumentReference(
          this.contentCreatorId ?? '',
        ),
        campaignId: Campaign.getDocumentReference(this.campaignId ?? ''),
      };

      await Transaction.getTransactionCollections().add(data);
      return true;
    } catch (error) {
      console.log(error);
    }
    throw Error('Error!');
  }

  static getTransactionCollections =
    (): FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData> => {
      return firestore().collection(TRANSACTION_COLLECTION);
    };
}
