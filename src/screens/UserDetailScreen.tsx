import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {Pressable, Text, View} from 'react-native';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../components/atoms/ViewPadding';
import {flex, items} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {rounded} from '../styles/BorderRadius';
import {CustomButton} from '../components/atoms/Button';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {SocialPlatform, User, UserRole, UserStatus} from '../model/User';
import {COLOR} from '../styles/Color';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {ProfileItem} from '../components/molecules/ProfileItem';
import {HomeSectionHeader} from '../components/molecules/SectionHeader';
import InstagramLogo from '../assets/vectors/instagram.svg';
import TikTokLogo from '../assets/vectors/tiktok.svg';
import FastImage from 'react-native-fast-image';
import {getSourceOrDefaultAvatar} from '../utils/asset';
import {font, fontSize} from '../styles/Font';
import {textColor} from '../styles/Text';
import {dimension} from '../styles/Dimension';
import {ChevronRight} from '../components/atoms/Icon';
import {formatDateToTime12Hrs} from '../utils/date';
import {padding} from '../styles/Padding';
import {Campaign} from '../model/Campaign';
import {OngoingCampaignCard} from '../components/molecules/OngoingCampaignCard';
import {Transaction, TransactionStatus} from '../model/Transaction';
import {useNavigation} from '@react-navigation/native';
import {SocialCard} from '../components/atoms/SocialCard';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.UserDetail
>;

