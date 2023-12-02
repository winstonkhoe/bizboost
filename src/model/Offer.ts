import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {BaseModel} from './BaseModel';
import {User} from './User';
import {Campaign} from './Campaign';

export const OFFER_COLLECTION = 'offers';

export enum OfferStatus {
  pending = 'Pending',
  approved = 'Approved',
  rejected = 'Rejected',
  negotiate = 'Negotiate',
}

export class Offer extends BaseModel {
  id?: string;
  contentCreatorId?: string;
  campaignId?: string;
  businessPeopleId?: string; // buat mempermudah fetch all transaction BP
  offeredPrice?: number;
  negotiatedPrice?: number;
  importantNotes?: string;
  negotiatedNotes?: string;
  status?: OfferStatus;
  createdAt?: number;

  constructor({
    id,
    contentCreatorId,
    campaignId,
    businessPeopleId,
    offeredPrice,
    importantNotes,
    status = OfferStatus.pending,
    createdAt,
  }: Partial<Offer>) {
    super();
    this.id = id;
    this.contentCreatorId = contentCreatorId;
    this.businessPeopleId = businessPeopleId;
    this.campaignId = campaignId;
    this.offeredPrice = offeredPrice;
    this.importantNotes = importantNotes;
    this.status = status;
    this.createdAt = createdAt;
  }

  toString(): string {
    return `
      Offer ID: ${this.id}
      Content Creator ID: ${this.contentCreatorId}
      Campaign ID: ${this.campaignId}
      Business People ID: ${this.businessPeopleId}
      Offered Price: ${this.offeredPrice}
      Important Notes: ${this.importantNotes || ''}
      Status: ${this.status}
      Updated At: ${
        this.createdAt ? new Date(this.createdAt).toLocaleString() : 'N/A'
      }
    `;
  }

  private static fromSnapshot(
    doc:
      | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
      | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Offer {
    const data = doc.data();
    if (data && doc.exists) {
      return new Offer({
        id: doc.id,
        contentCreatorId: data.contentCreatorId?.id,
        businessPeopleId: data.businessPeopleId?.id,
        campaignId: data.campaignId.id,
        offeredPrice: data.offeredPrice,
        importantNotes: data.importantNotes,
        createdAt: data.createdAt,
      });
    }

    throw Error("Error, document doesn't exist!");
  }

  static getCampaignCollections =
    (): FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData> => {
      return firestore().collection(OFFER_COLLECTION);
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

  async insert() {
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
        createdAt: new Date().getTime(),
      };

      const docRef = await firestore().collection(OFFER_COLLECTION).add(data);
      this.id = docRef.id;
      return true;
    } catch (error) {
      console.log(error);
    }
    throw Error('Error!');
  }

  static getPendingOffersbyCCBP(
    businessPeopleId: string,
    contentCreatorId: string,
    onComplete: (offers: Offer[]) => void,
  ) {
    try {
      const unsubscribe = firestore()
        .collection(OFFER_COLLECTION)
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
        .where('status', 'in', [OfferStatus.pending, OfferStatus.negotiate])
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

  async accept() {
    await this.updateStatus(OfferStatus.approved);
  }

  async reject() {
    await this.updateStatus(OfferStatus.rejected);
  }

  async updateStatus(status: OfferStatus) {
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
      };

      await firestore().collection(OFFER_COLLECTION).doc(id).set(data);
      return true;
    } catch (error) {
      console.log(error);
    }
    throw Error('Error!');
  }

  async negotiate(fee: number, importantNotes: string) {
    try {
      this.negotiatedPrice = fee;
      this.negotiatedNotes = importantNotes;

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
        status: OfferStatus.negotiate,
      };

      await firestore().collection(OFFER_COLLECTION).doc(id).set(data);
      return true;
    } catch (error) {
      console.log(error);
    }
    throw Error('Error!');
  }

  static filterByCampaignId(offers: Offer[], campaignId: string): Offer[] {
    return offers.filter(offer => offer.campaignId === campaignId);
  }
}
