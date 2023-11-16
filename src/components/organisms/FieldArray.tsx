import React, {useEffect, useState} from 'react';
import {Control, Controller, useFieldArray} from 'react-hook-form';
import {Text, View} from 'react-native';
import {FormlessTextInput} from '../atoms/Input';
import {FormFieldHelper} from '../atoms/FormLabel';
import {SheetModal} from '../../containers/SheetModal';
import {HorizontalPadding, VerticalPadding} from '../atoms/ViewPadding';
import {flex, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {padding} from '../../styles/Padding';
import {font} from '../../styles/Font';
import {CustomButton} from '../atoms/Button';
import {Platform} from 'react-native';
import {useKeyboard} from '../../hooks/keyboard';
import {FieldArrayLabel} from '../molecules/FieldArrayLabel';
type Props = {
  control: Control<any>;
  title: string;
  parentName: any; // string
  childName: string;
  placeholder?: string;
  fieldType?: 'default' | 'textarea';
  maxFieldLength?: number;
  helperText?: string;
};
const FieldArray = ({
  control,
  title,
  parentName,
  childName,
  placeholder,
  fieldType = 'default',
  maxFieldLength = 40,
  helperText,
}: Props) => {
  const keyboardHeight = useKeyboard();
  const [temporaryText, setTemporaryText] = useState<string>('');
  const [updateIndex, setUpdateIndex] = useState<number | null>(null);
  const [isModalOpened, setIsModalOpened] = useState(false);
  const {fields, append, remove} = useFieldArray({
    name: parentName,
    control,
  });

  const updateText = (text: string) => {
    setTemporaryText(text);
  };

  useEffect(() => {
    if (isModalOpened === false) {
      setUpdateIndex(null);
    }
  }, [isModalOpened]);

  const addNewEntry = () => {
    append({value: temporaryText});
    setTemporaryText('');
    setIsModalOpened(false);
  };

  const updateEntry = (onChange: (...event: any[]) => void) => {
    onChange(temporaryText);
    setIsModalOpened(false);
  };

  return (
    <>
      <View style={[flex.flexCol, gap.default]}>
        <FormFieldHelper title={title} />
        <View style={[flex.flexCol, gap.medium]}>
          {fields.length > 0 && (
            <View style={[flex.flexCol, gap.small]}>
              {fields.map((f, index) => (
                <View key={f.id} style={[flex.flexRow, justify.start]}>
                  <Controller
                    control={control}
                    name={`${parentName}.${index}.${childName}`}
                    render={({field: {value}}) => (
                      <FieldArrayLabel
                        type="field"
                        text={`${value}`}
                        onPress={() => {
                          setUpdateIndex(index);
                          setIsModalOpened(true);
                        }}
                        onRemovePress={() => remove(index)}
                      />
                    )}
                  />
                </View>
              ))}
            </View>
          )}
          <View style={[flex.flexRow, justify.start]}>
            <FieldArrayLabel
              type="add"
              text={placeholder ? placeholder : 'Add'}
              onPress={() => {
                setIsModalOpened(true);
              }}
            />
          </View>
        </View>
      </View>
      <SheetModal
        open={isModalOpened}
        onDismiss={() => {
          setIsModalOpened(false);
        }}>
        <HorizontalPadding paddingSize="large">
          <VerticalPadding paddingSize="default">
            <View style={[flex.flexCol, gap.default, padding.bottom.xlarge]}>
              <View style={[flex.flexRow, justify.center]}>
                <Text
                  className="font-bold"
                  style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
                  {title}
                </Text>
              </View>
              <View style={[flex.flexRow, justify.center]}>
                <Controller
                  control={control}
                  name={`${parentName}.${updateIndex}.${childName}`}
                  render={({field: {value, onChange}}) => (
                    <View style={[flex.flexCol, gap.medium]}>
                      <FormlessTextInput
                        counter
                        type={fieldType}
                        max={maxFieldLength}
                        defaultValue={`${value || ''}`}
                        placeholder={placeholder ?? `Add ${parentName}`}
                        focus={isModalOpened}
                        description={helperText}
                        onChangeText={updateText}
                      />
                      <CustomButton
                        disabled={temporaryText.length === 0}
                        text={updateIndex !== null ? 'Update' : 'Save'}
                        onPress={() => {
                          if (updateIndex !== null) {
                            updateEntry(onChange);
                          } else {
                            addNewEntry();
                          }
                        }}
                      />
                    </View>
                  )}
                />
              </View>
              <View
                style={[
                  Platform.OS !== 'android' && {
                    paddingBottom: keyboardHeight,
                  },
                ]}
              />
            </View>
          </VerticalPadding>
        </HorizontalPadding>
      </SheetModal>
    </>
  );
};

export default FieldArray;
