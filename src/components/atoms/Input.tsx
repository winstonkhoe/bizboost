import {useEffect, useRef, useState} from 'react';
import {Controller, UseControllerProps, useFormContext} from 'react-hook-form';
import {
  Animated,
  KeyboardTypeOptions,
  Pressable,
  PressableProps,
  TextInputProps,
} from 'react-native';
import {TextInput} from 'react-native';
import {Text} from 'react-native';
import {View} from 'react-native';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import Reanimated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {flex, items, justify} from '../../styles/Flex';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {CustomButton} from './Button';
import ImagePicker, {
  Options,
  ImageOrVideo,
} from 'react-native-image-crop-picker';
import {gap} from '../../styles/Gap';
import {
  horizontalPadding,
  padding,
  verticalPadding,
} from '../../styles/Padding';
import {textColor} from '../../styles/Text';
import {formatNumberWithThousandSeparator} from '../../utils/number';
import {dimension} from '../../styles/Dimension';
import {rounded} from '../../styles/BorderRadius';
import {AddIcon, MinusIcon} from './Icon';
import {font} from '../../styles/Font';
import uuid from 'react-native-uuid';
import storage from '@react-native-firebase/storage';
import {ProgressBar} from './ProgressBar';

interface Props extends UseControllerProps {
  label: string;
  placeholder?: string;
  multiline?: boolean;
  hideInputText?: boolean;
  forceLowercase?: boolean;
  keyboardType?: KeyboardTypeOptions;
  inputType?: 'default' | 'number' | 'price';
  prefix?: string;
}

export const CustomTextInput = ({
  label,
  placeholder = label,
  multiline = false,
  hideInputText = false,
  forceLowercase = false,
  keyboardType,
  inputType = 'default',
  prefix,
  ...controllerProps
}: Props) => {
  const {
    control,
    watch,
    formState: {errors},
  } = useFormContext();
  const maxTranslateX = 40;
  const animationDuration = 400;
  const translateX = useSharedValue(maxTranslateX);
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [parentWidth, setParentWidth] = useState<number>(0);
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const fieldFilled = watch(controllerProps.name);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: !errors?.[controllerProps.name] && isFocus ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [isFocus, animatedWidth, errors, controllerProps]);

  useEffect(() => {
    if (fieldFilled?.length > 0 || controllerProps.disabled) {
      translateX.value = 0;
    } else {
      translateX.value = maxTranslateX;
    }
  }, [fieldFilled, translateX, controllerProps]);

  const animatedStyles = useAnimatedStyle(() => ({
    opacity: withTiming(
      fieldFilled?.length > 0 || controllerProps.disabled ? 1 : 0,
      {
        duration: animationDuration,
      },
    ),
    transform: [
      {
        translateX: withSpring(translateX.value * 2),
      },
    ],
  }));

  const handleChangeText = (
    text: string,
    onChange: (...event: any[]) => void,
  ) => {
    let actual = text;
    if (inputType === 'price' || inputType === 'number') {
      if (text !== '') {
        actual = actual.replaceAll('.', '');
        const parsedNumber = parseInt(actual, 10);
        if (!isNaN(parsedNumber)) {
          actual = `${parsedNumber}`;
        } else {
          actual = '0';
        }
      }
    }
    if (forceLowercase) {
      actual = actual.toLocaleLowerCase();
    }
    onChange(actual);
  };

  return (
    <View style={[flex.flexCol, gap.xsmall2]}>
      <Reanimated.View style={[animatedStyles]}>
        <Text
          className="font-medium"
          style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
          {label}
        </Text>
      </Reanimated.View>
      <View style={[flex.flexCol]}>
        <Controller
          {...controllerProps}
          control={control}
          render={({field: {onChange, onBlur, value}}) => (
            <View
              style={[
                flex.flexRow,
                justify.start,
                gap.default,
                controllerProps.disabled && rounded.default,
                controllerProps.disabled && horizontalPadding.small,
                controllerProps.disabled &&
                  background(COLOR.background.neutral.disabled),
              ]}>
              {(prefix || inputType === 'price') && (
                <View style={[flex.flexRow, justify.start, items.center]}>
                  <Text
                    className="font-semibold"
                    style={[textColor(COLOR.text.neutral.low), font.size[30]]}>
                    {prefix ? prefix : inputType === 'price' ? 'Rp' : null}
                  </Text>
                </View>
              )}
              <TextInput
                keyboardType={
                  keyboardType
                    ? keyboardType
                    : inputType === 'number' || inputType === 'price'
                    ? 'number-pad'
                    : undefined
                }
                secureTextEntry={hideInputText}
                multiline={multiline}
                onContentSizeChange={event =>
                  setHeight(event.nativeEvent.contentSize.height + 15)
                }
                style={[
                  font.size[30],
                  padding.vertical.zero,
                  padding.horizontal.zero,
                  {height: Math.max(35, height)},
                  textColor(
                    controllerProps.disabled
                      ? COLOR.text.neutral.low
                      : COLOR.text.neutral.high,
                  ),
                ]}
                value={
                  inputType === 'number' || inputType === 'price'
                    ? formatNumberWithThousandSeparator(value)
                    : value
                }
                onFocus={() => {
                  setIsFocus(true);
                }}
                onBlur={() => {
                  onBlur();
                  setIsFocus(false);
                }}
                editable={!controllerProps.disabled}
                onChangeText={text => handleChangeText(text, onChange)}
                placeholder={placeholder}
                className="w-full font-medium"
              />
            </View>
          )}
          name={controllerProps.name}
        />
        {!controllerProps.disabled && (
          <View
            onLayout={event => {
              const {width} = event.nativeEvent.layout;
              setParentWidth(width);
            }}
            className="relative w-full overflow-hidden"
            style={[
              {height: 1},
              errors?.[controllerProps.name]
                ? background(COLOR.red.error)
                : background(COLOR.black[100]),
            ]}>
            <Animated.View
              className="absolute top-0 left-0 w-full h-full bg-green-700"
              style={{
                transform: [
                  {
                    translateX: animatedWidth.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-parentWidth, 0],
                    }),
                  },
                ],
              }}
            />
          </View>
        )}
        <Text
          className="text-xs mt-2 font-medium"
          style={[textColor(COLOR.text.danger.default)]}>
          {`${errors?.[controllerProps.name]?.message || ''}`}
        </Text>
      </View>
    </View>
  );
};

