import {Platform, Pressable, ScrollView, Text, View} from 'react-native';
import {flex, items, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {useUser} from '../../hooks/user';
import {
  CustomNumberInput,
  CustomTextInput,
  FormlessTextInput,
} from '../../components/atoms/Input';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import {textColor} from '../../styles/Text';
import {font, fontSize} from '../../styles/Font';
import {COLOR} from '../../styles/Color';
import PasswordIcon from '../../assets/vectors/password.svg';
import ChevronRight from '../../assets/vectors/chevron-right.svg';
import InfoIcon from '../../assets/vectors/info.svg';
import DateIcon from '../../assets/vectors/date.svg';
import {AddIcon} from '../../components/atoms/Icon';

import {CustomButton} from '../../components/atoms/Button';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../../styles/Size';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {UserRole} from '../../model/User';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../../components/atoms/ViewPadding';
import {FormLabel} from '../../components/atoms/FormLabel';
import {StringObject} from '../../utils/stringObject';
import {AnimatedPressable} from '../../components/atoms/AnimatedPressable';
import {useCallback, useEffect, useState} from 'react';
import {useKeyboard} from '../../hooks/keyboard';
import {rounded} from '../../styles/BorderRadius';
import {border} from '../../styles/Border';
import {formatDateToTime12Hrs} from '../../utils/date';
import {background} from '../../styles/BackgroundColor';
import {SheetModal} from '../../containers/SheetModal';
import {PostingScheduleDatePicker} from '../signup/RegisterContentCreatorPreferences';

type FormData = {
  email: string;
  fullname: string;
  phone: string;
  contentRevisionLimit: number | string;
  postingSchedules: {value: number}[];
  preferences: StringObject[];
};
const AboutMeScreen = () => {
  const navigation = useNavigation<NavigationStackProps>();
  const safeAreaInsets = useSafeAreaInsets();
  const {user, activeData, activeRole} = useUser();
  const methods = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      fullname: activeData?.fullname,
      email: user?.email,
      phone: user?.phone,
      postingSchedules: user?.contentCreator?.postingSchedules.map(ps => ({
        value: ps,
      })),
      contentRevisionLimit: user?.contentCreator?.contentRevisionLimit,
      preferences: user?.contentCreator?.preferences.map(p => ({value: p})),
    },
  });

  const {watch, control} = methods;

  const keyboardHeight = useKeyboard();
  const [isDatePickerModalOpened, setIsDatePickerModalOpened] = useState(false);
  const [isPreferencesModalOpened, setIsPreferencesModalOpened] =
    useState(false);
  const [updatePostingSchedulesIndex, setUpdatePostingSchedulesIndex] =
    useState<number | undefined>(undefined);
  const [updatePreferenceIndex, setUpdatePreferenceIndex] = useState<
    number | undefined
  >(undefined);
  const [temporaryDate, setTemporaryDate] = useState<number>(
    new Date().getTime(),
  );
  const [temporaryPreference, setTemporaryPreference] = useState<string>('');

  const {
    fields: fieldsPostingSchedule,
    append: appendPostingSchedule,
    remove: removePostingSchedule,
  } = useFieldArray({
    name: 'postingSchedules',
    control,
  });

  const {
    fields: fieldsPreferences,
    append: appendPreferences,
    remove: removePreferences,
  } = useFieldArray({
    name: 'preferences',
    control,
  });

  const closeDatePickerSheetModal = () => {
    setIsDatePickerModalOpened(false);
  };

  const resetDatePickerSheetModal = useCallback(() => {
    setTemporaryDate(new Date().getTime());
    if (updatePostingSchedulesIndex !== undefined) {
      setUpdatePostingSchedulesIndex(undefined);
    }
  }, [updatePostingSchedulesIndex]);

  const closePreferenceSheetModal = () => {
    setIsPreferencesModalOpened(false);
  };

  const resetPreferenceSheetModal = useCallback(() => {
    setTemporaryPreference('');
    if (updatePreferenceIndex !== undefined) {
      setUpdatePreferenceIndex(undefined);
    }
  }, [updatePreferenceIndex]);

  useEffect(() => {
    if (!isDatePickerModalOpened) {
      resetDatePickerSheetModal();
    }
  }, [isDatePickerModalOpened, resetDatePickerSheetModal]);

  useEffect(() => {
    if (!isPreferencesModalOpened) {
      resetPreferenceSheetModal();
    }
  }, [isPreferencesModalOpened, resetPreferenceSheetModal]);

  useEffect(() => {
    const subscription = watch(value => {
      let contentRevisionLimit = value.contentRevisionLimit;
      if (
        contentRevisionLimit === undefined ||
        typeof contentRevisionLimit === 'string'
      ) {
        contentRevisionLimit = undefined;
      }
      // onPreferenceChange({
      //   contentRevisionLimit: contentRevisionLimit,
      //   postingSchedules: (
      //     value?.postingSchedules?.map(item => item?.value) || []
      //   ).filter((item): item is number => item !== undefined),
      //   preferences: (
      //     value?.preferences?.map(item => item?.value) || []
      //   ).filter((item): item is string => item !== undefined),
      // });
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  const savePostingSchedule = () => {
    appendPostingSchedule({
      value: temporaryDate,
    });
    closeDatePickerSheetModal();
  };

  const updatePostingSchedule = (onChange: (...event: any[]) => void) => {
    onChange(temporaryDate);
    closeDatePickerSheetModal();
  };

  const savePreference = () => {
    appendPreferences({
      value: temporaryPreference,
    });
    closePreferenceSheetModal();
  };

  const updatePreference = (onChange: (...event: any[]) => void) => {
    onChange(temporaryPreference);
    closePreferenceSheetModal();
  };
  return (
    <PageWithBackButton fullHeight enableSafeAreaContainer>
      <FormProvider {...methods}>
        <ScrollView
          style={[
            flex.flexCol,
            padding.horizontal.default,
            {
              paddingTop: Math.max(
                safeAreaInsets.top,
                safeAreaInsets.top < 10 ? size.large : size.xlarge2,
              ),
            },
          ]}>
          <View style={[flex.flexCol, gap.medium]}>
            <Text className="font-bold" style={[font.size[40]]}>
              About Me
            </Text>

            <CustomTextInput
              label="Name"
              name="fullname"
              rules={{
                required: 'Name is required',
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

            <CustomTextInput label="Email" name="email" disabled />

            <Pressable
              className="flex flex-row items-center justify-between"
              onPress={() => {
                navigation.navigate(AuthenticatedNavigation.ChangePassword);
              }}>
              <View className="flex flex-row items-center">
                <PasswordIcon width={18} height={18} fill={'black'} />
                <Text
                  className="font-medium ml-1"
                  style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
                  Password
                </Text>
              </View>
              <Text
                style={[textColor(COLOR.text.green.default), font.size[30]]}>
                Change
              </Text>
            </Pressable>

            <View className="border-t border-gray-400 pt-4">
              <Text
                className="font-bold"
                style={[textColor(COLOR.text.neutral.high), font.size[40]]}>
                Content Creator Information
              </Text>
            </View>

            <Pressable
              className="flex flex-row items-center justify-between"
              onPress={() => {
                navigation.navigate(
                  AuthenticatedNavigation.EditMaxContentRevision,
                );
              }}>
              <Text
                className="font-medium"
                style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
                Max Content Revisions
              </Text>
              <View
                className="flex flex-row items-center"
                style={[gap.default]}>
                <Text
                  style={[textColor(COLOR.text.neutral.low), font.size[20]]}>
                  {user?.contentCreator?.contentRevisionLimit || 0} times
                </Text>
                <ChevronRight fill={COLOR.black[20]} />
              </View>
            </Pressable>

            <Pressable
              className="flex flex-row items-center justify-between"
              onPress={() => {
                navigation.navigate(
                  AuthenticatedNavigation.EditPostingSchedule,
                );
              }}>
              <Text
                className="font-medium"
                style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
                Posting Schedules
              </Text>
              <View
                className="flex flex-row items-center"
                style={[gap.default]}>
                <Text
                  style={[textColor(COLOR.text.neutral.low), font.size[20]]}>
                  {user?.contentCreator?.postingSchedules.at(0) &&
                    formatDateToTime12Hrs(
                      new Date(user?.contentCreator?.postingSchedules.at(0)!),
                    )}
                  {(user?.contentCreator?.postingSchedules.length || -1) > 1 &&
                    `, and ${
                      user?.contentCreator?.postingSchedules.length! - 1
                    } more`}
                </Text>
                <ChevronRight fill={COLOR.black[20]} />
              </View>
            </Pressable>

            <Pressable
              className="flex flex-row items-center justify-between"
              onPress={() => {
                navigation.navigate(AuthenticatedNavigation.EditPreferences);
              }}>
              <Text
                className="font-medium"
                style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
                Preferences
              </Text>
              <View
                className="flex flex-row items-center justify-end"
                style={[gap.default]}>
                <View className="w-1/2 flex flex-row items-center justify-end">
                  <Text
                    className="overflow-hidden text-right"
                    numberOfLines={1}
                    style={[textColor(COLOR.text.neutral.low), font.size[20]]}>
                    {user?.contentCreator?.preferences.at(0) &&
                      user?.contentCreator?.preferences.at(0)}
                  </Text>
                  <Text
                    style={[textColor(COLOR.text.neutral.low), font.size[20]]}>
                    {(user?.contentCreator?.preferences.length || -1) > 1 &&
                      `, and ${
                        user?.contentCreator?.preferences.length! - 1
                      } more`}
                  </Text>
                </View>
                <ChevronRight fill={COLOR.black[20]} />
              </View>
            </Pressable>

            <Pressable
              className="flex flex-row items-center justify-between"
              onPress={() => {
                navigation.navigate(
                  AuthenticatedNavigation.EditPreferredLocation,
                );
              }}>
              <Text
                className="font-medium"
                style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
                Preferred Locations
              </Text>
              <View
                className="flex flex-row items-center justify-end"
                style={[gap.default]}>
                <View className="w-1/2 flex flex-row items-center justify-end">
                  <Text
                    className="overflow-hidden text-right"
                    numberOfLines={1}
                    style={[textColor(COLOR.text.neutral.low), font.size[20]]}>
                    {user?.contentCreator?.preferredLocationIds.at(0) &&
                      user?.contentCreator?.preferredLocationIds.at(0)}
                  </Text>
                  <Text
                    style={[textColor(COLOR.text.neutral.low), font.size[20]]}>
                    {(user?.contentCreator?.preferredLocationIds.length || -1) >
                      1 &&
                      `, and ${
                        user?.contentCreator?.preferredLocationIds.length! - 1
                      } more`}
                  </Text>
                </View>
                <ChevronRight fill={COLOR.black[20]} />
              </View>
            </Pressable>

            <Pressable
              className="flex flex-row items-center justify-between"
              onPress={() => {
                navigation.navigate(
                  AuthenticatedNavigation.EditSpecializedCategory,
                );
              }}>
              <Text
                className="font-medium"
                style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
                Specialized Categories
              </Text>
              <View
                className="flex flex-row items-center justify-end"
                style={[gap.default]}>
                <View className="w-1/2 flex flex-row items-center justify-end">
                  <Text
                    className="overflow-hidden text-right"
                    numberOfLines={1}
                    style={[textColor(COLOR.text.neutral.low), font.size[20]]}>
                    {user?.contentCreator?.specializedCategoryIds.at(0) &&
                      user?.contentCreator?.specializedCategoryIds.at(0)}
                  </Text>
                  <Text
                    style={[textColor(COLOR.text.neutral.low), font.size[20]]}>
                    {(user?.contentCreator?.specializedCategoryIds.length ||
                      -1) > 1 &&
                      `, and ${
                        user?.contentCreator?.specializedCategoryIds.length! - 1
                      } more`}
                  </Text>
                </View>
                <ChevronRight fill={COLOR.black[20]} />
              </View>
            </Pressable>
          </View>

          <View className="mt-8">
            <View
              className="mb-4 flex flex-row items-center w-full"
              style={[gap.small]}>
              <InfoIcon width={18} height={18} fill={COLOR.text.neutral.med} />
              <Text
                style={[
                  textColor(COLOR.text.neutral.med),
                  {fontSize: fontSize[20]},
                ]}
                className="w-11/12">
                You are editing your information as a {activeRole}. Your name as
                a{' '}
                {activeRole === UserRole.BusinessPeople
                  ? UserRole.ContentCreator
                  : UserRole.BusinessPeople}{' '}
                might be different.
              </Text>
            </View>
            <CustomButton
              text="Save"
              onPress={methods.handleSubmit(d => console.log(d))}
            />
          </View>
        </ScrollView>
      </FormProvider>
    </PageWithBackButton>
  );
};

export default AboutMeScreen;
