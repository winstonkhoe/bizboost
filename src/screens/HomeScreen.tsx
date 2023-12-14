import {Pressable, StyleSheet, Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {RecentNegotiationCard} from '../components/molecules/RecentNegotiationCard';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {HomeSectionHeader} from '../components/molecules/SectionHeader';
import {HorizontalScrollView} from '../components/molecules/HorizontalScrollView';
import {OngoingCampaignCard} from '../components/molecules/OngoingCampaignCard';
import {flex, items, justify, self} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {
  PageWithSearchBar,
  SearchAutocompletePlaceholder,
} from '../components/templates/PageWithSearchBar';
import {Campaign} from '../model/Campaign';
import {useOngoingCampaign} from '../hooks/campaign';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {useEffect, useMemo, useRef, useState} from 'react';
import {User, UserRole} from '../model/User';
import {useUser} from '../hooks/user';
import UserListCard from '../components/molecules/UserListCard';
import {AnimatedPressable} from '../components/atoms/AnimatedPressable';
import Edit from '../assets/vectors/edit.svg';
import {Transaction} from '../model/Transaction';
import RegisteredUserListCard from '../components/molecules/RegisteredUserListCard';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {padding} from '../styles/Padding';
import {rounded} from '../styles/BorderRadius';
import {shadow} from '../styles/Shadow';
import {dimension} from '../styles/Dimension';
import FastImage from 'react-native-fast-image';
import {font} from '../styles/Font';
import {textColor} from '../styles/Text';
import {size} from '../styles/Size';
import {Label} from '../components/atoms/Label';
import {formatDateToDayMonthYear} from '../utils/date';
import {Report, ReportStatus, reportStatusPrecendence} from '../model/Report';
import {fetchReport} from '../helpers/report';
import {ReportCard} from './report/ReportListScreen';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SearchBar} from '../components/organisms/SearchBar';
import {CustomModal} from '../components/atoms/CustomModal';
import {
  ChevronLeft,
  ChevronRight,
  CircleIcon,
  ReportIcon,
} from '../components/atoms/Icon';
import PagerView from 'react-native-pager-view';
import {CustomButton} from '../components/atoms/Button';
import {showToast} from '../helpers/toast';
import {ToastType} from '../providers/ToastProvider';
import {Offer} from '../model/Offer';

