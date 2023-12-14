import {View} from 'react-native';
import {SheetModal} from '../../containers/SheetModal';
import {flex, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {COLOR} from '../../styles/Color';
import {CustomButton} from '../atoms/Button';
import {FormlessCustomTextInput} from '../atoms/Input';
import {useState} from 'react';
import {useUser} from '../../hooks/user';
import {Transaction} from '../../model/Transaction';
import {BackButtonPlaceholder} from './BackButtonPlaceholder';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AnimatedPressable} from '../atoms/AnimatedPressable';
import {RatingStarIcon} from '../atoms/Icon';
import {FormFieldHelper} from '../atoms/FormLabel';
import RegisteredUserListCard from './RegisteredUserListCard';
import {Review} from '../../model/Review';
import {showToast} from '../../helpers/toast';
import {ToastType} from '../../providers/ToastProvider';
import {size} from '../../styles/Size';

type ReviewSheetModalProps = {
  isModalOpened: boolean;
  transaction: Transaction;
  onModalDismiss: () => void;
};

const ReviewSheetModal = ({
  isModalOpened,
  onModalDismiss,
  transaction,
}: ReviewSheetModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const {activeRole, uid} = useUser();
  const safeAreaInsets = useSafeAreaInsets();
  const [rating, setRating] = useState<number>(-1);
  const [reviewContent, setReviewContent] = useState<string>();

  const submitReview = () => {
    if (!uid) {
      return;
    }
    const review = new Review({
      reviewerId: uid,
      revieweeId:
        transaction.contentCreatorId === uid
          ? transaction.businessPeopleId
          : transaction.businessPeopleId,
      campaignId: transaction.campaignId,
      transactionId: transaction.id,
      rating: rating,
      content: reviewContent,
    });
    setIsLoading(true);
    review
      .insert()
      .then(() => {
        showToast({
          type: ToastType.success,
          message: 'Review submitted',
        });
        onModalDismiss();
      })
      .catch(error => {
        console.log('submitReview error', error);
        showToast({
          type: ToastType.danger,
          message: 'Failed to submit review',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <SheetModal open={isModalOpened} onDismiss={onModalDismiss}>
        <View
          style={[
            flex.flexCol,
            gap.medium,
            padding.top.default,
            padding.bottom.xlarge,
            {
              paddingBottom: Math.max(safeAreaInsets.bottom, size.default),
            },
            padding.horizontal.medium,
          ]}>
          <BackButtonPlaceholder onPress={onModalDismiss} icon="close" />
          <View style={[flex.flex1]}>
            <RegisteredUserListCard
              transaction={transaction}
              role={activeRole}
            />
          </View>
          <View style={[flex.flexRow, justify.center, gap.medium]}>
            {[...Array(5)].map((_, ratingIndex) => (
              <AnimatedPressable
                key={ratingIndex}
                onPress={() => {
                  setRating(ratingIndex);
                }}>
                <RatingStarIcon
                  size="xlarge5"
                  color={
                    ratingIndex > rating ? COLOR.absoluteBlack[20] : undefined
                  }
                />
              </AnimatedPressable>
            ))}
          </View>
          <View style={[flex.flexCol, gap.default]}>
            <FormFieldHelper
              title="Tell us more about your experience."
              type="optional"
            />
            <FormlessCustomTextInput
              onChange={setReviewContent}
              max={500}
              description="Maximum 500 characters"
              counter
            />
          </View>
          <View style={[flex.flex1]}>
            <CustomButton
              text="Submit Review"
              onPress={submitReview}
              disabled={rating === -1}
              isLoading={isLoading}
            />
          </View>
        </View>
      </SheetModal>
    </>
  );
};

export default ReviewSheetModal;
