import {Text, View} from 'react-native';
import {shadow} from '../../styles/Shadow';
import {rounded} from '../../styles/BorderRadius';
import {ReactNode} from 'react';
import {AnimatedPressable} from '../atoms/AnimatedPressable';

type Props = {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  handleOnClick: () => void;
};
const ProfileMenuCard = ({title, subtitle, icon, handleOnClick}: Props) => {
  return (
    <View className="w-[45%] my-2 mx-1">
      <AnimatedPressable
        scale={0.95}
        onPress={handleOnClick}
        style={[rounded.medium]}>
        <View
          className="bg-white border border-gray-200 h-48 flex flex-col justify-end pt-6 pb-3 px-3 overflow-hidden"
          style={[rounded.medium]}>
          {icon}
          <Text className="font-semibold text-base mt-2 mb-1">{title}</Text>

          <Text className="text-xs text-gray-500" numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      </AnimatedPressable>
    </View>
  );
};

export default ProfileMenuCard;