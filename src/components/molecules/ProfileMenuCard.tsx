import {Pressable, Text, View} from 'react-native';
import {shadow} from '../../styles/Shadow';
import {rounded} from '../../styles/BorderRadius';
import {flex} from '../../styles/Flex';
import {ReactNode} from 'react';

type Props = {
  title: string;
  subtitle: string;
  icon?: ReactNode;
};
const ProfileMenuCard = ({title, subtitle, icon}: Props) => {
  return (
    <View style={[shadow.default, rounded.medium]}>
      <Pressable
        className="bg-white flex flex-col pt-5 pb-3 px-3 overflow-hidden"
        style={[rounded.medium]}>
        {icon}
        <Text className="font-semibold text-base mt-2">{title}</Text>

        <Text className="text-sm text-gray-500">{subtitle}</Text>
      </Pressable>
    </View>
  );
};

export default ProfileMenuCard;
