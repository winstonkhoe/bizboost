import {Text} from 'react-native';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';

interface FormLabelProps {
  type: 'optional' | 'required';
}

export const FormLabel = ({type}: FormLabelProps) => {
  return type === 'optional' ? (
    <Text style={[textColor(COLOR.text.neutral.low)]}>(Optional)</Text>
  ) : (
    <Text style={[textColor(COLOR.text.danger.default)]}>*</Text>
  );
};
