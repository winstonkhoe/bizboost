import React, {useState, useEffect} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {SocialPlatform, User, UserRole} from '../model/User';
import {ScrollView, Text, View} from 'react-native';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {font} from '../styles/Font';
import {flex, items, justify} from '../styles/Flex';
import {CustomButton} from '../components/atoms/Button';
import {gap} from '../styles/Gap';
import {formatDateToDayMonthYear} from '../utils/date';
import FastImage from 'react-native-fast-image';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {padding} from '../styles/Padding';
import {size} from '../styles/Size';
import {useNavigation} from '@react-navigation/native';
import {useUser} from '../hooks/user';
import {dimension} from '../styles/Dimension';
import {rounded} from '../styles/BorderRadius';
import {textColor} from '../styles/Text';
import {COLOR} from '../styles/Color';
import {usePortfolio} from '../hooks/portfolio';
import {TabView} from '../components/organisms/TabView';
import {PortfolioList} from '../components/organisms/PortfolioList';
import {getSourceOrDefaultAvatar} from '../utils/asset';
import {Review} from '../model/Review';
import {LoadingScreen} from './LoadingScreen';
import {ReviewList} from '../components/organisms/ReviewList';
import {SocialCard} from '../components/atoms/SocialCard';
import {RatingStarIcon} from '../components/atoms/Icon';
import {overflow} from '../styles/Overflow';
import {formatNumberWithSuffix} from '../utils/number';
import {SocialSummary} from '../components/molecules/SocialCard';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.ContentCreatorDetail
>;

