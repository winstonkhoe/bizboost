import {
  HorizontalPadding,
  VerticalPadding,
} from '../../components/atoms/ViewPadding';
import {flex, items, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {ScrollView} from 'react-native-gesture-handler';
import {SocialPlatformChip} from '../../components/molecules/SocialCard';
import {isValidField} from '../../utils/form';
import {SocialData, SocialPlatform, SocialPlatforms} from '../../model/User';
import Carousel, {ICarouselInstance} from 'react-native-reanimated-carousel';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {FormProvider, useForm, useFormContext} from 'react-hook-form';
import {Dimensions, Pressable, PressableProps, Text, View} from 'react-native';
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
import {dimension} from '../../styles/Dimension';
import {CustomNumberInput, CustomTextInput} from '../../components/atoms/Input';
import InstagramLogo from '../../assets/vectors/instagram.svg';
import TiktokLogo from '../../assets/vectors/tiktok.svg';
import {Label} from '../../components/atoms/Label';

type FormData = {
  instagramUsername: string;
  instagramFollowers: string;
  tiktokUsername: string;
  tiktokFollowers: string;
};

export interface PlatformData {
  platform: SocialPlatform;
  data: SocialData;
}

type InitialData = {
  [K in keyof FormData]?: FormData[K];
};

interface RegisterSocialPlatformProps {
  initialData?: InitialData;
  onChangeSocialData: (socialDatas: PlatformData[]) => void;
  onValidRegistration: (valid: boolean) => void;
}

export const RegisterSocialPlatform = ({
  initialData,
  onChangeSocialData,
  onValidRegistration,
}: RegisterSocialPlatformProps) => {
  const width = Dimensions.get('window').width;
  const methods = useForm<FormData>({
    mode: 'all',
    defaultValues: {},
  });

  const {getFieldState, watch, formState, setValue, getValues} = methods;
  const finishedSetDefaultValue = useRef<boolean>(false);
  const updateSocialCarouselIndexRef = useRef<boolean>(true);
  const carouselRef = useRef<ICarouselInstance>(null);
  const [verifiedPlatforms, setVerifiedPlatforms] = useState<SocialPlatform[]>(
    [],
  );
  const [selectedSocialPlatforms, setSelectedSocialPlatforms] = useState<
    SocialPlatform[]
  >([]);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState<number>(0);

  const toggleSelectPlatform = useCallback(
    (platform: SocialPlatform) => {
      if (selectedSocialPlatforms.includes(platform)) {
        setSelectedSocialPlatforms(
          selectedSocialPlatforms.filter(
            selectedPlatform => selectedPlatform !== platform,
          ),
        );
      } else {
        setSelectedSocialPlatforms([...selectedSocialPlatforms, platform]);
      }
    },
    [selectedSocialPlatforms],
  );

  const setFieldValue = useCallback(
    (field: keyof FormData, data?: string) => {
      data &&
        setValue(field, data, {
          shouldValidate: true,
          shouldTouch: true,
          shouldDirty: true,
        });
    },
    [setValue],
  );

  const isValidInitialData = useCallback((field: any) => {
    return (
      field && field !== '' && field !== undefined && field !== 'undefined'
    );
  }, []);

  const getFallbackField = (value: any) => {
    if (value === undefined || value === 'undefined') {
      return '';
    }
    return value;
  };

  useEffect(() => {
    if (initialData) {
      if (isValidInitialData(initialData.instagramUsername)) {
        if (
          isValidInitialData(initialData.instagramFollowers) &&
          !verifiedPlatforms.includes(SocialPlatform.Instagram)
        ) {
          setVerifiedPlatforms([
            ...verifiedPlatforms,
            SocialPlatform.Instagram,
          ]);
        }
      }
      if (isValidInitialData(initialData.tiktokUsername)) {
        if (
          isValidInitialData(initialData.tiktokFollowers) &&
          !verifiedPlatforms.includes(SocialPlatform.Tiktok)
        ) {
          setVerifiedPlatforms([...verifiedPlatforms, SocialPlatform.Tiktok]);
        }
      }
      setFieldValue(
        'instagramUsername',
        getFallbackField(initialData.instagramUsername),
      );
      setFieldValue(
        'instagramFollowers',
        getFallbackField(initialData.instagramFollowers),
      );
      setFieldValue(
        'tiktokUsername',
        getFallbackField(initialData.tiktokUsername),
      );
      setFieldValue(
        'tiktokFollowers',
        getFallbackField(initialData.tiktokFollowers),
      );
      finishedSetDefaultValue.current = true;
    }
  }, [initialData, setFieldValue, isValidInitialData, verifiedPlatforms]);

  useEffect(() => {
    setFieldValue(
      'instagramUsername',
      getFallbackField(getValues('instagramUsername')),
    );
    setFieldValue(
      'instagramFollowers',
      getFallbackField(getValues('instagramFollowers')),
    );
    setFieldValue(
      'tiktokUsername',
      getFallbackField(getValues('tiktokUsername')),
    );
    setFieldValue(
      'tiktokFollowers',
      getFallbackField(getValues('tiktokFollowers')),
    );
    const platformDatas: PlatformData[] = selectedSocialPlatforms.reduce(
      (acc, platform) => {
        if (platform === SocialPlatform.Instagram) {
          acc.push({
            platform: SocialPlatform.Instagram,
            data: {
              username: watch('instagramUsername'),
              followersCount: parseInt(watch('instagramFollowers'), 10),
            },
          });
        }
        if (platform === SocialPlatform.Tiktok) {
          acc.push({
            platform: SocialPlatform.Tiktok,
            data: {
              username: watch('tiktokUsername'),
              followersCount: parseInt(watch('tiktokFollowers'), 10),
            },
          });
        }
        return acc;
      },
      [] as PlatformData[],
    );
    onChangeSocialData(platformDatas);
  }, [watch, onChangeSocialData, selectedSocialPlatforms, setValue, getValues]);

  useEffect(() => {
    const isDisable =
      (selectedSocialPlatforms.includes(SocialPlatform.Instagram)
        ? !isValidField(
            getFieldState('instagramUsername', formState),
            !verifiedPlatforms.includes(SocialPlatform.Instagram),
          ) ||
          !isValidField(
            getFieldState('instagramFollowers', formState),
            !verifiedPlatforms.includes(SocialPlatform.Instagram),
          )
        : false) ||
      (selectedSocialPlatforms.includes(SocialPlatform.Tiktok)
        ? !isValidField(
            getFieldState('tiktokUsername', formState),
            !verifiedPlatforms.includes(SocialPlatform.Tiktok),
          ) ||
          !isValidField(
            getFieldState('tiktokFollowers', formState),
            !verifiedPlatforms.includes(SocialPlatform.Tiktok),
          )
        : false);
    onValidRegistration(!isDisable);
  }, [
    formState,
    onValidRegistration,
    getFieldState,
    selectedSocialPlatforms,
    verifiedPlatforms,
  ]);

  useEffect(() => {
    const currentCarouselIndex = carouselRef.current?.getCurrentIndex();
    if (
      currentCarouselIndex &&
      currentCarouselIndex > selectedSocialPlatforms.length - 1
    ) {
      carouselRef.current?.prev({
        count: 0,
      });
    }
  }, [selectedSocialPlatforms, carouselRef]);

  const scrollToSocialCard = (index: number) => {
    carouselRef.current?.scrollTo({
      index: index,
      animated: true,
    });
  };

  return (
    <View style={[flex.flexCol, gap.small]}>
      <VerticalPadding paddingSize="medium">
        <HorizontalPadding paddingSize="large">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[flex.flexRow, flex.growShrink, gap.default]}>
              <SocialPlatformChip
                error={
                  !isValidField(
                    getFieldState('instagramUsername', formState),
                    !verifiedPlatforms.includes(SocialPlatform.Instagram),
                  ) ||
                  !isValidField(
                    getFieldState('instagramFollowers', formState),
                    !verifiedPlatforms.includes(SocialPlatform.Instagram),
                  )
                }
                onPress={() => {
                  toggleSelectPlatform(SocialPlatform.Instagram);
                }}
                platform={SocialPlatform.Instagram}
                isSelected={selectedSocialPlatforms.includes(
                  SocialPlatform.Instagram,
                )}
              />
              <SocialPlatformChip
                error={
                  !isValidField(
                    getFieldState('tiktokUsername', formState),
                    !verifiedPlatforms.includes(SocialPlatform.Tiktok),
                  ) ||
                  !isValidField(
                    getFieldState('tiktokFollowers', formState),
                    !verifiedPlatforms.includes(SocialPlatform.Tiktok),
                  )
                }
                onPress={() => {
                  toggleSelectPlatform(SocialPlatform.Tiktok);
                }}
                platform={SocialPlatform.Tiktok}
                isSelected={selectedSocialPlatforms.includes(
                  SocialPlatform.Tiktok,
                )}
              />
            </View>
          </ScrollView>
        </HorizontalPadding>
      </VerticalPadding>
      <FormProvider {...methods}>
        <View
          className="h-72"
          style={[flex.flexCol, items.center, justify.center]}>
          {selectedSocialPlatforms.length > 0 ? (
            <Carousel
              ref={carouselRef}
              loop={false}
              width={width}
              mode="parallax"
              height={width * 0.75}
              data={selectedSocialPlatforms}
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
                  platform={item}
                  isActive={activeCarouselIndex === index}
                  isVerified={verifiedPlatforms.includes(item)}
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
      </FormProvider>
    </View>
  );
};

interface SocialCardProps extends PressableProps {
  platform: SocialPlatforms;
  isActive: boolean;
  isVerified?: boolean;
}

const SocialCard = ({
  platform,
  isActive,
  isVerified = false,
  ...props
}: SocialCardProps) => {
  const {getFieldState, formState} = useFormContext();
  const currentFields = useMemo(() => {
    return {
      username:
        SocialPlatform.Instagram === platform
          ? 'instagramUsername'
          : 'tiktokUsername',
      followers:
        SocialPlatform.Instagram === platform
          ? 'instagramFollowers'
          : 'tiktokFollowers',
    };
  }, [platform]);

  const getTargetValue = useCallback(() => {
    const isError =
      !isValidField(
        getFieldState(currentFields.username, formState),
        !isVerified,
      ) ||
      !isValidField(
        getFieldState(currentFields.followers, formState),
        !isVerified,
      );
    if (isError) {
      return -1;
    }
    return isActive ? 1 : 0;
  }, [getFieldState, formState, currentFields, isActive, isVerified]);

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
          className="absolute top-0 left-0 z-10"
          style={[dimension.full]}
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
              {SocialPlatform.Instagram === platform && (
                <InstagramLogo width={25} height={25} />
              )}
              {SocialPlatform.Tiktok === platform && (
                <TiktokLogo width={25} height={25} />
              )}
            </View>
            <Text
              className="font-semibold text-lg"
              style={[textColor(COLOR.text.neutral.high)]}>
              {platform}
            </Text>
          </View>
          {isVerified && <Label text="Verified" fontSize={40} />}
        </View>
      </Animated.View>
      <Animated.View className="overflow-hidden" style={[flex.flexCol]}>
        <View style={[flex.flexCol, padding.large, gap.small]}>
          <CustomTextInput
            label="Username"
            name={currentFields.username}
            prefix="@"
            forceLowercase
            disabled={isVerified}
            rules={{
              required: 'Username cannot be empty',
            }}
          />
          <CustomNumberInput
            label="Followers"
            type="field"
            min={1}
            disabled={isVerified}
            name={currentFields.followers}
            rules={{
              required: 'Follower cannot be 0',
              min: {
                value: 1,
                message: 'Follower must be at least 1',
              },
            }}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
};
