import {Image, Text, View} from 'react-native';
import {flex} from '../../styles/Flex';
import {rounded} from '../../styles/BorderRadius';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {textColor} from '../../styles/Text';
import {UserRole} from '../../model/User';
import {gap} from '../../styles/Gap';

interface Props {
  name: string;
  active: boolean;
  role: UserRole;
}
const AccountListCard = ({name, active, role}: Props) => {
  return (
    <View
      className="w-full h-20 p-3 items-center"
      style={[
        flex.flexRow,
        rounded.default,
        gap.default,
        active ? background(COLOR.blue[100], 0.6) : null,
      ]}>
      <View className="w-16 h-16 rounded-full overflow-hidden">
        <Image
          className="w-full h-full object-cover"
          source={require('../../assets/images/kopi-nako-logo.jpeg')}
        />
      </View>
      <View className="flex-1" style={[flex.flexCol, gap.xsmall2]}>
        <Text
          className="text-base font-bold"
          numberOfLines={1}
          style={[
            active ? textColor(COLOR.blue[200]) : textColor(COLOR.black),
          ]}>
          {name}
        </Text>
        <Text
          className="text-xs font-medium"
          numberOfLines={1}
          style={[
            active ? textColor(COLOR.blue[200]) : textColor(COLOR.black),
          ]}>
          {role === 'CC'
            ? 'Content Creator'
            : role === 'BP'
            ? 'Business People'
            : null}
        </Text>
      </View>
    </View>
  );
};

export {AccountListCard};