interface NumberInputProps extends UseControllerProps {
  label?: string;
  type?: 'default' | 'field';
  min?: number;
  max?: number;
  removeDefaultValue?: boolean;
}

export const CustomNumberInput = ({
  label,
  type = 'default',
  min = 0,
  max,
  removeDefaultValue = false,
  ...controllerProps
}: NumberInputProps) => {
  const {
    control,
    formState: {errors},
  } = useFormContext();
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const fieldFocusProgress = useSharedValue<number>(isFocus ? 1 : 0);

  const fieldFocusAnimatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        fieldFocusProgress.value,
        [-1, 0, 1],
        [COLOR.red[50], COLOR.black[15], COLOR.green[50]],
      ),
    };
  });

  useEffect(() => {
    let targetValue = 0;
    if (errors?.[controllerProps.name]?.message) {
      targetValue = -1;
    } else {
      targetValue = isFocus ? 1 : 0;
    }
    fieldFocusProgress.value = withTiming(targetValue, {
      duration: 300,
    });
  }, [isFocus, fieldFocusProgress, errors, controllerProps]);

  const isExceedMaxLimit = (value: number) => {
    if (max) {
      return value > max;
    }
    return false;
  };

  const isExceedMinLimit = (value: number) => {
    return value < min;
  };

  const updateValue = (actual: string, valueChange: number) => {
    const parsedNumber = parseInt(actual, 10);
    if (!isNaN(parsedNumber)) {
      const targetValue = parsedNumber + valueChange;
      if (!isExceedMaxLimit(targetValue) && !isExceedMinLimit(targetValue)) {
        return targetValue;
      } else if (isExceedMaxLimit(targetValue)) {
        return max;
      }
    }
    return min;
  };

  const handleChangeText = (
    text: string,
    onChange: (...event: any[]) => void,
  ) => {
    let actual = text.replaceAll('.', '');
    const parsedNumber = parseInt(actual, 10);
    if (!isNaN(parsedNumber)) {
      onChange(updateValue(actual, 0));
    } else {
      onChange(type === 'field' ? '' : '0');
    }
  };

  const decrement = (actual: string, onChange: (...event: any[]) => void) => {
    onChange(updateValue(actual, -1));
  };

  const increment = (actual: string, onChange: (...event: any[]) => void) => {
    onChange(updateValue(actual, 1));
  };

  return (
    <View className="justify-start" style={[flex.flexCol, gap.small]}>
      {label && (
        <Text
          className="text-base font-medium"
          style={[textColor(COLOR.text.neutral.high)]}>
          {label}
        </Text>
      )}
      <Controller
        defaultValue={min}
        {...controllerProps}
        control={control}
        render={({field: {onChange, onBlur, value}}) => (
          <Reanimated.View
            style={[
              flex.flexRow,
              gap.default,
              items.center,
              rounded.default,
              controllerProps.disabled &&
                background(COLOR.background.neutral.disabled),
              type === 'field' && {
                borderWidth: 1,
              },
              type === 'field' && padding.small,
              type === 'field' && fieldFocusAnimatedStyle,
            ]}>
            <IncrementDecrementButton
              type="decrement"
              disabled={isExceedMinLimit(value - 1) || controllerProps.disabled}
              removeBorder={type === 'field' ? true : false}
              removeBackground={type === 'field' ? true : false}
              onPress={() => decrement(value, onChange)}
            />
            {type === 'field' ? (
              <View style={[flex.flexCol, flex.growShrink]}>
                <TextInput
                  style={[
                    font.size[30],
                    padding.vertical.zero,
                    padding.horizontal.zero,
                    textColor(
                      controllerProps.disabled
                        ? COLOR.text.neutral.disabled
                        : COLOR.text.neutral.high,
                    ),
                  ]}
                  keyboardType="number-pad"
                  value={`${formatNumberWithThousandSeparator(value)}`}
                  onFocus={() => {
                    setIsFocus(true);
                  }}
                  onBlur={() => {
                    onBlur();
                    setIsFocus(false);
                  }}
                  editable={!controllerProps.disabled}
                  onChangeText={text => handleChangeText(text, onChange)}
                  className="font-medium text-center align-center"
                />
              </View>
            ) : (
              <View style={[flex.growShrink, flex.flexRow, justify.center]}>
                <Text
                  className="font-semibold text-xl"
                  style={[
                    textColor(
                      controllerProps.disabled
                        ? COLOR.text.neutral.disabled
                        : COLOR.text.neutral.high,
                    ),
                  ]}>
                  {formatNumberWithThousandSeparator(value || 0)}
                </Text>
              </View>
            )}
            <IncrementDecrementButton
              type="increment"
              disabled={isExceedMaxLimit(value + 1) || controllerProps.disabled}
              removeBorder={type === 'field' ? true : false}
              removeBackground={type === 'field' ? true : false}
              onPress={() => increment(value, onChange)}
            />
          </Reanimated.View>
        )}
        name={controllerProps.name}
      />
      <Text className="text-xs mt-2 font-medium text-red-500">
        {`${errors?.[controllerProps.name]?.message || ''}`}
      </Text>
    </View>
  );
};

