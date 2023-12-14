import {Text, View} from 'react-native';
import {rounded, RadiusSizeType} from '../../styles/BorderRadius';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {textColor} from '../../styles/Text';
import {FontSizeType, font} from '../../styles/Font';

interface Props {
  text: string;
  type?: 'success' | 'danger' | 'neutral';
  radius?: RadiusSizeType;
  fontSize?: FontSizeType;
}
const Label = ({
  text,
  type = 'success',
  radius = 'xlarge',
  fontSize = 20,
}: Props) => {
  return (
    <View
      className="px-2 py-1"
      style={[
        rounded[radius],
        type === 'success' && background(COLOR.green[50]),
        type === 'danger' && background(COLOR.red[50]),
        type === 'neutral' && background(COLOR.background.neutral.high),
      ]}>
      <Text
        className="font-bold"
        style={[textColor(COLOR.absoluteBlack[5]), font.size[fontSize]]}>
        {text}
      </Text>
    </View>
  );
};

export {Label};
