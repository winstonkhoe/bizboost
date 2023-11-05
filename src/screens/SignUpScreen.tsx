import {Alert, Text, View} from 'react-native';
import {User, UserRole, UserRoles} from '../model/User';
import {useForm, FormProvider} from 'react-hook-form';
import {CustomTextInput} from '../components/atoms/Input';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../components/atoms/ViewPadding';
import {flex} from '../styles/Flex';
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
import {Provider} from '../model/AuthMethod';
import {KeyboardAvoidingContainer} from '../containers/KeyboardAvoidingContainer';
import {useNavigation} from '@react-navigation/native';
import {NavigationStackProps} from '../navigation/StackNavigation';
import {Location} from '../model/Location';
import {openLocationModal} from '../utils/modal';
import {Category} from '../model/Category';
import {ChooseRole} from './signup/ChooseRole';
import {
  PlatformData,
  RegisterSocialPlatform,
} from './signup/RegisterSocialPlatform';
import {RegisterFocusCategory} from './signup/RegisterFocusCategory';
import {RegisterLocation} from './signup/RegisterLocation';
import {
  ContentCreatorPreference,
  RegisterContentCreatorPreferences,
} from './signup/RegisterContentCreatorPreferences';

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  fullname: string;
  phone: string;
};

enum SignupStep {
  EMAIL = 0,
  PASSWORD = 1,
  ROLE = 2,
  NAME_PHONE = 3,
  SOCIAL_PLATFORM = 4,
  FAVORITE_CATEGORY = 5,
  LOCATION = 6,
  CONTENT_CREATOR_PREFERENCES = 7,
  PROFILE_PICTURE = 8,
}

const SignUpScreen = () => {
  const [contentCreatorPreference, setContentCreatorPreference] =
    useState<ContentCreatorPreference>();
  const [platformDatas, setPlatformDatas] = useState<PlatformData[]>([]);
  const [isValidPlatformData, setIsValidPlatformData] =
    useState<boolean>(false);
  const [focusCategories, setFocusCategories] = useState<Category[]>([]);
  const [preferredLocations, setPreferredLocations] = useState<Location[]>([]);
  const generalNavigation = useNavigation<NavigationStackProps>();
  const {
    temporaryData: temporaryUserSignupData,
    data: userSignupData,
    provider,
    role,
  } = useAppSelector(select => select.signup);
  const [currentRole, setCurrentRole] = useState<UserRoles | undefined>(
    undefined,
  );
  const [activePosition, setActivePosition] = useState<number>(0);
  const [actionText, setActionText] = useState<string>('Next');
  const steps = useMemo(() => {
    let commonSteps = [SignupStep.ROLE, SignupStep.NAME_PHONE];
    if (Provider.GOOGLE === provider) {
      if (!userSignupData?.email) {
        commonSteps = [SignupStep.EMAIL, ...commonSteps];
      }
    } else if (Provider.FACEBOOK === provider) {
      commonSteps = [SignupStep.EMAIL, ...commonSteps];
    } else {
      commonSteps = [SignupStep.EMAIL, SignupStep.PASSWORD, ...commonSteps];
    }

    if (UserRole.ContentCreator === role) {
      commonSteps = [
        ...commonSteps,
        SignupStep.SOCIAL_PLATFORM,
        SignupStep.FAVORITE_CATEGORY,
        SignupStep.LOCATION,
        SignupStep.CONTENT_CREATOR_PREFERENCES,
      ];
    }

    commonSteps = [
      SignupStep.CONTENT_CREATOR_PREFERENCES,
      ...commonSteps,
      SignupStep.PROFILE_PICTURE,
    ];
    return commonSteps;
  }, [provider, userSignupData, role]);

  const pagerViewRef = useRef<PagerView>(null);
  const methods = useForm<FormData>({
    mode: 'all',
    defaultValues: {},
  });

  const {handleSubmit, getFieldState, watch, formState, setValue} = methods;

  const onSubmit = (data: FormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {confirmPassword, ...rest} = data;
    const signUpData: User = {
      email: rest.email,
      password: rest.password,
      phone: rest.phone,
      businessPeople: {
        fullname: rest.fullname,
      },
    };
    User.signUpBusinessPeople(signUpData).catch(error => {
      Alert.alert('Error!', error.message, [
        {
          text: 'OK',
          onPress: () => console.log('OK Pressed'),
          style: 'cancel',
        },
      ]);
    });
  };

  const hasNext = useCallback(() => {
    return activePosition + 1 < steps.length;
  }, [activePosition, steps]);

  const nextPage = () => {
    if (hasNext()) {
      pagerViewRef.current?.setPage(steps[activePosition + 1]);
    } else {
      handleSubmit(onSubmit);
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
              <Stepper
                currentPosition={activePosition}
                maxPosition={steps.length}
              />
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
            <View key={SignupStep.EMAIL}>
              <VerticalPadding paddingSize="large">
                <HorizontalPadding paddingSize="large">
                  <View style={[flex.flexCol, gap.xlarge]}>
                    <CustomTextInput
                      label="Email"
                      name="email"
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
                      onPress={nextPage}
                    />
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
