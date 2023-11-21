import {Text, View} from 'react-native';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
} from '../navigation/StackNavigation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEffect, useMemo, useState} from 'react';
import {Transaction, TransactionStatus} from '../model/Transaction';
import RegisteredUserListCard from '../components/molecules/RegisteredUserListCard';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {UserRole} from '../model/User';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {padding} from '../styles/Padding';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../styles/Size';
import {ScrollView} from 'react-native-gesture-handler';
import SelectableTag from '../components/atoms/SelectableTag';
import {COLOR} from '../styles/Color';
import {background} from '../styles/BackgroundColor';
import {Campaign, CampaignType} from '../model/Campaign';
import {LoadingScreen} from './LoadingScreen';
import {EmptyPlaceholder} from '../components/templates/EmptyPlaceholder';
import {font} from '../styles/Font';
type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.CampaignRegistrants
>;
const CampaignRegistrantsScreen = ({route}: Props) => {
  const {campaignId, initialTransactionStatusFilter} = route.params;
  const safeAreaInsets = useSafeAreaInsets();
  const [statusFilter, setStatusFilter] = useState<
    TransactionStatus | undefined
  >(initialTransactionStatusFilter);
  const [campaign, setCampaign] = useState<Campaign>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const filteredTransactions = useMemo(
    () =>
      transactions.filter(t =>
        !statusFilter ? true : t.status === statusFilter,
      ),
    [transactions, statusFilter],
  );

  const isPrivateCampaign = useMemo(() => {
    return campaign?.type === CampaignType.Private;
  }, [campaign]);

  useEffect(() => {
    Campaign.getById(campaignId).then(c => setCampaign(c));
  }, [campaignId]);

  useEffect(() => {
    Transaction.getAllTransactionsByCampaign(campaignId, t =>
      setTransactions(t),
    );
  }, [campaignId]);

  const updateStatusFilter = (status: TransactionStatus | undefined) => {
    if (statusFilter !== status) {
      setStatusFilter(status);
    }
  };

  if (!campaign) {
    return <LoadingScreen />;
  }

  return (
    <PageWithBackButton
      fullHeight
      icon="close"
      backButtonPlaceholder={
        <View style={[flex.flex1, flex.flexCol]}>
          <Text
            className="font-semibold"
            style={[font.size[30]]}
            numberOfLines={1}>
            {campaign.title}
          </Text>
          <Text
            className="font-light"
            style={[font.size[20]]}
            numberOfLines={1}>
            {`${campaign.type} campaign`}
          </Text>
        </View>
      }
      underBackButtonPlaceholder={
        <View
          style={[
            background(COLOR.background.neutral.default),
            padding.bottom.default,
          ]}>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            style={[flex.flex1]}
            horizontal
            contentContainerStyle={[
              padding.horizontal.default,
              flex.grow,
              flex.flexRow,
              gap.small,
            ]}>
            <SelectableTag
              text={'All'}
              isSelected={statusFilter === undefined}
              onPress={() => {
                updateStatusFilter(undefined);
              }}
            />
            <SelectableTag
              text={TransactionStatus.registrationPending}
              isSelected={
                statusFilter === TransactionStatus.registrationPending
              }
              onPress={() => {
                updateStatusFilter(TransactionStatus.registrationPending);
              }}
            />
            {isPrivateCampaign && (
              <SelectableTag
                text={TransactionStatus.offering}
                isSelected={statusFilter === TransactionStatus.offering}
                onPress={() => {
                  updateStatusFilter(TransactionStatus.offering);
                }}
              />
            )}
            <SelectableTag
              text={TransactionStatus.brainstormSubmitted}
              isSelected={
                statusFilter === TransactionStatus.brainstormSubmitted
              }
              onPress={() => {
                updateStatusFilter(TransactionStatus.brainstormSubmitted);
              }}
            />
          </ScrollView>
        </View>
      }>
      <View
        style={[
          flex.flex1,
          flex.flexCol,
          gap.medium,
          padding.horizontal.default,
          background(COLOR.background.neutral.default),
          {
            paddingTop: safeAreaInsets.top + size.xlarge5,
            paddingBottom: Math.max(safeAreaInsets.bottom, size.xlarge),
          },
        ]}>
        {filteredTransactions.length <= 0 ? (
          <EmptyPlaceholder />
        ) : (
          filteredTransactions.map((t, index) => (
            <RegisteredUserListCard
              transaction={t}
              role={UserRole.BusinessPeople}
              key={index}
            />
          ))
        )}
      </View>
    </PageWithBackButton>
  );
};

export default CampaignRegistrantsScreen;