interface IncrementDecrementProps extends PressableProps {
  type: 'increment' | 'decrement';
  min?: number;
  max?: number;
  removeBorder: boolean;
  removeBackground: boolean;
}

const IncrementDecrementButton = ({
  type,
  removeBorder = false,
  removeBackground = false,
  ...props
}: IncrementDecrementProps) => {
  const disableProgress = useSharedValue(props.disabled ? 1 : 0);

  const disableEnableBackgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        disableProgress.value,
        [0, 1],
        [COLOR.black[0], COLOR.background.neutral.disabled],
      ),
    };
  });

  const disableEnableBorderAnimatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        disableProgress.value,
        [0, 1],
        [COLOR.green[50], COLOR.text.neutral.disabled],
      ),
    };
  });

  useEffect(() => {
    disableProgress.value = withTiming(props.disabled ? 1 : 0, {
      duration: 300,
    });
  }, [props.disabled, disableProgress]);
  return (
    <Pressable {...props}>
      <Reanimated.View
        className="justify-center items-center"
        style={[
          flex.flexRow,
          dimension.square.xlarge,
          rounded.max,
          !removeBorder && {
            borderWidth: 1.5,
          },
          !removeBorder && disableEnableBorderAnimatedStyle,
          !removeBackground && disableEnableBackgroundAnimatedStyle,
        ]}>
        {type === 'increment' ? (
          <AddIcon
            color={
              props.disabled ? COLOR.text.neutral.disabled : COLOR.green[50]
            }
          />
        ) : (
          <MinusIcon
            color={
              props.disabled ? COLOR.text.neutral.disabled : COLOR.green[50]
            }
          />
        )}
      </Reanimated.View>
    </Pressable>
  );
};

