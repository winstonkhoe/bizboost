import {ScrollView, Text, View} from 'react-native';
import {
  ContentCreatorPreference,
  SocialPlatform,
  User,
  UserRole,
} from '../model/User';
import {useForm, FormProvider} from 'react-hook-form';
import {CustomTextInput} from '../components/atoms/Input';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {flex, items, justify, self} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {textColor} from '../styles/Text';
import {COLOR} from '../styles/Color';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {CustomButton} from '../components/atoms/Button';
import PagerView from 'react-native-pager-view';
import {isValidField} from '../utils/form';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {padding, verticalPadding} from '../styles/Padding';
import {Stepper} from '../components/atoms/Stepper';
import {AuthMethod, Provider} from '../model/AuthMethod';
import {KeyboardAvoidingContainer} from '../containers/KeyboardAvoidingContainer';
import {Location} from '../model/Location';
import {Category} from '../model/Category';
import {ChooseRole} from './signup/ChooseRole';
import {
  PlatformData,
  RegisterSocialPlatform,
} from './signup/RegisterSocialPlatform';
import {RegisterFocusCategory} from './signup/RegisterFocusCategory';
import {RegisterLocation} from './signup/RegisterLocation';
import {RegisterContentCreatorPreferences} from './signup/RegisterContentCreatorPreferences';
import {RegisterProfilePicture} from './signup/RegisterProfilePicture';
import {CustomModal} from '../components/atoms/CustomModal';
import {font, text} from '../styles/Font';
import {AuthProviderButton} from '../components/molecules/AuthProviderButton';
import {useNavigation} from '@react-navigation/native';
import {
  GuestNavigation,
  GuestStack,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {FadeInOut} from '../containers/FadeInOut';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {showToast} from '../helpers/toast';
import {ToastType} from '../providers/ToastProvider';
import {LoadingScreen} from './LoadingScreen';
import {BackButtonLabel} from '../components/atoms/Header';

type FormData = {
  email: string;
  password?: string;
  confirmPassword?: string;
  fullname: string;
  phone: string;
  profilePicture: string;
  provider: Provider;
  providerId: string;
  platformDatas: PlatformData[];
  focusCategories: Category[];
  preferredLocations: Location[];
  contentCreatorPreference: ContentCreatorPreference;
  token: string;
  currentRole?: UserRole;
};

enum SignupStep {
  ROLE = 0,
  EMAIL = 1,
  PASSWORD = 2,
  NAME_PHONE = 3,
  SOCIAL_PLATFORM = 4,
  FAVORITE_CATEGORY = 5,
  LOCATION = 6,
  CONTENT_CREATOR_PREFERENCES = 7,
  PROFILE_PICTURE = 8,
}

type Props = NativeStackScreenProps<GuestStack, GuestNavigation.Signup>;

const SignUpScreen = ({route}: Props) => {
  const {
    user = new User({}),
    provider = Provider.EMAIL,
    providerId,
    token,
    name,
    profilePicture,
  } = route.params;
  const navigation = useNavigation<NavigationStackProps>();
  const [loginAuthMethod, setLoginAuthMethod] = useState<
    Provider | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginModalOpened, setIsLoginModalOpened] = useState<boolean>(false);
  const [isValidPlatformData, setIsValidPlatformData] =
    useState<boolean>(false);
  const [activePosition, setActivePosition] = useState<number>(0);
  const [actionText, setActionText] = useState<string>('Next');

  const initialPlatformData = useMemo(() => {
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
  }, [user.instagram, user.tiktok]);

  const methods = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      fullname: name || '',
      profilePicture: profilePicture,
      provider: provider,
      providerId: providerId,
      token: token,
      platformDatas: initialPlatformData,
      focusCategories: [],
      preferredLocations: [],
      contentCreatorPreference: {
        contentRevisionLimit: 0,
        postingSchedules: [],
        preferences: [],
      },
    },
  });
  const {getFieldState, watch, formState, setValue, getValues} = methods;
  const email = watch('email');
  const currentRole = watch('currentRole');
  const contentCreatorPreference = watch('contentCreatorPreference');

  const steps = useMemo(() => {
    let commonSteps = [SignupStep.NAME_PHONE];
    if (Provider.GOOGLE === provider) {
      if (!email) {
        commonSteps = [SignupStep.EMAIL, ...commonSteps];
      }
    } else if (Provider.FACEBOOK === provider) {
      commonSteps = [SignupStep.EMAIL, ...commonSteps];
    } else {
      commonSteps = [SignupStep.EMAIL, SignupStep.PASSWORD, ...commonSteps];
    }

    if (UserRole.ContentCreator === currentRole) {
      commonSteps = [
        ...commonSteps,
        SignupStep.SOCIAL_PLATFORM,
        SignupStep.FAVORITE_CATEGORY,
        SignupStep.LOCATION,
        SignupStep.CONTENT_CREATOR_PREFERENCES,
      ];
    }

    return [SignupStep.ROLE, ...commonSteps, SignupStep.PROFILE_PICTURE];
  }, [provider, currentRole, email]);

  const pagerViewRef = useRef<PagerView>(null);

  const onSubmit = (data: FormData) => {
    setIsLoading(true);
    const {
      token: formToken,
      provider: formProvider = Provider.EMAIL,
      providerId: formProviderId,
      ...rest
    } = data;
    const newUser: User = new User({
      email: rest.email,
      password: rest.password,
      phone: rest.phone,
      tiktok: rest.platformDatas.find(
        platform => platform.platform === SocialPlatform.Tiktok,
      )?.data,
      instagram: rest.platformDatas.find(
        platform => platform.platform === SocialPlatform.Instagram,
      )?.data,
    });

    if (UserRole.BusinessPeople === rest.currentRole) {
      newUser.businessPeople = {
        fullname: rest.fullname,
        profilePicture: profilePicture,
        rating: 0,
        ratedCount: 0,
      };
    }

    if (UserRole.ContentCreator === rest.currentRole) {
      newUser.contentCreator = {
        fullname: rest.fullname,
        profilePicture: profilePicture,
        specializedCategoryIds: (
          rest.focusCategories.map(category => category.id) || []
        ).filter((item): item is string => item !== undefined),
        preferredLocationIds: (
          rest.preferredLocations.map(location => location.id) || []
        ).filter((item): item is string => item !== undefined),
        postingSchedules: rest.contentCreatorPreference?.postingSchedules || [],
        preferences: rest.contentCreatorPreference?.preferences || [],
        contentRevisionLimit:
          rest.contentCreatorPreference?.contentRevisionLimit || 0,
        rating: 0,
        ratedCount: 0,
        biodata: '',
      };
    }

    newUser
      .signup(formToken, formProvider, formProviderId)
      .then(() => {
        showToast({
          type: ToastType.success,
          message: 'Registration success!',
        });
      })
      .catch(() => {
        showToast({
          type: ToastType.danger,
          message: 'Registration failed!',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

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

  const emailCheck = async () => {
    const authMethod = await AuthMethod.getByEmail(email);
    if (authMethod) {
      setLoginAuthMethod(authMethod.method);
      setIsLoginModalOpened(true);
    } else {
      nextPage();
    }
  };

  const handleLogin = () => {
    if (Provider.GOOGLE === loginAuthMethod) {
      User.continueWithGoogle()
        .then(data => {
          if (data.token) {
            setValue('email', data.email || '');
            setValue('fullname', data.name || '');
            setValue('profilePicture', data.photo || '');
            setValue('token', data.token);
            setValue('providerId', data.id);
            setValue('provider', Provider.GOOGLE);
          }
        })
        .finally(() => setIsLoginModalOpened(false));
    } else if (Provider.FACEBOOK === loginAuthMethod) {
      User.continueWithFacebook(data => {
        setValue('email', data.email || '');
        setValue('fullname', data.name || '');
        setValue('profilePicture', data.photo || '');
        setValue('token', data.token);
        setValue('providerId', data.id);
        setValue('provider', Provider.FACEBOOK);
      });
    } else {
      navigation.navigate(GuestNavigation.Login, {
        user: new User({
          email: getValues('email'),
        }),
      });
    }
  };

  const onChangeRole = useCallback(
    (role: UserRole) => {
      setValue('currentRole', role);
    },
    [setValue],
  );

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

  useEffect(() => {
    if (hasNext()) {
      setActionText('Next');
    } else {
      setActionText('Create Account');
    }
  }, [activePosition, steps.length, hasNext]);

  return (
    <>
      {isLoading && <LoadingScreen />}
      <FormProvider {...methods}>
        <PageWithBackButton
          fullHeight
          enableSafeAreaContainer
          onPress={previousPage}
          threshold={0}
          backButtonPlaceholder={<BackButtonLabel text="Sign Up" />}
          disableDefaultOnPress={activePosition > 0}>
          <View style={[flex.flex1, flex.flexCol, padding.top.large]}>
            <View style={[padding.horizontal.large]}>
              <FadeInOut visible={activePosition > 0}>
                <Stepper
                  currentPosition={activePosition + 1}
                  maxPosition={steps.length}
                />
              </FadeInOut>
            </View>
            <PagerView
              style={[flex.flex1]}
              ref={pagerViewRef}
              initialPage={steps[activePosition]}
              scrollEnabled={false}
              onPageSelected={e => {
                const position = e.nativeEvent.position;
                setActivePosition(steps.findIndex(step => step === position));
              }}>
              <ScrollView key={SignupStep.ROLE}>
                <View style={[flex.flexCol, gap.small, items.center]}>
                  <ChooseRole onChangeRole={onChangeRole} />
                  <CustomButton
                    text={actionText}
                    rounded="max"
                    minimumWidth
                    onPress={nextPage}
                  />
                </View>
              </ScrollView>
              <ScrollView
                key={SignupStep.EMAIL}
                style={[flex.flexCol, gap.xlarge, padding.large]}>
                <CustomTextInput
                  label="Email"
                  name="email"
                  forceLowercase
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                      message: 'Email address must be a valid address',
                    },
                  }}
                />
                <CustomButton
                  text={actionText}
                  rounded="max"
                  minimumWidth
                  disabled={!isValidField(getFieldState('email', formState))}
                  onPress={emailCheck}
                />
                <CustomModal transparent={true} visible={isLoginModalOpened}>
                  <View style={[flex.flexCol, gap.large, padding.xlarge]}>
                    <Text
                      style={[
                        self.center,
                        text.center,
                        font.weight.bold,
                        font.size[40],
                      ]}>
                      This email is already connected to an account
                    </Text>
                    <Text style={[self.center, text.center, font.size[40]]}>
                      Do you want to log in instead?
                    </Text>
                    <View style={[flex.flexCol, gap.default]}>
                      <AuthProviderButton
                        provider={loginAuthMethod || Provider.EMAIL}
                        onPress={handleLogin}
                      />
                      <CustomButton
                        text="Dismiss"
                        type="tertiary"
                        rounded="large"
                        onPress={() => setIsLoginModalOpened(false)}
                      />
                    </View>
                  </View>
                </CustomModal>
              </ScrollView>
              <ScrollView
                key={SignupStep.PASSWORD}
                style={[flex.flexCol, gap.xlarge, padding.large]}>
                <CustomTextInput
                  label="Password"
                  name="password"
                  hideInputText
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  }}
                />

                <CustomTextInput
                  label="Confirm password"
                  name="confirmPassword"
                  hideInputText
                  rules={{
                    required: 'Confirm Password must be filled',
                    validate: value =>
                      value === watch('password') ||
                      'Confirm password must be the same as password',
                  }}
                />
                <CustomButton
                  text={actionText}
                  rounded="max"
                  minimumWidth
                  disabled={
                    !isValidField(getFieldState('password', formState)) ||
                    !isValidField(getFieldState('confirmPassword', formState))
                  }
                  onPress={nextPage}
                />
              </ScrollView>
              <ScrollView
                key={SignupStep.NAME_PHONE}
                style={[padding.large, flex.flexCol, gap.xlarge]}>
                <CustomTextInput
                  label="Full name"
                  name="fullname"
                  rules={{
                    required: 'Fullname is required',
                  }}
                />
                <CustomTextInput
                  keyboardType="phone-pad"
                  label="Phone Number"
                  name="phone"
                  rules={{
                    required: 'Phone number is required',
                    pattern: {
                      value: /^(^\+62|62|^08)(\d{3,4}-?){2}\d{3,4}$/g,
                      message: 'Phone number is invalid',
                    },
                  }}
                />
                <CustomButton
                  text={actionText}
                  rounded="max"
                  minimumWidth
                  disabled={
                    getValues('fullname').length <= 0 ||
                    !isValidField(getFieldState('phone', formState))
                  }
                  onPress={nextPage}
                />
              </ScrollView>
              <ScrollView key={SignupStep.SOCIAL_PLATFORM}>
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
              <ScrollView key={SignupStep.FAVORITE_CATEGORY}>
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
              <ScrollView key={SignupStep.LOCATION}>
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
              <ScrollView key={SignupStep.CONTENT_CREATOR_PREFERENCES}>
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
              <ScrollView key={SignupStep.PROFILE_PICTURE}>
                <KeyboardAvoidingContainer>
                  <View style={[flex.flexCol, gap.xlarge2]}>
                    <RegisterProfilePicture
                      defaultProfile={getValues('profilePicture')}
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

export default SignUpScreen;
