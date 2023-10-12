import {Pressable, PressableProps, Text} from 'react-native';
import {RadiusSizeType, rounded} from '../../styles/BorderRadius';
import {View} from 'react-native';
import {flex} from '../../styles/Flex';

interface Props extends PressableProps, React.RefAttributes<View> {
  text: string;
  rounded: RadiusSizeType;
}
export const AuthButton = ({text, rounded: roundSize, ...props}: Props) => {
  return (
    <Pressable
      {...props}
      className="justify-center items-center text-center"
      style={[flex.flexRow, rounded[roundSize]]}>
      <Text>{text}</Text>
    </Pressable>
  );
};
