import {Image, Text, View} from 'react-native';
import {flex, items} from '../../styles/Flex';
import {rounded} from '../../styles/BorderRadius';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {textColor} from '../../styles/Text';
import {
  BusinessPeople,
  ContentCreator,
  UserRole,
  UserRoles,
} from '../../model/User';
import {gap} from '../../styles/Gap';
import Add from '../../assets/vectors/add-thin.svg';
import {border} from '../../styles/Border';
import {useAppDispatch} from '../../redux/hooks';
import {switchRole} from '../../redux/slices/userSlice';
import {useNavigation} from '@react-navigation/native';
import {closeModal} from '../../redux/slices/modalSlice';
import {setRole} from '../../redux/slices/forms/createAdditionalAccountSlice';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {AnimatedPressable} from '../atoms/AnimatedPressable';
import {padding} from '../../styles/Padding';
import {dimension} from '../../styles/Dimension';
import {font} from '../../styles/Font';

interface Props {
  data?: BusinessPeople | ContentCreator;
  active?: boolean;
  role: UserRoles;
}
const AccountListCard = ({data, active = false, role}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();
  const dispatch = useAppDispatch();
  const isValidUser = () => {
    return !!data?.fullname;
  };
  const handlePress = () => {
    if (isValidUser()) {
      dispatch(switchRole(role));
    } else {
      dispatch(setRole(role));
      navigation.navigate(AuthenticatedNavigation.CreateAdditionalAccount);
    }
    dispatch(closeModal());
  };
  return (
    <AnimatedPressable
      scale={0.9}
      style={[
        flex.flexRow,
        items.center,
        rounded.default,
        gap.default,
        padding.default,
        dimension.height.xlarge5,
        active ? background(COLOR.green[5]) : null,
      ]}
      onPress={handlePress}>
      <View
        className="w-16 h-16 items-center justify-center overflow-hidden"
        style={[
          flex.flexRow,
          rounded.max,
          !isValidUser() &&
            border({
              borderWidth: 0.7,
              color: COLOR.background.neutral.med,
            }),
        ]}>
        {isValidUser() ? (
          <Image
            style={[dimension.full]}
            source={
              isValidUser() && data?.profilePicture
                ? {
                    uri: data?.profilePicture,
                  }
                : require('../../assets/images/bizboost-avatar.png')
            }
            resizeMode="cover"
          />
        ) : (
          <Add width={25} height={25} color={COLOR.black[100]} />
        )}
      </View>
      <View style={[flex.flex1, flex.flexCol, gap.xsmall2]}>
        <Text
          className="font-bold"
          numberOfLines={1}
          style={[
            font.size[40],
            active ? textColor(COLOR.green[60]) : textColor(COLOR.black[100]),
          ]}>
          {isValidUser() ? data?.fullname : 'Create account'}
        </Text>
        <Text
          className="font-medium"
          numberOfLines={1}
          style={[
            font.size[20],
            active ? textColor(COLOR.green[60]) : textColor(COLOR.black[100]),
          ]}>
          {role}
        </Text>
      </View>
    </AnimatedPressable>
  );
};

export {AccountListCard};
