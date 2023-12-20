import {Pressable, PressableProps, StyleSheet, Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {RecentNegotiationCard} from '../components/molecules/RecentNegotiationCard';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {HomeSectionHeader} from '../components/molecules/SectionHeader';
import {HorizontalScrollView} from '../components/molecules/HorizontalScrollView';
import {OngoingCampaignCard} from '../components/molecules/OngoingCampaignCard';
import {flex, items, justify, self} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {SearchAutocompletePlaceholder} from '../components/templates/PageWithSearchBar';
import {Campaign, CampaignStep} from '../model/Campaign';
import {useOngoingCampaign} from '../hooks/campaign';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {ReactNode, useEffect, useMemo, useRef, useState} from 'react';
import {User, UserRole} from '../model/User';
import {useUser} from '../hooks/user';
import UserListCard from '../components/molecules/UserListCard';
import {AnimatedPressable} from '../components/atoms/AnimatedPressable';
import Edit from '../assets/vectors/edit.svg';
import {Transaction, TransactionStatus} from '../model/Transaction';
import RegisteredUserListCard from '../components/molecules/RegisteredUserListCard';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {padding} from '../styles/Padding';
import {rounded} from '../styles/BorderRadius';
import {shadow} from '../styles/Shadow';
import {font, text} from '../styles/Font';
import {textColor} from '../styles/Text';
import {size} from '../styles/Size';
import {Report, reportStatusPrecendence} from '../model/Report';
import {fetchReport} from '../helpers/report';
import {ReportCard} from './report/ReportListScreen';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SearchBar} from '../components/organisms/SearchBar';
import {CustomModal} from '../components/atoms/CustomModal';
import {
  CardIcon,
  CircleIcon,
  RatingStarIcon,
  ReportIcon,
} from '../components/atoms/Icon';
import PagerView from 'react-native-pager-view';
import {CustomButton} from '../components/atoms/Button';
import {showToast} from '../helpers/toast';
import {ToastType} from '../providers/ToastProvider';
import {Offer} from '../model/Offer';
import {NewThisWeekCard} from '../components/molecules/NewThisWeekCard';
import {round} from 'lodash';
import {InternalLink} from '../components/atoms/Link';
import {currencyFormat} from '../utils/currency';
import {border} from '../styles/Border';
import {dimension} from '../styles/Dimension';
import SelectableTag from '../components/atoms/SelectableTag';
import {EmptyPlaceholder} from '../components/templates/EmptyPlaceholder';
import {SkeletonPlaceholder} from '../components/molecules/SkeletonPlaceholder';

enum FilterCardType {
  ActionNeeded = 'Action Needed',
  Ongoing = 'Ongoing',
  Terminated = 'Terminated',
  Completed = 'Completed',
}

