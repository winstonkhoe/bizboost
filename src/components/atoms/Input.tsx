import {useEffect, useRef, useState} from 'react';
import {Controller, UseControllerProps, useFormContext} from 'react-hook-form';
import {
  Animated,
  KeyboardTypeOptions,
  Pressable,
  PressableProps,
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

interface Props extends UseControllerProps {
  label: string;
  placeholder?: string;
  multiline?: boolean;
  hideInputText?: boolean;
  keyboardType?: KeyboardTypeOptions;
  inputType?: 'default' | 'number' | 'price';
  prefix?: string;
}

export const CustomTextInput = ({
  label,
  placeholder = label,
  multiline = false,
  hideInputText = false,
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
    onChange(actual);
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
              className="w-full text-base font-medium"
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

      <Text className="text-xs mt-2 font-medium text-red-500">
        {`${errors?.[controllerProps.name]?.message || ''}`}
      </Text>
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
      actual = `${updateValue(actual, 0)}`;
    } else {
      actual = type === 'field' ? '' : '0';
    }
    onChange(actual);
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
                  className="text-base font-medium text-center pb-2"
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
  children?: React.ReactNode;
  callback: (media: ImageOrVideo) => void;
}

export const MediaUploader = ({
  options,
  onUploadComplete,
  children,
  callback,
}: MediaUploaderProps) => {
  const handleImageUpload = () => {
    ImagePicker.openPicker(options)
      .then((media: ImageOrVideo) => {
        callback(media);
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <TouchableOpacity onPress={handleImageUpload}>
      <View style={[flex.flexRow]} className="items-center">
        {children || <CustomButton text="Upload image" rounded={'small'} />}
      </View>
    </TouchableOpacity>
  );
};
