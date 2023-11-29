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

const MyTransactionsScreen = () => {
  const {uid, activeRole} = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  useEffect(() => {
    const unsubscribe = Transaction.getAllTransactionsByRole(
      uid || '',
      activeRole,
      t => setTransactions(t),
    );

    return unsubscribe;
  }, [uid, activeRole]);
  return (
    <SafeAreaContainer enable>
      <CloseModal />
      <ScrollView>
        <View style={[flex.flexCol, gap.medium, padding.horizontal.default]}>
          <Text className="text-lg font-bold">My Transactions</Text>
          {transactions.length <= 0 ? (
            <Text>No transaction yet!</Text>
          ) : (
            transactions.map((t, index) => (
              <RegisteredUserListCard
                key={index}
                transaction={t}
                role={activeRole}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default MyTransactionsScreen;
