import {ScrollView, Text, View} from 'react-native';
import {flex, items} from '../styles/Flex';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {gap} from '../styles/Gap';
import {FormProvider, useForm} from 'react-hook-form';
import {CustomButton} from '../components/atoms/Button';
import {CustomTextInput} from '../components/atoms/Input';
import {rounded} from '../styles/BorderRadius';
import {padding} from '../styles/Padding';
import UserIcon from '../assets/vectors/user.svg';
import {border} from '../styles/Border';
import {isValidField} from '../utils/form';
import {useAppDispatch} from '../redux/hooks';
import {
  ContentCreatorPreference,
  SocialPlatform,
  User,
  UserRole,
} from '../model/User';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {useUser} from '../hooks/user';
import {switchRole} from '../redux/slices/userSlice';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  PlatformData,
  RegisterSocialPlatform,
} from './signup/RegisterSocialPlatform';
import {Category} from '../model/Category';
import {Location} from '../model/Location';
import PagerView from 'react-native-pager-view';
import {Stepper} from '../components/atoms/Stepper';
import {FadeInOut} from '../containers/FadeInOut';
import {KeyboardAvoidingContainer} from '../containers/KeyboardAvoidingContainer';
import {RegisterFocusCategory} from './signup/RegisterFocusCategory';
import {RegisterLocation} from './signup/RegisterLocation';
import {RegisterContentCreatorPreferences} from './signup/RegisterContentCreatorPreferences';
import {RegisterProfilePicture} from './signup/RegisterProfilePicture';
import {LoadingScreen} from './LoadingScreen';
import {showToast} from '../helpers/toast';
import {ToastType} from '../providers/ToastProvider';
import {font} from '../styles/Font';
import {textColor} from '../styles/Text';

type FormData = {
  fullname: string;
  profilePicture: string;
  platformDatas: PlatformData[];
  focusCategories: Category[];
  preferredLocations: Location[];
  contentCreatorPreference: ContentCreatorPreference;
};

enum CreateAccountStep {
  NAME_PHONE = 0,
  SOCIAL_PLATFORM = 1,
  FAVORITE_CATEGORY = 2,
  LOCATION = 3,
  CONTENT_CREATOR_PREFERENCES = 4,
  PROFILE_PICTURE = 5,
}