const HomeScreen = () => {
  const {uid, activeRole} = useUser();
  const safeAreaInsets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationStackProps>();
  const isAdmin = UserRole.Admin === activeRole;
  const isBusinessPeople = UserRole.BusinessPeople === activeRole;
  const isContentCreator = UserRole.ContentCreator === activeRole;

  const {userCampaigns, nonUserCampaigns} = useOngoingCampaign();
  const thisWeekCampaign = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - (day === 0 ? 6 : day - 1),
    );

    console.log(nonUserCampaigns);

    return nonUserCampaigns.filter(
      campaign =>
        new Campaign(campaign)?.getTimelineStart().start >=
        startOfWeek.getTime(),
    );
  }, [nonUserCampaigns]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  // TODO: kalo klik see all apa mending pindah page?
  const [userLimit, setUserLimit] = useState(3);
  const [ongoingCampaignsLimit, setOngoingCampaignsLimit] = useState(3);
  useEffect(() => {
    console.log('homeScreen:userGetall');
    const unsubscribe = User.getAll(setUsers);
    return unsubscribe;
  }, []);

  useEffect(() => {
    console.log('homeScreen:Offer.getPendingOffersbyUser');
    try {
      Offer.getPendingOffersbyUser(uid, activeRole, data => {
        setOffers(data);
      });
    } catch (error) {}
  }, []);

  useEffect(() => {
    return fetchReport({
      isAdmin: isAdmin,
      uid: uid,
      onComplete: setReports,
    });
  }, [isAdmin, uid]);

  useEffect(() => {
    console.log('homeScreen:getAllTransactionsByRole');
    if (!isAdmin && uid && activeRole) {
      const unsubscribe = Transaction.getAllTransactionsByRole(
        uid,
        activeRole,
        setTransactions,
      );

      return unsubscribe;
    }
  }, [isAdmin, uid, activeRole]);

  useEffect(() => {
    if (isAdmin) {
      return Transaction.getAllTransactionsWithPayment(setTransactions);
    }
  }, [isAdmin]);

  if (isAdmin) {
    console.log('admin transactions', transactions);
  }

  return (
    <View
      style={[
        flex.flex1,
        {
          paddingTop: Math.max(safeAreaInsets.top, size.default),
        },
        background(COLOR.background.neutral.default),
      ]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        contentContainerStyle={[
          flex.flexCol,
          padding.bottom.xlarge,
          gap.default,
        ]}>
        <View
          style={[
            padding.horizontal.default,
            background(COLOR.background.neutral.default),
          ]}>
          <SearchBar />
        </View>
        <SearchAutocompletePlaceholder>
          <View style={[flex.flexCol, gap.large]}>
            {isContentCreator && (
              <View style={[flex.flexCol, gap.default]}>
                <HorizontalPadding>
                  <HomeSectionHeader header="New This Week" link="See All" />
                </HorizontalPadding>
                <HorizontalScrollView>
                  {thisWeekCampaign
                    .slice(0, 5)
                    .map((campaign: Campaign, index: number) => (
                      <AnimatedPressable
                        onPress={() => {
                          if (campaign.id) {
                            navigation.navigate(
                              AuthenticatedNavigation.CampaignDetail,
                              {
                                campaignId: campaign.id,
                              },
                            );
                          }
                        }}
                        key={index}
                        style={[flex.flexCol, dimension.square.xlarge9]}>
                        <View
                          className="overflow-hidden"
                          style={[StyleSheet.absoluteFill, rounded.large]}>
                          <FastImage
                            style={[dimension.full]}
                            source={{
                              uri: campaign.image,
                            }}
                          />
                        </View>
                        <View
                          className="overflow-hidden"
                          style={[
                            StyleSheet.absoluteFill,
                            rounded.large,
                            background(COLOR.black[100], 0.4),
                          ]}
                        />
                        <View
                          className="overflow-hidden"
                          style={[
                            StyleSheet.absoluteFill,
                            flex.flexCol,
                            justify.end,
                            padding.default,
                          ]}>
                          <View
                            style={[
                              flex.flexCol,
                              gap.xsmall,
                              {
                                minHeight: size.xlarge2,
                              },
                              // padding.bottom.small,
                            ]}>
                            <Text
                              className="font-bold"
                              style={[font.size[20], textColor(COLOR.black[0])]}
                              numberOfLines={1}>
                              {campaign?.title}
                            </Text>
                            <Text
                              className="font-medium"
                              style={[font.size[20], textColor(COLOR.black[0])]}
                              numberOfLines={2}>
                              {campaign?.description}
                            </Text>
                          </View>
                        </View>
                        <View
                          className="overflow-hidden"
                          style={[
                            padding.default,
                            {
                              position: 'absolute',
                              top: size.xsmall2,
                              right: size.xsmall2,
                            },
                          ]}>
                          <Label
                            radius="default"
                            text={`Until ${formatDateToDayMonthYear(
                              new Date(
                                new Campaign(campaign).getTimelineStart().end,
                              ),
                            )}`}
                          />
                        </View>
                      </AnimatedPressable>
                    ))}
                </HorizontalScrollView>
              </View>
            )}
            <View style={[flex.flexCol, gap.default]}>
              <HorizontalPadding>
                <HomeSectionHeader
                  header="Recent Negotiations"
                  link="See All"
                />
              </HorizontalPadding>
              <HorizontalScrollView>
                {offers.map((offer: any, index: number) => (
                  <RecentNegotiationCard
                    key={index}
                    offer={offer}
                    navigation={navigation}
                  />
                ))}
              </HorizontalScrollView>
            </View>
            {isBusinessPeople && (
              <View style={[flex.flexCol, gap.default]}>
                <HorizontalPadding>
                  <HomeSectionHeader
                    header="Ongoing Campaigns"
                    link={ongoingCampaignsLimit === 3 ? 'See All' : 'Collapse'}
                    onPressLink={() =>
                      setOngoingCampaignsLimit(
                        ongoingCampaignsLimit === 3 ? userCampaigns.length : 3,
                      )
                    }
                  />
                </HorizontalPadding>
                <View
                  style={[
                    flex.flexCol,
                    gap.medium,
                    padding.horizontal.default,
                  ]}>
                  {userCampaigns
                    .slice(0, ongoingCampaignsLimit)
                    .map((c: Campaign, index: number) => (
                      <OngoingCampaignCard campaign={c} key={index} />
                    ))}
                </View>
              </View>
            )}
            <View style={[flex.flexCol, gap.default]}>
              <HorizontalPadding>
                <HomeSectionHeader
                  header={isAdmin ? 'Payments' : 'Ongoing Transactions'}
                  link={'See All'}
                  // onPressLink={() =>
                  // setOngoingCampaignsLimit(
                  //   ongoingCampaignsLimit === 3 ? userCampaigns.length : 3,
                  // )
                  // }
                />
              </HorizontalPadding>
              <View
                style={[flex.flexCol, gap.medium, padding.horizontal.default]}>
                {transactions
                  .filter(transaction =>
                    isAdmin ? true : transaction.isOngoing(),
                  )
                  .map((t, index) => (
                    <RegisteredUserListCard
                      key={index}
                      transaction={t}
                      role={activeRole}
                    />
                  ))}
              </View>
            </View>
          </View>
          {isAdmin && (
            <HorizontalPadding>
              <View className="my-4" style={[flex.flexCol]}>
                <HomeSectionHeader
                  header="Users"
                  link={userLimit === 3 ? 'See All' : 'Collapse'}
                  onPressLink={() =>
                    setUserLimit(userLimit === 3 ? users.length : 3)
                  }
                />
                <View style={[flex.flexCol, gap.medium]} className="mt-4">
                  {users.slice(0, userLimit).map((u, index) => (
                    // <Pressable
                    //   key={index}
                    //   onPress={() => {
                    //     navigation.navigate(AuthenticatedNavigation.UserDetail, {
                    //       userId: u.id || '',
                    //     });
                    //   }}>
                    <UserListCard user={u} key={index} />
                    // </Pressable>
                  ))}
                </View>
              </View>
            </HorizontalPadding>
          )}
          {isAdmin && (
            <HorizontalPadding>
              <View className="my-4" style={[flex.flexCol]}>
                <HomeSectionHeader
                  header="Reports"
                  link={'See All'}
                  onPressLink={() =>
                    navigation.navigate(AuthenticatedNavigation.ReportList)
                  }
                />
                <View style={[flex.flexCol, gap.medium]} className="mt-4">
                  {reports
                    .filter(report => report.isPending())
                    .sort(
                      (a, b) =>
                        reportStatusPrecendence[a.status] -
                        reportStatusPrecendence[b.status],
                    )
                    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
                    .slice(0, 3)
                    .map((report, index) => (
                      <ReportCard key={index} report={report} />
                    ))}
                </View>
              </View>
            </HorizontalPadding>
          )}
        </SearchAutocompletePlaceholder>
      </ScrollView>
      {isBusinessPeople && (
        <View
          style={[
            {
              position: 'absolute',
              bottom: 20,
              right: 20,
            },
          ]}>
          <AnimatedPressable
            onPress={() =>
              navigation.navigate(AuthenticatedNavigation.CreateCampaign)
            }>
            <View
              style={[
                shadow.large,
                background(COLOR.green[50]),
                padding.default,
                rounded.max,
              ]}>
              <Edit width={20} height={20} color={'white'} />
            </View>
          </AnimatedPressable>
        </View>
      )}
      <WarningModal />
    </View>
  );
};

