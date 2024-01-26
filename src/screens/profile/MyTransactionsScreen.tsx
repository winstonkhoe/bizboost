import {ScrollView, Text, View} from 'react-native';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import TransactionCard from '../../components/molecules/TransactionCard';
import {useEffect, useState} from 'react';
import {Transaction} from '../../model/Transaction';
import {padding} from '../../styles/Padding';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
} from '../../navigation/StackNavigation';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';
import {BackButtonLabel} from '../../components/atoms/Header';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../../styles/Size';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {EmptyPlaceholder} from '../../components/templates/EmptyPlaceholder';
type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.MyTransactions
>;
const MyTransactionsScreen = ({route}: Props) => {
  const {userId, role} = route.params;
  const safeAreaInsets = useSafeAreaInsets();
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
    <PageWithBackButton
      fullHeight
      threshold={0}
      backButtonPlaceholder={<BackButtonLabel text="Transactions" />}>
      <ScrollView
        style={[flex.flex1]}
        contentContainerStyle={[
          flex.flex1,
          {
            paddingTop: Math.max(safeAreaInsets.top, size.small),
          },
        ]}>
        <SafeAreaContainer enable>
          <View
            style={[
              flex.flex1,
              flex.flexCol,
              gap.medium,
              padding.horizontal.default,
            ]}>
            {transactions.length <= 0 ? (
              <EmptyPlaceholder />
            ) : (
              transactions.map((t, index) => (
                <TransactionCard key={index} transaction={t} role={role} />
              ))
            )}
          </View>
        </SafeAreaContainer>
      </ScrollView>
    </PageWithBackButton>
  );
};

export default MyTransactionsScreen;
