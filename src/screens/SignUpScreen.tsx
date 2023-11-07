import {Alert, Text, View} from 'react-native';
import {
  ContentCreatorPreference,
  SignupContentCreatorProps,
  SocialPlatform,
  User,
  UserRole,
  UserRoles,
} from '../model/User';
import {useForm, FormProvider} from 'react-hook-form';
import {CustomTextInput} from '../components/atoms/Input';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../components/atoms/ViewPadding';
import {flex, items, justify} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {textColor} from '../styles/Text';
import {COLOR} from '../styles/Color';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {CustomButton} from '../components/atoms/Button';
import {useAppSelector} from '../redux/hooks';
import PagerView from 'react-native-pager-view';
import {isValidField} from '../utils/form';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {verticalPadding} from '../styles/Padding';
import {Stepper} from '../components/atoms/Stepper';
import {AuthMethod, Provider, Providers} from '../model/AuthMethod';
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
import {font} from '../styles/Font';
import {AuthProviderButton} from '../components/molecules/AuthProviderButton';
import {dimension} from '../styles/Dimension';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import {GuestNavigation, NavigationStackProps} from '../navigation/StackNavigation';

type FormData = {
  email: string;
  password?: string;
  confirmPassword?: string;
  fullname: string;
  phone: string;
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

const SignUpScreen = () => {
  const navigation = useNavigation<NavigationStackProps>();
  const [loginAuthMethod, setLoginAuthMethod] = useState<Providers | undefined>(
    undefined,
  );
  const [isLoginModalOpened, setIsLoginModalOpened] = useState<boolean>(false);
  const [profilePicture, setProfilePicture] = useState<string | undefined>(
    undefined,
  );
  const [contentCreatorPreference, setContentCreatorPreference] =
    useState<ContentCreatorPreference>();
  const [platformDatas, setPlatformDatas] = useState<PlatformData[]>([]);
  const [isValidPlatformData, setIsValidPlatformData] =
    useState<boolean>(false);
  const [focusCategories, setFocusCategories] = useState<Category[]>([]);
  const [preferredLocations, setPreferredLocations] = useState<Location[]>([]);
  const {
    temporaryData: temporaryUserSignupData,
    data: userSignupData,
    provider,
    providerId,
  } = useAppSelector(select => select.signup);
  const [currentRole, setCurrentRole] = useState<UserRoles | undefined>(
    undefined,
  );
  const [activePosition, setActivePosition] = useState<number>(0);
  const [actionText, setActionText] = useState<string>('Next');
  const steps = useMemo(() => {
    let commonSteps = [SignupStep.NAME_PHONE];
    if (Provider.GOOGLE === provider) {
      if (!userSignupData?.email) {
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

    commonSteps = [SignupStep.ROLE, ...commonSteps, SignupStep.PROFILE_PICTURE];
    return commonSteps;
  }, [provider, userSignupData, currentRole]);

  const pagerViewRef = useRef<PagerView>(null);
  const methods = useForm<FormData>({
    mode: 'all',
    defaultValues: {},
  });

  const {getFieldState, watch, formState, setValue, getValues} = methods;

  const onSubmit = async (data: FormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {confirmPassword, ...rest} = data;
    const commonUserData: User = new User({
      email: rest.email || userSignupData?.email,
      password: rest.password,
      phone: rest.phone,
    });

    let signupData: SignupContentCreatorProps = {
      ...commonUserData.toJSON(),
      providerId: providerId === '' ? undefined : providerId,
      provider: provider || Provider.EMAIL,
      token: temporaryUserSignupData?.token!!,
      tiktok: platformDatas.find(
        platform => platform.platform === SocialPlatform.Tiktok,
      )?.data,
      instagram: platformDatas.find(
        platform => platform.platform === SocialPlatform.Instagram,
      )?.data,
    };

    if (UserRole.BusinessPeople === currentRole) {
      signupData = {
        ...signupData,
        businessPeople: {
          fullname: rest.fullname,
          profilePicture: profilePicture,
        },
      };
    }

    if (UserRole.ContentCreator === currentRole) {
      signupData = {
        ...signupData,
        contentCreator: {
          fullname: rest.fullname,
          profilePicture: profilePicture,
          specializedCategoryIds: (
            focusCategories.map(category => category.id) || []
          ).filter((item): item is string => item !== undefined),
          preferredLocationIds: (
            preferredLocations.map(location => location.id) || []
          ).filter((item): item is string => item !== undefined),
          postingSchedules:
            contentCreatorPreference?.postingSchedules.map(postingSchedule => {
              if (postingSchedule instanceof Date) {
                return firestore.Timestamp.fromDate(postingSchedule);
              }
              return postingSchedule;
            }) || [],
          preferences: contentCreatorPreference?.preferences || [],
          contentRevisionLimit:
            contentCreatorPreference?.contentRevisionLimit || 0,
        },
      };
    }
    try {
      await User.signUp(signupData);
    } catch (error: any) {
      Alert.alert('Error!', error.message, [
        {
          text: 'OK',
          onPress: () => console.log('OK Pressed'),
          style: 'cancel',
        },
      ]);
    }
  };

  const hasNext = useCallback(() => {
    return activePosition + 1 < steps.length;
  }, [activePosition, steps]);

  const nextPage = async () => {
    if (hasNext()) {
      pagerViewRef.current?.setPage(steps[activePosition + 1]);
    } else {
      await onSubmit(getValues());
    }
  };

  const previousPage = () => {
    pagerViewRef.current?.setPage(steps[activePosition - 1]);
  };

  const setFieldValue = useCallback(
    (field: keyof FormData, data: any) => {
      data &&
        setValue(field, data, {
          shouldValidate: true,
          shouldTouch: true,
          shouldDirty: true,
        });
    },
    [setValue],
  );

  const emailCheck = async () => {
    const email = getValues('email');
    const authMethod = await AuthMethod.getByEmail(email);
    if (authMethod) {
      setLoginAuthMethod(authMethod.method);
      setIsLoginModalOpened(true);
    } else {
      nextPage();
    }
  };

  const handleLogin = () => {
    if (loginAuthMethod === Provider.GOOGLE) {
      User.continueWithGoogle();
    } else if (loginAuthMethod === Provider.FACEBOOK) {
      User.continueWithFacebook(() => {});
    } else {
      navigation.navigate(GuestNavigation.Login);
      // TODO: (additional) navigate to login page and set email with value here
    }
  };

  useEffect(() => {
    if (steps.includes(SignupStep.EMAIL)) {
      setFieldValue('email', userSignupData?.email);
    }

    if (steps.includes(SignupStep.NAME_PHONE)) {
      setFieldValue('fullname', temporaryUserSignupData?.fullname);
    }
  }, [steps, setFieldValue, userSignupData, temporaryUserSignupData]);

  useEffect(() => {
    if (hasNext()) {
      setActionText('Next');
    } else {
      setActionText('Create Account');
    }
  }, [activePosition, steps.length, hasNext]);

  return (
    <FormProvider {...methods}>
      <PageWithBackButton
        fullHeight
        onPress={previousPage}
        backButtonPlaceholder={
          <View className="justify-center" style={[flex.flexRow]}>
            <Text
              className="text-lg font-semibold"
              style={[textColor(COLOR.text.neutral.high)]}>
              Sign Up
            </Text>
          </View>
        }
        disableDefaultOnPress={activePosition > 0}>
        <View
          className="flex-1"
          style={[flex.flexCol, verticalPadding.default]}>
          <HorizontalPadding paddingSize="large">
            <VerticalPadding>
              <View
                style={[dimension.height.xlarge, flex.flexCol, justify.center]}>
                {activePosition > 0 && (
                  <Stepper
                    currentPosition={activePosition + 1}
                    maxPosition={steps.length}
                  />
                )}
              </View>
            </VerticalPadding>
          </HorizontalPadding>
          <PagerView
            ref={pagerViewRef}
            className="flex-1"
            initialPage={steps[activePosition]}
            scrollEnabled={false}
            onPageSelected={e => {
              const position = e.nativeEvent.position;
              setActivePosition(steps.findIndex(step => step === position));
            }}>
            <View key={SignupStep.ROLE}>
              <View className="items-center" style={[flex.flexCol, gap.small]}>
                <ChooseRole onChangeRole={setCurrentRole} />
                <CustomButton
                  text={actionText}
                  rounded="max"
                  minimumWidth
                  onPress={nextPage}
                />
              </View>
            </View>
            <View key={SignupStep.EMAIL}>
              <VerticalPadding paddingSize="large">
                <HorizontalPadding paddingSize="large">
                  <View style={[flex.flexCol, gap.xlarge]}>
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
                      disabled={
                        !isValidField(getFieldState('email', formState))
                      }
                      onPress={emailCheck}
                    />
                    <CustomModal
                      transparent={true}
                      visible={isLoginModalOpened}>
                      <HorizontalPadding paddingSize="xlarge">
                        <VerticalPadding paddingSize="xlarge">
                          <View style={[flex.flexCol, gap.large]}>
                            <Text
                              className="self-center text-center font-bold"
                              style={[font.size[40]]}>
                              This email is already connected to an account
                            </Text>
                            <Text
                              className="self-center text-center"
                              style={[font.size[40]]}>
                              Do you want to log in instead?
                            </Text>
                            <View style={[flex.flexCol, gap.default]}>
                              <AuthProviderButton
                                provider={loginAuthMethod || Provider.EMAIL}
                                customTextSize="text-sm"
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
                        </VerticalPadding>
                      </HorizontalPadding>
                    </CustomModal>
                  </View>
                </HorizontalPadding>
              </VerticalPadding>
            </View>
            <View key={SignupStep.PASSWORD}>
              <VerticalPadding paddingSize="large">
                <HorizontalPadding paddingSize="large">
                  <View style={[flex.flexCol, gap.xlarge]}>
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
                        !isValidField(
                          getFieldState('confirmPassword', formState),
                        )
                      }
                      onPress={nextPage}
                    />
                  </View>
                </HorizontalPadding>
              </VerticalPadding>
            </View>
            <View key={SignupStep.NAME_PHONE}>
              <VerticalPadding paddingSize="large">
                <HorizontalPadding paddingSize="large">
                  <View style={[flex.flexCol, gap.xlarge]}>
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
                        !isValidField(getFieldState('fullname', formState)) ||
                        !isValidField(getFieldState('phone', formState))
                      }
                      onPress={nextPage}
                    />
                  </View>
                </HorizontalPadding>
              </VerticalPadding>
            </View>
            <View key={SignupStep.SOCIAL_PLATFORM}>
              <KeyboardAvoidingContainer>
                <View style={[flex.flexCol, gap.xlarge3]}>
                  <RegisterSocialPlatform
                    initialData={{
                      instagramFollowers: `${userSignupData?.instagram?.followersCount}`,
                      instagramUsername: userSignupData?.instagram?.username,
                      tiktokFollowers: `${userSignupData?.tiktok?.followersCount}`,
                      tiktokUsername: userSignupData?.tiktok?.username,
                    }}
                    onChangeSocialData={setPlatformDatas}
                    onValidRegistration={setIsValidPlatformData}
                  />
                  <CustomButton
                    text={platformDatas.length === 0 ? 'Skip' : actionText}
                    rounded="max"
                    minimumWidth
                    disabled={!isValidPlatformData}
                    onPress={nextPage}
                  />
                </View>
              </KeyboardAvoidingContainer>
            </View>
            <View key={SignupStep.FAVORITE_CATEGORY}>
              <KeyboardAvoidingContainer>
                <View style={[flex.flexCol, gap.xlarge2]}>
                  <RegisterFocusCategory
                    onCategoriesChange={setFocusCategories}
                  />
                  <CustomButton
                    text={focusCategories.length === 0 ? 'Skip' : actionText}
                    rounded="max"
                    minimumWidth
                    onPress={nextPage}
                  />
                </View>
              </KeyboardAvoidingContainer>
            </View>
            <View key={SignupStep.LOCATION}>
              <KeyboardAvoidingContainer>
                <View style={[flex.flexCol, gap.xlarge2]}>
                  <RegisterLocation onLocationsChange={setPreferredLocations} />
                  <CustomButton
                    text={preferredLocations.length === 0 ? 'Skip' : actionText}
                    rounded="max"
                    minimumWidth
                    onPress={nextPage}
                  />
                </View>
              </KeyboardAvoidingContainer>
            </View>
            <View key={SignupStep.CONTENT_CREATOR_PREFERENCES}>
              <KeyboardAvoidingContainer>
                <View style={[flex.flexCol, gap.xlarge2]}>
                  <RegisterContentCreatorPreferences
                    onPreferenceChange={setContentCreatorPreference}
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
            </View>
            <View key={SignupStep.PROFILE_PICTURE}>
              <KeyboardAvoidingContainer>
                <View style={[flex.flexCol, gap.xlarge2]}>
                  <RegisterProfilePicture
                    defaultProfile={temporaryUserSignupData?.profilePicture}
                    onProfilePictureChange={setProfilePicture}
                  />
                  <CustomButton
                    text={actionText}
                    rounded="max"
                    minimumWidth
                    onPress={nextPage}
                  />
                </View>
              </KeyboardAvoidingContainer>
            </View>
          </PagerView>
        </View>
      </PageWithBackButton>
    </FormProvider>
  );
};

export default SignUpScreen;
