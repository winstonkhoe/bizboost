import {Dimensions, Pressable, Text, View} from 'react-native';
import {User, UserRole} from '../model/User';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {ScrollView} from 'react-native';
import {flex, items, justify} from '../styles/Flex';
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
import {Portfolio} from '../model/Portfolio';
import {background} from '../styles/BackgroundColor';
import {MediaUploader} from '../components/atoms/Input';
import {Campaign, CampaignType} from '../model/Campaign';
import {textColor} from '../styles/Text';
import {font} from '../styles/Font';
import {getSourceOrDefaultAvatar} from '../utils/asset';
import {dimension} from '../styles/Dimension';
import {usePortfolio} from '../hooks/portfolio';
import {StyleSheet} from 'react-native';
import {TabView} from '../components/organisms/TabView';
import {Review} from '../model/Review';
import {LoadingScreen} from './LoadingScreen';
import {ReviewCard} from '../components/molecules/ReviewCard';
import {ReviewList} from '../components/organisms/ReviewList';
import {PortfolioList} from '../components/organisms/PortfolioList';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const {user, activeData, activeRole, uid} = useUser();
  const navigation = useNavigation<NavigationStackProps>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reviews, setReviews] = useState<Review[]>();
  const [ongoingTransactionsCount, setOngoingTransactionsCount] = useState(0);
  const [publicCampaignsCount, setPublicCampaignsCount] = useState(0);
  const pagerViewRef = useRef<PagerView>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const {portfolios} = usePortfolio(uid || '');

  useEffect(() => {
    // TODO: gatau ini mestinya gabung sama yang di dalem modal transactionsnya apa ngga biar fetch skali? tp kalo kek gitu gabisa dua"nya ngelisten, jadinya cuma salah satu, krn behaviour si modal kan navigate yaa
    var unsubscribeTransaction: () => void;
    if (activeRole !== UserRole.Admin) {
      unsubscribeTransaction = Transaction.getAllTransactionsByRole(
        uid || '',
        activeRole,
        setTransactions,
      );
    }

    const unsubscribeCampaign = Campaign.getUserCampaignsReactive(
      uid || '',
      c => {
        setCampaigns(c);
      },
    );
    return () => {
      // TODO: kyknya yang bener kayak campaign aja, di transaction tiap catch eror masih ngethrow lagi, kyknya nanti hapus aja thrownya tktnya bikin ribet
      unsubscribeTransaction && unsubscribeTransaction();
      if (unsubscribeCampaign) unsubscribeCampaign();
    };
  }, [uid, activeRole]);

  useEffect(() => {
    // TODO: ongoing berarti ga rejected dan ga done, kalo finished berarti total transaction minus ini.
    const ongoingCount = transactions?.filter(t => t.isOngoing()).length || 0;
    setOngoingTransactionsCount(ongoingCount);
  }, [transactions, ongoingTransactionsCount]);

  useEffect(() => {
    setPublicCampaignsCount(
      campaigns.filter(c => c.type === CampaignType.Public).length,
    );
  }, [campaigns]);

  useEffect(() => {
    if (uid && activeRole) {
      Review.getReviewsByRevieweeId(uid, activeRole)
        .then(setReviews)
        .catch(() => {
          setReviews([]);
        });
    }
  }, [uid, activeRole]);

  const onProfilePictureChanged = (url: string) => {
    if (!user) {
      return;
    }
    const updatedUser: User = new User({...user});

    updatedUser.updateProfilePicture(activeRole, url);
  };

  if (!reviews || !transactions) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1">
      <ScrollView
        bounces={false}
        contentContainerStyle={{flexGrow: 1}}
        showsVerticalScrollIndicator={false}>
        <SafeAreaContainer enable>
          <View style={[flex.flex1, flex.flexCol]}>
            <View
              style={[flex.flexCol, gap.xlarge, padding.horizontal.default]}>
              <View style={[flex.flexRow, gap.large, items.center]}>
                <View className="relative">
                  <View
                    className="w-20 h-20 overflow-hidden"
                    style={[rounded.max]}>
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
                      <FastImage
                        style={[dimension.full]}
                        source={getSourceOrDefaultAvatar({
                          uri: activeData?.profilePicture,
                        })}
                      />
                    </MediaUploader>
                  </View>
                  <View
                    className="absolute bottom-0 right-1 p-2 rounded-full"
                    style={[background(COLOR.background.green.med)]}>
                    <Edit width={13} height={13} color={'white'} />
                  </View>
                </View>

                <View style={[flex.flex1, flex.flexCol, gap.xsmall2]}>
                  <Text
                    className="font-bold"
                    style={[font.size[30], textColor(COLOR.text.neutral.high)]}
                    numberOfLines={1}>
                    {activeData?.fullname}
                  </Text>
                  <Text
                    style={[font.size[20], textColor(COLOR.text.neutral.high)]}
                    numberOfLines={1}>
                    {user?.email}
                  </Text>
                  <Text
                    style={[font.size[20], textColor(COLOR.text.neutral.med)]}
                    numberOfLines={1}>
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
            {/* {activeRole === UserRole.ContentCreator && (
                  <View style={[flex.flexRow, justify.center]} className="py-3">
                    <Pressable
                      style={(flex.flexRow, styles.button)}
                      className={`${
                        selectedTab === 0
                          ? 'bg-primary'
                          : 'border border-zinc-200'
                      } rounded-l-md p-2 justify-center items-center text-center`}
                      onPress={goToInfoTab}>
                      <Text
                        className={`${
                          selectedTab === 0 ? 'text-white' : 'text-black'
                        }`}>
                        Info
                      </Text>
                    </Pressable>
                    <Pressable
                      style={(flex.flexRow, styles.button)}
                      className={`${
                        selectedTab === 1
                          ? 'bg-primary'
                          : 'border border-zinc-200'
                      } rounded-r-md p-2 justify-center items-center text-center`}
                      onPress={goToPortfolioTab}>
                      <Text
                        className={`${
                          selectedTab === 1 ? 'text-white' : 'text-black'
                        }`}>
                        Portfolio
                      </Text>
                    </Pressable>
                  </View>
                )} */}

            <TabView labels={['Home', 'Portfolio', 'Reviews']}>
              <View
                style={[
                  flex.flexRow,
                  flex.wrap,
                  justify.between,
                  items.center,
                  padding.horizontal.default,
                ]}>
                {activeRole !== UserRole.Admin && (
                  <ProfileMenuCard
                    handleOnClick={() => {
                      navigation.navigate(
                        AuthenticatedNavigation.MyTransactions,
                        {userId: uid || '', role: activeRole},
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
                )}
                <ProfileMenuCard
                  handleOnClick={() => {
                    navigation.navigate(AuthenticatedNavigation.AboutMe);
                  }}
                  icon={<AboutIcon fill={'#FB8A2E'} height={80} width={80} />}
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
                      navigation.navigate(AuthenticatedNavigation.UploadVideo);
                    }}
                    icon={
                      <AddIcon fill={COLOR.red[40]} height={80} width={80} />
                    }
                    title="Upload Video"
                    subtitle={'Add more videos to promote yourself.'}
                  />
                )}

                {activeRole === UserRole.BusinessPeople && (
                  <ProfileMenuCard
                    handleOnClick={() => {
                      navigation.navigate(AuthenticatedNavigation.MyCampaigns);
                    }}
                    icon={
                      <CampaignIcon fill={'#72B3FF'} height={80} width={80} />
                    }
                    title="My Campaigns"
                    subtitle={`${publicCampaignsCount} Public\n${
                      campaigns.length - publicCampaignsCount
                    } Private`}
                  />
                )}
              </View>
              <View style={[flex.flex1, padding.horizontal.default]}>
                <PortfolioList portfolios={portfolios} />
              </View>
              <View style={[flex.flex1, padding.horizontal.default]}>
                <ReviewList reviews={reviews} />
              </View>
            </TabView>
          </View>
        </SafeAreaContainer>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  pagerView: {
    width: '100%',
    height: '60%',
  },
  button: {
    width: Dimensions.get('window').width * 0.45,
  },
  video: {
    height: 200,
    borderRadius: 10,
  },
});
