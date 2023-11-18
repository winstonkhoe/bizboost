import React, {useEffect, useState} from 'react';
import {Control, Controller, useFieldArray} from 'react-hook-form';
import {Text, View} from 'react-native';
import {FormlessCustomTextInput} from '../atoms/Input';
import {FormFieldHelper} from '../atoms/FormLabel';
import {SheetModal} from '../../containers/SheetModal';
import {flex, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {padding} from '../../styles/Padding';
import {font} from '../../styles/Font';
import {CustomButton} from '../atoms/Button';
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
        maxHeight={750}
        open={isModalOpened}
        onDismiss={() => {
          setIsModalOpened(false);
        }}>
        <View
          style={[
            flex.flexCol,
            gap.xlarge2,
            padding.horizontal.large,
            padding.vertical.default,
            padding.bottom.xlarge3,
          ]}>
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
                  <FormlessCustomTextInput
                    counter
                    type={fieldType}
                    max={maxFieldLength}
                    defaultValue={`${value || ''}`}
                    placeholder={placeholder ?? `Add ${parentName}`}
                    description={helperText}
                    onChange={updateText}
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
        </View>
      </SheetModal>
    </>
  );
};

export default FieldArray;
