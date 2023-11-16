import {Pressable, Text, View} from 'react-native';
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
import LogoutIcon from '../assets/vectors/logout.svg';
import TransactionIcon from '../assets/vectors/transaction.svg';
import {COLOR} from '../styles/Color';
import {hex2rgba} from '../utils/color';
import {gap} from '../styles/Gap';
import {padding} from '../styles/Padding';
import {border} from '../styles/Border';
import {currencyFormat} from '../utils/currency';
import {ProfileItem} from '../components/molecules/ProfileItem';
import {CustomButton} from '../components/atoms/Button';
import {useAppDispatch} from '../redux/hooks';
import {disableAccess} from '../redux/slices/authSlice';
import FastImage from 'react-native-fast-image';
import ProfileMenuCard from '../components/molecules/ProfileMenuCard';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const {user, activeData, activeRole} = useUser();
  return (
    <View className="flex-1">
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        showsVerticalScrollIndicator={false}>
        <SafeAreaContainer enable>
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
                      <FastImage
                        className="w-full flex-1"
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
                        {user?.email}
                      </Text>
                      <Text className="text-xs text-gray-500" numberOfLines={1}>
                        {activeRole}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        User.signOut()
                          .then(() => dispatch(disableAccess()))
                          .catch(err => console.log('logout error', err));
                      }}
                      className="justify-center"
                      style={[flex.flexCol, padding.default]}>
                      <LogoutIcon
                        width={20}
                        height={20}
                        stroke={COLOR.red[50]}
                        strokeWidth={2}
                      />
                    </Pressable>
                  </View>
                  {/* TODO: bikin komponen tab samain sama cc detail*/}
                  <View style={flex.flexRow} className="py-3 ">
                    <Pressable
                      style={flex.flexRow}
                      className={`${'bg-primary'} w-1/2 rounded-l-md p-2 justify-center items-center text-center`}
                      onPress={() => {}}>
                      <Text className={`${'text-white'}`}>Info</Text>
                    </Pressable>
                    <Pressable
                      style={flex.flexRow}
                      className={`${'border border-zinc-200'} w-1/2 rounded-r-md p-2 justify-center items-center text-center`}
                      onPress={() => {}}>
                      <Text className={`${'text-black'}`}>Portfolio</Text>
                    </Pressable>
                  </View>
                </View>
                <View className="flex flex-row flex-wrap justify-between items-center">
                  <View className="w-[45%] my-2 mx-1">
                    <ProfileMenuCard
                      icon={
                        <TransactionIcon
                          fill={COLOR.green[50]}
                          height={80}
                          width={80}
                        />
                      }
                      title="My Transactions"
                      subtitle={`5 Ongoing
11 Finished`}
                    />
                  </View>
                  <View className="w-[45%] my-2 mx-1">
                    <Text>asd</Text>
                  </View>
                  <View className="w-[45%] my-2 mx-1">
                    <Text>asd</Text>
                  </View>
                  {/* <View className="w-[40%] my-2 mx-1">
                    <Text>asd</Text>
                  </View> */}
                </View>
              </HorizontalPadding>
            </View>
            {/* <VerticalPadding>
              <HorizontalPadding>
                <CustomButton
                  onPress={() => {
                    User.signOut()
                      .then(() => dispatch(disableAccess()))
                      .catch(err => console.log('logout error', err));
                  }}
                  rounded="default"
                  text="Sign out"
                />
              </HorizontalPadding>
            </VerticalPadding> */}
          </View>
        </SafeAreaContainer>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
