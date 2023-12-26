import {Text} from 'react-native';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {View} from 'react-native';
import {flex} from '../../styles/Flex';
import {FontSizeType, font} from '../../styles/Font';
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
  titleSize?: FontSizeType;
  descriptionSize?: FontSizeType;
}

export const FormFieldHelper = ({
  title,
  description,
  titleSize = 50,
  descriptionSize = 30,
  ...props
}: FormFieldHelperProps) => {
  return title || description ? (
    <View style={[flex.flexCol, gap.small]}>
      {title && (
        <Text
          style={[
            flex.flex1,
            textColor(COLOR.text.neutral.high),
            font.weight.bold,
            font.size[titleSize],
          ]}>
          {title} <FormLabel type={props.type} />
        </Text>
      )}
      {description && (
        <Text
          style={[
            flex.flex1,
            textColor(COLOR.text.neutral.med),
            font.weight.medium,
            font.size[descriptionSize],
          ]}>
          {description}
        </Text>
      )}
    </View>
  ) : null;
};
