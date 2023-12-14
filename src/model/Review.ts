import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {BaseModel} from './BaseModel';
import {User, UserRole} from './User';
import {Transaction} from './Transaction';
import {Campaign} from './Campaign';

export const REVIEW_COLLECTION = 'reviews';

export class Review extends BaseModel {
  id?: string;
  reviewerId?: string;
  revieweeId?: string;
  transactionId?: string;
  campaignId?: string;
  content: string;
  rating: number;
  createdAt?: number;

  constructor({
    id,
    reviewerId,
    revieweeId,
    transactionId,
    campaignId,
    content,
    rating,
    createdAt,
  }: Partial<Review>) {
    super();
    this.id = id;
    this.reviewerId = reviewerId;
    this.revieweeId = revieweeId;
    this.transactionId = transactionId;
    this.campaignId = campaignId;
    this.content = content || '';
    this.rating = rating || 0;
    this.createdAt = createdAt;
  }

  private static fromSnapshot(
    doc:
      | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
      | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Review {
    const data = doc.data();
    if (data && doc.exists) {
      return new Review({
        id: doc.id,
        reviewerId: data.reviewerId.id,
        revieweeId: data.revieweeId.id,
        transactionId: data.transactionId.id,
        campaignId: data.campaignId.id,
        content: data.content,
        rating: data.rating,
        createdAt: data.createdAt,
      });
    }

    throw Error("Error, document doesn't exist!");
  }

  static getCollectionReference = () => {
    return firestore().collection(REVIEW_COLLECTION);
  };

  static getDocumentReference = (documentId: string) => {
    this.setFirestoreSettings();
    return this.getCollectionReference().doc(documentId);
  };

  toFirestore() {
    const {id, reviewerId, revieweeId, transactionId, campaignId, ...rest} =
      this;

    if (!reviewerId) {
      throw Error('ReviewerId is required!');
    }
    if (!revieweeId) {
      throw Error('RevieweeId is required!');
    }
    if (!transactionId) {
      throw Error('TransactionId is required!');
    }
    if (!campaignId) {
      throw Error('CampaignId is required!');
    }

    const data = {
      ...rest,
      reviewerId: User.getDocumentReference(reviewerId),
      revieweeId: User.getDocumentReference(revieweeId),
      transactionId: Transaction.getDocumentReference(transactionId),
      campaignId: Campaign.getDocumentReference(campaignId),
    };

    return data;
  }

  async insert() {
    const {revieweeId, campaignId, rating} = this;
    if (!revieweeId) {
      throw Error('RevieweeId is required!');
    }
    if (!campaignId) {
      throw Error('CampaignId is required!');
    }
    const data = {
      ...this.toFirestore(),
      createdAt: firestore.FieldValue.serverTimestamp(),
    };
    await Review.getCollectionReference().add(data);
    const campaign = await Campaign.getById(campaignId);
    const revieweeUser = await User.getById(revieweeId);
    const revieweeRole =
      campaign.userId === revieweeId
        ? UserRole.BusinessPeople
        : UserRole.ContentCreator;
    await revieweeUser?.updateRating(rating, revieweeRole);
  }

  static async getReviewsByRevieweeId(revieweeId: string): Promise<Review[]> {
    try {
      const reviews = await this.getCollectionReference()
        .where('revieweeId', '==', User.getDocumentReference(revieweeId))
        .get();
      return reviews.docs.map(this.fromSnapshot);
    } catch (error) {
      throw Error('Review.getReviewsByRevieweeId err: ' + error);
    }
  }
}