const WarningModal = () => {
  const pagerViewRef = useRef<PagerView>(null);
  const {uid} = useUser();
  const [warningReports, setWarningReports] = useState<Report[]>([]);
  const [index, setIndex] = useState(0);
  const isInFocus = useIsFocused();

  useEffect(() => {
    if (uid && isInFocus) {
      // TODO: its better if we can fetch / role, so the warning context will be more clear
      Report.getAllWarnings(uid)
        .then(reports =>
          setWarningReports(
            reports.filter(report => report.warningClosedAt === undefined),
          ),
        )
        .catch(() => {
          setWarningReports([]);
        });
    }
  }, [uid, isInFocus]);

  const handleUnderstand = () => {
    Report.closeAllWarnings(
      warningReports
        .map(report => report.id)
        .filter(id => id !== undefined) as string[],
    )
      .then(() => {
        setWarningReports([]);
      })
      .catch(() =>
        showToast({
          message: "There's an error. Please try again.",
          type: ToastType.danger,
        }),
      );
  };

  return (
    <CustomModal visible={warningReports.length > 0}>
      <View
        style={[
          flex.flexCol,
          {
            aspectRatio: 1 / 1.4,
          },
          padding.large,
          gap.large,
        ]}>
        <View style={[flex.flexRow, justify.center, items.center, gap.small]}>
          <ReportIcon size="large" />
          <Text
            className="font-bold"
            style={[font.size[40], textColor(COLOR.red[70])]}>
            Warning
          </Text>
        </View>
        <View style={[styles.bottomBorder]} />
        <PagerView
          ref={pagerViewRef}
          style={[flex.flex1]}
          onPageSelected={e => {
            console.log(e.nativeEvent.position);
            const newIndex = e.nativeEvent.position;
            if (index !== newIndex) {
              setIndex(newIndex);
            }
          }}>
          {warningReports.map(report => (
            <View
              key={report.id}
              style={[flex.flex1, flex.flexCol, justify.center, gap.default]}>
              <Text
                className="font-bold text-center"
                style={[
                  self.center,
                  font.size[30],
                  textColor(COLOR.text.neutral.high),
                ]}>
                {report.type}
              </Text>
              <Text
                className="text-center"
                style={[
                  self.center,
                  font.size[30],
                  textColor(COLOR.text.neutral.high),
                ]}>
                {report.warningNotes}
              </Text>
            </View>
          ))}
        </PagerView>
        {/* <View style={[flex.flexRow, justify.center]}>
          <Text style={[font.size[20], textColor(COLOR.text.neutral.med)]}>{`${
            index + 1
          } / ${warningReports.length}`}</Text>
        </View> */}
        {warningReports.length > 1 && (
          <View style={[flex.flexRow, gap.xsmall, justify.center]}>
            {warningReports.map((report, reportIndex) => (
              <CircleIcon
                key={report.id}
                size="small"
                color={
                  index === reportIndex
                    ? COLOR.green[50]
                    : COLOR.text.neutral.low
                }
              />
            ))}
          </View>
        )}
        <CustomButton
          scale={0.95}
          text="Understand"
          disabled={index < warningReports.length - 1}
          onPress={handleUnderstand}
        />
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLOR.black[15],
  },
});

export default HomeScreen;
