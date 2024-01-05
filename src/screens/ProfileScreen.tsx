import {Pressable, Text, View} from 'react-native';
import {User, UserRole} from '../model/User';
import {ScrollView} from 'react-native';
import {flex, items, justify} from '../styles/Flex';
import {useUser} from '../hooks/user';
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
import {useEffect, useState} from 'react';
import {Transaction} from '../model/Transaction';
import {background} from '../styles/BackgroundColor';
import {MediaUploader} from '../components/atoms/Input';
import {Campaign} from '../model/Campaign';
import {textColor} from '../styles/Text';
import {font} from '../styles/Font';
import {getSourceOrDefaultAvatar} from '../utils/asset';
import {dimension} from '../styles/Dimension';
import {usePortfolio} from '../hooks/portfolio';
import {TabView} from '../components/organisms/TabView';
import {Review} from '../model/Review';
import {LoadingScreen} from './LoadingScreen';
import {ReviewList} from '../components/organisms/ReviewList';
import {PortfolioList} from '../components/organisms/PortfolioList';
import {overflow} from '../styles/Overflow';
import {ReportIssueIcon} from '../components/atoms/Icon';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../styles/Size';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const {
    user,
    activeData,
    activeRole,
    uid,
    isContentCreator,
    isBusinessPeople,
    isAdmin,
  } = useUser();
  const navigation = useNavigation<NavigationStackProps>();
  const [transactions, setTransactions] = useState<Transaction[]>();
  const [reviews, setReviews] = useState<Review[]>();
  const [campaigns, setCampaigns] = useState<Campaign[]>();
  const safeAreaInsets = useSafeAreaInsets();
  const publicCampaignsCount = campaigns?.filter(c => c.isPublic()).length || 0;
  const ongoingTransactionsCount =
    transactions?.filter(t => t.isOngoing()).length || 0;
  const completedTransactionsCount =
    transactions?.filter(t => t.isCompleted() || t.isTerminated()).length || 0;

  const {portfolios} = usePortfolio(uid || '');

  useEffect(() => {
    if (uid && activeRole !== UserRole.Admin) {
      return Transaction.getAllTransactionsByRole(
        uid,
        activeRole,
        setTransactions,
      );
    }
  }, [uid, activeRole]);

  useEffect(() => {
    if (uid) {
      return Campaign.getUserCampaignsReactive(uid, setCampaigns);
    }
  }, [uid, activeRole]);

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

  // TODO: kondisi buat admin
  if ((!reviews || !transactions) && activeRole !== UserRole.Admin) {
    return <LoadingScreen />;
  }

  return (
    <View
      style={[
        flex.flex1,
        flex.flexCol,
        background(COLOR.background.neutral.default),
        {
          paddingTop: Math.max(safeAreaInsets.top, size.default),
        },
      ]}>
      <View
        style={[
          flex.flexRow,
          gap.large,
          items.center,
          padding.horizontal.default,
        ]}>
        <View className="relative">
          <View
            style={[dimension.square.xlarge4, rounded.max, overflow.hidden]}>
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
      {/* TODO: tab labels sesuai role */}
      {activeRole !== UserRole.Admin && (
        <TabView labels={['Home', 'Portfolio', 'Reviews']}>
          <ScrollView
            contentContainerStyle={[
              flex.flexRow,
              flex.wrap,
              justify.between,
              items.center,
              padding.default,
            ]}>
            {!isAdmin && (
              <ProfileMenuCard
                handleOnClick={() => {
                  navigation.navigate(AuthenticatedNavigation.MyTransactions, {
                    userId: uid || '',
                    role: activeRole,
                  });
                }}
                icon={
                  <TransactionIcon fill={'#72B3FF'} height={80} width={80} />
                }
                title="My Transactions"
                subtitle={`${ongoingTransactionsCount} Ongoing\n${completedTransactionsCount} Finished`}
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

            {isContentCreator && [
              <ProfileMenuCard
                key={'Withdraw Money'}
                handleOnClick={() => {
                  navigation.navigate(AuthenticatedNavigation.WithdrawMoney);
                }}
                icon={
                  <MoneyIcon fill={COLOR.green[50]} height={80} width={80} />
                }
                title={'Withdraw Money'}
                subtitle={'2 Transactions ready to be withdrawn'}
              />,
              <ProfileMenuCard
                key={'Upload Video'}
                handleOnClick={() => {
                  navigation.navigate(AuthenticatedNavigation.UploadVideo);
                }}
                icon={<AddIcon fill={COLOR.red[40]} height={80} width={80} />}
                title="Upload Video"
                subtitle={'Add more videos to promote yourself.'}
              />,
            ]}
            {isBusinessPeople && [
              <ProfileMenuCard
                key={'My Campaigns'}
                handleOnClick={() => {
                  navigation.navigate(AuthenticatedNavigation.MyCampaigns, {
                    userId: uid || '',
                  });
                }}
                icon={<CampaignIcon fill={'#72B3FF'} height={80} width={80} />}
                title="My Campaigns"
                subtitle={`${publicCampaignsCount} Public\n${
                  campaigns.length - publicCampaignsCount
                } Private`}
              />,
              // TODO: ini kayaknya ga perlu lagi
              <ProfileMenuCard
                key={'Pay Content Creator'}
                handleOnClick={() => {
                  navigation.navigate(
                    AuthenticatedNavigation.PayContentCreator,
                  );
                }}
                icon={
                  <MoneyIcon fill={COLOR.green[50]} height={80} width={80} />
                }
                title={'Pay Content Creator'}
                subtitle={'0 Pending Payment'}
              />,
            ]}
            <ProfileMenuCard
              handleOnClick={() => {
                navigation.navigate(AuthenticatedNavigation.ReportList);
              }}
              icon={<ReportIssueIcon size="xlarge5" />}
              title="My Reports"
              subtitle="See your reports and their status"
            />
          </ScrollView>
          {activeRole === UserRole.ContentCreator && (
            <ScrollView contentContainerStyle={[flex.grow, padding.default]}>
              <PortfolioList portfolios={portfolios} />
            </ScrollView>
          )}
          <ScrollView contentContainerStyle={[flex.grow, padding.default]}>
            <ReviewList reviews={reviews} />
          </ScrollView>
        </TabView>
      )}
    </View>
  );
};

export default ProfileScreen;