// TODO: apa CC & BP detail screen samain aja sm ini ya? tp jd banyak kondisi
// TODO: portfolio cc blm ada
const UserDetailScreen = ({route}: Props) => {
  const {userId} = route.params;
  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contentCreatorTransactions, setContentCreatorTransactions] =
    useState<Transaction[]>();
  const [businessPeopleTransactions, setBusinessPeopleTransactions] =
    useState<Transaction[]>();
  const navigation = useNavigation<NavigationStackProps>();

  useEffect(() => {
    Campaign.getUserCampaigns(userId)
      .then(value => setCampaigns(value))
      .catch(() => setCampaigns([]));
  }, [userId]);
  useEffect(() => {
    return User.getUserDataReactive(userId, u => setUser(u));
  }, [userId]);
  useEffect(() => {
    return Transaction.getAllTransactionsByRole(
      userId,
      UserRole.ContentCreator,
      setContentCreatorTransactions,
    );
  }, [userId]);

  useEffect(() => {
    return Transaction.getAllTransactionsByRole(
      userId,
      UserRole.BusinessPeople,
      setBusinessPeopleTransactions,
    );
  }, [userId]);

  if (!user) {
    return <Text>Error</Text>;
  }

  // TODO: show success message
  const onSuspendButtonClick = async () => {
    if (user.status === UserStatus.Active) {
      await user.suspend();
    } else if (user.status === UserStatus.Suspended) {
      await user.activate();
    }
  };
  return (
    <PageWithBackButton enableSafeAreaContainer>
      <View
        className="flex-1 justify-between pt-4"
        style={[flex.flexCol, gap.medium, padding.horizontal.default]}>
        <View className="flex-1" style={[flex.flexCol]}>
          <View className="w-full" style={[flex.flexCol, gap.xlarge]}>
            <View style={[flex.flexRow, gap.large, items.center]}>
              <View className="relative">
                <View
                  className="overflow-hidden bg-white"
                  style={[rounded.max, dimension.square.xlarge4]}>
                  <FastImage
                    className="w-full flex-1"
                    source={getSourceOrDefaultAvatar({
                      uri: user.contentCreator?.fullname
                        ? user.contentCreator?.profilePicture
                        : user.businessPeople?.profilePicture,
                    })}
                  />
                </View>
                {user.contentCreator?.fullname &&
                user.businessPeople?.fullname ? (
                  <View
                    className="overflow-hidden absolute left-5 bg-white"
                    style={[rounded.max, dimension.square.xlarge4]}>
                    <FastImage
                      className="w-full flex-1"
                      source={getSourceOrDefaultAvatar({
                        uri: user.businessPeople?.profilePicture,
                      })}
                    />
                  </View>
                ) : (
                  <></>
                )}
              </View>
              <View className="flex-1 items-start" style={[flex.flexCol]}>
                <Text
                  className="font-bold"
                  style={[{fontSize: fontSize[30]}]}
                  numberOfLines={1}>
                  {/* TODO: ini cuma buat cc, bikin kondisi buat bp */}
                  {user.contentCreator?.fullname}
                  {user.contentCreator?.fullname &&
                  user.businessPeople?.fullname
                    ? ' · '
                    : ''}
                  {user.businessPeople?.fullname}
                </Text>
                <Text
                  style={[
                    {fontSize: fontSize[20]},
                    textColor(COLOR.text.neutral.med),
                  ]}
                  numberOfLines={1}>
                  {`${user.contentCreator?.fullname ? 'Content Creator' : ''}${
                    user.contentCreator?.fullname &&
                    user.businessPeople?.fullname
                      ? ' · '
                      : ''
                  }${user.businessPeople?.fullname ? 'Business People' : ''}`}
                </Text>
                <Text
                  style={[
                    {fontSize: fontSize[20]},
                    textColor(COLOR.text.neutral.med),
                  ]}
                  numberOfLines={1}>
                  {user?.phone}
                </Text>
                <Text
                  style={[
                    {fontSize: fontSize[20]},
                    textColor(COLOR.text.neutral.med),
                  ]}
                  numberOfLines={1}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={[flex.flexRow, gap.default]}>
          {user.instagram?.username && (
            <SocialCard
              type="detail"
              platform={SocialPlatform.Instagram}
              data={user?.instagram}
            />
          )}
          {user?.tiktok?.username && (
            <SocialCard
              type="detail"
              platform={SocialPlatform.Tiktok}
              data={user?.tiktok}
            />
          )}
        </View>
        {user.contentCreator?.fullname && (
          <>
            <View className="border-t border-gray-400 pt-4">
              <HomeSectionHeader header="Content Creator Information" />
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text
                className="font-medium"
                style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
                Max Content Revisions
              </Text>
              <View
                className="flex flex-row items-center"
                style={[gap.default]}>
                <Text
                  style={[textColor(COLOR.text.neutral.low), font.size[20]]}>
                  {user?.contentCreator?.contentRevisionLimit || 0} times
                </Text>
                {/* <ChevronRight color={COLOR.black[20]} /> */}
              </View>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text
                className="font-medium"
                style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
                Posting Schedules
              </Text>
              <View
                className="flex flex-row items-center"
                style={[gap.default]}>
                <Text
                  style={[textColor(COLOR.text.neutral.low), font.size[20]]}>
                  {user?.contentCreator?.postingSchedules.at(0)
                    ? formatDateToTime12Hrs(
                        new Date(user?.contentCreator?.postingSchedules.at(0)!),
                      )
                    : 'None'}
                  {(user?.contentCreator?.postingSchedules.length || -1) > 1 &&
                    `, and ${
                      user?.contentCreator?.postingSchedules.length! - 1
                    } more`}
                </Text>
                {/* <ChevronRight color={COLOR.black[20]} /> */}
              </View>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text
                className="font-medium"
                style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
                Preferences
              </Text>
              <View
                className="flex flex-row items-center justify-end"
                style={[gap.default]}>
                <View className="w-1/2 flex flex-row items-center justify-end">
                  <Text
                    className="overflow-hidden text-right"
                    numberOfLines={1}
                    style={[textColor(COLOR.text.neutral.low), font.size[20]]}>
                    {user?.contentCreator?.preferences.at(0)
                      ? user?.contentCreator?.preferences.at(0)
                      : 'None'}
                  </Text>
                  <Text
                    style={[textColor(COLOR.text.neutral.low), font.size[20]]}>
                    {(user?.contentCreator?.preferences.length || -1) > 1 &&
                      `, and ${
                        user?.contentCreator?.preferences.length! - 1
                      } more`}
                  </Text>
                </View>
                {/* <ChevronRight color={COLOR.black[20]} /> */}
              </View>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text
                className="font-medium"
                style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
                Preferred Locations
              </Text>
              <View
                className="flex flex-row items-center justify-end"
                style={[gap.default]}>
                <View className="w-1/2 flex flex-row items-center justify-end">
                  <Text
                    className="overflow-hidden text-right"
                    numberOfLines={1}
                    style={[textColor(COLOR.text.neutral.low), font.size[20]]}>
                    {user?.contentCreator?.preferredLocationIds.at(0)
                      ? user?.contentCreator?.preferredLocationIds.at(0)
                      : 'None'}
                  </Text>
                  <Text
                    style={[textColor(COLOR.text.neutral.low), font.size[20]]}>
                    {(user?.contentCreator?.preferredLocationIds.length || -1) >
                      1 &&
                      `, and ${
                        user?.contentCreator?.preferredLocationIds.length! - 1
                      } more`}
                  </Text>
                </View>
                {/* <ChevronRight color={COLOR.black[20]} /> */}
              </View>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text
                className="font-medium"
                style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
                Specialized Categories
              </Text>
              <View
                className="flex flex-row items-center justify-end"
                style={[gap.default]}>
                <View className="w-1/2 flex flex-row items-center justify-end">
                  <Text
                    className="overflow-hidden text-right"
                    numberOfLines={1}
                    style={[textColor(COLOR.text.neutral.low), font.size[20]]}>
                    {user?.contentCreator?.specializedCategoryIds.at(0)
                      ? user?.contentCreator?.specializedCategoryIds.at(0)
                      : 'None'}
                  </Text>
                  <Text
                    style={[textColor(COLOR.text.neutral.low), font.size[20]]}>
                    {(user?.contentCreator?.specializedCategoryIds.length ||
                      -1) > 1 &&
                      `, and ${
                        user?.contentCreator?.specializedCategoryIds.length! - 1
                      } more`}
                  </Text>
                </View>
                {/* <ChevronRight color={COLOR.black[20]} /> */}
              </View>
            </View>
          </>
        )}

        {user.businessPeople?.fullname && (
          <>
            <View className="border-t border-gray-400 pt-4">
              <HomeSectionHeader
                header="Business People Campaigns"
                link={'See All'}
                onPressLink={() => {
                  navigation.navigate(AuthenticatedNavigation.MyCampaigns, {
                    userId: userId || '',
                  });
                }}
              />
            </View>
            <View style={[flex.flexCol, gap.medium]}>
              {campaigns.slice(0, 3).map((c, index) => (
                <OngoingCampaignCard campaign={c} key={index} />
              ))}
            </View>
          </>
        )}

        <>
          <View className="border-t border-gray-400 pt-4">
            <HomeSectionHeader header="Transactions" />
          </View>
          <Pressable
            className="flex flex-row items-center justify-between"
            onPress={() => {
              navigation.navigate(AuthenticatedNavigation.MyTransactions, {
                userId: userId,
                role: UserRole.ContentCreator,
              });
            }}>
            <Text
              className="font-medium"
              style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
              as a Content Creator
            </Text>
            <View
              className="flex flex-row items-center justify-end"
              style={[gap.default]}>
              <View className="flex flex-row items-center justify-end">
                {/* TODO: bingung sih jumlahnya, perlu total apa ga ya */}
                <Text
                  className="overflow-hidden text-right"
                  numberOfLines={1}
                  style={[textColor(COLOR.text.neutral.low), font.size[20]]}>
                  {contentCreatorTransactions?.length} (
                  {
                    contentCreatorTransactions?.filter(
                      t =>
                        t.status !== TransactionStatus.completed &&
                        t.status !== TransactionStatus.terminated,
                    ).length
                  }{' '}
                  Ongoing,{' '}
                  {
                    contentCreatorTransactions?.filter(
                      t => t.status === TransactionStatus.completed,
                    ).length
                  }{' '}
                  Completed)
                </Text>
              </View>
              <ChevronRight color={COLOR.black[30]} />
            </View>
          </Pressable>
          <Pressable
            className="flex flex-row items-center justify-between"
            onPress={() => {
              navigation.navigate(AuthenticatedNavigation.MyTransactions, {
                userId: userId,
                role: UserRole.BusinessPeople,
              });
            }}>
            <Text
              className="font-medium"
              style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
              as a Business People
            </Text>
            <View
              className="flex flex-row items-center justify-end"
              style={[gap.default]}>
              <View className="flex flex-row items-center justify-end">
                <Text
                  className="overflow-hidden text-right"
                  numberOfLines={1}
                  style={[textColor(COLOR.text.neutral.low), font.size[20]]}>
                  {businessPeopleTransactions?.length} (
                  {
                    businessPeopleTransactions?.filter(
                      t =>
                        t.status !== TransactionStatus.completed &&
                        t.status !== TransactionStatus.terminated,
                    ).length
                  }{' '}
                  Ongoing,{' '}
                  {
                    businessPeopleTransactions?.filter(
                      t => t.status === TransactionStatus.completed,
                    ).length
                  }{' '}
                  Completed)
                </Text>
              </View>
              <ChevronRight color={COLOR.black[30]} />
            </View>
          </Pressable>
        </>
        <CustomButton
          onPress={onSuspendButtonClick}
          customBackgroundColor={
            user.status === UserStatus.Active
              ? {
                  default: COLOR.background.danger.high,
                  disabled: COLOR.background.danger.disabled,
                }
              : undefined
          }
          rounded="default"
          text={user.status === UserStatus.Active ? 'Suspend' : 'Reactivate'}
        />
      </View>
    </PageWithBackButton>
  );
};

export default UserDetailScreen;
