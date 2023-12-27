import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {BaseModel} from './BaseModel';
import {User, UserRole} from './User';
import {Transaction} from './Transaction';
import {Campaign} from './Campaign';
import {filterAsync} from '../utils/array';

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
    Review.setFirestoreSettings();
    return Review.getCollectionReference().doc(documentId);
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
      createdAt: new Date().getTime(),
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

  static async getReviewsByRevieweeId(
    revieweeId: string,
    revieweeRole: UserRole,
  ): Promise<Review[]> {
    try {
      const reviews = await Review.getCollectionReference()
        .where('revieweeId', '==', User.getDocumentReference(revieweeId))
        .get();
      return await filterAsync(
        reviews.docs.map(Review.fromSnapshot),
        async review => {
          const isContentCreator = await review.isRevieweeContentCreator();
          return (
            (revieweeRole === UserRole.ContentCreator && isContentCreator) ||
            (revieweeRole === UserRole.BusinessPeople && !isContentCreator)
          );
        },
      );
    } catch (error) {
      throw Error('Review.getReviewsByRevieweeId err: ' + error);
    }
  }

  static getReviewByTransactionIdAndReviewerId(
    transactionId: string,
    reviewerId: string,
    onComplete: (review: Review | null) => void,
  ) {
    return Review.getCollectionReference()
      .where(
        'transactionId',
        '==',
        Transaction.getDocumentReference(transactionId),
      )
      .where('reviewerId', '==', User.getDocumentReference(reviewerId))
      .onSnapshot(
        querySnapshot => {
          if (querySnapshot.empty) {
            onComplete(null);
          } else {
            onComplete(Review.fromSnapshot(querySnapshot.docs[0]));
          }
        },
        error => {
          onComplete(null);
          console.log(error.message);
        },
      );
  }

  async isRevieweeContentCreator(): Promise<boolean> {
    const {transactionId} = this;
    if (!transactionId) {
      return false;
    }
    return new Promise(resolve => {
      let unsubscribe = () => {};
      try {
        unsubscribe = Transaction.getById(transactionId, transaction => {
          unsubscribe();
          resolve(transaction?.contentCreatorId === this.revieweeId);
        });
      } catch (error) {
        unsubscribe();
        resolve(false);
      }
    });
  }
}