const HomeScreen = () => {
  const {uid, activeRole} = useUser();
  const [activeFilterType, setActiveFilterType] = useState<FilterCardType>(
    FilterCardType.ActionNeeded,
  );
  const safeAreaInsets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationStackProps>();
  const isAdmin = UserRole.Admin === activeRole;
  const isBusinessPeople = UserRole.BusinessPeople === activeRole;
  const isContentCreator = UserRole.ContentCreator === activeRole;

  const {userCampaigns, nonUserCampaigns = null} = useOngoingCampaign();
  const thisWeekCampaign = useMemo(() => {
    if (nonUserCampaigns === null) {
      return [...Array(5)];
    }

    const now = new Date();
    const day = now.getDay();
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - (day === 0 ? 6 : day - 1),
    );

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

  const [actionNeededTransactions, setActionNeededTransactions] =
    useState<Transaction[]>();

  const ongoingTransactions = useMemo(
    () => transactions.filter(transaction => transaction.isOngoing()),
    [transactions],
  );

  const terminatedTransactions = useMemo(
    () => transactions.filter(transaction => transaction.isTerminated()),
    [transactions],
  );

  const completedTransaction = useMemo(
    () => transactions.filter(transaction => transaction.isCompleted()),
    [transactions],
  );

  const filteredTransactions = useMemo(() => {
    switch (activeFilterType) {
      case FilterCardType.ActionNeeded:
        return actionNeededTransactions;
      case FilterCardType.Ongoing:
        return ongoingTransactions;
      case FilterCardType.Terminated:
        return terminatedTransactions;
      case FilterCardType.Completed:
        return completedTransaction;
      default:
        return transactions;
    }
  }, [
    activeFilterType,
    transactions,
    actionNeededTransactions,
    ongoingTransactions,
    terminatedTransactions,
    completedTransaction,
  ]);

  useEffect(() => {
    const getActionNeededTransactions = async () => {
      const results = await Promise.all(
        transactions.map(async transaction =>
          (await transaction.isWaitingContentCreatorAction())
            ? transaction
            : null,
        ),
      );
      return results.filter((result): result is Transaction => result !== null);
    };
    if (transactions) {
      getActionNeededTransactions()
        .then(setActionNeededTransactions)
        .catch(() => setActionNeededTransactions([]));
    }
  }, [transactions]);

  useEffect(() => {
    console.log('homeScreen:userGetall');
    const unsubscribe = User.getAll(setUsers);
    return unsubscribe;
  }, []);

  useEffect(() => {
    console.log('homeScreen:Offer.getPendingOffersbyUser');
    try {
      if (uid && activeRole) {
        return Offer.getPendingOffersbyUser(uid, activeRole, setOffers);
      }
    } catch (error) {}
  }, [uid, activeRole]);

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
        flex.flexCol,
        gap.default,
        {
          paddingTop: Math.max(safeAreaInsets.top, size.default),
        },
        background(COLOR.background.neutral.default),
      ]}>
      <View
        style={[
          padding.horizontal.default,
          background(COLOR.background.neutral.default),
        ]}>
        <SearchBar />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[]}
        contentContainerStyle={[
          flex.flexCol,
          padding.bottom.xlarge,
          gap.default,
        ]}>
        <SearchAutocompletePlaceholder>
          <View style={[flex.flexCol, gap.medium]}>
            <DashboardPanel transactions={transactions} />
            {isContentCreator && (
              <View style={[flex.flexCol, gap.default]}>
                <HorizontalPadding>
                  <HomeSectionHeader header="New This Week" link="See All" />
                </HorizontalPadding>
                <ScrollView
                  horizontal
                  contentContainerStyle={[
                    flex.flexRow,
                    gap.default,
                    padding.horizontal.default,
                    padding.bottom.xsmall,
                  ]}>
                  {thisWeekCampaign
                    .slice(0, 5)
                    .map((campaign: Campaign, index: number) => (
                      <NewThisWeekCard campaign={campaign} key={index} />
                    ))}
                </ScrollView>
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
            <View style={[flex.flexCol, gap.small]}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                  flex.flexRow,
                  gap.default,
                  padding.horizontal.default,
                ]}>
                <SkeletonPlaceholder
                  isLoading={actionNeededTransactions?.length === undefined}>
                  <FilterCard
                    isActive={activeFilterType === FilterCardType.ActionNeeded}
                    label={FilterCardType.ActionNeeded}
                    count={actionNeededTransactions?.length || 0}
                    onPress={() =>
                      setActiveFilterType(FilterCardType.ActionNeeded)
                    }
                  />
                </SkeletonPlaceholder>
                <SkeletonPlaceholder
                  isLoading={ongoingTransactions?.length === undefined}>
                  <FilterCard
                    isActive={activeFilterType === FilterCardType.Ongoing}
                    label={FilterCardType.Ongoing}
                    count={ongoingTransactions.length}
                    onPress={() => setActiveFilterType(FilterCardType.Ongoing)}
                  />
                </SkeletonPlaceholder>
                <SkeletonPlaceholder
                  isLoading={terminatedTransactions?.length === undefined}>
                  <FilterCard
                    isActive={activeFilterType === FilterCardType.Terminated}
                    label={FilterCardType.Terminated}
                    count={terminatedTransactions.length}
                    onPress={() =>
                      setActiveFilterType(FilterCardType.Terminated)
                    }
                  />
                </SkeletonPlaceholder>
                <SkeletonPlaceholder
                  isLoading={completedTransaction?.length === undefined}>
                  <FilterCard
                    isActive={activeFilterType === FilterCardType.Completed}
                    label={FilterCardType.Completed}
                    count={completedTransaction.length}
                    onPress={() =>
                      setActiveFilterType(FilterCardType.Completed)
                    }
                  />
                </SkeletonPlaceholder>
              </ScrollView>
              {[FilterCardType.ActionNeeded, FilterCardType.Ongoing].find(
                filter => filter === activeFilterType,
              ) && (
                <View
                  style={[flex.flexRow, items.start, padding.vertical.small]}>
                  <FilterPanel />
                </View>
              )}
            </View>
          </View>
          {filteredTransactions && filteredTransactions.length > 0 ? (
            <View
              style={[
                flex.flex1,
                flex.flexCol,
                gap.default,
                padding.horizontal.default,
              ]}>
              {filteredTransactions?.map(transaction => (
                <RegisteredUserListCard
                  key={transaction.id}
                  transaction={transaction}
                  role={UserRole.ContentCreator} //dashboard is focusing on cc side
                />
              ))}
            </View>
          ) : (
            <EmptyPlaceholder />
          )}
          {/* <View style={[flex.flexCol, gap.large]}>
            <DashboardPanel transactions={transactions} />
            {isContentCreator && (
              <View style={[flex.flexCol, gap.default]}>
                <HorizontalPadding>
                  <HomeSectionHeader header="New This Week" link="See All" />
                </HorizontalPadding>
                <ScrollView
                  horizontal
                  style={[flex.flex1]}
                  contentContainerStyle={[
                    flex.flexRow,
                    gap.default,
                    padding.horizontal.default,
                    padding.bottom.xsmall,
                  ]}>
                  {thisWeekCampaign
                    .slice(0, 5)
                    .map((campaign: Campaign, index: number) => (
                      <NewThisWeekCard campaign={campaign} key={index} />
                    ))}
                </ScrollView>
              </View>
            )}
            
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
          )} */}
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

