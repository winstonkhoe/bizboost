import {View} from 'react-native';
import {Text} from 'react-native';
import {flex} from '../../styles/Flex';
import {rounded} from '../../styles/BorderRadius';
import {Image} from 'react-native';
import {Transaction, TransactionStatus} from '../../model/Transaction';
import {User} from '../../model/User';
import {useEffect, useState} from 'react';
import {border} from '../../styles/Border';
import {COLOR} from '../../styles/Color';
import {verticalPadding} from '../../styles/Padding';
import {CustomButton} from '../atoms/Button';
import SelectableTag from '../atoms/SelectableTag';

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
          color: COLOR.black[50],
          opacity: 0.3,
        }),
      ]}>
      <View className="flex flex-row items-center w-1/2">
        <View
          className="mr-2 w-12 h-12 items-center justify-center overflow-hidden"
          style={[flex.flexRow, rounded.max]}>
          <Image
            className="w-full h-full object-cover"
            source={
              user?.contentCreator?.profilePicture
                ? {
                    uri: user?.contentCreator?.profilePicture,
                  }
                : require('../../assets/images/bizboost-avatar.png')
            }
          />
        </View>
        <View className="flex flex-col w-4/5 ">
          <Text className="font-semibold text-base " numberOfLines={1}>
            {user?.contentCreator?.fullname}
          </Text>
          <Text className="text-gray-600 text-xs">Subtitle</Text>
        </View>
      </View>
      {transaction.status === TransactionStatus.registrationPending ? (
        <View className="flex flex-row items-center w-1/2 justify-end">
          <View className="w-2/5 mr-2">
            <CustomButton
              onPress={() => {
                transaction.updateStatus(
                  TransactionStatus.registrationApproved,
                );
              }}
              text="Accept"
              customTextSize="text-xs"
            />
          </View>
          <View className="w-2/5">
            <CustomButton
              text="Reject"
              onPress={() => {
                transaction.updateStatus(
                  TransactionStatus.registrationRejected,
                );
              }}
              customTextSize="text-xs"
              customBackgroundColor={COLOR.background.neutral}
            />
          </View>
        </View>
      ) : (
        // <Text>{transaction.status}</Text>
        <SelectableTag text={transaction.status || ''} />
      )}
    </View>
  );
};

export default RegisteredUserListCard;
