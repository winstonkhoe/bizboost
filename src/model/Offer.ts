import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {BaseModel} from './BaseModel';
import {User, UserRole} from './User';
import {Campaign, CampaignPlatform, CampaignTask} from './Campaign';
import {Chat, MessageType} from './Chat';
import {ErrorMessage} from '../constants/errorMessage';
import {Transaction, TransactionStatus} from './Transaction';

export const OFFER_COLLECTION = 'offers';

export enum OfferStatus {
  pending = 'Pending',
  approved = 'Approved',
  rejected = 'Rejected',
  negotiate = 'Negotiate',
  negotiateRejected = 'Negotiate Rejected',
}

export interface Negotiation {
  fee?: number;
  tasks: CampaignPlatform[];
  notes?: string;
  negotiatedBy?: UserRole;
  createdAt?: number;
}

export class Offer extends BaseModel {
  id?: string;
  contentCreatorId?: string;
  campaignId?: string;
  businessPeopleId?: string;
  negotiations: Negotiation[];
  status?: OfferStatus;
  createdAt?: number;

  constructor({
    contentCreatorId,
    campaignId,
    businessPeopleId,
    negotiations,
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
    this.negotiations = negotiations || [];
    this.status = status;
    this.createdAt = createdAt;
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
        negotiations: data.negotiations,
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
    return Offer.getCollectionReference().doc(documentId);
  }

  static async getById(id: string): Promise<Offer> {
    try {
      const snapshot = await Offer.getDocumentReference(id).get();
      if (!snapshot.exists) {
        throw Error('Transaction not found!');
      }

      return Offer.fromSnapshot(snapshot);
    } catch (error) {
      console.error('Error in getById:', error);
    }
    throw Error('Error!');
  }

  async insert() {
    try {
      const {id, campaignId, contentCreatorId, businessPeopleId, ...rest} =
        this;
      const earliestNegotiation = this.getEarliestNegotiation();
      if (
        !id ||
        !contentCreatorId ||
        !businessPeopleId ||
        !campaignId ||
        !earliestNegotiation?.createdAt
      ) {
        throw Error(ErrorMessage.GENERAL);
      }
      const data = {
        ...rest,
        contentCreatorId: User.getDocumentReference(contentCreatorId),
        campaignId: Campaign.getDocumentReference(campaignId),
        businessPeopleId: User.getDocumentReference(businessPeopleId),
        createdAt: new Date().getTime(),
      };
      await Offer.getDocumentReference(id).set(data);

      const transaction = new Transaction({
        contentCreatorId: contentCreatorId,
        businessPeopleId: businessPeopleId,
        campaignId: campaignId,
      });
      await transaction.offer();

      const existingChat =
        await Chat.findOrCreateByContentCreatorIdAndBusinessPeopleId(
          contentCreatorId,
          businessPeopleId,
        );
      await existingChat.addOfferMessage(
        UserRole.BusinessPeople,
        id,
        earliestNegotiation.createdAt,
      );
      return {chat: existingChat};
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
          querySnapshot =>
            onComplete(querySnapshot.docs.map(Offer.fromSnapshot)),
          error => console.log(error),
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
        query = Offer.getCollectionReference().where(
          'businessPeopleId',
          '==',
          User.getDocumentReference(userId),
        );
      } else if (activeRole === UserRole.ContentCreator) {
        query = Offer.getCollectionReference().where(
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
          querySnapshot =>
            onComplete(querySnapshot.docs.map(Offer.fromSnapshot)),
          error => console.log(error),
        );
    } catch (error) {
      console.error(error);
      throw Error('Offer.getPendingOffersbyUser err: ' + error);
    }
  }

  async accept(role: UserRole) {
    await this.updateStatus(OfferStatus.approved);
    const {businessPeopleId, contentCreatorId, campaignId} = this;
    const latestNegotiation = this.getLatestNegotiation();
    if (
      !businessPeopleId ||
      !contentCreatorId ||
      !campaignId ||
      !latestNegotiation
    ) {
      throw Error(ErrorMessage.GENERAL);
    }
    try {
      const transaction = new Transaction({
        transactionAmount: latestNegotiation.fee,
        platformTasks: latestNegotiation.tasks,
        contentCreatorId: contentCreatorId,
        businessPeopleId: businessPeopleId,
        campaignId: campaignId,
      });
      await transaction.insert(TransactionStatus.offerWaitingForPayment);
      const campaign = await Campaign.getById(campaignId);
      const user = await User.getById(
        role === UserRole.BusinessPeople ? businessPeopleId : contentCreatorId,
      );
      const name =
        role === UserRole.BusinessPeople
          ? user?.businessPeople?.fullname
          : user?.contentCreator?.fullname;
      const text = `${name} accepted offer for ${campaign?.title}. Transaction will begin after Business People have finished payment.`;
      const existingChat =
        await Chat.findOrCreateByContentCreatorIdAndBusinessPeopleId(
          contentCreatorId,
          businessPeopleId,
        );
      await existingChat.addMessage(MessageType.System, role, {
        content: text,
      });
    } catch (error) {
      console.log(error);
      throw Error('Offer.accept error ' + error);
    }
  }

  async reject(role: UserRole) {
    await this.updateStatus(OfferStatus.rejected);
    const {businessPeopleId, contentCreatorId, campaignId} = this;
    if (!businessPeopleId || !contentCreatorId || !campaignId) {
      throw Error(ErrorMessage.GENERAL);
    }
    try {
      const campaign = await Campaign.getById(campaignId);
      const user = await User.getById(
        role === UserRole.BusinessPeople ? businessPeopleId : contentCreatorId,
      );
      const name =
        role === UserRole.BusinessPeople
          ? user?.businessPeople?.fullname
          : user?.contentCreator?.fullname;
      const text = `${name} rejected offer for ${campaign?.title}.`;
      const existingChat =
        await Chat.findOrCreateByContentCreatorIdAndBusinessPeopleId(
          contentCreatorId,
          businessPeopleId,
        );
      await existingChat.addMessage(MessageType.System, role, {
        content: text,
      });
    } catch (error) {
      console.log(error);
      throw Error('Offer.reject error ' + error);
    }
  }

  async updateStatus(status: OfferStatus) {
    try {
      const {id} = this;

      if (!id) {
        throw Error('Missing id');
      }

      this.status = status;

      await Offer.getDocumentReference(id).update({
        status: status,
      });
    } catch (error) {
      console.log(error);
      throw Error('Offer.updateStatus error ' + error);
    }
  }

  async negotiate(
    fee: number,
    note: string,
    tasks: CampaignPlatform[],
    negotiatedBy: UserRole,
  ) {
    try {
      const {id} = this;
      if (!id) {
        throw Error('Missing id');
      }
      const negotiation = {
        fee: fee,
        notes: note,
        tasks: tasks,
        negotiatedBy: negotiatedBy,
        createdAt: new Date().getTime(),
      };

      await Offer.getDocumentReference(id).update({
        negotiations: firestore.FieldValue.arrayUnion(negotiation),
        status: OfferStatus.negotiate,
      });
    } catch (error) {
      console.log(error);
      throw Error('Offer.negotitate error ' + error);
    }
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

  static async getLatestOfferByCampaignIdBusinessPeopleIdContentCreatorId(
    campaignId: string,
    businessPeopleId: string,
    contentCreatorId: string,
  ) {
    try {
      const querySnapshot = await firestore()
        .collection(OFFER_COLLECTION)
        .where(
          'businessPeopleId',
          '==',
          User.getDocumentReference(businessPeopleId),
        )
        .where(
          'contentCreatorId',
          '==',
          User.getDocumentReference(contentCreatorId),
        )
        .where('campaignId', '==', Campaign.getDocumentReference(campaignId))
        .orderBy('createdAt', 'desc')
        .get();

      if (querySnapshot.size === 0) {
        return null;
      }

      return Offer.fromSnapshot(querySnapshot.docs[0]);
    } catch (error) {
      console.error(error);
      throw new Error(
        'Offer.getLatestOfferByCampaignIdBusinessPeopleIdContentCreatorId error ' +
          error,
      );
    }
  }

  getEarliestNegotiation() {
    if (this.negotiations.length === 0) {
      return null;
    }
    return this.negotiations.sort(
      (a, b) => (a.createdAt || 0) - (b.createdAt || 0),
    )[0];
  }

  getLatestNegotiation() {
    if (this.negotiations.length === 0) {
      return null;
    }
    return this.negotiations.sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
    )[0];
  }

  isPending() {
    return this.status === OfferStatus.pending;
  }

  isNegotiating() {
    return this.status === OfferStatus.negotiate;
  }

  isNegotiationRejected() {
    return this.status === OfferStatus.negotiateRejected;
  }
}
