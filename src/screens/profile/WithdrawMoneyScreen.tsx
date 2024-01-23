import {ScrollView, View} from 'react-native';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {useEffect, useState} from 'react';
import {Transaction} from '../../model/Transaction';
import {useUser} from '../../hooks/user';
import TransactionCard from '../../components/molecules/TransactionCard';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';
import {BackButtonLabel} from '../../components/atoms/Header';
import {size} from '../../styles/Size';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {EmptyPlaceholder} from '../../components/templates/EmptyPlaceholder';

const WithdrawMoneyScreen = () => {
  const {uid, activeRole} = useUser();
  const safeAreaInsets = useSafeAreaInsets();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  useEffect(() => {
    // TODO: filter completenya disini ga ya? iya disini aja jev
    if (uid && activeRole) {
      return Transaction.getAllTransactionsByRole(uid, activeRole, trans => {
        setTransactions(trans.filter(t => t.isWithdrawable(activeRole)));
      });
    }
  }, [uid, activeRole]);
  return (
    <PageWithBackButton
      fullHeight
      threshold={0}
      backButtonPlaceholder={
        <BackButtonLabel text="Withdrawable Transactions" />
      }>
      <ScrollView
        contentContainerStyle={[
          flex.flex1,
          {
            paddingTop: safeAreaInsets.top + size.xlarge4,
          },
        ]}>
        <View
          style={[
            flex.flex1,
            flex.flexCol,
            gap.medium,
            padding.horizontal.default,
          ]}>
          {transactions.length > 0 ? (
            transactions.map((t, index) => (
              <TransactionCard key={index} transaction={t} role={activeRole} />
            ))
          ) : (
            <EmptyPlaceholder />
          )}
        </View>
      </ScrollView>
    </PageWithBackButton>
  );
};

export default WithdrawMoneyScreen;
