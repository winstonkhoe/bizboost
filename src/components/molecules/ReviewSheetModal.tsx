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
import TransactionCard from './TransactionCard';
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
          ? transaction.businessPeopleId //opposite id
          : transaction.contentCreatorId,
      campaignId: transaction.campaignId,
      transactionId: transaction.id,
      rating: rating + 1,
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
      <SheetModal
        open={isModalOpened}
        onDismiss={onModalDismiss}
        snapPoints={['60%']}
        enableDynamicSizing={false}>
        <View
          style={[
            flex.flexCol,
            gap.xlarge,
            padding.top.default,
            padding.bottom.xlarge,
            {
              paddingBottom: Math.max(safeAreaInsets.bottom, size.default),
            },
            padding.horizontal.medium,
          ]}>
          <BackButtonPlaceholder onPress={onModalDismiss} icon="close" />
          {/* <View style={[flex.flex1]}>
            <RegisteredUserListCard
              transaction={transaction}
              role={activeRole}
            />
          </View> */}
          <View style={[flex.flexCol, gap.large]}>
            <View style={[flex.flexRow, justify.center, gap.medium]}>
              {[...Array(5)].map((_, ratingIndex) => (
                <AnimatedPressable
                  key={ratingIndex}
                  onPress={() => {
                    setRating(ratingIndex);
                  }}>
                  <RatingStarIcon
                    size="xlarge"
                    color={
                      ratingIndex > rating ? COLOR.absoluteBlack[20] : undefined
                    }
                  />
                </AnimatedPressable>
              ))}
            </View>
            <View style={[flex.flexCol, gap.default]}>
              <FormFieldHelper
                title="Tell us about your experience."
                titleSize={40}
                type="optional"
              />
              <FormlessCustomTextInput
                onChange={setReviewContent}
                type="textarea"
                placeholder='e.g. "I love it, clear instructions and the business people is very responsive"'
                max={200}
                description="Maximum 200 characters"
                counter
              />
            </View>
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
