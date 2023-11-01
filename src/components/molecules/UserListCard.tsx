import {Text} from 'react-native';
import {User} from '../../model/User';
import {View} from 'react-native';
import {Image} from 'react-native';
import {flex} from '../../styles/Flex';
import {rounded} from '../../styles/BorderRadius';
import {COLOR} from '../../styles/Color';
import {verticalPadding} from '../../styles/Padding';
import {border} from '../../styles/Border';
import {gap} from '../../styles/Gap';
import SelectableTag from '../atoms/SelectableTag';
import PlatformTag from '../atoms/PlatformTag';

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
        <View className="flex flex-col w-4/5 ">
          <Text className="font-semibold text-base " numberOfLines={1}>
            {user?.contentCreator?.fullname || user.email}
            {user?.id}
          </Text>
          <Text className="text-gray-600 text-xs">Subtitle</Text>
          <View style={[flex.flexRow, rounded.max, gap.default]}>
            {user.contentCreator && <PlatformTag text="Content Creator" />}
            {user.businessPeople && <PlatformTag text="Business People" />}
          </View>
        </View>
      </View>
    </View>
  );
};

export default UserListCard;
