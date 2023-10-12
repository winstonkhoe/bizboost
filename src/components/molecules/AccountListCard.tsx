import {Image, Pressable, Text, View} from 'react-native';
import {flex} from '../../styles/Flex';
import {rounded} from '../../styles/BorderRadius';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {textColor} from '../../styles/Text';
import {UserRole, UserRoles} from '../../model/User';
import {gap} from '../../styles/Gap';
import Add from '../../assets/vectors/add-thin.svg';
import {border} from '../../styles/Border';
import {useAppDispatch} from '../../redux/hooks';
import {switchRole} from '../../redux/slices/userSlice';
import {useNavigation} from '@react-navigation/native';
import {closeModal} from '../../redux/slices/modalSlice';

interface Props {
  name?: string;
  active?: boolean;
  role: UserRoles;
}
const AccountListCard = ({name, active = false, role}: Props) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const isValidUser = () => {
    return !!name;
  };
  const handlePress = () => {
    if (isValidUser()) {
      dispatch(switchRole(role));
    } else {
      navigation.navigate('Create Account', {role: role});
      dispatch(closeModal());
    }
  };
  return (
    <Pressable
      className="w-full h-20 p-3 items-center"
      style={[
        flex.flexRow,
        rounded.default,
        gap.default,
        active ? background(COLOR.blue[100], 0.6) : null,
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
              color: COLOR.black,
              opacity: 0.4,
            }),
        ]}>
        {isValidUser() ? (
          <Image
            className="w-full h-full object-cover"
            source={require('../../assets/images/kopi-nako-logo.jpeg')}
          />
        ) : (
          <Add width={25} height={25} color={COLOR.black} />
        )}
      </View>
      <View className="flex-1" style={[flex.flexCol, gap.xsmall2]}>
        <Text
          className="text-base font-bold"
          numberOfLines={1}
          style={[
            active ? textColor(COLOR.blue[200]) : textColor(COLOR.black),
          ]}>
          {isValidUser() ? name : 'Create account'}
        </Text>
        <Text
          className="text-xs font-medium"
          numberOfLines={1}
          style={[
            active ? textColor(COLOR.blue[200]) : textColor(COLOR.black),
          ]}>
          {role === UserRole.ContentCreator
            ? 'Content Creator'
            : role === UserRole.BusinessPeople
            ? 'Business People'
            : null}
        </Text>
      </View>
    </Pressable>
  );
};

export {AccountListCard};
