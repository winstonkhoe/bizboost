import {useEffect, useRef, useState} from 'react';
import {Controller, UseControllerProps, useFormContext} from 'react-hook-form';
import {Animated, KeyboardTypeOptions} from 'react-native';
import {TextInput} from 'react-native';
import {Text} from 'react-native';
import {View} from 'react-native';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {flex} from '../../styles/Flex';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {CustomButton} from './Button';
import ImagePicker, {
  Options,
  ImageOrVideo,
} from 'react-native-image-crop-picker';
import {gap} from '../../styles/Gap';
import {horizontalPadding, verticalPadding} from '../../styles/Padding';
import {textColor} from '../../styles/Text';
import {formatNumberWithThousandSeparator} from '../../utils/number';

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
    if (fieldFilled?.length > 0) {
      translateX.value = 0;
    } else {
      translateX.value = maxTranslateX;
    }
  }, [fieldFilled, translateX]);

  const animatedStyles = useAnimatedStyle(() => ({
    opacity: withTiming(fieldFilled?.length > 0 ? 1 : 0, {
      duration: animationDuration,
    }),
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
    console.log('actual', actual);
    onChange(actual);
  };

  return (
    <View className="w-full flex flex-col justify-start">
      <Reanimated.View style={[animatedStyles]}>
        <Text className="text-black">{label}</Text>
      </Reanimated.View>
      <Controller
        {...controllerProps}
        control={control}
        render={({field: {onChange, onBlur, value}}) => (
          <View style={[flex.flexRow, gap.xsmall2]}>
            {(prefix || inputType === 'price') && (
              <View
                className="items-end"
                style={[flex.flexRow, verticalPadding.xsmall2]}>
                <Text
                  className="text-m1 font-semibold"
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
              style={{height: Math.max(35, height)}}
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
              onChangeText={text => handleChangeText(text, onChange)}
              placeholder={placeholder}
              className="w-full h-10 px-1 pt-2 pb-1 text-base font-medium"
            />
          </View>
        )}
        name={controllerProps.name}
      />
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
      {errors?.[controllerProps.name] && (
        <Text className="text-xs mt-2 font-medium text-red-500">
          {`${errors?.[controllerProps.name]?.message}`}
        </Text>
      )}
    </View>
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