const FilterPanel = () => {
  const [filterStep, setFilterStep] = useState<
    CampaignStep | TransactionStatus
  >(CampaignStep.Brainstorming);
  const filterSteps = [
    CampaignStep.Brainstorming,
    CampaignStep.ContentCreation,
    CampaignStep.ResultSubmission,
  ];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        flex.flexRow,
        items.start,
        gap.default,
        padding.horizontal.default,
      ]}>
      <SelectableTag
        text={TransactionStatus.offerRejected}
        onPress={() => setFilterStep(TransactionStatus.offerRejected)}
        isSelected={filterStep === TransactionStatus.offerRejected}
      />
      {filterSteps.map(step => (
        <SelectableTag
          key={step}
          text={step}
          onPress={() => setFilterStep(step)}
          isSelected={filterStep === step}
        />
      ))}
    </ScrollView>
  );
};

interface FilterCardProps extends PressableProps {
  isActive: boolean;
  label: string;
  count: number;
}

const FilterCard = ({isActive, label, count, ...props}: FilterCardProps) => {
  return (
    <Pressable
      style={[
        rounded.default,
        dimension.width.xlarge8,
        // shadow.small,
        padding.default,
        flex.flexCol,
        gap.default,
        background(COLOR.black[1]),
        border({
          borderWidth: 1,
          color: COLOR.black[20],
        }),

        isActive && [
          background(COLOR.background.neutral.high),
          border({
            borderWidth: 1,
            color: COLOR.green[50],
          }),
          shadow.default,
        ],
      ]}
      {...props}>
      <Text style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
        {label}
      </Text>
      <Text
        style={[
          font.size[40],
          font.weight.bold,
          textColor(COLOR.text.neutral.high),
        ]}>
        {count}
      </Text>
    </Pressable>
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
            style={[font.weight.bold, font.size[40], textColor(COLOR.red[70])]}>
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
                style={[
                  text.center,
                  font.weight.bold,
                  self.center,
                  font.size[30],
                  textColor(COLOR.text.neutral.high),
                ]}>
                {report.type}
              </Text>
              <Text
                style={[
                  text.center,
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

interface DashboardPanelProps {
  transactions: Transaction[];
}

const DashboardPanel = ({transactions}: DashboardPanelProps) => {
  const {user} = useUser();
  const navigation = useNavigation<NavigationStackProps>();
  const balance = transactions
    .filter(transaction => transaction.isCompleted())
    .reduce(
      (acc, transaction) => acc + (transaction.transactionAmount || 0),
      0,
    );
  return (
    <View style={[padding.horizontal.default]}>
      <View
        style={[
          padding.horizontal.small,
          padding.vertical.default,
          rounded.medium,
          flex.flexRow,
          gap.small,
          justify.around,
          // shadow.default,
          border({
            borderWidth: 1,
            color: COLOR.black[20],
          }),
          background(COLOR.black[0]),
        ]}>
        <DashboardPanelItem label="Bizboost Balance">
          <Pressable
            style={[flex.flexCol, items.center]}
            onPress={() =>
              navigation.navigate(AuthenticatedNavigation.WithdrawMoney)
            }>
            <CardIcon size="large" />
            <Text
              style={[
                font.size[20],
                font.weight.bold,
                textColor(COLOR.text.neutral.high),
              ]}
              numberOfLines={1}>
              {currencyFormat(balance)}
            </Text>
          </Pressable>
        </DashboardPanelItem>
        <VerticalSeparator />
        <DashboardPanelItem
          label={
            user?.bankAccountInformation
              ? user?.bankAccountInformation?.bankName
              : 'Bank Account'
          }>
          {user?.bankAccountInformation ? (
            <Pressable
              style={[
                flex.flexCol,
                justify.center,
                {
                  maxWidth: size.xlarge9,
                },
              ]}
              onPress={() => {
                navigation.navigate(
                  AuthenticatedNavigation.EditBankAccountInformationScreen,
                );
              }}>
              <Text
                style={[
                  text.center,
                  font.weight.semibold,
                  self.center,
                  font.size[20],
                  textColor(COLOR.text.neutral.high),
                ]}
                numberOfLines={1}>
                {`${user?.bankAccountInformation?.accountNumber}`}
              </Text>
              <Text
                style={[
                  text.center,
                  font.weight.semibold,
                  self.center,
                  font.size[20],
                  textColor(COLOR.text.neutral.high),
                ]}
                numberOfLines={1}>
                {`${user?.bankAccountInformation?.accountHolderName}`}
              </Text>
            </Pressable>
          ) : (
            <InternalLink
              text="Update Bank Info"
              size={20}
              onPress={() => {
                navigation.navigate(
                  AuthenticatedNavigation.EditBankAccountInformationScreen,
                );
              }}
            />
          )}
        </DashboardPanelItem>
        <VerticalSeparator />
        <DashboardPanelItem
          label={
            user?.contentCreator?.ratedCount
              ? `${user?.contentCreator?.ratedCount} Rating`
              : 'Rating'
          }>
          <View style={[flex.flexRow, items.end, gap.xsmall2]}>
            <RatingStarIcon size="medium" />
            <Text
              style={[
                font.size[20],
                font.weight.bold,
                textColor(COLOR.text.neutral.high),
              ]}>
              {/* {Math.round(user?.contentCreator?.rating || 4.88).toFixed(1)} */}
              {round(user?.contentCreator?.rating || 0, 1).toFixed(1)}
            </Text>
          </View>
        </DashboardPanelItem>
      </View>
    </View>
  );
};

interface DashboardPanelItemProps {
  children?: ReactNode;
  label: string;
}

const DashboardPanelItem = ({...props}: DashboardPanelItemProps) => {
  return (
    <View style={[flex.flex1, flex.flexCol, items.center, gap.small]}>
      <View
        style={[
          flex.flexCol,
          justify.center,
          {
            height: size.xlarge,
          },
        ]}>
        {props.children}
      </View>
      <Text style={[font.size[20], textColor(COLOR.text.neutral.high)]}>
        {props.label}
      </Text>
    </View>
  );
};

const VerticalSeparator = () => {
  return (
    <View
      style={[
        styles.verticalSeparator,
        {
          marginVertical: size.default,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLOR.black[15],
  },
  verticalSeparator: {
    borderRightWidth: 0.7,
    borderRightColor: COLOR.black[20],
  },
});

export default HomeScreen;
