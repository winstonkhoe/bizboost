import {ScrollView, Text, View} from 'react-native';
import {CloseModal} from '../components/atoms/Close';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
} from '../navigation/StackNavigation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEffect, useState} from 'react';
import {Transaction} from '../model/Transaction';
import RegisteredUserListCard from '../components/molecules/RegisteredUserListCard';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {UserRole} from '../model/User';
import {padding} from '../styles/Padding';
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
    <SafeAreaContainer enable>
      <CloseModal />
      <ScrollView>
        <View style={[flex.flexCol, gap.medium, padding.horizontal.default]}>
          <Text className="text-lg font-bold">Registrants</Text>
          {transactions.length <= 0 ? (
            <Text>No Content Creator has joined this campaign!</Text>
          ) : (
            transactions.map((t, index) => (
              <RegisteredUserListCard
                transaction={t}
                role={UserRole.BusinessPeople}
                key={index}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default CampaignRegistrantsScreen;