interface MediaUploaderProps {
  options: Options;
  targetFolder: string;
  showUploadProgress?: boolean;
  children?: React.ReactNode;
  onMediaSelected?: (media: ImageOrVideo) => void;
  onUploadSuccess?: (url: string) => void;
  onUploadFail?: (err?: any) => void;
}

export const MediaUploader = ({
  options,
  targetFolder,
  showUploadProgress = false,
  onUploadSuccess,
  onUploadFail,
  children,
  onMediaSelected,
}: MediaUploaderProps) => {
  const [uploadProgress, setUploadProgress] = useState<number | undefined>(
    undefined,
  );
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    if (uploadProgress === 1) {
      timeoutId = setTimeout(() => {
        setUploadProgress(undefined);
      }, 1000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [uploadProgress]);
  const handleImageUpload = () => {
    ImagePicker.openPicker(options)
      .then((media: ImageOrVideo) => {
        onMediaSelected && onMediaSelected(media);
        const imageType = media.mime.split('/')[1];
        const filename = `${targetFolder}/${uuid.v4()}.${imageType}`;

        const reference = storage().ref(filename);
        const task = reference.putFile(media.path);
        task.on('state_changed', taskSnapshot => {
          setUploadProgress(
            taskSnapshot.bytesTransferred / taskSnapshot.totalBytes,
          );
        });
        task.then(() => {
          try {
            reference
              .getDownloadURL()
              .then(url => {
                onUploadSuccess && onUploadSuccess(url);
                console.log(url);
                console.log('Image uploaded to the bucket!');
              })
              .catch(err => {
                onUploadFail && onUploadFail(err);
                setUploadProgress(undefined);
                console.log(err);
              });
          } catch (e) {
            onUploadFail && onUploadFail(e);
            setUploadProgress(undefined);
            console.log(e);
          }
        });
      })
      .catch(err => {
        console.log(err);
        setUploadProgress(undefined);
      });
  };

  return (
    <TouchableOpacity onPress={handleImageUpload}>
      <View style={[flex.flexRow]} className="items-center">
        {children || <CustomButton text="Upload image" rounded={'small'} />}
      </View>
      {showUploadProgress && uploadProgress !== undefined && (
        <ProgressBar currentProgress={uploadProgress} showProgressNumber />
      )}
    </TouchableOpacity>
  );
};

interface FormlessTextInputProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  description?: string;
  counter?: boolean;
  max?: number;
  inputType?: 'default' | 'number' | 'price';
  prefix?: string;
  focus?: boolean;
  onChangeText?: (text: string) => void;
}

