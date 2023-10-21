import {Image, Button, Text, View} from 'react-native';
import {User} from '../model/User';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {ScrollView} from 'react-native';
import {flex} from '../styles/Flex';
import {useUser} from '../hooks/user';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../components/atoms/ViewPadding';
import {rounded} from '../styles/BorderRadius';
import EditIcon from '../assets/vectors/edit.svg';
import {COLOR} from '../styles/Color';
import {hex2rgba} from '../utils/color';
import {gap} from '../styles/Gap';
import {padding} from '../styles/Padding';
import {border} from '../styles/Border';
import {currencyFormat} from '../utils/currency';
import {ProfileItem} from '../components/molecules/ProfileItem';
import {AuthButton} from '../components/atoms/Button';
import auth from '@react-native-firebase/auth';

const ProfileScreen = () => {
  const {user, activeData} = useUser();
  return (
    <SafeAreaContainer>
      <ScrollView className="h-full" showsVerticalScrollIndicator={false}>
        <View className="h-full justify-between" style={[flex.flexCol]}>
          <View className="h-full" style={[flex.flexCol]}>
            <HorizontalPadding>
              <View className="w-full" style={[flex.flexCol, gap.xlarge]}>
                <View
                  className="items-center"
                  style={[flex.flexRow, gap.large]}>
                  <View
                    className="w-24 h-24 overflow-hidden"
                    style={[rounded.max]}>
                    <Image
                      className="w-full h-full"
                      source={
                        activeData?.profilePicture
                          ? {uri: activeData.profilePicture}
                          : require('../assets/images/bizboost-avatar.png')
                      }
                    />
                  </View>
                  <View className="flex-1 items-start" style={[flex.flexCol]}>
                    <Text className="text-base font-bold" numberOfLines={1}>
                      {activeData?.fullname}
                    </Text>
                    <Text className="text-xs" numberOfLines={1}>
                      {user?.phone}
                    </Text>
                    <Text className="text-xs" numberOfLines={1}>
                      {user?.email}
                    </Text>
                  </View>
                  <View
                    className="justify-center"
                    style={[flex.flexCol, padding.default]}>
                    <EditIcon
                      width={14}
                      height={14}
                      color={hex2rgba({hex: COLOR.black, alpha: 0.6})}
                    />
                  </View>
                </View>
                <HorizontalPadding paddingSize="medium">
                  <View
                    className="items-start"
                    style={[
                      flex.flexCol,
                      padding.small,
                      rounded.default,
                      border({
                        borderWidth: 2,
                        color: COLOR.black,
                        opacity: 0.7,
                      }),
                    ]}>
                    <Text className="text-xs font-medium">Balance</Text>
                    <Text className="text-base font-extrabold">
                      {currencyFormat(1500000000)}
                    </Text>
                  </View>
                </HorizontalPadding>
              </View>
            </HorizontalPadding>
            <VerticalPadding paddingSize="medium">
              <View className="w-full" style={[flex.flexCol]}>
                {[...Array(6)].map((_item: any, index: number) => (
                  <ProfileItem
                    key={index}
                    itemLabel="My Campaigns"
                    itemAdditionalInfo="22 campaigns"
                  />
                ))}
              </View>
            </VerticalPadding>
          </View>
          <HorizontalPadding>
            <AuthButton
              onPress={() => {
                User.signOut();
              }}
              rounded="default"
              text="Sign out"
            />
          </HorizontalPadding>
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default ProfileScreen;
