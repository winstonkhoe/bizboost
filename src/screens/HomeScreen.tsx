import {Pressable, PressableProps, StyleSheet, Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {HomeSectionHeader} from '../components/molecules/SectionHeader';
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
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {User, UserRole} from '../model/User';
import {useUser} from '../hooks/user';
import UserListCard from '../components/molecules/UserListCard';
import {AnimatedPressable} from '../components/atoms/AnimatedPressable';
import Edit from '../assets/vectors/edit.svg';
import {
  Transaction,
  TransactionStatus,
  transactionStatusCampaignStepMap,
} from '../model/Transaction';
import TransactionCard from '../components/molecules/TransactionCard';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {padding} from '../styles/Padding';
import {rounded} from '../styles/BorderRadius';
import {shadow} from '../styles/Shadow';
import {font, text} from '../styles/Font';
import {textColor} from '../styles/Text';
import {size} from '../styles/Size';
import {Report, reportStatusPrecendence} from '../model/Report';
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
  Completed = 'Completed',
  Terminated = 'Terminated',
  Users = 'Users',
  Reports = 'Reports',
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
  const [filterStep, setFilterStep] = useState<FilterType>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const upcomingCampaigns = useMemo(
    () => userCampaigns.filter(c => new Campaign(c).isUpcomingOrRegistration()),
    [userCampaigns],
  );

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

  const showFilterPanel = [
    FilterCardType.ActionNeeded,
    FilterCardType.Ongoing,
  ].find(filter => filter === activeFilterType);

  const getFilteredStep = useCallback(
    (targetFilterTransactions: Transaction[]) => {
      if (targetFilterTransactions.length === 0) {
        return targetFilterTransactions;
      }
      if (!filterStep) {
        return targetFilterTransactions;
      }
      return targetFilterTransactions.filter(
        transaction =>
          filterStep === transactionStatusCampaignStepMap[transaction.status],
      );
    },
    [filterStep],
  );

  const filteredTransactions = useMemo(() => {
    if (FilterCardType.ActionNeeded === activeFilterType) {
      return getFilteredStep(actionNeededTransactions || []);
    }
    if (FilterCardType.Ongoing === activeFilterType) {
      return getFilteredStep(ongoingTransactions);
    }
    if (FilterCardType.Terminated === activeFilterType) {
      return getFilteredStep(terminatedTransactions);
    }
    if (FilterCardType.Completed === activeFilterType) {
      return getFilteredStep(completedTransaction);
    }
    return getFilteredStep(transactions);
  }, [
    getFilteredStep,
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
          (await (isContentCreator
            ? transaction.isWaitingContentCreatorAction()
            : transaction.isWaitingBusinessPeopleAction()))
            ? transaction
            : null,
        ),
      );
      return results.filter((result): result is Transaction => result !== null);
    };
    if (transactions) {
      if (isAdmin) {
        const getTransactionPresedence = (neededAction: boolean) => {
          return neededAction ? 0 : 1;
        };
        const sortAdminTransaction = (
          firstTransaction: Transaction,
          secondTransaction: Transaction,
        ) => {
          return (
            getTransactionPresedence(firstTransaction.isWaitingAdminAction()) -
            getTransactionPresedence(secondTransaction.isWaitingAdminAction())
          );
        };
        setActionNeededTransactions(transactions.sort(sortAdminTransaction));
      }
      if (isContentCreator || isBusinessPeople) {
        getActionNeededTransactions()
          .then(setActionNeededTransactions)
          .catch(() => setActionNeededTransactions([]));
      }
    }
  }, [transactions, isAdmin, isBusinessPeople, isContentCreator]);

  useEffect(() => {
    console.log('homeScreen:userGetall');
    return User.getAll(setUsers);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      return Report.getAll(setReports);
    }
    if (!isAdmin && uid) {
      return Report.getAllByReporterId(uid, setReports);
    }
  }, [isAdmin, uid]);

  useEffect(() => {
    console.log('homeScreen:getAllTransactionsByRole');
    if (!isAdmin && uid && activeRole) {
      return Transaction.getAllTransactionsByRole(
        uid,
        activeRole,
        setTransactions,
      );
    }
  }, [isAdmin, uid, activeRole]);

  useEffect(() => {
    if (isAdmin) {
      return Transaction.getAllTransactionsWithPayment(setTransactions);
    }
  }, [isAdmin]);

  const navigateToCreateCampaign = () => {
    navigation.navigate(AuthenticatedNavigation.CreateCampaign);
  };

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
      {!isAdmin && (
        <View
          style={[
            padding.horizontal.default,
            background(COLOR.background.neutral.default),
          ]}>
          <SearchBar />
        </View>
      )}
      <SearchAutocompletePlaceholder>
        <ScrollView
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[2]}
          contentContainerStyle={[
            flex.grow,
            flex.flexCol,
            padding.bottom.xlarge,
            gap.medium,
          ]}>
          {!isAdmin && <DashboardPanel transactions={transactions} />}
          {/* New This Week */}
          {isContentCreator &&
            (thisWeekCampaign.length > 0 ? (
              <View style={[flex.flexCol, gap.default]}>
                <View style={[padding.horizontal.default]}>
                  <HomeSectionHeader header="New This Week" />
                </View>
                <ScrollView
                  showsHorizontalScrollIndicator={false}
                  horizontal
                  contentContainerStyle={[
                    flex.flexRow,
                    gap.default,
                    padding.horizontal.default,
                    padding.bottom.xsmall,
                  ]}>
                  {thisWeekCampaign.map((campaign: Campaign, index: number) => (
                    <NewThisWeekCard campaign={campaign} key={index} />
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={[padding.horizontal.default]}>
                <EmptySection
                  title="New This Week"
                  description="No new campaigns have opened for registration this week. Check back soon for exciting new opportunities!"
                />
              </View>
            ))}

          {/* Your Upcoming Campaigns */}
          {isBusinessPeople &&
            (upcomingCampaigns.length > 0 ? (
              <View style={[flex.flexCol, gap.default]}>
                <View style={[padding.horizontal.default]}>
                  <HomeSectionHeader header="Your Upcoming Campaigns" />
                </View>
                <ScrollView
                  showsHorizontalScrollIndicator={false}
                  horizontal
                  contentContainerStyle={[
                    flex.flexRow,
                    gap.default,
                    padding.horizontal.default,
                    padding.bottom.xsmall,
                  ]}>
                  {upcomingCampaigns.map(
                    (campaign: Campaign, index: number) => (
                      <NewThisWeekCard campaign={campaign} key={index} />
                    ),
                  )}
                </ScrollView>
              </View>
            ) : (
              <View style={[padding.horizontal.default]}>
                <EmptySection
                  title="Your Upcoming Campaigns"
                  description="You don’t have any upcoming campaigns at the moment."
                  actionText="Create Now"
                  handleAction={navigateToCreateCampaign}
                />
              </View>
            ))}
          <View
            style={[
              flex.flexCol,
              gap.small,
              background(COLOR.background.neutral.default),
            ]}>
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
                  secondaryLabel={isAdmin ? 'Transactions' : undefined}
                  count={
                    (isAdmin
                      ? actionNeededTransactions?.filter(t =>
                          t.isWaitingAdminAction(),
                        ).length
                      : actionNeededTransactions?.length) || 0
                  }
                  onPress={() =>
                    setActiveFilterType(FilterCardType.ActionNeeded)
                  }
                />
              </SkeletonPlaceholder>

              {!isAdmin && [
                <SkeletonPlaceholder
                  key="filter-ongoing"
                  isLoading={ongoingTransactions?.length === undefined}>
                  <FilterCard
                    isActive={activeFilterType === FilterCardType.Ongoing}
                    label={FilterCardType.Ongoing}
                    count={ongoingTransactions.length}
                    onPress={() => setActiveFilterType(FilterCardType.Ongoing)}
                  />
                </SkeletonPlaceholder>,
                <SkeletonPlaceholder
                  key="filter-completed"
                  isLoading={completedTransaction?.length === undefined}>
                  <FilterCard
                    isActive={activeFilterType === FilterCardType.Completed}
                    label={FilterCardType.Completed}
                    count={completedTransaction.length}
                    onPress={() =>
                      setActiveFilterType(FilterCardType.Completed)
                    }
                  />
                </SkeletonPlaceholder>,
                <SkeletonPlaceholder
                  key="filter-terminated"
                  isLoading={terminatedTransactions?.length === undefined}>
                  <FilterCard
                    isActive={activeFilterType === FilterCardType.Terminated}
                    label={FilterCardType.Terminated}
                    count={terminatedTransactions.length}
                    onPress={() =>
                      setActiveFilterType(FilterCardType.Terminated)
                    }
                  />
                </SkeletonPlaceholder>,
              ]}

              {isAdmin && [
                <SkeletonPlaceholder
                  key="filter-reports"
                  isLoading={reports?.length === undefined}>
                  <FilterCard
                    isActive={activeFilterType === FilterCardType.Reports}
                    label={FilterCardType.ActionNeeded}
                    secondaryLabel={FilterCardType.Reports}
                    count={reports?.filter(r => r.isPending())?.length || 0}
                    onPress={() => setActiveFilterType(FilterCardType.Reports)}
                  />
                </SkeletonPlaceholder>,
                <SkeletonPlaceholder
                  key="filter-users"
                  isLoading={users?.length === undefined}>
                  <FilterCard
                    isActive={activeFilterType === FilterCardType.Users}
                    label={FilterCardType.Users}
                    count={users.length}
                    onPress={() => setActiveFilterType(FilterCardType.Users)}
                  />
                </SkeletonPlaceholder>,
              ]}
            </ScrollView>
            {showFilterPanel && (
              <View style={[flex.flexRow, items.start, padding.vertical.small]}>
                <FilterPanel
                  initialFilter={filterStep}
                  onFilterChange={setFilterStep}
                />
              </View>
            )}
          </View>
          {(activeFilterType !== FilterCardType.Users &&
            filteredTransactions &&
            filteredTransactions.length > 0) ||
          (activeFilterType === FilterCardType.Users &&
            users &&
            users.length > 0) ? (
            <View
              style={[
                flex.flex1,
                flex.flexCol,
                gap.default,
                padding.horizontal.default,
              ]}>
              {activeFilterType !== FilterCardType.Users &&
                activeFilterType !== FilterCardType.Reports &&
                filteredTransactions?.map(transaction => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    role={activeRole}
                  />
                ))}
              {activeFilterType === FilterCardType.Reports &&
                reports
                  .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
                  .sort(
                    (a, b) =>
                      reportStatusPrecendence[a.status] -
                      reportStatusPrecendence[b.status],
                  )
                  .map((report, index) => (
                    <ReportCard key={index} report={report} />
                  ))}
              {activeFilterType === FilterCardType.Users &&
                users?.map((user, index) => (
                  <UserListCard key={index} user={user} />
                ))}
            </View>
          ) : (
            <EmptyPlaceholder />
          )}
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
            <AnimatedPressable onPress={navigateToCreateCampaign}>
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
      </SearchAutocompletePlaceholder>
      <WarningModal />
    </View>
  );
};

