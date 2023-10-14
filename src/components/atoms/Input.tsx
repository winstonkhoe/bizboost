import {useEffect, useRef, useState} from 'react';
import {Controller, UseControllerProps, useFormContext} from 'react-hook-form';
import {Animated} from 'react-native';
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
import {
  ImageLibraryOptions,
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';
import {flex} from '../../styles/Flex';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {AuthButton} from './Button';

interface Props extends UseControllerProps {
  label: string;
  placeholder?: string;
}

interface MediaUploaderProps {
  options: ImageLibraryOptions;
  onUploadComplete: (response: ImagePickerResponse) => void;
  children?: React.ReactNode;
}

export const CustomTextInput = ({
  label,
  placeholder = label,
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
  const fieldFilled = watch(controllerProps.name, '');

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

  return (
    <View className="w-full flex flex-col justify-start">
      <Reanimated.View style={[animatedStyles]}>
        <Text className="text-black">{label}</Text>
      </Reanimated.View>
      <Controller
        {...controllerProps}
        control={control}
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            value={value}
            onFocus={() => {
              setIsFocus(true);
            }}
            onBlur={() => {
              onBlur();
              setIsFocus(false);
            }}
            onChangeText={onChange}
            placeholder={placeholder}
            className="w-full h-10 px-1 pt-2 pb-1 text-base font-medium"
          />
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
            : background(COLOR.black),
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

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  options,
  onUploadComplete,
  children,
}) => {
  const handleImageUpload = () => {
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('Image picker was canceled');
      } else if (response.errorCode) {
        console.log('Image picker error: ', response.errorMessage);
      } else {
        onUploadComplete(response);
      }
    });
  };

  return (
    <TouchableOpacity onPress={handleImageUpload}>
      <View style={[flex.flexRow]} className="items-center">
        {children || <AuthButton text="Upload image" rounded={'small'} />}
      </View>
    </TouchableOpacity>
  );
};
