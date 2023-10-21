import {Button, View} from 'react-native';
import {Text} from 'react-native';
import {flex} from '../../styles/Flex';
import {rounded} from '../../styles/BorderRadius';
import {Image} from 'react-native';
import {Transaction, TransactionStatus} from '../../model/Transaction';
import {User} from '../../model/User';
import {useEffect, useState} from 'react';
import {border} from '../../styles/Border';
import {COLOR} from '../../styles/Color';
import {horizontalPadding, verticalPadding} from '../../styles/Padding';

type Props = {
  transaction: Transaction;
};
const RegisteredUserListCard = ({transaction}: Props) => {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    User.getById(transaction.contentCreatorId || '').then(u => setUser(u));
  }, [transaction]);

  return (
    <View
      className="w-full flex flex-row items-center justify-between border-b"
      style={[
        verticalPadding.default,
        border({
          color: COLOR.black,
          opacity: 0.3,
        }),
      ]}>
      <View className="flex flex-row items-center">
        <View
          className="w-10 h-10 items-center justify-center overflow-hidden"
          style={[flex.flexRow, rounded.max]}>
          <Image
            className="w-full h-full object-cover"
            source={{
              uri: user?.contentCreator?.profilePicture,
            }}
          />
        </View>
        <Text>{user?.contentCreator?.fullname}</Text>
      </View>
      {transaction.status === TransactionStatus.registrationPending ? (
        <View className="flex flex-row items-center">
          <Button
            title="✅"
            onPress={() => {
              transaction.updateStatus(TransactionStatus.registrationApproved);
            }}
          />
          <Button
            title="❌"
            onPress={() => {
              transaction.updateStatus(TransactionStatus.registrationRejected);
            }}
          />
        </View>
      ) : (
        <Text>{transaction.status}</Text>
      )}
    </View>
  );
};

export default RegisteredUserListCard;
