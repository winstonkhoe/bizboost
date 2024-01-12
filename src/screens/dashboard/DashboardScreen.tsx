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
import {CampaignCard} from '../../components/molecules/CampaignCard';
import {SkeletonPlaceholder} from '../../components/molecules/SkeletonPlaceholder';
import {Campaign, CampaignStep} from '../../model/Campaign';
import {InternalLink} from '../../components/atoms/Link';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {border} from '../../styles/Border';
import TransactionCard from '../../components/molecules/TransactionCard';
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
          stickyHeaderIndices={[1]}
          contentContainerStyle={[
            flex.grow,
            padding.bottom.large,
            flex.flexCol,
            gap.default,
          ]}>

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
      {campaign && <CampaignCard campaign={campaign} />}
    </SkeletonPlaceholder>
  );
};

const styles = StyleSheet.create({
  verticalSeparator: {
    borderRightWidth: 0.7,
    borderRightColor: COLOR.black[20],
  },
});

export default DashboardScreen;