const ContentCreatorDetailScreen = ({route}: Props) => {
  const {contentCreatorId} = route.params;
  const safeAreaInsets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationStackProps>();
  const [contentCreator, setContentCreator] = useState<User | null>();
  const [reviews, setReviews] = useState<Review[]>();
  const {portfolios} = usePortfolio(contentCreatorId);
  const {uid} = useUser();

  useEffect(() => {
    User.getById(contentCreatorId)
      .then(setContentCreator)
      .catch(() => setContentCreator(null));
    Review.getReviewsByRevieweeId(contentCreatorId, UserRole.ContentCreator)
      .then(setReviews)
      .catch(() => {
        setReviews([]);
      });
  }, [contentCreatorId]);

  const openMakeOfferModal = () => {
    navigation.navigate(AuthenticatedNavigation.MakeOffer, {
      businessPeopleId: uid ?? '',
      contentCreatorId: contentCreator?.id ?? '',
    });
  };

  if (!reviews || contentCreator === undefined) {
    return <LoadingScreen />;
  }

  return (
    <PageWithBackButton fullHeight={true}>
      <View
        style={[
          flex.grow,
          flex.flexCol,
          {
            paddingTop: Math.max(safeAreaInsets.top, size.default),
            paddingBottom: Math.max(safeAreaInsets.bottom, size.large),
          },
        ]}>
        <View style={[flex.flexCol, gap.default, padding.horizontal.medium]}>
          <View style={[flex.flexRow, gap.default]}>
            <View style={[padding.left.xlarge2]}>
              <View
                style={[
                  dimension.square.xlarge3,
                  overflow.hidden,
                  rounded.medium,
                ]}>
                <FastImage
                  style={[dimension.full]}
                  source={getSourceOrDefaultAvatar({
                    uri: contentCreator?.contentCreator?.profilePicture,
                  })}
                />
              </View>
            </View>
            <View style={[flex.flex1, flex.flexCol, gap.small]}>
              <View style={[flex.flexCol]}>
                <Text
                  style={[
                    font.size[30],
                    textColor(COLOR.text.neutral.high),
                    font.weight.semibold,
                  ]}
                  numberOfLines={1}>
                  {contentCreator?.contentCreator?.fullname}
                </Text>
                <View
                  style={[
                    flex.flexRow,
                    justify.start,
                    items.center,
                    gap.xsmall,
                  ]}>
                  <RatingStarIcon size="medium" />
                  <Text
                    style={[
                      font.size[20],
                      font.weight.semibold,
                      textColor(COLOR.text.neutral.high),
                    ]}>
                    {`${
                      contentCreator?.contentCreator?.rating
                    } (${formatNumberWithSuffix(
                      contentCreator?.contentCreator?.ratedCount || 0,
                    )})` ?? 'Not rated'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={[flex.flexRow, gap.default]}>
            {contentCreator?.instagram?.username && (
              <SocialCard
                type="detail"
                platform={SocialPlatform.Instagram}
                data={contentCreator?.instagram}
              />
            )}
            {contentCreator?.tiktok?.username && (
              <SocialCard
                type="detail"
                platform={SocialPlatform.Tiktok}
                data={contentCreator?.tiktok}
              />
            )}
          </View>
        </View>
        <TabView labels={['Detail', 'Portfolio', 'Reviews']}>
          <ScrollView
            bounces={false}
            contentContainerStyle={[flex.flexCol, gap.medium, padding.large]}>
            <View style={[flex.flexCol]}>
              <Text
                style={[textColor(COLOR.text.neutral.high), font.weight.bold]}>
                About Me
              </Text>
              <Text>
                Hi there! I'm Emily, a content creator weaving stories and
                visuals in the digital realm. From crafting eye-catching
                Instagram feeds to whipping up engaging TikTok moments, I thrive
                on transforming ideas into captivating digital experiences.
                Beyond just creating content, it's about fostering connections
                and sparking meaningful conversations. With a knack for staying
                on top of trends and a commitment to authenticity, I love
                navigating the dynamic world of content creation, where each
                post is a brushstroke in my canvas of digital expression.
              </Text>
            </View>
            {contentCreator?.contentCreator?.preferences &&
              contentCreator.contentCreator.preferences.length > 0 && (
                <View>
                  <Text
                    style={[
                      textColor(COLOR.text.neutral.high),
                      font.weight.bold,
                    ]}>
                    Preferences
                  </Text>
                  {contentCreator.contentCreator.preferences.map(
                    (preference, idx) => (
                      <Text key={idx}>• {preference}</Text>
                    ),
                  )}
                </View>
              )}

            {contentCreator?.contentCreator?.preferredLocationIds &&
              contentCreator?.contentCreator?.preferredLocationIds.length >
                0 && (
                <View>
                  <Text
                    style={[
                      textColor(COLOR.text.neutral.high),
                      font.weight.bold,
                    ]}>
                    Preferred Locations
                  </Text>
                  {contentCreator.contentCreator.preferredLocationIds.map(
                    (loc, idx) => (
                      <Text key={idx}>• {loc}</Text>
                    ),
                  )}
                </View>
              )}
            {contentCreator?.contentCreator?.postingSchedules &&
              contentCreator?.contentCreator?.postingSchedules.length > 0 && (
                <View>
                  <Text
                    style={[
                      textColor(COLOR.text.neutral.high),
                      font.weight.bold,
                    ]}>
                    Posting Schedules
                  </Text>
                  {contentCreator?.contentCreator?.postingSchedules?.map(
                    (sched, idx) => (
                      <Text key={idx}>
                        • {formatDateToDayMonthYear(new Date(sched))}
                      </Text>
                    ),
                  )}
                </View>
              )}
            {contentCreator?.contentCreator?.specializedCategoryIds &&
              contentCreator?.contentCreator?.specializedCategoryIds.length >
                0 && (
                <View>
                  <Text
                    style={[
                      textColor(COLOR.text.neutral.high),
                      font.weight.bold,
                    ]}>
                    Specialized Categories
                  </Text>
                  <ScrollView
                    horizontal
                    contentContainerStyle={(flex.flexRow, gap.small)}>
                    {contentCreator?.contentCreator?.specializedCategoryIds?.map(
                      (cat, idx) => (
                        <View style={padding.top.xsmall} key={idx}>
                          <Text className="bg-primary py-1 px-2 rounded-md text-white">
                            {cat}
                          </Text>
                        </View>
                      ),
                    )}
                  </ScrollView>
                </View>
              )}
          </ScrollView>
          <ScrollView
            style={[flex.flex1, padding.horizontal.default]}
            contentContainerStyle={[flex.flex1, padding.vertical.default]}>
            <PortfolioList portfolios={portfolios} />
          </ScrollView>
          <ScrollView
            style={[flex.flex1, padding.horizontal.default]}
            contentContainerStyle={[flex.flex1, padding.vertical.default]}>
            <ReviewList reviews={reviews} />
          </ScrollView>
        </TabView>
        <View style={[padding.horizontal.default]}>
          <CustomButton text="Make Offer" onPress={openMakeOfferModal} />
        </View>
      </View>
    </PageWithBackButton>
  );
};

export default ContentCreatorDetailScreen;
