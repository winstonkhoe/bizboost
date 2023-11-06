import {Text} from 'react-native';
import {User, UserStatus} from '../../model/User';
import {View} from 'react-native';
import {Image} from 'react-native';
import {flex} from '../../styles/Flex';
import {borderRadius, radiusSize, rounded} from '../../styles/BorderRadius';
import {COLOR} from '../../styles/Color';
import {horizontalPadding, verticalPadding} from '../../styles/Padding';
import {border} from '../../styles/Border';
import {gap} from '../../styles/Gap';
import PlatformTag from '../atoms/PlatformTag';
import {textColor} from '../../styles/Text';
import {shadow} from '../../styles/Shadow';
import {background} from '../../styles/BackgroundColor';

type Props = {
  user: User;
};
const UserListCard = ({user}: Props) => {
  return (
    <View className="bg-white" style={[shadow.default, rounded.medium]}>
      <View
        className="w-full flex flex-row items-center justify-between relative overflow-hidden"
        style={[
          verticalPadding.default,
          horizontalPadding.default,
          rounded.medium,
        ]}>
        <View
          className="absolute top-0 right-0 px-5 py-1 bg-black overflow-hidden"
          style={[
            borderRadius({
              bottomLeft: radiusSize.medium,
            }),
            background(
              user.status === UserStatus.Active
                ? COLOR.green[50]
                : COLOR.red[50],
            ),
          ]}>
          <Text className="font-bold text-xs text-white">{user.status}</Text>
        </View>
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
              {user.contentCreator && (
                <Text className="text-xs text-gray-600">Content Creator</Text>
              )}
              {user.contentCreator && user.businessPeople ? (
                <Text className="text-xs text-gray-600">·</Text>
              ) : (
                <></>
              )}
              {user.businessPeople && (
                <Text className="text-xs text-gray-600">Business People</Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default UserListCard;
