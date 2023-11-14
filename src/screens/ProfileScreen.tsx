import {Image, Text, View} from 'react-native';
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
import {CustomButton} from '../components/atoms/Button';
import {useAppDispatch} from '../redux/hooks';
import {disableAccess} from '../redux/slices/authSlice';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const {user, activeData} = useUser();
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
                      <Image
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
                        color={hex2rgba({hex: COLOR.black[100], alpha: 0.6})}
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
                          color: COLOR.black[100],
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
            <VerticalPadding>
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
            </VerticalPadding>
          </View>
        </SafeAreaContainer>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
