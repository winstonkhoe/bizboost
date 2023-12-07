import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {Text, View} from 'react-native';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../components/atoms/ViewPadding';
import {flex} from '../styles/Flex';
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

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.UserDetail
>;
const UserDetailScreen = ({route}: Props) => {
  const {userId} = route.params;
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    User.getUserDataReactive(userId, u => setUser(u));
  }, [userId]);

  if (!user) {
    return <Text>Error</Text>;
  }

  const onSuspendButtonClick = () => {
    if (user.status === UserStatus.Active) {
      user.status = UserStatus.Suspended;
    } else {
      user.status = UserStatus.Active;
    }

    user.updateUserData();
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
                <View
                  className="items-center"
                  style={[flex.flexRow, gap.large]}>
                  <View
                    className="w-24 h-24 overflow-hidden"
                    style={[rounded.max]}>
                    <FastImage
                      className="w-full flex-1"
                      source={
                        user.contentCreator?.profilePicture
                          ? {uri: user.contentCreator.profilePicture}
                          : require('../assets/images/bizboost-avatar.png')
                      }
                    />
                  </View>
                  <View className="flex-1 items-start" style={[flex.flexCol]}>
                    <Text className="text-base font-bold" numberOfLines={1}>
                      {/* TODO: ini cuma buat cc, bikin kondisi buat bp */}
                      {user.contentCreator?.fullname}
                    </Text>
                    <Text className="text-xs" numberOfLines={1}>
                      {user?.phone}
                    </Text>
                    <Text className="text-xs" numberOfLines={1}>
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
