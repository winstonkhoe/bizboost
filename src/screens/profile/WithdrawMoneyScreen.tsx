import {ScrollView, Text, View} from 'react-native';
import {CloseModal} from '../../components/atoms/Close';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {useEffect, useState} from 'react';
import {Transaction, TransactionStatus} from '../../model/Transaction';
import {useUser} from '../../hooks/user';
import RegisteredUserListCard from '../../components/molecules/RegisteredUserListCard';

const WithdrawMoneyScreen = () => {
  const {uid, activeRole} = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  useEffect(() => {
    // TODO: filter completenya disini ga ya?
    const unsubscribe = Transaction.getAllTransactionsByRole(
      uid || '',
      activeRole!!,
      trans => {
        setTransactions(
          trans.filter(t => t.status === TransactionStatus.completed),
        );
      },
    );

    return unsubscribe;
  }, [uid, activeRole]);
  return (
    <SafeAreaContainer enable>
      <CloseModal />
      <ScrollView>
        <View style={[flex.flexCol, gap.medium, padding.horizontal.default]}>
          <Text className="text-lg font-bold">Completed Transactions</Text>
          {transactions.map((t, index) => (
            <RegisteredUserListCard
              key={index}
              transaction={t}
              role={activeRole}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default WithdrawMoneyScreen;
