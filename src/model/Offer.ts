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
  platformTasks: CampaignPlatform[];
  negotiatedTasks: CampaignPlatform[];
  importantNotes?: string;
  negotiatedNotes?: string;
  negotiatedBy?: UserRole;
  status?: OfferStatus;
  createdAt?: number;

  constructor({
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
    this.platformTasks = platformTasks || [];
    this.negotiatedTasks = negotiatedTasks || [];
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

  static getCollectionReference =
    (): FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData> => {
      return firestore().collection(OFFER_COLLECTION);
    };

  static getDocumentReference(
    documentId: string,
  ): FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData> {
    firestore().settings({
      ignoreUndefinedProperties: true,
    });
    return this.getCollectionReference().doc(documentId);
  }

  static async getById(id: string): Promise<Offer> {
    try {
      const snapshot = await this.getDocumentReference(id).get();
      if (!snapshot.exists) {
        throw Error('Transaction not found!');
      }

      const offer = this.fromSnapshot(snapshot);
      return offer;
    } catch (error) {
      console.error('Error in getById:', error);
    }
    throw Error('Error!');
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

      await Offer.getDocumentReference(id).set(data);
    } catch (error) {
      console.log(error);
      throw Error('Error!');
    }
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

  static getPendingOffersbyUser(
    userId: string,
    activeRole: UserRole,
    onComplete: (offers: Offer[]) => void,
  ) {
    try {
      let query;
      if (activeRole === UserRole.BusinessPeople) {
        query = this.getCollectionReference().where(
          'businessPeopleId',
          '==',
          User.getDocumentReference(userId),
        );
      } else if (activeRole === UserRole.ContentCreator) {
        query = this.getCollectionReference().where(
          'contentCreatorId',
          '==',
          User.getDocumentReference(userId),
        );
      }
      if (!query) {
        return () => {};
      }
      return query
        .where('status', 'in', [OfferStatus.pending, OfferStatus.negotiate])
        .onSnapshot(
          querySnapshot => {
            onComplete(querySnapshot.docs.map(this.fromSnapshot));
          },
          error => {
            console.log(error);
          },
        );
    } catch (error) {
      console.error(error);
      throw Error('Offer.getPendingOffersbyUser err: ' + error);
    }
  }

  async accept(): Promise<Offer> {
    this.offeredPrice = this.negotiatedPrice;
    this.importantNotes = this.negotiatedNotes;
    this.platformTasks = this.negotiatedTasks;
    await this.updateStatus(OfferStatus.approved);

    return this;
  }

  async reject() {
    this.offeredPrice = this.negotiatedPrice;
    this.importantNotes = this.negotiatedNotes;
    this.platformTasks = this.negotiatedTasks;
    await this.updateStatus(OfferStatus.rejected);
  }

  async updateStatus(status: OfferStatus) {
    try {
      const {id, ...rest} = this;

      if (!id) {
        throw Error('Missing id');
      }

      this.status = status;
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

      await Offer.getDocumentReference(id).set(data);
    } catch (error) {
      console.log(error);
      throw Error('Offer.updateStatus error ' + error);
    }
  }

  async negotiate(
    fee: number,
    importantNotes: string,
    platformTasks: CampaignPlatform[],
    negotiatedBy: UserRole,
  ) {
    try {
      if (this.negotiatedBy) {
        this.offeredPrice = this.negotiatedPrice;
        this.importantNotes = this.negotiatedNotes;
        this.platformTasks = this.negotiatedTasks;
      }

      this.negotiatedPrice = fee;
      this.negotiatedNotes = importantNotes;
      this.negotiatedTasks = platformTasks;
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
          User.getDocumentReference(contentCreatorId),
        )
        .where('campaignId', '==', Campaign.getDocumentReference(campaignId))
        .where('status', '!=', OfferStatus.rejected)
        .count()
        .get();

      return querySnapshot.data().count > 0;
    } catch (error) {
      console.error(error);
      throw new Error(
        'Offer.hasOfferForContentCreatorAndCampaign error ' + error,
      );
    }
  }
}
