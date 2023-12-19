import {ReactNode, useEffect, useMemo, useState} from 'react';
import {LoadingScreen} from '../LoadingScreen';
import {Transaction, TransactionStatus} from '../../model/Transaction';
import {useUser} from '../../hooks/user';
import {UserRole} from '../../model/User';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import {flex, items, justify, self} from '../../styles/Flex';
import {padding} from '../../styles/Padding';
import {rounded} from '../../styles/BorderRadius';
import {shadow} from '../../styles/Shadow';
import {Text} from 'react-native';
import {font, text} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {gap} from '../../styles/Gap';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {CardIcon, RatingStarIcon} from '../../components/atoms/Icon';
import {round} from 'lodash';
import {ScrollView} from 'react-native-gesture-handler';
import {dimension} from '../../styles/Dimension';
import {background} from '../../styles/BackgroundColor';
import {size} from '../../styles/Size';
import {OngoingCampaignCard} from '../../components/molecules/OngoingCampaignCard';
import {SkeletonPlaceholder} from '../../components/molecules/SkeletonPlaceholder';
import {Campaign, CampaignStep} from '../../model/Campaign';
import {InternalLink} from '../../components/atoms/Link';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {border} from '../../styles/Border';
import RegisteredUserListCard from '../../components/molecules/RegisteredUserListCard';
import {EmptyPlaceholder} from '../../components/templates/EmptyPlaceholder';
import {currencyFormat} from '../../utils/currency';
import SelectableTag from '../../components/atoms/SelectableTag';

enum FilterCardType {
  ActionNeeded = 'Action Needed',
  Ongoing = 'Ongoing',
  Terminated = 'Terminated',
  Completed = 'Completed',
}

const DashboardScreen = () => {
  const safeAreaInsets = useSafeAreaInsets();
  const {uid, user} = useUser();
  const [activeFilterType, setActiveFilterType] = useState<FilterCardType>(
    FilterCardType.ActionNeeded,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
    if (uid) {
      return Transaction.getAllTransactionsByRole(
        uid,
        UserRole.ContentCreator,
        setTransactions,
      );
    }
  }, [uid]);

  if (!transactions || !user) {
    return <LoadingScreen />;
  }
  return (
    <>
      {isLoading && <LoadingScreen />}
      <View
        style={[
          flex.flex1,
          background(COLOR.background.neutral.med),
          {
            paddingTop: Math.max(safeAreaInsets.top, size.default),
          },
        ]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={[flex.flex1]}
          scrollEventThrottle={8}
          stickyHeaderIndices={[1]}
          contentContainerStyle={[
            flex.grow,
            padding.bottom.large,
            flex.flexCol,
            gap.default,
          ]}>
          <DashboardPanel transactions={transactions} />
          <View style={[flex.flexCol, gap.medium]}>
            <View style={[flex.flexRow, items.start, padding.vertical.small]}>
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
            </View>
            {activeFilterType === FilterCardType.ActionNeeded && (
              <View style={[flex.flexRow, items.start, padding.vertical.small]}>
                <FilterPanel />
              </View>
            )}
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
        </ScrollView>
      </View>
    </>
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

interface CampaignCardProps {
  transaction: Transaction;
}

const CampaignCard = ({...props}: CampaignCardProps) => {
  const windowDimension = useWindowDimensions();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  useEffect(() => {
    if (props.transaction.campaignId) {
      Campaign.getById(props.transaction.campaignId)
        .then(setCampaign)
        .catch(() => {
          setCampaign(null);
        });
    }
  }, [props.transaction]);
  return (
    <SkeletonPlaceholder
      isLoading={!campaign}
      width={windowDimension.width - 2 * size.default}
      height={150}>
      {campaign && <OngoingCampaignCard campaign={campaign} />}
    </SkeletonPlaceholder>
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
  verticalSeparator: {
    borderRightWidth: 0.7,
    borderRightColor: COLOR.black[20],
  },
});

export default DashboardScreen;
