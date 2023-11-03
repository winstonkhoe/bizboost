import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {Text, View} from 'react-native';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../components/atoms/ViewPadding';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {rounded} from '../styles/BorderRadius';
import {Image} from 'react-native';
import {CustomButton} from '../components/atoms/Button';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
} from '../navigation/StackNavigation';
import {User, UserStatus} from '../model/User';
import {COLOR} from '../styles/Color';
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

    User.updateUserData(user.id || '', user);
  };
  return (
    <View className="flex-1">
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        showsVerticalScrollIndicator={false}>
        <SafeAreaContainer>
          <View className="flex-1 justify-between" style={[flex.flexCol]}>
            <View className="flex-1" style={[flex.flexCol]}>
              <HorizontalPadding>
                <View className="w-full" style={[flex.flexCol, gap.xlarge]}>
                  <View
                    className="items-center"
                    style={[flex.flexRow, gap.large]}>
                    <View
                      className="w-24 h-24 overflow-hidden"
                      style={[rounded.max]}>
                      <Image
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
                <CustomButton
                  onPress={onSuspendButtonClick}
                  customBackgroundColor={
                    user.status === UserStatus.Active
                      ? COLOR.background.danger
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
        </SafeAreaContainer>
      </ScrollView>
    </View>
  );
};

export default UserDetailScreen;
