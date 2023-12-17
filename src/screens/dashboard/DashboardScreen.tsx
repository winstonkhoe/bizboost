import {ReactNode, useEffect, useMemo, useState} from 'react';
import {LoadingScreen} from '../LoadingScreen';
import {Transaction} from '../../model/Transaction';
import {useUser} from '../../hooks/user';
import {UserRole} from '../../model/User';
import {
  Pressable,
  PressableProps,
  View,
  useWindowDimensions,
} from 'react-native';
import {flex, items, justify, self} from '../../styles/Flex';
import {padding} from '../../styles/Padding';
import {rounded} from '../../styles/BorderRadius';
import {shadow} from '../../styles/Shadow';
import {Text} from 'react-native';
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {gap} from '../../styles/Gap';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {RatingStarIcon} from '../../components/atoms/Icon';
import {round} from 'lodash';
import {ScrollView} from 'react-native-gesture-handler';
import {dimension} from '../../styles/Dimension';
import {background} from '../../styles/BackgroundColor';
import {size} from '../../styles/Size';
import {OngoingCampaignCard} from '../../components/molecules/OngoingCampaignCard';
import {SkeletonPlaceholder} from '../../components/molecules/SkeletonPlaceholder';
import {Campaign} from '../../model/Campaign';
import {InternalLink} from '../../components/atoms/Link';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {border} from '../../styles/Border';
import RegisteredUserListCard from '../../components/molecules/RegisteredUserListCard';
import {EmptyPlaceholder} from '../../components/templates/EmptyPlaceholder';

enum FilterCardType {
  ActionNeeded = 'Action Needed',
  Terminated = 'Terminated',
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

  const terminatedTransactions = useMemo(
    () => transactions.filter(transaction => transaction.isTerminated()),
    [transactions],
  );

  const filteredTransactions = useMemo(() => {
    switch (activeFilterType) {
      case FilterCardType.ActionNeeded:
        return actionNeededTransactions;
      case FilterCardType.Terminated:
        return terminatedTransactions;
      default:
        return transactions;
    }
  }, [
    activeFilterType,
    actionNeededTransactions,
    transactions,
    terminatedTransactions,
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
      <View style={[flex.flex1, background(COLOR.background.neutral.default)]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={[flex.flex1]}
          contentContainerStyle={[
            flex.grow,
            {
              paddingTop: Math.max(safeAreaInsets.top, size.default),
            },
            padding.bottom.large,
            flex.flexCol,
            gap.default,
          ]}>
          <DashboardPanel />
          <View style={[flex.flexRow, items.start]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                flex.flexRow,
                gap.default,
                padding.horizontal.default,
                padding.vertical.small,
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
                isLoading={terminatedTransactions?.length === undefined}>
                <FilterCard
                  isActive={activeFilterType === FilterCardType.Terminated}
                  label="Terminated"
                  count={terminatedTransactions.length}
                  onPress={() => setActiveFilterType(FilterCardType.Terminated)}
                />
              </SkeletonPlaceholder>
            </ScrollView>
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
        className="font-bold"
        style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
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

const DashboardPanel = () => {
  const {user} = useUser();
  const navigation = useNavigation<NavigationStackProps>();
  return (
    <View style={[padding.horizontal.default]}>
      <View
        style={[
          padding.horizontal.small,
          padding.vertical.default,
          rounded.medium,
          flex.flexRow,
          justify.around,
          shadow.default,
        ]}>
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
                className="font-semibold text-center"
                style={[
                  self.center,
                  font.size[20],
                  textColor(COLOR.text.neutral.med),
                ]}
                numberOfLines={1}>
                {`${user?.bankAccountInformation?.accountNumber}`}
              </Text>
              <Text
                className="font-semibold text-center"
                style={[
                  self.center,
                  font.size[20],
                  textColor(COLOR.text.neutral.med),
                ]}
                numberOfLines={1}>
                {`${user?.bankAccountInformation?.accountHolderName}`}
              </Text>
            </Pressable>
          ) : (
            <InternalLink
              text="Update Bank Info"
              size={30}
              onPress={() => {
                navigation.navigate(
                  AuthenticatedNavigation.EditBankAccountInformationScreen,
                );
              }}
            />
          )}
        </DashboardPanelItem>

        <DashboardPanelItem
          label={
            user?.contentCreator?.ratedCount
              ? `${user?.contentCreator?.ratedCount} Rating`
              : 'Rating'
          }>
          <View style={[flex.flexRow, items.end, gap.xsmall2]}>
            <RatingStarIcon size="medium" />
            <Text
              className="font-bold"
              style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
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
    <View style={[flex.flexCol, items.center, gap.small]}>
      <View
        style={[
          flex.flexCol,
          justify.center,
          {
            height: size.xlarge2,
          },
        ]}>
        {props.children}
      </View>
      <Text style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
        {props.label}
      </Text>
    </View>
  );
};

export default DashboardScreen;
