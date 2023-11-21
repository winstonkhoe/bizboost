import {Text} from 'react-native';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {View} from 'react-native';
import {flex} from '../../styles/Flex';
import {font} from '../../styles/Font';
import {gap} from '../../styles/Gap';

export type FormFieldType = 'optional' | 'required';

interface FormLabelProps {
  type?: FormFieldType;
}

export const FormLabel = ({type = 'required'}: FormLabelProps) => {
  return type === 'optional' ? (
    <Text style={[textColor(COLOR.text.neutral.low)]}>(Optional)</Text>
  ) : (
    <Text style={[textColor(COLOR.text.danger.default)]}>*</Text>
  );
};

interface FormFieldHelperProps extends FormLabelProps {
  title?: string;
  description?: string;
}

export const FormFieldHelper = ({
  title,
  description,
  ...props
}: FormFieldHelperProps) => {
  return title || description ? (
    <View style={[flex.flexCol, gap.small]}>
      {title && (
        <Text
          className="font-bold"
          style={[textColor(COLOR.text.neutral.high), font.size[50]]}>
          {title} <FormLabel type={props.type} />
        </Text>
      )}
      {description && (
        <Text
          className="font-medium"
          style={[textColor(COLOR.text.neutral.med), font.size[30]]}>
          {description}
        </Text>
      )}
    </View>
  ) : null;
};
