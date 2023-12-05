import {Pressable, Text, View} from 'react-native';
import {User, UserRole} from '../model/User';
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
import CampaignIcon from '../assets/vectors/campaign-outline.svg';
import {COLOR} from '../styles/Color';
import {gap} from '../styles/Gap';
import {padding} from '../styles/Padding';
import {useAppDispatch} from '../redux/hooks';
import {disableAccess} from '../redux/slices/authSlice';
import FastImage from 'react-native-fast-image';
import ProfileMenuCard from '../components/molecules/ProfileMenuCard';
import {useNavigation} from '@react-navigation/native';
import Edit from '../assets/vectors/edit.svg';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {useEffect, useRef, useState} from 'react';
import {Transaction, TransactionStatus} from '../model/Transaction';
import PagerView from 'react-native-pager-view';
import {Content} from '../model/Content';
import {background} from '../styles/BackgroundColor';
import {MediaUploader} from '../components/atoms/Input';
import {Campaign, CampaignType} from '../model/Campaign';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const {user, activeData, activeRole, uid} = useUser();
  const navigation = useNavigation<NavigationStackProps>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ongoingTransactionsCount, setOngoingTransactionsCount] = useState(0);
  const [publicCampaignsCount, setPublicCampaignsCount] = useState(0);
  const pagerViewRef = useRef<PagerView>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contents, setContents] = useState<Content[]>();

  useEffect(() => {
    // TODO: gatau ini mestinya gabung sama yang di dalem modal transactionsnya apa ngga biar fetch skali? tp kalo kek gitu gabisa dua"nya ngelisten, jadinya cuma salah satu, krn behaviour si modal kan navigate yaa
    const unsubscribeTransaction = Transaction.getAllTransactionsByRole(
      uid || '',
      activeRole,
      t => setTransactions(t),
    );

    const unsubscribeCampaign = Campaign.getUserCampaignsReactive(
      uid || '',
      c => {
        setCampaigns(c);
      },
    );

    // TODO: ini juga bakal butuh dibuat .onSnapshot kyknya nantinya
    Content.getByUserId(uid || '').then(content => {
      setContents(content);
    });

    return () => {
      // TODO: kyknya yang bener kayak campaign aja, di transaction tiap catch eror masih ngethrow lagi, kyknya nanti hapus aja thrownya tktnya bikin ribet
      unsubscribeTransaction();
      if (unsubscribeCampaign) unsubscribeCampaign();
    };
  }, [uid, activeRole]);

  useEffect(() => {
    // TODO: ongoing berarti ga rejected dan ga done, kalo finished berarti total transaction minus ini.
    setOngoingTransactionsCount(
      transactions.filter(
        t =>
          t.status !== TransactionStatus.registrationRejected &&
          t.status !== TransactionStatus.done,
      ).length,
    );
  }, [transactions]);

  useEffect(() => {
    setPublicCampaignsCount(
      campaigns.filter(c => c.type === CampaignType.Public).length,
    );
  }, [campaigns]);

  const goToInfoTab = () => {
    pagerViewRef.current?.setPage(0);
    setSelectedTab(0);
  };

  const goToPortfolioTab = () => {
    pagerViewRef.current?.setPage(1);
    setSelectedTab(1);
  };

  const onProfilePictureChanged = (url: string) => {
    if (!user) {
      return;
    }
    const updatedUser: User = new User({...user});

    updatedUser.updateProfilePicture(activeRole, url);
  };

  return (
    <View className="flex-1">
      <ScrollView
        bounces={false}
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
                    <MediaUploader
                      targetFolder="profile-pictures"
                      options={{
                        width: 400,
                        height: 400,
                        cropping: true,
                        includeBase64: true,
                      }}
                      showUploadProgress
                      onUploadSuccess={onProfilePictureChanged}>
                      <View className="relative">
                        <View
                          className="w-20 h-20 overflow-hidden"
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
                        <View
                          className="absolute bottom-0 right-1 p-2 rounded-full"
                          style={[background(COLOR.background.green.med)]}>
                          <Edit width={13} height={13} color={'white'} />
                        </View>
                      </View>
                    </MediaUploader>

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
                </View>
                {/* TODO: bikin komponen tab samain sama cc detail*/}
                <View style={flex.flexRow} className="py-3 ">
                  <Pressable
                    style={flex.flexRow}
                    className={`${
                      selectedTab === 0
                        ? 'bg-primary'
                        : 'border border-zinc-200'
                    } rounded-l-md p-2 justify-center items-center text-center w-1/2`}
                    onPress={goToInfoTab}>
                    <Text
                      className={`${
                        selectedTab === 0 ? 'text-white' : 'text-black'
                      }`}>
                      Info
                    </Text>
                  </Pressable>
                  <Pressable
                    style={flex.flexRow}
                    className={`${
                      selectedTab === 1
                        ? 'bg-primary'
                        : 'border border-zinc-200'
                    } rounded-r-md p-2 justify-center items-center text-center w-1/2`}
                    onPress={goToPortfolioTab}>
                    <Text
                      className={`${
                        selectedTab === 1 ? 'text-white' : 'text-black'
                      }`}>
                      Portfolio
                    </Text>
                  </Pressable>
                </View>

                <PagerView
                  ref={pagerViewRef}
                  className="w-full h-full"
                  style={[flex.flexCol]}
                  initialPage={selectedTab}
                  onPageSelected={e => {
                    setSelectedTab(e.nativeEvent.position);
                  }}>
                  <View key="1">
                    <View className="flex flex-row flex-wrap justify-between items-center">
                      <ProfileMenuCard
                        handleOnClick={() => {
                          navigation.navigate(
                            AuthenticatedNavigation.MyTransactions,
                          );
                        }}
                        icon={
                          <TransactionIcon
                            fill={'#72B3FF'}
                            height={80}
                            width={80}
                          />
                        }
                        title="My Transactions"
                        subtitle={`${ongoingTransactionsCount} Ongoing\n${
                          transactions.length - ongoingTransactionsCount
                        } Finished`}
                      />
                      <ProfileMenuCard
                        handleOnClick={() => {
                          navigation.navigate(AuthenticatedNavigation.AboutMe);
                        }}
                        icon={
                          <AboutIcon fill={'#FB8A2E'} height={80} width={80} />
                        }
                        title="About Me"
                        subtitle={'Edit Information people see on your profile'}
                      />
                      {/* TODO: ini kayaknya ga perlu lagi */}
                      {activeRole === UserRole.BusinessPeople && (
                        <ProfileMenuCard
                          handleOnClick={() => {
                            navigation.navigate(
                              AuthenticatedNavigation.PayContentCreator,
                            );
                          }}
                          icon={
                            <MoneyIcon
                              fill={COLOR.green[50]}
                              height={80}
                              width={80}
                            />
                          }
                          title={'Pay Content Creator'}
                          subtitle={'0 Pending Payment'}
                        />
                      )}
                      {activeRole === UserRole.ContentCreator && (
                        <ProfileMenuCard
                          handleOnClick={() => {
                            navigation.navigate(
                              AuthenticatedNavigation.WithdrawMoney,
                            );
                          }}
                          icon={
                            <MoneyIcon
                              fill={COLOR.green[50]}
                              height={80}
                              width={80}
                            />
                          }
                          title={'Withdraw Money'}
                          subtitle={'2 Transactions ready to be withdrawn'}
                        />
                      )}
                      {activeRole === UserRole.ContentCreator && (
                        <ProfileMenuCard
                          handleOnClick={() => {
                            navigation.navigate(
                              AuthenticatedNavigation.UploadVideo,
                            );
                          }}
                          icon={
                            <AddIcon
                              fill={COLOR.red[40]}
                              height={80}
                              width={80}
                            />
                          }
                          title="Upload Video"
                          subtitle={'Add more videos to promote yourself.'}
                        />
                      )}

                      {activeRole === UserRole.BusinessPeople && (
                        <ProfileMenuCard
                          handleOnClick={() => {
                            navigation.navigate(
                              AuthenticatedNavigation.MyCampaigns,
                            );
                          }}
                          icon={
                            <CampaignIcon
                              fill={'#72B3FF'}
                              height={80}
                              width={80}
                            />
                          }
                          title="My Campaigns"
                          subtitle={`${publicCampaignsCount} Public\n${
                            campaigns.length - publicCampaignsCount
                          } Private`}
                        />
                      )}
                    </View>
                  </View>
                  <View key="2">
                    <View style={[flex.flexRow, gap.default]}>
                      <View
                        style={[
                          flex.flex1,
                          flex.growShrink,
                          flex.flexCol,
                          gap.default,
                        ]}>
                        {contents?.map(
                          (content, idx) =>
                            idx % 2 === 0 && (
                              <Pressable
                                key={content.id}
                                onPress={() => {
                                  navigation.navigate(
                                    AuthenticatedNavigation.SpecificExploreModal,
                                    {
                                      contentCreatorId: uid || '',
                                      targetContentId: content.id,
                                    },
                                  );
                                }}>
                                <FastImage
                                  source={{uri: content.thumbnail}}
                                  style={{
                                    height: 200,
                                    borderRadius: 10,
                                  }}
                                />
                              </Pressable>
                            ),
                        )}
                      </View>
                      <View
                        style={[
                          flex.flex1,
                          flex.growShrink,
                          flex.flexCol,
                          gap.default,
                        ]}>
                        {contents?.map(
                          (content, idx) =>
                            idx % 2 !== 0 && (
                              <Pressable
                                key={content.id}
                                onPress={() => {
                                  navigation.navigate(
                                    AuthenticatedNavigation.SpecificExploreModal,
                                    {
                                      contentCreatorId: uid || '',
                                      targetContentId: content.id,
                                    },
                                  );
                                }}>
                                <FastImage
                                  source={{uri: content.thumbnail}}
                                  style={{
                                    height: 200,
                                    borderRadius: 10,
                                  }}
                                />
                              </Pressable>
                            ),
                        )}
                      </View>
                    </View>
                  </View>
                </PagerView>
              </HorizontalPadding>
            </View>
          </View>
        </SafeAreaContainer>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
