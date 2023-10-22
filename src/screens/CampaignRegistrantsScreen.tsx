import {View} from 'react-native';
import {Text} from 'react-native';
import {CloseModal} from '../components/atoms/Close';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  RootAuthenticatedStackParamList,
} from '../navigation/AuthenticatedNavigation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEffect, useState} from 'react';
import {Transaction} from '../model/Transaction';
import RegisteredUserListCard from '../components/molecules/RegisteredUserListCard';
type Props = NativeStackScreenProps<
  RootAuthenticatedStackParamList,
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
        {transactions.map((t, index) => (
          <RegisteredUserListCard transaction={t} key={index} />
        ))}
      </HorizontalPadding>
    </SafeAreaContainer>
  );
};

export default CampaignRegistrantsScreen;
