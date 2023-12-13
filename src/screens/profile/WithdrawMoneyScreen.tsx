import {ScrollView, View} from 'react-native';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {useEffect, useState} from 'react';
import {Transaction, TransactionStatus} from '../../model/Transaction';
import {useUser} from '../../hooks/user';
import RegisteredUserListCard from '../../components/molecules/RegisteredUserListCard';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';
import {BackButtonLabel} from '../../components/atoms/Header';
import {size} from '../../styles/Size';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const WithdrawMoneyScreen = () => {
  const {uid, activeRole} = useUser();
  const safeAreaInsets = useSafeAreaInsets();
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
    <PageWithBackButton
      fullHeight
      threshold={0}
      backButtonPlaceholder={<BackButtonLabel text="Completed Transactions" />}>
      <ScrollView
        style={[flex.flex1]}
        contentContainerStyle={[
          {
            paddingTop: safeAreaInsets.top + size.xlarge4,
          },
        ]}>
        <View style={[flex.flexCol, gap.medium, padding.horizontal.default]}>
          {transactions.map((t, index) => (
            <RegisteredUserListCard
              key={index}
              transaction={t}
              role={activeRole}
            />
          ))}
        </View>
      </ScrollView>
    </PageWithBackButton>
  );
};

export default WithdrawMoneyScreen;
