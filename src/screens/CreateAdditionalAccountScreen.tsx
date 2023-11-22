import {Alert, Text, View} from 'react-native';
import {flex} from '../styles/Flex';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {gap} from '../styles/Gap';
import {FormProvider, useForm} from 'react-hook-form';
import {CustomButton} from '../components/atoms/Button';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../components/atoms/ViewPadding';
import {CustomTextInput} from '../components/atoms/Input';
import {rounded} from '../styles/BorderRadius';
import {horizontalPadding, padding, verticalPadding} from '../styles/Padding';
import UserIcon from '../assets/vectors/user.svg';
import {border} from '../styles/Border';
import {isValidField} from '../utils/form';
import {useCreateAdditionalAccount} from '../hooks/forms';
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

type FormData = {
  fullname: string;
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
  const {role} = useCreateAdditionalAccount();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationStackProps>();
  const methods = useForm<FormData>({
    mode: 'all',
    defaultValues: {},
  });
  const {user} = useUser();

  const pagerViewRef = useRef<PagerView>(null);

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

  const {getFieldState, formState, getValues} = methods;

  const onSubmit = async (data: FormData) => {
    let userData: User = new User({
      ...user,
      tiktok: platformDatas.find(
        platform => platform.platform === SocialPlatform.Tiktok,
      )?.data,
      instagram: platformDatas.find(
        platform => platform.platform === SocialPlatform.Instagram,
      )?.data,
    });

    if (UserRole.BusinessPeople === role) {
      userData = new User({
        ...userData.toJSON(),
        businessPeople: {
          fullname: data.fullname,
          profilePicture: profilePicture,
        },
      });
    }

    if (UserRole.ContentCreator === role) {
      userData = new User({
        ...userData.toJSON(),
        contentCreator: {
          fullname: data.fullname,
          profilePicture: profilePicture,
          specializedCategoryIds: (
            focusCategories.map(category => category.id) || []
          ).filter((item): item is string => item !== undefined),
          preferredLocationIds: (
            preferredLocations.map(location => location.id) || []
          ).filter((item): item is string => item !== undefined),
          postingSchedules: contentCreatorPreference?.postingSchedules || [],
          preferences: contentCreatorPreference?.preferences || [],
          contentRevisionLimit:
            contentCreatorPreference?.contentRevisionLimit || 0,
        },
      });
    }

    if (user?.id) {
      try {
        await userData.updateUserData();
        dispatch(switchRole(role));
      } catch (error: any) {
        Alert.alert('Error!', error.message, [
          {
            text: 'OK',
            onPress: () => console.log('OK Pressed'),
            style: 'cancel',
          },
        ]);
      }
    }
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
      navigation.navigate(AuthenticatedNavigation.Home);
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
    <FormProvider {...methods}>
      <PageWithBackButton
        enableSafeAreaContainer
        icon={activePosition === 0 ? 'close' : 'back'}
        fullHeight
        onPress={previousPage}
        backButtonPlaceholder={
          <View
            className="h-10 items-center"
            style={[
              flex.flexRow,
              gap.small,
              rounded.large,
              horizontalPadding.default,
              verticalPadding.xsmall2,
              background(COLOR.background.light),
              border({
                borderWidth: 1,
                color: COLOR.black[100],
                opacity: 0.6,
              }),
            ]}>
            <UserIcon width={25} height={25} color={COLOR.black[100]} />
            <Text className="font-semibold text-sm">{role}</Text>
          </View>
        }
        disableDefaultOnPress={activePosition > 0}>
        <View className="flex-1" style={[flex.flexCol, padding.top.xlarge2]}>
          <HorizontalPadding paddingSize="large">
            <FadeInOut visible={true}>
              <Stepper
                currentPosition={activePosition + 1}
                maxPosition={steps.length}
              />
            </FadeInOut>
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
            <View key={CreateAccountStep.NAME_PHONE}>
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
                </HorizontalPadding>
              </VerticalPadding>
            </View>
            <View key={CreateAccountStep.SOCIAL_PLATFORM}>
              <KeyboardAvoidingContainer>
                <View style={[flex.flexCol, gap.xlarge3]}>
                  <RegisterSocialPlatform
                    initialData={{
                      instagramFollowers: `${user?.instagram?.followersCount}`,
                      instagramUsername: user?.instagram?.username,
                      tiktokFollowers: `${user?.tiktok?.followersCount}`,
                      tiktokUsername: user?.tiktok?.username,
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
            <View key={CreateAccountStep.FAVORITE_CATEGORY}>
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
            <View key={CreateAccountStep.LOCATION}>
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
            <View key={CreateAccountStep.CONTENT_CREATOR_PREFERENCES}>
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
            <View key={CreateAccountStep.PROFILE_PICTURE}>
              <KeyboardAvoidingContainer>
                <View style={[flex.flexCol, gap.xlarge2]}>
                  <RegisterProfilePicture
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
