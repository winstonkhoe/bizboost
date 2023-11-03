import {Text} from 'react-native';
import {User, UserStatus} from '../../model/User';
import {View} from 'react-native';
import {Image} from 'react-native';
import {flex} from '../../styles/Flex';
import {rounded} from '../../styles/BorderRadius';
import {COLOR} from '../../styles/Color';
import {verticalPadding} from '../../styles/Padding';
import {border} from '../../styles/Border';
import {gap} from '../../styles/Gap';
import PlatformTag from '../atoms/PlatformTag';
import {textColor} from '../../styles/Text';

type Props = {
  user: User;
};
const UserListCard = ({user}: Props) => {
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
        <View className="flex flex-col w-full">
          <Text className="font-semibold text-base " numberOfLines={1}>
            {user?.contentCreator?.fullname ||
              user.businessPeople?.fullname ||
              user.email}
            {/* {user?.id} */}
          </Text>
          {/* <Text className="text-gray-600 text-xs">Subtitle</Text> */}
          <View style={[flex.flexRow, rounded.max, gap.small]}>
            {user.contentCreator && <PlatformTag text="CC" />}
            {user.businessPeople && <PlatformTag text="BP" />}
          </View>
        </View>
      </View>
      <Text
        style={[
          textColor(
            user.status === UserStatus.Active
              ? COLOR.text.green.default
              : COLOR.text.danger.default,
          ),
        ]}>
        {user.status}
      </Text>
    </View>
  );
};

export default UserListCard;
