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
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';
import {BackButtonLabel} from '../../components/atoms/Header';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../../styles/Size';
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
          {
            paddingTop: safeAreaInsets.top + size.xlarge4,
          },
        ]}>
        <View style={[flex.flexCol, gap.medium, padding.horizontal.default]}>
          {transactions.length <= 0 ? (
            <Text>No transaction yet!</Text>
          ) : (
            transactions.map((t, index) => (
              <RegisteredUserListCard key={index} transaction={t} role={role} />
            ))
          )}
        </View>
      </ScrollView>
    </PageWithBackButton>
  );
};

export default MyTransactionsScreen;
