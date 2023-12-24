import {Pressable, View} from 'react-native';
import {Review} from '../../model/Review';
import {Text} from 'react-native';
import {flex, items, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import FastImage from 'react-native-fast-image';
import {dimension} from '../../styles/Dimension';
import {rounded} from '../../styles/BorderRadius';
import {overflow} from '../../styles/Overflow';
import {useEffect, useState} from 'react';
import {Campaign} from '../../model/Campaign';
import {User} from '../../model/User';
import {getSourceOrDefaultAvatar} from '../../utils/asset';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {border} from '../../styles/Border';
import {padding} from '../../styles/Padding';
import {getTimeAgo} from '../../utils/date';
import {RatingStarIcon} from '../atoms/Icon';
import {shadow} from '../../styles/Shadow';
import {background} from '../../styles/BackgroundColor';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard = ({review}: ReviewCardProps) => {
  const navigation = useNavigation<NavigationStackProps>();
  const [campaign, setCampaign] = useState<Campaign | null>();
  const [reviewer, setReviewer] = useState<User | null>();
  const isReviewerContentCreator =
    !!campaign && review.reviewerId !== campaign.userId;

  useEffect(() => {
    if (review.campaignId) {
      Campaign.getById(review.campaignId)
        .then(setCampaign)
        .catch(() => setCampaign(null));
    }
    if (review.reviewerId) {
      User.getById(review.reviewerId)
        .then(setReviewer)
        .catch(() => setReviewer(null));
    }
  }, [review]);

  return (
    <View
      style={[
        flex.flexCol,
        rounded.medium,
        border({
          borderWidth: 1,
          color: COLOR.black[20],
        }),
        background(COLOR.background.neutral.default),
      ]}>
      <Pressable
        style={[
          flex.flexRow,
          items.center,
          padding.default,
          gap.default,
          {
            borderBottomWidth: 1,
            borderBottomColor: COLOR.black[20],
          },
        ]}
        onPress={() => {
          if (!review.campaignId) {
            return;
          }
          navigation.navigate(AuthenticatedNavigation.CampaignDetail, {
            campaignId: review.campaignId,
          });
        }}>
        <View
          style={[dimension.square.xlarge2, rounded.default, overflow.hidden]}>
          <FastImage
            style={[dimension.full]}
            source={getSourceOrDefaultAvatar({
              uri: campaign?.image,
            })}
          />
        </View>
        <Text
          numberOfLines={1}
          style={[font.size[20], textColor(COLOR.text.neutral.high)]}>
          {campaign?.title}
        </Text>
      </Pressable>
      <View style={[flex.flexCol, gap.small, padding.default]}>
        <View style={[flex.flexRow, gap.medium]}>
          <Text
            style={[flex.flex1, font.weight.semibold, font.size[20]]}
            numberOfLines={1}>
            {isReviewerContentCreator
              ? reviewer?.contentCreator?.fullname
              : reviewer?.businessPeople?.fullname}
          </Text>
          {review.createdAt && (
            <Text style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
              {getTimeAgo(review.createdAt!!)}
            </Text>
          )}
        </View>
        <View style={[flex.flexRow, gap.xsmall]}>
          {[...Array(5)].map((_, index) => (
            <RatingStarIcon
              key={index}
              size="medium"
              color={index > review.rating - 1 ? COLOR.black[20] : undefined}
            />
          ))}
        </View>
        <Text style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
          {review.content}
        </Text>
      </View>
    </View>
  );
};