export const FormlessTextInput = ({
  label,
  placeholder = label,
  disabled = false,
  error,
  success,
  description,
  counter,
  max,
  inputType = 'default',
  prefix,
  focus = false,
  onChangeText,
  ...props
}: FormlessTextInputProps) => {
  const fieldRef = useRef<TextInput>(null);
  const [fieldValue, setFieldValue] = useState(props.defaultValue || '');
  const maxTranslateX = 40;
  const animationDuration = 400;
  const translateX = useSharedValue(maxTranslateX);
  const [parentWidth, setParentWidth] = useState<number>(0);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: !error && focus ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [focus, animatedWidth, error, props]);

  useEffect(() => {
    if (fieldValue?.length > 0 || disabled) {
      translateX.value = 0;
    } else {
      translateX.value = maxTranslateX;
    }
  }, [fieldValue, translateX, disabled]);

  useEffect(() => {
    if (onChangeText) {
      onChangeText(fieldValue);
    }
  }, [fieldValue, onChangeText]);

  useEffect(() => {
    if (focus) {
      fieldRef.current?.focus();
    } else {
      fieldRef.current?.blur();
    }
  }, [focus]);

  const animatedStyles = useAnimatedStyle(() => ({
    opacity: withTiming(fieldValue?.length > 0 || disabled ? 1 : 0, {
      duration: animationDuration,
    }),
    transform: [
      {
        translateX: withSpring(translateX.value * 2),
      },
    ],
  }));

  const handleChangeText = (text: string) => {
    let actual = text;
    if (!max || (max && actual.length <= max)) {
      if (inputType === 'price' || inputType === 'number') {
        if (text !== '') {
          actual = actual.replaceAll('.', '');
          const parsedNumber = parseInt(actual, 10);
          if (!isNaN(parsedNumber)) {
            actual = `${parsedNumber}`;
          } else {
            actual = '0';
          }
        }
      }
      setFieldValue(actual);
    }
  };

  return (
    <View style={[flex.flexCol, gap.small]}>
      <Reanimated.View style={[animatedStyles]}>
        <Text
          className="text-base font-medium"
          style={[textColor(COLOR.text.neutral.high)]}>
          {label}
        </Text>
      </Reanimated.View>
      <View
        style={[
          flex.flexRow,
          justify.start,
          gap.default,
          disabled && rounded.default,
          disabled && horizontalPadding.small,
          disabled && background(COLOR.background.neutral.disabled),
        ]}>
        {(prefix || inputType === 'price') && (
          <View
            style={[
              flex.flexRow,
              verticalPadding.xsmall2,
              justify.start,
              items.end,
            ]}>
            <Text
              className="text-base font-semibold"
              style={[textColor(COLOR.text.neutral.low)]}>
              {prefix ? prefix : inputType === 'price' ? 'Rp' : null}
            </Text>
          </View>
        )}
        <TextInput
          ref={fieldRef}
          {...props}
          keyboardType={
            props.keyboardType
              ? props.keyboardType
              : inputType === 'number' || inputType === 'price'
              ? 'number-pad'
              : undefined
          }
          style={[
            textColor(
              disabled ? COLOR.text.neutral.low : COLOR.text.neutral.high,
            ),
            font.size[30],
            font.lineHeight[30],
          ]}
          value={
            inputType === 'number' || inputType === 'price'
              ? `${formatNumberWithThousandSeparator(parseInt(fieldValue, 10))}`
              : fieldValue
          }
          editable={!disabled}
          onChangeText={text => handleChangeText(text)}
          placeholder={placeholder}
          className="w-full font-medium"
        />
      </View>
      {!disabled && (
        <View
          onLayout={event => {
            const {width} = event.nativeEvent.layout;
            setParentWidth(width);
          }}
          className="relative w-full overflow-hidden"
          style={[
            {height: 1},
            error ? background(COLOR.red.error) : background(COLOR.black[100]),
          ]}>
          <Animated.View
            className="absolute top-0 left-0 w-full h-full bg-green-700"
            style={{
              transform: [
                {
                  translateX: animatedWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-parentWidth, 0],
                  }),
                },
              ],
            }}
          />
        </View>
      )}
      <View style={[flex.flexRow, gap.medium, justify.between]}>
        <Text
          className="text-xs"
          style={[
            flex.flex1,
            flex.grow,
            textColor(COLOR.text.neutral.med),
            error && textColor(COLOR.text.danger.default),
          ]}>
          {description}
        </Text>
        {counter && (
          <Text
            className="text-xs"
            style={[textColor(COLOR.text.neutral.med)]}>{`${
            fieldValue.length
          } / ${parseInt(`${max}`, 10)}`}</Text>
        )}
      </View>
    </View>
  );
};