export const CreateAdditionalAccountScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationStackProps>();
  const {user, activeRole} = useUser();
  const initialPlatformData = useMemo(() => {
    if (!user) {
      return [];
    }
    const datas = [];
    if (user.instagram?.username) {
      datas.push({
        platform: SocialPlatform.Instagram,
        data: user.instagram,
      });
    }
    if (user.tiktok?.username) {
      datas.push({
        platform: SocialPlatform.Tiktok,
        data: user.tiktok,
      });
    }
    return datas;
  }, [user]);
  const methods = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      contentCreatorPreference: {
        contentRevisionLimit: 0,
        postingSchedules: [],
        preferences: [],
      },
      focusCategories: [],
      platformDatas: initialPlatformData,
      preferredLocations: [],
      profilePicture: '',
    },
  });
  const role =
    activeRole === UserRole.BusinessPeople
      ? UserRole.ContentCreator
      : UserRole.BusinessPeople;
  const {getFieldState, formState, getValues, setValue, watch} = methods;
  const contentCreatorPreference = watch('contentCreatorPreference');
  const pagerViewRef = useRef<PagerView>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidPlatformData, setIsValidPlatformData] =
    useState<boolean>(false);
  const [activePosition, setActivePosition] = useState<number>(0);
  const [actionText, setActionText] = useState<string>('Next');

  const steps = useMemo(() => {
    let commonSteps = [CreateAccountStep.NAME_PHONE];

    if (UserRole.ContentCreator === role) {
      commonSteps = [
        ...commonSteps,
        CreateAccountStep.SOCIAL_PLATFORM,
        CreateAccountStep.FAVORITE_CATEGORY,
        CreateAccountStep.LOCATION,
        CreateAccountStep.CONTENT_CREATOR_PREFERENCES,
      ];
    }

    return [...commonSteps, CreateAccountStep.PROFILE_PICTURE];
  }, [role]);

  const onSubmit = async (data: FormData) => {
    if (
      [UserRole.BusinessPeople, UserRole.ContentCreator].findIndex(
        userRole => userRole === role,
      ) === -1
    ) {
      return;
    }

    setIsLoading(true);

    if (UserRole.BusinessPeople === role) {
      const newAccountUser = new User({
        ...user,
        businessPeople: {
          fullname: data.fullname,
          profilePicture: data.profilePicture,
          rating: 0,
          ratedCount: 0,
        },
      });
      newAccountUser
        .createBusinessPeopleAccount()
        .then(() => {
          setIsLoading(false);
          showToast({
            type: ToastType.success,
            message: 'Account created successfully!',
          });
          dispatch(switchRole(role));
          navigation.navigate(AuthenticatedNavigation.Home);
        })
        .catch(() => {
          setIsLoading(false);
          showToast({
            type: ToastType.danger,
            message: 'Account creation failed!',
          });
        });
    }

    if (UserRole.ContentCreator === role) {
      const newAccountUser = new User({
        ...user,
        tiktok: data.platformDatas.find(
          platform => platform.platform === SocialPlatform.Tiktok,
        )?.data,
        instagram: data.platformDatas.find(
          platform => platform.platform === SocialPlatform.Instagram,
        )?.data,
        contentCreator: {
          fullname: data.fullname,
          profilePicture: data.profilePicture,
          specializedCategoryIds: (
            data.focusCategories.map(category => category.id) || []
          ).filter((item): item is string => item !== undefined),
          preferredLocationIds: (
            data.preferredLocations.map(location => location.id) || []
          ).filter((item): item is string => item !== undefined),
          postingSchedules:
            data.contentCreatorPreference?.postingSchedules || [],
          preferences: data.contentCreatorPreference?.preferences || [],
          contentRevisionLimit:
            data.contentCreatorPreference?.contentRevisionLimit || 0,
          rating: 0,
          ratedCount: 0,
          biodata: '',
        },
      });
      newAccountUser
        .createContentCreatorAccount()
        .then(() => {
          setIsLoading(false);
          showToast({
            type: ToastType.success,
            message: 'Account created successfully!',
          });
          dispatch(switchRole(role));
          navigation.navigate(AuthenticatedNavigation.Home);
        })
        .catch(() => {
          setIsLoading(false);
          showToast({
            type: ToastType.danger,
            message: 'Account creation failed!',
          });
        });
    }
  };

  const onPlatformDataChange = useCallback(
    (data: PlatformData[]) => {
      setValue('platformDatas', data);
    },
    [setValue],
  );

  const onLocationChange = useCallback(
    (locations: Location[]) => {
      setValue('preferredLocations', locations);
    },
    [setValue],
  );

  const onCategoryChange = useCallback(
    (categories: Category[]) => {
      setValue('focusCategories', categories);
    },
    [setValue],
  );

  const onContentCreatorPreferenceChange = useCallback(
    (preference: ContentCreatorPreference) => {
      console.log('change preference', preference);
      setValue('contentCreatorPreference', preference);
    },
    [setValue],
  );

  const onProfilePictureChange = useCallback(
    (imageUrl: string) => {
      setValue('profilePicture', imageUrl);
    },
    [setValue],
  );

  const hasNext = useCallback(() => {
    return activePosition + 1 < steps.length;
  }, [activePosition, steps]);

  const nextPage = async () => {
    if (hasNext()) {
      pagerViewRef.current?.setPage(steps[activePosition + 1]);
      setActivePosition(activePosition + 1);
    } else {
      await onSubmit(getValues());
    }
  };

  const previousPage = () => {
    pagerViewRef.current?.setPage(steps[activePosition - 1]);
    setActivePosition(activePosition - 1);
  };

  useEffect(() => {
    if (hasNext()) {
      setActionText('Next');
    } else {
      setActionText('Create');
    }
  }, [activePosition, steps.length, hasNext]);

  return (
    <>
      {isLoading && <LoadingScreen />}
      <FormProvider {...methods}>
        <PageWithBackButton
          enableSafeAreaContainer
          icon={activePosition === 0 ? 'close' : 'back'}
          fullHeight
          onPress={previousPage}
          backButtonPlaceholder={
            <View
              style={[
                flex.flexRow,
                items.center,
                gap.small,
                rounded.large,
                padding.horizontal.default,
                padding.vertical.small,
                background(COLOR.background.neutral.default),
                border({
                  borderWidth: 1,
                  color: COLOR.black[100],
                  opacity: 0.6,
                }),
              ]}>
              <UserIcon width={20} height={20} color={COLOR.black[100]} />
              <Text
                style={[
                  font.size[20],
                  font.weight.semibold,
                  textColor(COLOR.text.neutral.high),
                ]}>
                {role}
              </Text>
            </View>
          }
          disableDefaultOnPress={activePosition > 0}>
          <View style={[flex.flex1, flex.flexCol, padding.top.xlarge3]}>
            <View style={[padding.horizontal.large]}>
              <FadeInOut visible={true}>
                <Stepper
                  currentPosition={activePosition + 1}
                  maxPosition={steps.length}
                />
              </FadeInOut>
            </View>
            <PagerView
              ref={pagerViewRef}
              className="flex-1"
              initialPage={steps[activePosition]}
              scrollEnabled={false}
              onPageSelected={e => {
                const position = e.nativeEvent.position;
                setActivePosition(steps.findIndex(step => step === position));
              }}>
              <ScrollView key={CreateAccountStep.NAME_PHONE}>
                <View style={[flex.flexCol, gap.xlarge, padding.large]}>
                  <CustomTextInput
                    label="Full name"
                    name="fullname"
                    rules={{
                      required: 'Fullname is required',
                    }}
                  />
                  <CustomButton
                    text={actionText}
                    rounded="max"
                    minimumWidth
                    disabled={
                      !isValidField(getFieldState('fullname', formState))
                    }
                    onPress={nextPage}
                  />
                </View>
              </ScrollView>
              <ScrollView key={CreateAccountStep.SOCIAL_PLATFORM}>
                <KeyboardAvoidingContainer>
                  <View style={[flex.flexCol, gap.xlarge3]}>
                    <RegisterSocialPlatform
                      initialData={initialPlatformData}
                      onChangeSocialData={onPlatformDataChange}
                      onValidRegistration={setIsValidPlatformData}
                    />
                    <CustomButton
                      text={
                        watch('platformDatas').length === 0
                          ? 'Skip'
                          : actionText
                      }
                      rounded="max"
                      minimumWidth
                      disabled={!isValidPlatformData}
                      onPress={nextPage}
                    />
                  </View>
                </KeyboardAvoidingContainer>
              </ScrollView>
              <ScrollView key={CreateAccountStep.FAVORITE_CATEGORY}>
                <KeyboardAvoidingContainer>
                  <View style={[flex.flexCol, gap.xlarge2]}>
                    <RegisterFocusCategory
                      onCategoriesChange={onCategoryChange}
                    />
                    <CustomButton
                      text={
                        watch('focusCategories').length === 0
                          ? 'Skip'
                          : actionText
                      }
                      rounded="max"
                      minimumWidth
                      onPress={nextPage}
                    />
                  </View>
                </KeyboardAvoidingContainer>
              </ScrollView>
              <ScrollView key={CreateAccountStep.LOCATION}>
                <KeyboardAvoidingContainer>
                  <View style={[flex.flexCol, gap.xlarge2]}>
                    <RegisterLocation onLocationsChange={onLocationChange} />
                    <CustomButton
                      text={
                        watch('preferredLocations').length === 0
                          ? 'Skip'
                          : actionText
                      }
                      rounded="max"
                      minimumWidth
                      onPress={nextPage}
                    />
                  </View>
                </KeyboardAvoidingContainer>
              </ScrollView>
              <ScrollView key={CreateAccountStep.CONTENT_CREATOR_PREFERENCES}>
                <KeyboardAvoidingContainer>
                  <View style={[flex.flexCol, gap.xlarge2]}>
                    <RegisterContentCreatorPreferences
                      onPreferenceChange={onContentCreatorPreferenceChange}
                    />
                    <CustomButton
                      text={actionText}
                      rounded="max"
                      minimumWidth
                      disabled={
                        contentCreatorPreference?.contentRevisionLimit ===
                          undefined ||
                        contentCreatorPreference.contentRevisionLimit < 0
                      }
                      onPress={nextPage}
                    />
                  </View>
                </KeyboardAvoidingContainer>
              </ScrollView>
              <ScrollView key={CreateAccountStep.PROFILE_PICTURE}>
                <KeyboardAvoidingContainer>
                  <View style={[flex.flexCol, gap.xlarge2]}>
                    <RegisterProfilePicture
                      onProfilePictureChange={onProfilePictureChange}
                    />
                    <CustomButton
                      text={actionText}
                      rounded="max"
                      minimumWidth
                      onPress={nextPage}
                    />
                  </View>
                </KeyboardAvoidingContainer>
              </ScrollView>
            </PagerView>
          </View>
        </PageWithBackButton>
      </FormProvider>
    </>
  );
};
