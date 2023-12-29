import {flex, items, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {ScrollView} from 'react-native-gesture-handler';
import {SocialPlatformChip} from '../../components/molecules/SocialCard';
import {SocialData, SocialPlatform} from '../../model/User';
import Carousel, {ICarouselInstance} from 'react-native-reanimated-carousel';
import {useCallback, useEffect, useRef, useState} from 'react';
import {FormProvider, useFieldArray, useForm} from 'react-hook-form';
import {
  Dimensions,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {padding} from '../../styles/Padding';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {background} from '../../styles/BackgroundColor';
import {shadow} from '../../styles/Shadow';
import {rounded} from '../../styles/BorderRadius';
import {CustomNumberInput, CustomTextInput} from '../../components/atoms/Input';
import InstagramLogo from '../../assets/vectors/instagram.svg';
import TiktokLogo from '../../assets/vectors/tiktok.svg';
import {PlatformIcon, SyncIcon} from '../../components/atoms/Icon';
import {font} from '../../styles/Font';
import {formatNumberWithThousandSeparator} from '../../utils/number';
import {dimension} from '../../styles/Dimension';

type FormData = {
  socialData: PlatformData[];
};

export interface PlatformData {
  platform: SocialPlatform;
  data: SocialData;
}

interface RegisterSocialPlatformProps {
  initialData?: PlatformData[];
  onChangeSocialData: (socialDatas: PlatformData[]) => void;
  onValidRegistration: (valid: boolean) => void;
}

export const RegisterSocialPlatform = ({
  initialData = [],
  onChangeSocialData,
  onValidRegistration,
}: RegisterSocialPlatformProps) => {
  const width = Dimensions.get('window').width;
  console.log('initialData', initialData);
  const methods = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      socialData: initialData,
    },
  });

  const {watch, control, getValues} = methods;
  const isPlatformDataValid = useCallback(
    (index: number) => {
      const data = getValues(`socialData.${index}.data`);
      if (data.isSynchronized) {
        return true;
      }
      return data.username && (data.followersCount || 0) > 0;
    },
    [getValues],
  );
  const isAllPlatformDataValid = useCallback(
    (platformData: PlatformData[]) => {
      const invalidDatas = platformData.filter((_, socialDataIndex) => {
        return !isPlatformDataValid(socialDataIndex);
      });
      return invalidDatas.length === 0;
    },
    [isPlatformDataValid],
  );

  const {
    fields: fieldsSocialData,
    append: appendSocialData,
    remove: removeSocialData,
  } = useFieldArray({
    name: 'socialData',
    control,
    rules: {
      validate: (value: PlatformData[]) => {
        if (!isAllPlatformDataValid(value)) {
          return 'Please correct the errors in social data';
        }
      },
    },
  });

  const updateSocialCarouselIndexRef = useRef<boolean>(true);
  const carouselRef = useRef<ICarouselInstance>(null);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState<number>(0);

  useEffect(() => {
    const subscription = watch(datas => {
      const socialDatas =
        datas?.socialData?.filter(
          (platform): platform is PlatformData => platform !== undefined,
        ) || [];
      onValidRegistration(isAllPlatformDataValid(socialDatas));
    });

    return () => subscription.unsubscribe();
  }, [watch, isAllPlatformDataValid, onValidRegistration]);

  useEffect(() => {
    const subscription = watch(datas => {
      const socialDatas =
        datas?.socialData?.filter(
          (platform): platform is PlatformData => platform !== undefined,
        ) || [];
      onChangeSocialData(socialDatas);
    });

    return () => subscription.unsubscribe();
  }, [watch, onChangeSocialData]);

  useEffect(() => {
    onValidRegistration(isAllPlatformDataValid(fieldsSocialData));
  }, [fieldsSocialData, onValidRegistration, isAllPlatformDataValid]);

  useEffect(() => {
    onChangeSocialData(fieldsSocialData);
  }, [fieldsSocialData, onChangeSocialData]);

  useEffect(() => {
    const currentCarouselIndex = carouselRef.current?.getCurrentIndex();
    if (
      currentCarouselIndex &&
      currentCarouselIndex > fieldsSocialData.length - 1
    ) {
      carouselRef.current?.prev({
        count: 0,
      });
    }
  }, [fieldsSocialData, carouselRef]);

  useEffect(() => {
    console.log('fieldSocialData change', fieldsSocialData);
  }, [fieldsSocialData]);

  const scrollToSocialCard = (index: number) => {
    carouselRef.current?.scrollTo({
      index: index,
      animated: true,
    });
  };

  return (
    <FormProvider {...methods}>
      <View style={[flex.flexCol, gap.small]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[padding.vertical.medium, padding.horizontal.large]}
          contentContainerStyle={[flex.flexRow, gap.default]}>
          {[SocialPlatform.Instagram, SocialPlatform.Tiktok].map(platform => {
            const index = fieldsSocialData.findIndex(
              ({platform: socialPlatform}) => socialPlatform === platform,
            );
            const socialData = fieldsSocialData.find(
              ({platform: socialPlatform}) => socialPlatform === platform,
            );
            const isSynchronized =
              socialData && socialData?.data.isSynchronized;
            const isError = index >= 0 ? !isPlatformDataValid(index) : false;
            return (
              <SocialPlatformChip
                key={platform}
                error={isError}
                onPress={() => {
                  if (isSynchronized) {
                    return;
                  }
                  if (index >= 0) {
                    removeSocialData(index);
                    return;
                  }
                  const existingSocialData = initialData.find(
                    d => d.platform === platform,
                  );
                  if (existingSocialData) {
                    appendSocialData(existingSocialData);
                    return;
                  }
                  console.log('before append', fieldsSocialData);
                  appendSocialData({
                    platform: platform,
                    data: {
                      username: '',
                      followersCount: 0,
                      isSynchronized: false,
                    },
                  });
                  console.log('after append', fieldsSocialData);
                }}
                platform={platform}
                isDisabled={isSynchronized}
                isSelected={index >= 0}
              />
            );
          })}
        </ScrollView>
        <View
          className="h-72"
          style={[flex.flexCol, items.center, justify.center]}>
          {fieldsSocialData.length > 0 ? (
            <Carousel
              ref={carouselRef}
              loop={false}
              width={width}
              mode="parallax"
              height={width * 0.75}
              data={fieldsSocialData}
              scrollAnimationDuration={300}
              modeConfig={{
                parallaxScrollingScale: 0.75,
                parallaxScrollingOffset: 180,
              }}
              onSnapToItem={index => {
                setActiveCarouselIndex(index);
              }}
              onProgressChange={(offsetProgress, absoluteProgress) => {
                if (
                  updateSocialCarouselIndexRef.current &&
                  absoluteProgress % 1 !== 0
                ) {
                  setActiveCarouselIndex(activeCarouselIndex === 0 ? 1 : 0);
                  updateSocialCarouselIndexRef.current = false;
                }
                if (absoluteProgress % 1 === 0) {
                  updateSocialCarouselIndexRef.current = true;
                }
              }}
              renderItem={({index, item}) => (
                <SocialCard
                  key={item.platform}
                  data={item}
                  index={index}
                  isError={!isPlatformDataValid(index)}
                  isActive={activeCarouselIndex === index}
                  onPress={() => scrollToSocialCard(index)}
                />
              )}
            />
          ) : (
            <View
              style={[
                flex.flexRow,
                padding.vertical.large,
                justify.center,
                {
                  opacity: 0.5,
                },
              ]}>
              <View
                className="justify-center items-center"
                style={[flex.flexCol, gap.default]}>
                <View style={[flex.flexRow, gap.default]}>
                  <InstagramLogo width={30} height={30} />
                  <TiktokLogo width={30} height={30} />
                </View>
                <Text
                  className="text-sm font-medium text-center"
                  style={[textColor(COLOR.text.neutral.med)]}>
                  Choose your desired platforms
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </FormProvider>
  );
};

interface SocialCardProps extends PressableProps {
  data: PlatformData;
  isError: boolean;
  isActive: boolean;
  index: number;
}

const SocialCard = ({
  data,
  isActive,
  isError,
  index,
  ...props
}: SocialCardProps) => {
  const isSynchronized = data.data.isSynchronized ?? false;
  const getTargetValue = useCallback(() => {
    if (isError) {
      return -1;
    }
    return isActive ? 1 : 0;
  }, [isActive, isError]);

  const openCardProgress = useSharedValue(getTargetValue());
  useEffect(() => {
    openCardProgress.value = withTiming(getTargetValue(), {
      duration: 500,
    });
  }, [isActive, openCardProgress, getTargetValue]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        openCardProgress.value,
        [-1, 0, 1],
        [COLOR.red[20], COLOR.background.neutral.disabled, COLOR.green[20]],
      ),
    };
  });

  return (
    <Animated.View
      className="relative"
      style={[
        flex.flexCol,
        background(COLOR.black[0]),
        shadow.default,
        rounded.large,
        {
          borderWidth: 2,
        },
        animatedStyle,
      ]}>
      {!isActive && (
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            {
              zIndex: 10,
            },
          ]}
          {...props}
        />
      )}
      <Animated.View
        style={[
          flex.flexRow,
          padding.top.default,
          padding.horizontal.default,
          justify.between,
          items.center,
        ]}>
        <View style={[flex.flexRow, justify.between, items.center]}>
          <View style={[flex.flex1, flex.flexRow, gap.small, items.center]}>
            <View
              style={[
                background(COLOR.black[0]),
                padding.xsmall,
                rounded.default,
              ]}>
              <PlatformIcon platform={data.platform} size="medium" />
            </View>
            <Text
              className="font-semibold text-lg"
              style={[textColor(COLOR.text.neutral.high)]}>
              {data.platform}
            </Text>
          </View>
          {isSynchronized && (
            <View style={[flex.flexRow, gap.xsmall2, items.center]}>
              <SyncIcon size="xlarge" strokeWidth={1.5} />
            </View>
          )}
        </View>
      </Animated.View>
      <Animated.View
        className="overflow-hidden"
        style={[flex.flexCol, dimension.height.xlarge11]}>
        {!isSynchronized ? (
          <View style={[flex.flexCol, padding.large, gap.small]}>
            <CustomTextInput
              label="Username"
              name={`socialData.${index}.data.username`}
              prefix="@"
              forceLowercase
              defaultValue={data.data.username}
              disabled={isSynchronized}
              rules={{
                required: 'Username cannot be empty',
              }}
            />
            <CustomNumberInput
              label="Followers"
              type="field"
              min={1}
              disabled={isSynchronized}
              name={`socialData.${index}.data.followersCount`}
              defaultValue={data.data.followersCount}
              rules={{
                required: 'Follower cannot be 0',
                min: {
                  value: 1,
                  message: 'Follower must be at least 1',
                },
              }}
            />
          </View>
        ) : (
          <View
            style={[
              flex.flexCol,
              gap.large,
              padding.default,
              padding.top.xlarge,
            ]}>
            <View style={[flex.flexCol, gap.small]}>
              <Text
                style={[
                  font.size[40],
                  font.weight.semibold,
                  textColor(COLOR.text.neutral.high),
                ]}>
                Username
              </Text>
              <View
                style={[
                  background(COLOR.background.neutral.disabled),
                  rounded.default,
                  padding.small,
                ]}>
                <Text
                  style={[
                    font.size[40],
                    textColor(COLOR.black[30]),
                    font.weight.medium,
                  ]}>
                  {`@ ${data.data.username}`}
                </Text>
              </View>
            </View>
            <View style={[flex.flexCol, gap.small]}>
              <Text
                style={[
                  font.size[40],
                  font.weight.semibold,
                  textColor(COLOR.text.neutral.high),
                ]}>
                Followers
              </Text>
              <View
                style={[
                  background(COLOR.background.neutral.disabled),
                  rounded.default,
                  padding.small,
                ]}>
                <Text
                  style={[
                    font.size[40],
                    textColor(COLOR.black[30]),
                    font.weight.medium,
                  ]}>
                  {formatNumberWithThousandSeparator(
                    data.data.followersCount || 0,
                  )}
                </Text>
              </View>
            </View>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
};
