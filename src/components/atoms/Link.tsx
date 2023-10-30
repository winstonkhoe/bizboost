import {Pressable, PressableProps, Text} from 'react-native';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {FontSizeType, font} from '../../styles/Font';

interface Props extends PressableProps {
  text: string;
  size?: FontSizeType;
}
const InternalLink = ({text, size: sizeType = 40, ...props}: Props) => {
  return (
    <Pressable {...props}>
      <Text
        className="font-bold"
        style={[textColor(COLOR.green[60]), font.size[sizeType]]}>
        {text}
      </Text>
    </Pressable>
  );
};

export {InternalLink};
