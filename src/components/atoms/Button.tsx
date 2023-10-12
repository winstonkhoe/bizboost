import {Pressable, PressableProps, Text} from 'react-native';
import {RadiusSizeType, rounded} from '../../styles/BorderRadius';
import {View} from 'react-native';
import {flex} from '../../styles/Flex';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {textColor} from '../../styles/Text';

interface Props extends PressableProps, React.RefAttributes<View> {
  text: string;
  rounded: RadiusSizeType;
}
export const AuthButton = ({text, rounded: roundSize, ...props}: Props) => {
  return (
    <Pressable
      {...props}
      className="w-full justify-center items-center text-center px-6 py-3"
      style={[
        flex.flexRow,
        rounded[roundSize],
        background(COLOR.blue[200], 1),
      ]}>
      <Text className="font-bold text-base" style={[textColor(COLOR.white)]}>
        {text}
      </Text>
    </Pressable>
  );
};
