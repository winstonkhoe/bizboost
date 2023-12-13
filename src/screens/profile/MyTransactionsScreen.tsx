import {ScrollView, Text, View} from 'react-native';
import {CloseModal} from '../../components/atoms/Close';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import RegisteredUserListCard from '../../components/molecules/RegisteredUserListCard';
import {useUser} from '../../hooks/user';
import {useEffect, useState} from 'react';
import {Transaction} from '../../model/Transaction';
import {padding} from '../../styles/Padding';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
} from '../../navigation/StackNavigation';
type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.MyTransactions
>;
const MyTransactionsScreen = ({route}: Props) => {
  const {userId, role} = route.params;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  useEffect(() => {
    const unsubscribe = Transaction.getAllTransactionsByRole(
      userId || '',
      role,
      t => setTransactions(t),
    );

    return unsubscribe;
  }, [userId, role]);
  return (
    <SafeAreaContainer enable>
      <CloseModal />
      <ScrollView>
        <View style={[flex.flexCol, gap.medium, padding.horizontal.default]}>
          <Text className="text-lg font-bold">Transactions</Text>
          {transactions.length <= 0 ? (
            <Text>No transaction yet!</Text>
          ) : (
            transactions.map((t, index) => (
              <RegisteredUserListCard key={index} transaction={t} role={role} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default MyTransactionsScreen;
