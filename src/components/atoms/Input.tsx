import {useCallback, useEffect, useState} from 'react';
import {
  Controller,
  FormProvider,
  UseControllerProps,
  useForm,
  useFormContext,
} from 'react-hook-form';
import {KeyboardTypeOptions, Pressable, PressableProps} from 'react-native';
import {TextInput} from 'react-native';
import {Text} from 'react-native';
import {View} from 'react-native';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {flex, items, justify, self} from '../../styles/Flex';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {CustomButton} from './Button';
import ImagePicker, {
  Options,
  ImageOrVideo,
} from 'react-native-image-crop-picker';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {textColor} from '../../styles/Text';
import {formatNumberWithThousandSeparator} from '../../utils/number';
import {dimension} from '../../styles/Dimension';
import {rounded} from '../../styles/BorderRadius';
import {AddIcon, MinusIcon} from './Icon';
import {font, lineHeight} from '../../styles/Font';
import {ProgressBar} from './ProgressBar';
import {uploadFile} from '../../helpers/storage';
import {debounce} from 'lodash';

interface CustomTextInputProps extends UseControllerProps {
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  focus?: boolean;
  description?: string;
  counter?: boolean;
  max?: number;
  hideInputText?: boolean;
  forceLowercase?: boolean;
  keyboardType?: KeyboardTypeOptions;
  type?: 'default' | 'textarea';
  inputType?: 'default' | 'number' | 'price';
  prefix?: string;
}

export const CustomTextInput = ({
  label,
  placeholder = label,
  error: isError,
  success,
  description,
  counter,
  max,
  focus = false,
  hideInputText = false,
  forceLowercase = false,
  keyboardType,
  type = 'default',
  inputType = 'default',
  prefix,
  ...controllerProps
}: CustomTextInputProps) => {
  const {
    control,
    watch,
    formState: {errors},
  } = useFormContext();
  const maxTranslateX = 40;
  const animationDuration = 400;
  const translateX = useSharedValue(maxTranslateX);
  const [isFocus, setIsFocus] = useState<boolean>(focus);
  const [parentWidth, setParentWidth] = useState<number>(0);
  const animatedWidth = useSharedValue(0);
  const fieldFilled = watch(controllerProps.name);

  useEffect(() => {
    animatedWidth.value = withTiming(
      !errors?.[controllerProps.name] && isFocus ? 1 : 0,
      {
        duration: 500,
      },
    );
  }, [isFocus, animatedWidth, errors, controllerProps]);

  const activeBorderOffset = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            animatedWidth.value,
            [0, 1],
            [-parentWidth, 0],
          ),
        },
      ],
    };
  });

  const animatedTextAreaBorder = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        animatedWidth.value,
        [0, 1],
        [COLOR.text.neutral.low, COLOR.green[50]],
      ),
    };
  });

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

  const handleChangeText = useCallback(
    (text: string, onChange: (...event: any[]) => void) => {
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
        if (forceLowercase) {
          actual = actual.toLocaleLowerCase();
        }
        onChange(actual);
      } else if (max && actual.length > max) {
        onChange(actual.substring(0, max));
      }
    },
    [forceLowercase, inputType, max],
  );

  return (
    <View style={[flex.flexCol, gap.xsmall2]}>
      {label && (
        <Animated.View style={[animatedStyles]}>
          <Text
            className="font-medium"
            style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
            {label}
          </Text>
        </Animated.View>
      )}
      <Controller
        {...controllerProps}
        control={control}
        render={({
          field: {onChange, onBlur, value},
          fieldState: {error, invalid},
        }) => (
          <View style={[flex.flexCol, gap.small]}>
            <View style={[flex.flexCol]}>
              <Animated.View
                style={[
                  flex.flexRow,
                  justify.start,
                  gap.default,
                  animatedTextAreaBorder,
                  type === 'textarea' && [
                    padding.default,
                    rounded.default,
                    {
                      borderWidth: 1,
                    },
                  ],
                  type !== 'textarea' && padding.bottom.xsmall,
                  controllerProps.disabled && rounded.default,
                  controllerProps.disabled && padding.horizontal.small,
                  controllerProps.disabled &&
                    background(COLOR.background.neutral.disabled),
                ]}>
                {(prefix || inputType === 'price') && (
                  <View style={[flex.flexRow, justify.start, items.end]}>
                    <Text
                      className="font-semibold"
                      style={[
                        textColor(COLOR.text.neutral.low),
                        font.size[30],
                      ]}>
                      {prefix ? prefix : inputType === 'price' ? 'Rp' : null}
                    </Text>
                  </View>
                )}
                <TextInput
                  autoCorrect={false}
                  autoCapitalize="none"
                  scrollEnabled={false}
                  placeholderTextColor={COLOR.text.neutral.med}
                  keyboardType={
                    keyboardType
                      ? keyboardType
                      : inputType === 'number' || inputType === 'price'
                      ? 'number-pad'
                      : undefined
                  }
                  maxLength={max}
                  secureTextEntry={hideInputText}
                  textAlignVertical={type === 'textarea' ? 'top' : 'bottom'}
                  multiline={type === 'textarea'}
                  style={[
                    flex.flexRow,
                    self.start,
                    font.size[30],
                    font.lineHeight[30],
                    padding.vertical.zero,
                    padding.horizontal.zero,
                    type === 'textarea' && {
                      minHeight: lineHeight[30] * 3,
                    },
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
              </Animated.View>

              {!controllerProps.disabled && type !== 'textarea' && (
                <View
                  onLayout={event => {
                    const {width} = event.nativeEvent.layout;
                    setParentWidth(width);
                  }}
                  className="relative w-full overflow-hidden"
                  style={[
                    {height: 1},
                    invalid || isError
                      ? background(COLOR.red.error)
                      : background(COLOR.text.neutral.low),
                  ]}>
                  <Animated.View
                    className="absolute top-0 left-0 w-full h-full"
                    style={[activeBorderOffset, background(COLOR.green[50])]}
                  />
                </View>
              )}
            </View>
            <View style={[flex.flexRow, gap.medium, justify.between]}>
              <Text
                style={[
                  flex.flex1,
                  flex.grow,
                  font.size[20],
                  textColor(COLOR.text.neutral.med),
                  (error || isError) && textColor(COLOR.text.danger.default),
                ]}>
                {error?.message || description}
              </Text>
              {counter && (
                <Text
                  style={[
                    font.size[20],
                    textColor(COLOR.text.neutral.med),
                  ]}>{`${value?.length || 0} / ${parseInt(
                  `${max}`,
                  10,
                )}`}</Text>
              )}
            </View>
          </View>
        )}
        name={controllerProps.name}
      />
    </View>
  );
};

interface FormlessCustomTextInputProps extends Partial<CustomTextInputProps> {
  onChange: (text: string) => void;
  onValidChange?: (value: boolean) => void;
}

type TextData = {
  value: string;
};

export const FormlessCustomTextInput = ({
  onChange,
  onValidChange,
  ...props
}: FormlessCustomTextInputProps) => {
  const methods = useForm<TextData>({
    mode: 'all',
    defaultValues: {
      value: props.defaultValue || '',
    },
  });
  const {
    watch,
    formState: {isValid},
  } = methods;
  const value = watch('value');

  // // Create a debounced version of onChange
  const debouncedOnChange = debounce(onChange, 100);

  useEffect(() => {
    debouncedOnChange(value);
  }, [value, debouncedOnChange]);

  useEffect(() => {
    onValidChange && onValidChange(isValid);
  }, [isValid, onValidChange]);

  return (
    <FormProvider {...methods}>
      <CustomTextInput {...props} name="value" />
    </FormProvider>
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
          <Animated.View
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
          </Animated.View>
        )}
        name={controllerProps.name}
      />
      <Text className="text-xs mt-2 font-medium text-red-500">
        {`${errors?.[controllerProps.name]?.message || ''}`}
      </Text>
    </View>
  );
};

