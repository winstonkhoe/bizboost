import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {Text, View} from 'react-native';
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
} from '../navigation/StackNavigation';
import {User, UserStatus} from '../model/User';
import {COLOR} from '../styles/Color';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {ProfileItem} from '../components/molecules/ProfileItem';
import {HomeSectionHeader} from '../components/molecules/SectionHeader';
import InstagramLogo from '../assets/vectors/instagram.svg';
import TikTokLogo from '../assets/vectors/tiktok.svg';
import FastImage from 'react-native-fast-image';
import {getSourceOrDefaultAvatar} from '../utils/asset';
import {fontSize} from '../styles/Font';
import {textColor} from '../styles/Text';
import {dimension} from '../styles/Dimension';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.UserDetail
>;

// TODO: apa CC detail screen samain aja sm ini ya
const UserDetailScreen = ({route}: Props) => {
  const {userId} = route.params;
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    User.getUserDataReactive(userId, u => setUser(u));
  }, [userId]);

  if (!user) {
    return <Text>Error</Text>;
  }

  const onSuspendButtonClick = async () => {
    if (user.status === UserStatus.Active) {
      await user.suspend();
    }
    if (user.status === UserStatus.Suspended) {
      await user.activate();
    }
  };
  return (
    <PageWithBackButton enableSafeAreaContainer>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-between pt-4" style={[flex.flexCol]}>
          <View className="flex-1" style={[flex.flexCol]}>
            <HorizontalPadding>
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
                      {`${
                        user.contentCreator?.fullname ? 'Content Creator' : ''
                      }${
                        user.contentCreator?.fullname &&
                        user.businessPeople?.fullname
                          ? ' · '
                          : ''
                      }${
                        user.businessPeople?.fullname ? 'Business People' : ''
                      }`}
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
            </HorizontalPadding>
          </View>

          <VerticalPadding>
            <HorizontalPadding>
              <View className="w-full" style={[flex.flexCol]}>
                <HomeSectionHeader header="Transactions" link="See All" />

                {[...Array(6)].map((_item: any, index: number) => (
                  <ProfileItem
                    key={index}
                    itemLabel="My Campaigns"
                    itemAdditionalInfo="22 campaigns"
                  />
                ))}
              </View>
            </HorizontalPadding>
          </VerticalPadding>

          <HorizontalPadding>
            <View className="flex flex-row items-center justify-around w-full">
              <View className=" flex flex-col border border-gray-200 py-4 px-8 rounded-lg">
                <View className="flex flex-row mb-2 items-center">
                  <InstagramLogo width={20} height={20} />
                  <Text className={'font-semibold ml-1'}>Instagram</Text>
                </View>
                <Text className="text-gray-500 mb-1">@username</Text>
                <Text className="text-gray-500">
                  Followers: <Text className="font-bold">100</Text>
                </Text>
              </View>

              <View className=" flex flex-col border border-gray-200 py-4 px-8 rounded-lg">
                <View className="flex flex-row mb-2 items-center">
                  <TikTokLogo width={20} height={20} />
                  <Text className={'font-semibold ml-1'}>TikTok</Text>
                </View>
                <Text className="text-gray-500 mb-1">@username</Text>
                <Text className="text-gray-500">
                  Followers: <Text className="font-bold">100</Text>
                </Text>
              </View>
            </View>
          </HorizontalPadding>

          <VerticalPadding>
            <HorizontalPadding>
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
                text={
                  user.status === UserStatus.Active ? 'Suspend' : 'Reactivate'
                }
              />
            </HorizontalPadding>
          </VerticalPadding>
        </View>
      </ScrollView>
    </PageWithBackButton>
  );
};

export default UserDetailScreen;