type FilterType = CampaignStep | undefined;

interface FilterPanelProps {
  initialFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filterStepLabelMap: {[key in CampaignStep]?: string} = {
  [CampaignStep.Registration]: `${CampaignStep.Registration} · ${TransactionStatus.offering}`,
  [CampaignStep.Brainstorming]: CampaignStep.Brainstorming,
  [CampaignStep.ContentCreation]: CampaignStep.ContentCreation,
  [CampaignStep.ResultSubmission]: CampaignStep.ResultSubmission,
};

const FilterPanel = ({initialFilter, onFilterChange}: FilterPanelProps) => {
  const [filterStep, setFilterStep] = useState<FilterType>(initialFilter);
  const filterSteps = [
    CampaignStep.Registration,
    CampaignStep.Brainstorming,
    CampaignStep.ContentCreation,
    CampaignStep.ResultSubmission,
  ];

  useEffect(() => {
    onFilterChange(filterStep);
  }, [filterStep, onFilterChange]);

  const onSelectFilter = (filter: FilterType) => {
    if (filterStep !== filter) {
      setFilterStep(filter);
      return;
    }
    setFilterStep(undefined);
  };

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
      {filterSteps.map(step => (
        <SelectableTag
          key={step}
          text={filterStepLabelMap[step] || ''}
          onPress={() => onSelectFilter(step)}
          isSelected={filterStep === step}
        />
      ))}
    </ScrollView>
  );
};

