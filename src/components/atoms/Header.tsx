import {Text} from 'react-native';
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';

interface BackButtonLabelProps {
  text: string;
}

export const BackButtonLabel = ({text}: BackButtonLabelProps) => {
  return (
    <Text
      className="font-bold"
      style={[font.size[50], textColor(COLOR.text.neutral.high)]}>
      {text}
    </Text>
  );
};
