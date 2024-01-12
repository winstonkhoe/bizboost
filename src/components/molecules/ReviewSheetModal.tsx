import {Text, View} from 'react-native';
import {SheetModal} from '../../containers/SheetModal';
import {flex, items, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {COLOR} from '../../styles/Color';
import {CustomButton} from '../atoms/Button';
import {FormlessCustomTextInput} from '../atoms/Input';
import {useEffect, useState} from 'react';
import {useUser} from '../../hooks/user';
import {Transaction} from '../../model/Transaction';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AnimatedPressable} from '../atoms/AnimatedPressable';
import {RatingStarIcon} from '../atoms/Icon';
import {FormFieldHelper} from '../atoms/FormLabel';
import {Review} from '../../model/Review';
import {showToast} from '../../helpers/toast';
import {ToastType} from '../../providers/ToastProvider';
import {size} from '../../styles/Size';
import {rounded} from '../../styles/BorderRadius';
import {Campaign} from '../../model/Campaign';
import {User} from '../../model/User';
import {dimension} from '../../styles/Dimension';
import {overflow} from '../../styles/Overflow';
import FastImage from 'react-native-fast-image';
import {getSourceOrDefaultAvatar} from '../../utils/asset';
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';

type ReviewSheetModalProps = {
  isModalOpened: boolean;
  transaction: Transaction;
  onModalDismiss: () => void;
};

interface Preview {
  image?: string;
  text?: string;
}

const ReviewSheetModal = ({
  isModalOpened,
  onModalDismiss,
  transaction,
}: ReviewSheetModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const {uid, isContentCreator} = useUser();
  const safeAreaInsets = useSafeAreaInsets();
  const [rating, setRating] = useState<number>(-1);
  const [campaign, setCampaign] = useState<Campaign | null>();
  const [user, setUser] = useState<User | null>();
  const [reviewContent, setReviewContent] = useState<string>();
  const activeOpponentUserData = isContentCreator
    ? user?.businessPeople
    : user?.contentCreator;
  const mainPreview: Preview = {
    image: isContentCreator
      ? campaign?.image
      : activeOpponentUserData?.profilePicture,
    text: isContentCreator ? campaign?.title : activeOpponentUserData?.fullname,
  };

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

  useEffect(() => {
    if (transaction.campaignId) {
      Campaign.getById(transaction.campaignId)
        .then(setCampaign)
        .catch(() => setCampaign(null));
    }
    if (transaction.contentCreatorId && transaction.businessPeopleId) {
      User.getById(
        isContentCreator
          ? transaction.businessPeopleId
          : transaction.contentCreatorId,
      )
        .then(setUser)
        .catch(() => setUser(null));
    }
  }, [transaction, isContentCreator]);

  if (user === undefined || campaign === undefined) {
    return null;
  }

  return (
    <>
      <SheetModal
        open={isModalOpened}
        onDismiss={onModalDismiss}
        snapPoints={['70%']}
        fullHeight
        enableDynamicSizing={false}>
        <BottomSheetScrollView
          style={[flex.flex1]}
          contentContainerStyle={[
            flex.flexCol,
            gap.large,
            padding.top.default,
            {
              paddingBottom: Math.max(safeAreaInsets.bottom, size.default),
            },
          ]}>
          <View
            style={[
              flex.flexCol,
              gap.small,
              {
                borderColor: COLOR.black[20],
                borderBottomWidth: 1,
              },
              padding.default,
              padding.horizontal.medium,
            ]}>
            <View style={[flex.flexRow, gap.default, items.center]}>
              <View
                style={[
                  dimension.square.xlarge2,
                  rounded.small,
                  overflow.hidden,
                ]}>
                <FastImage
                  style={[dimension.full]}
                  source={getSourceOrDefaultAvatar({
                    uri: mainPreview.image,
                  })}
                />
              </View>
              <Text
                style={[font.size[30], textColor(COLOR.text.neutral.high)]}
                numberOfLines={2}>
                {mainPreview.text}
              </Text>
            </View>
          </View>
          <View style={[flex.flexCol, items.center, gap.default]}>
            <Text
              style={[
                font.size[30],
                font.weight.semibold,
                textColor(COLOR.text.neutral.high),
              ]}>
              {isContentCreator
                ? 'Campaign and Business People Quality'
                : 'Content Creator Quality'}
            </Text>
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
          </View>
          <View style={[flex.flexCol, gap.default, padding.horizontal.medium]}>
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
          <View style={[padding.horizontal.medium]}>
            <CustomButton
              text="Submit Review"
              onPress={submitReview}
              disabled={rating === -1}
              isLoading={isLoading}
            />
          </View>
        </BottomSheetScrollView>
      </SheetModal>
    </>
  );
};

export default ReviewSheetModal;
