import React, {useEffect, useState} from 'react';
import {
  Control,
  Controller,
  ControllerProps,
  useFieldArray,
} from 'react-hook-form';
import {Text, View, useWindowDimensions} from 'react-native';
import {FormlessCustomTextInput} from '../atoms/Input';
import {FormFieldHelper, FormFieldType} from '../atoms/FormLabel';
import {SheetModal} from '../../containers/SheetModal';
import {flex, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {CustomButton} from '../atoms/Button';
import {FieldArrayLabel} from '../molecules/FieldArrayLabel';
import {BottomSheetModalWithTitle} from '../templates/BottomSheetModalWithTitle';
import {padding} from '../../styles/Padding';
import {useKeyboard} from '../../hooks/keyboard';
import {AnimatedPressable} from '../atoms/AnimatedPressable';
import {InternalLink} from '../atoms/Link';
import WebView from 'react-native-webview';
import {CustomModal} from '../atoms/CustomModal';
import {dimension} from '../../styles/Dimension';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {rounded} from '../../styles/BorderRadius';
import {font} from '../../styles/Font';
import {shadow} from '../../styles/Shadow';

interface Props extends Partial<ControllerProps> {
  control: Control<any>;
  title?: string;
  description?: string;
  parentName: any; // string
  childName: string;
  type?: FormFieldType;
  placeholder?: string;
  fieldType?: 'default' | 'textarea';
  maxFieldLength?: number;
  helperText?: string;
  forceLowerCase?: boolean;
}
const FieldArray = ({
  control,
  title,
  description,
  parentName,
  childName,
  placeholder,
  type = 'required',
  fieldType = 'default',
  maxFieldLength = 40,
  helperText,
  forceLowerCase = false,
  ...props
}: Props) => {
  const keyboardHeight = useKeyboard();
  const windowDimension = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();
  const [temporaryText, setTemporaryText] = useState<string>('');
  const [isValidField, setIsValidField] = useState(true);
  const [updateIndex, setUpdateIndex] = useState<number | null>(null);
  const [isWebviewModalOpen, setIsWebviewModalOpen] = useState(false);
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

  useEffect(() => {
    console.log('isValidField', isValidField);
  }, [isValidField]);

  return (
    <>
      <CustomModal
        transparent
        visible={isWebviewModalOpen}
        removeDefaultBackground
        removeDefaultPadding>
        <View
          style={[
            flex.flexCol,
            gap.medium,
            justify.center,
            dimension.width.full,
            dimension.height.full,
            background(COLOR.black[0], 0.4),
            padding.horizontal.medium,
            {
              paddingTop: safeAreaInsets.top,
              paddingBottom: safeAreaInsets.bottom,
            },
          ]}>
          <View
            style={[
              dimension.width.full,
              {
                height: '85%',
              },
            ]}>
            <WebView
              style={[rounded.large]}
              source={{
                uri: temporaryText,
              }}
            />
          </View>
          <CustomButton
            text="Close Preview"
            customTextSize={font.size[30]}
            rounded="large"
            verticalPadding="medium"
            onPress={() => {
              setIsWebviewModalOpen(false);
            }}
          />
        </View>
      </CustomModal>
      <View style={[flex.flexCol, gap.default]}>
        <FormFieldHelper title={title} description={description} type={type} />
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
        snapPoints={[keyboardHeight > 0 ? '70%' : '50%']}
        bottomInsetType="default"
        fullHeight
        enableDynamicSizing={false}
        open={isModalOpened}
        onDismiss={() => {
          setIsModalOpened(false);
        }}>
        <BottomSheetModalWithTitle title={title || ''}>
          <Controller
            control={control}
            {...props}
            name={`${parentName}.${updateIndex}.${childName}`}
            render={({
              field: {value, onChange},
              formState: {isValid, errors},
            }) => (
              <View
                style={[
                  flex.flex1,
                  flex.flexCol,
                  padding.top.large,
                  gap.xlarge,
                ]}>
                <View style={[flex.flexCol, gap.small]}>
                  {new RegExp('^(http|https)://[^ "]+$', 'i').test(
                    temporaryText,
                  ) && (
                    <View style={[flex.flexRow, justify.end]}>
                      <AnimatedPressable>
                        <InternalLink
                          text="Preview url"
                          onPress={() => {
                            setIsWebviewModalOpen(true);
                          }}
                        />
                      </AnimatedPressable>
                    </View>
                  )}
                  <FormlessCustomTextInput
                    counter={maxFieldLength > 0}
                    type={fieldType}
                    max={maxFieldLength > 0 ? maxFieldLength : undefined}
                    defaultValue={`${value || ''}`}
                    {...props}
                    forceLowercase={forceLowerCase}
                    placeholder={placeholder ?? `Add ${parentName}`}
                    description={helperText}
                    onChange={updateText}
                    onValidChange={setIsValidField}
                  />
                </View>
                <CustomButton
                  disabled={temporaryText.length === 0 || !isValidField}
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
        </BottomSheetModalWithTitle>
      </SheetModal>
    </>
  );
};

export default FieldArray;
