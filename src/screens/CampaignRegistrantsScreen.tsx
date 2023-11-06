import {Text} from 'react-native';
import {CloseModal} from '../components/atoms/Close';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
} from '../navigation/StackNavigation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEffect, useState} from 'react';
import {Transaction} from '../model/Transaction';
import RegisteredUserListCard from '../components/molecules/RegisteredUserListCard';
type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.CampaignRegistrants
>;
const CampaignRegistrantsScreen = ({route}: Props) => {
  const {campaignId} = route.params;
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    Transaction.getAllTransactionsByCampaign(campaignId, t =>
      setTransactions(t),
    );
  }, [campaignId]);
  return (
    <SafeAreaContainer>
      <CloseModal />
      <HorizontalPadding>
        <Text className="text-lg font-bold">Registrants</Text>
        {transactions.length <= 0 ? (
          <Text>No Content Creator has joined this campaign!</Text>
        ) : (
          transactions.map((t, index) => (
            <RegisteredUserListCard transaction={t} key={index} />
          ))
        )}
      </HorizontalPadding>
    </SafeAreaContainer>
  );
};

export default CampaignRegistrantsScreen;
