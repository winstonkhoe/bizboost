import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {BaseModel} from './BaseModel';
import {User, UserRole} from './User';
import {Campaign, CampaignPlatform, CampaignTask} from './Campaign';

export const OFFER_COLLECTION = 'offers';

export enum OfferStatus {
  pending = 'Pending',
  approved = 'Approved',
  rejected = 'Rejected',
  negotiate = 'Negotiate',
  negotiateRejected = 'Negotiate Rejected',
}

export class Offer extends BaseModel {
  id?: string;
  contentCreatorId?: string;
  campaignId?: string;
  businessPeopleId?: string;
  offeredPrice?: number;
  negotiatedPrice?: number;
  platformTasks?: CampaignPlatform[];
  negotiatedTasks?: CampaignPlatform[];
  importantNotes?: string;
  negotiatedNotes?: string;
  negotiatedBy?: string;
  status?: OfferStatus;
  createdAt?: number;

  constructor({
    id,
    contentCreatorId,
    campaignId,
    businessPeopleId,
    offeredPrice,
    negotiatedPrice,
    platformTasks,
    negotiatedTasks,
    importantNotes,
    negotiatedNotes,
    negotiatedBy,
    status = OfferStatus.pending,
    createdAt,
  }: Partial<Offer>) {
    super();
    if (campaignId && contentCreatorId) {
      this.id = campaignId + contentCreatorId;
    }
    this.contentCreatorId = contentCreatorId;
    this.businessPeopleId = businessPeopleId;
    this.campaignId = campaignId;
    this.offeredPrice = offeredPrice;
    this.negotiatedPrice = negotiatedPrice;
    this.platformTasks = platformTasks;
    this.negotiatedTasks = negotiatedTasks;
    this.importantNotes = importantNotes;
    this.negotiatedNotes = negotiatedNotes;
    this.negotiatedBy = negotiatedBy;
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

      Negotiated Price: ${this.negotiatedPrice}
      Negotiated Notes: ${this.negotiatedNotes || ''}
      Negotiated By: ${this.negotiatedBy || ''}
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
        negotiatedPrice: data.negotiatedPrice,
        platformTasks: data.platformTasks,
        negotiatedTasks: data.negotiatedTasks,
        importantNotes: data.importantNotes,
        negotiatedNotes: data.negotiatedNotes,
        negotiatedBy: data.negotiatedBy,
        status: data.status,
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
        createdAt: new Date().getTime(),
      };

      await firestore().collection(OFFER_COLLECTION).doc(id).set(data);
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
        .where('status', 'in', [
          OfferStatus.pending,
          OfferStatus.negotiate,
          OfferStatus.negotiateRejected,
        ])
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

  async negotiate(
    fee: number,
    importantNotes: string,
    platformTasks: CampaignPlatform[],
    negotiatedBy: UserRole,
  ) {
    try {
      this.negotiatedPrice = fee;
      this.negotiatedNotes = importantNotes;
      this.platformTasks = platformTasks;
      this.negotiatedBy = negotiatedBy;

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

  async acceptNegotiation() {
    this.offeredPrice = this.negotiatedPrice;
    this.importantNotes = this.negotiatedNotes;

    await this.updateStatus(OfferStatus.approved);
  }

  async rejectNegotiation() {
    await this.updateStatus(OfferStatus.negotiateRejected);
  }

  static filterByCampaignId(offers: Offer[], campaignId: string): Offer[] {
    return offers.filter(offer => offer.campaignId === campaignId);
  }

  static async hasOfferForContentCreatorAndCampaign(
    contentCreatorId: string,
    campaignId: string,
  ): Promise<boolean> {
    try {
      const querySnapshot = await firestore()
        .collection(OFFER_COLLECTION)
        .where(
          'contentCreatorId',
          '==',
          firestore().collection('users').doc(contentCreatorId),
        )
        .where(
          'campaignId',
          '==',
          firestore().collection('campaigns').doc(campaignId),
        )
        .get();

      return !querySnapshot.empty;
    } catch (error) {
      console.error(error);
      throw new Error('Error checking for offers');
    }
  }
}
