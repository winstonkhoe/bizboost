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
import {formatDateToDayMonthYear, formatDateToTime12Hrs} from '../utils/date';
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
import {DateIcon, RatingStarIcon} from '../components/atoms/Icon';
import {overflow} from '../styles/Overflow';
import {formatNumberWithSuffix} from '../utils/number';
import {border} from '../styles/Border';
import StatusTag, {StatusType} from '../components/atoms/StatusTag';
import LocationTag from '../components/atoms/LocationTag';

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
              <Text>{contentCreator?.contentCreator?.biodata || '-'}</Text>
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
                  <View
                    style={[
                      flex.flexRow,
                      flex.wrap,
                      items.center,
                      gap.default,
                      padding.top.small,
                    ]}>
                    {contentCreator?.contentCreator?.preferredLocationIds?.map(
                      (loc, idx) => (
                        <View style={padding.top.xsmall} key={idx}>
                          <LocationTag text={loc} />
                        </View>
                      ),
                    )}
                  </View>
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
                  <View
                    style={[
                      flex.flexRow,
                      flex.wrap,
                      items.center,
                      gap.default,
                      padding.top.small,
                    ]}
                    className="w-full">
                    {contentCreator?.contentCreator?.postingSchedules?.map(
                      (sched, idx) => (
                        <View
                          key={idx}
                          style={[
                            flex.flexRow,
                            gap.small,
                            items.center,
                            rounded.small,
                            padding.vertical.xsmall,
                            padding.horizontal.small,
                            border({
                              borderWidth: 1,
                              color: COLOR.green[50],
                            }),
                          ]}>
                          <DateIcon
                            width={20}
                            height={20}
                            color={COLOR.green[50]}
                          />
                          <Text
                            className="font-semibold"
                            style={[textColor(COLOR.green[60]), font.size[30]]}>
                            {formatDateToTime12Hrs(new Date(sched))}
                          </Text>
                        </View>
                      ),
                    )}
                  </View>
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
                  <View
                    style={[
                      flex.flexRow,
                      flex.wrap,
                      items.center,
                      gap.default,
                      padding.top.small,
                    ]}>
                    {contentCreator?.contentCreator?.specializedCategoryIds?.map(
                      (cat, idx) => (
                        <View style={padding.top.xsmall} key={idx}>
                          <StatusTag
                            status={cat}
                            fontSize={30}
                            statusType={StatusType.success}
                          />
                        </View>
                      ),
                    )}
                  </View>
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
