import {Text} from 'react-native';
import {User, UserStatus, userStatusTypeMap} from '../../model/User';
import {View} from 'react-native';
import {flex} from '../../styles/Flex';
import {borderRadius, radiusSize, rounded} from '../../styles/BorderRadius';
import {COLOR} from '../../styles/Color';
import {horizontalPadding, verticalPadding} from '../../styles/Padding';
import {gap} from '../../styles/Gap';
import {shadow} from '../../styles/Shadow';
import {background} from '../../styles/BackgroundColor';
import FastImage from 'react-native-fast-image';
import {BaseCard} from './TransactionCard';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {getSourceOrDefaultAvatar} from '../../utils/asset';

type Props = {
  user: User;
};
const UserListCard = ({user}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();

  return (
    <BaseCard
      headerTextLeading={
        user.isAdmin
          ? 'Admin'
          : `${user.contentCreator?.fullname ? 'Content Creator' : ''}${
              user.contentCreator?.fullname && user.businessPeople?.fullname
                ? ' · '
                : ''
            }${user.businessPeople?.fullname ? 'Business People' : ''}`
      }
      handleClickBody={() => {
        navigation.navigate(AuthenticatedNavigation.UserDetail, {
          userId: user.id || '',
        });
      }}
      imageSource={getSourceOrDefaultAvatar({
        uri: user?.contentCreator?.profilePicture,
      })}
      bodyText={
        // TODO: admin liatnya bagusan email apa nama ya
        user.email ||
        user.contentCreator?.fullname ||
        user.businessPeople?.fullname ||
        'User'
      }
      statusText={user.status}
      statusType={user.status && userStatusTypeMap[user.status]}
    />
  );
  // return (
  //   <View className="bg-white" style={[shadow.default, rounded.medium]}>
  //     <View
  //       className="w-full flex flex-row items-center justify-between relative overflow-hidden"
  //       style={[
  //         verticalPadding.default,
  //         horizontalPadding.default,
  //         rounded.medium,
  //       ]}>
  //       <View
  //         className="absolute top-0 right-0 px-5 py-1 bg-black overflow-hidden"
  //         style={[
  //           borderRadius({
  //             bottomLeft: radiusSize.medium,
  //           }),
  //           background(
  //             user.status === UserStatus.Active
  //               ? COLOR.green[50]
  //               : COLOR.red[50],
  //           ),
  //         ]}>
  //         <Text className="font-bold text-xs text-white">{user.status}</Text>
  //       </View>
  //       <View className="flex flex-row items-center w-1/2">
  //         <View
  //           className="mr-2 w-12 h-12 items-center justify-center overflow-hidden"
  //           style={[flex.flexRow, rounded.max]}>
  //           <FastImage
  //             className="w-full h-full object-cover"
  //             source={
  //               user?.contentCreator?.profilePicture
  //                 ? {
  //                     uri: user?.contentCreator?.profilePicture,
  //                   }
  //                 : require('../../assets/images/bizboost-avatar.png')
  //             }
  //           />
  //         </View>
  //         <View className="flex flex-col w-full">
  //           <Text className="font-semibold text-base " numberOfLines={1}>
  //             {user?.contentCreator?.fullname ||
  //               user.businessPeople?.fullname ||
  //               user.email}
  //             {/* {user?.id} */}
  //           </Text>
  //           {/* <Text className="text-gray-600 text-xs">Subtitle</Text> */}
  //           <View style={[flex.flexRow, rounded.max, gap.small]}>
  //             {user.contentCreator && (
  //               <Text className="text-xs text-gray-600">Content Creator</Text>
  //             )}
  //             {user.contentCreator && user.businessPeople ? (
  //               <Text className="text-xs text-gray-600">·</Text>
  //             ) : (
  //               <></>
  //             )}
  //             {user.businessPeople && (
  //               <Text className="text-xs text-gray-600">Business People</Text>
  //             )}
  //           </View>
  //         </View>
  //       </View>
  //     </View>
  //   </View>
  // );
};

export default UserListCard;
