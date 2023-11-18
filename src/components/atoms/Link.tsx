import {Text} from 'react-native';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {FontSizeType, font} from '../../styles/Font';
import {AnimatedPressable, AnimatedPressableProps} from './AnimatedPressable';

interface Props extends Partial<AnimatedPressableProps> {
  text: string;
  size?: FontSizeType;
}
const InternalLink = ({text, size: sizeType = 40, ...props}: Props) => {
  return (
    <AnimatedPressable {...props}>
      <Text
        className="font-bold"
        style={[textColor(COLOR.green[60]), font.size[sizeType]]}>
        {text}
      </Text>
    </AnimatedPressable>
  );
};

export {InternalLink};