interface FilterCardProps extends PressableProps {
  isActive: boolean;
  label: string;
  secondaryLabel?: string;
  count: number;
}

const FilterCard = ({
  isActive,
  label,
  count,
  secondaryLabel,
  ...props
}: FilterCardProps) => {
  return (
    <Pressable
      style={[
        flex.flex1,
        rounded.default,
        dimension.width.xlarge8,
        // shadow.small,
        padding.default,
        flex.flexCol,
        justify.between,
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
      <View style={[flex.flexCol]}>
        <Text style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
          {label}
        </Text>
        {secondaryLabel && (
          <Text
            style={[
              font.size[10],
              font.weight.semibold,
              textColor(COLOR.text.neutral.med),
            ]}>
            {secondaryLabel}
          </Text>
        )}
      </View>
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
  const {user, isContentCreator, activeRole} = useUser();
  const navigation = useNavigation<NavigationStackProps>();

  const calculateBalance = useMemo(() => {
    if (!activeRole) {
      return 0;
    }
    return transactions
      .filter(transaction => transaction.isWithdrawable(activeRole))
      .reduce(
        (acc, transaction) =>
          acc + (Number(transaction.transactionAmount) || 0),
        0,
      );
  }, [activeRole, transactions]);

  const getRatingLabel = () => {
    if (isContentCreator) {
      return user?.contentCreator?.ratedCount
        ? `${user?.contentCreator?.ratedCount} Rating`
        : 'Rating';
    }
    return user?.businessPeople?.ratedCount
      ? `${user?.businessPeople?.ratedCount} Rating`
      : 'Rating';
  };
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
              {currencyFormat(calculateBalance)}
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
                  AuthenticatedNavigation.EditBankAccountInformation,
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
                  AuthenticatedNavigation.EditBankAccountInformation,
                );
              }}
            />
          )}
        </DashboardPanelItem>
        <VerticalSeparator />
        <DashboardPanelItem label={getRatingLabel()}>
          <View style={[flex.flexRow, items.end, gap.xsmall2]}>
            <RatingStarIcon size="medium" />
            <Text
              style={[
                font.size[20],
                font.weight.bold,
                textColor(COLOR.text.neutral.high),
              ]}>
              {/* {Math.round(user?.contentCreator?.rating || 4.88).toFixed(1)} */}
              {round(
                (isContentCreator
                  ? user?.contentCreator?.rating
                  : user?.businessPeople?.rating) || 0,
                1,
              ).toFixed(1)}
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

interface EmptySectionProps {
  title: string;
  description: string;
  handleAction?: () => void;
  actionText?: string;
}

const EmptySection = ({
  title,
  description,
  actionText = 'Submit',
  handleAction,
}: EmptySectionProps) => {
  return (
    <View
      style={[
        flex.flexCol,
        gap.default,
        rounded.medium,
        padding.horizontal.default,
        padding.vertical.medium,
        border({
          borderWidth: 1,
          color: COLOR.black[20],
        }),
      ]}>
      <View style={[flex.flexCol, gap.xsmall, items.center]}>
        <Text
          style={[
            font.size[30],
            font.weight.bold,
            textColor(COLOR.text.neutral.high),
          ]}>
          {title}
        </Text>
        <Text
          style={[
            text.center,
            font.size[20],
            font.weight.semibold,
            textColor(COLOR.text.neutral.med),
          ]}>
          {description}
        </Text>
      </View>
      {handleAction && (
        <View style={[flex.flexRow, justify.center]}>
          <CustomButton
            text={actionText}
            onPress={handleAction}
            rounded="max"
          />
        </View>
      )}
    </View>
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
