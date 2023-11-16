import {Pressable, Text, View} from 'react-native';
import {User} from '../model/User';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {ScrollView} from 'react-native';
import {flex} from '../styles/Flex';
import {useUser} from '../hooks/user';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {rounded} from '../styles/BorderRadius';
import LogoutIcon from '../assets/vectors/logout.svg';
import TransactionIcon from '../assets/vectors/transaction.svg';
import AboutIcon from '../assets/vectors/about.svg';
import MoneyIcon from '../assets/vectors/money.svg';
import AddIcon from '../assets/vectors/add-thick.svg';
import {COLOR} from '../styles/Color';
import {gap} from '../styles/Gap';
import {padding} from '../styles/Padding';
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
                        width={25}
                        height={25}
                        stroke={COLOR.red[50]}
                        strokeWidth={3}
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
                  <ProfileMenuCard
                    handleOnClick={() => {
                      console.log('masuk');
                    }}
                    icon={
                      <TransactionIcon
                        fill={'#72B3FF'}
                        height={80}
                        width={80}
                      />
                    }
                    title="My Transactions"
                    subtitle={`5 Ongoing
11 Finished`}
                  />
                  <ProfileMenuCard
                    handleOnClick={() => {
                      console.log('masuk');
                    }}
                    icon={<AboutIcon fill={'#FB8A2E'} height={80} width={80} />}
                    title="About Me"
                    subtitle={'Edit Information people see on your profile'}
                  />
                  <ProfileMenuCard
                    handleOnClick={() => {
                      console.log('masuk');
                    }}
                    icon={
                      <MoneyIcon
                        fill={COLOR.green[50]}
                        height={80}
                        width={80}
                      />
                    }
                    title="Withdraw Money"
                    subtitle={`2 Transactions ready to be withdrawn`}
                  />
                  <ProfileMenuCard
                    handleOnClick={() => {
                      console.log('masuk');
                    }}
                    icon={
                      <AddIcon fill={COLOR.red[40]} height={80} width={80} />
                    }
                    title="Upload Video"
                    subtitle={`Add more videos to promote yourself.`}
                  />
                </View>
              </HorizontalPadding>
            </View>
          </View>
        </SafeAreaContainer>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