interface FormlessCustomNumberInputProps extends Partial<NumberInputProps> {
  onChange: (value: number) => void;
}

type NumberData = {
  value: number;
};

export const FormlessCustomNumberInput = ({
  onChange,
  ...props
}: FormlessCustomNumberInputProps) => {
  const methods = useForm<NumberData>({
    defaultValues: {
      value: props?.defaultValue || props?.min || 1,
    },
  });
  const {watch} = methods;
  const value = watch('value');

  useEffect(() => {
    onChange(value);
  }, [value, onChange]);
  return (
    <FormProvider {...methods}>
      <CustomNumberInput {...props} name="value" />
    </FormProvider>
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
      <Animated.View
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
      </Animated.View>
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
  if (options.mediaType !== 'video') {
    options.mediaType = 'photo';
  }

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
    console.log('masuk');
    ImagePicker.openPicker(options)
      .then((media: ImageOrVideo) => {
        onMediaSelected && onMediaSelected(media);
        uploadFile({
          targetFolder: targetFolder,
          originalFilePath: media.path,
          onUploadComplete: url => {
            onUploadSuccess && onUploadSuccess(url);
          },
          onUploadError: error => {
            onUploadFail && onUploadFail(error);
            setUploadProgress(undefined);
          },
          onUploadProgressChange: setUploadProgress,
        });
      })
      .catch(err => {
        console.log(err);
        setUploadProgress(undefined);
      });
  };

  return (
    <TouchableOpacity
      style={[flex.flex1]}
      containerStyle={[flex.grow, flex.flexCol, gap.xsmall2]}
      onPress={handleImageUpload}>
      {/* TODO: ini custom buttonnya ga bisa @win, keknya si AnimatedPressable punya CustomButton tu nimpa touchable opacity nya ini^  */}
      {children || <CustomButton text="Upload image" rounded={'small'} />}
      {showUploadProgress && uploadProgress !== undefined && (
        <ProgressBar currentProgress={uploadProgress} showProgressNumber />
      )}
    </TouchableOpacity>
  );
};
