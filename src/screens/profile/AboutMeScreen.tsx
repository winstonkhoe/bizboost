import {Pressable, ScrollView, Text, View} from 'react-native';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {useUser} from '../../hooks/user';
import {CustomTextInput} from '../../components/atoms/Input';
import {FormProvider, useForm} from 'react-hook-form';
import {textColor} from '../../styles/Text';
import {font, fontSize} from '../../styles/Font';
import {COLOR} from '../../styles/Color';
import PasswordIcon from '../../assets/vectors/password.svg';
import ChevronRight from '../../assets/vectors/chevron-right.svg';
import InfoIcon from '../../assets/vectors/info.svg';
import {CustomButton} from '../../components/atoms/Button';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../../styles/Size';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {User, UserRole} from '../../model/User';
import {formatDateToTime12Hrs} from '../../utils/date';
import {openCategoryModal, openLocationModal} from '../../utils/modal';
import {Location} from '../../model/Location';
import {Category} from '../../model/Category';
type FormData = {
  email: string;
  fullname: string;
  phone: string;

  //
  // preferredLocations: Location[]
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
    },
  });
  const onSubmit = (d: FormData) => {
    const temp = new User({...user});

    if (activeRole === UserRole.BusinessPeople) {
      temp.businessPeople = {
        ...temp.businessPeople!,
        fullname: d.fullname,
      };
    } else if (activeRole === UserRole.ContentCreator) {
      temp.contentCreator = {
        ...temp.contentCreator!,
        fullname: d.fullname,
      };
    }

    temp.email = d.email;
    temp.phone = d.phone;

    temp.updateUserData().then(() => {
      navigation.goBack();
    });
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
            <Text
              className="font-bold"
              style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
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

            {activeRole === UserRole.ContentCreator && (
              <>
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
                      style={[
                        textColor(COLOR.text.neutral.low),
                        font.size[20],
                      ]}>
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
                      style={[
                        textColor(COLOR.text.neutral.low),
                        font.size[20],
                      ]}>
                      {user?.contentCreator?.postingSchedules.at(0)
                        ? formatDateToTime12Hrs(
                            new Date(
                              user?.contentCreator?.postingSchedules.at(0)!,
                            ),
                          )
                        : 'None'}
                      {(user?.contentCreator?.postingSchedules.length || -1) >
                        1 &&
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
                    navigation.navigate(
                      AuthenticatedNavigation.EditPreferences,
                    );
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
                        style={[
                          textColor(COLOR.text.neutral.low),
                          font.size[20],
                        ]}>
                        {user?.contentCreator?.preferences.at(0)
                          ? user?.contentCreator?.preferences.at(0)
                          : 'None'}
                      </Text>
                      <Text
                        style={[
                          textColor(COLOR.text.neutral.low),
                          font.size[20],
                        ]}>
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
                    // TODO: baru liat ada uda RegisterLocation sama RegisterFocusCategory, jadi kyknya nanti yang lainnya akan disamain hehe
                    // navigation.navigate(
                    //   AuthenticatedNavigation.EditSpecializedCategory,
                    // );

                    openLocationModal({
                      preferredLocations:
                        user?.contentCreator?.preferredLocationIds.map(
                          pl => new Location({id: pl}),
                        ) || [],
                      setPreferredLocations: locations => {
                        // TODO: extract method?
                        const temp = new User({...user});
                        temp.contentCreator = {
                          ...temp.contentCreator!,
                          preferredLocationIds: locations.map(l => l.id || ''),
                        };

                        temp.updateUserData();
                      },
                      navigation: navigation,
                    });
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
                        style={[
                          textColor(COLOR.text.neutral.low),
                          font.size[20],
                        ]}>
                        {user?.contentCreator?.preferredLocationIds.at(0)
                          ? user?.contentCreator?.preferredLocationIds.at(0)
                          : 'None'}
                      </Text>
                      <Text
                        style={[
                          textColor(COLOR.text.neutral.low),
                          font.size[20],
                        ]}>
                        {(user?.contentCreator?.preferredLocationIds.length ||
                          -1) > 1 &&
                          `, and ${
                            user?.contentCreator?.preferredLocationIds.length! -
                            1
                          } more`}
                      </Text>
                    </View>
                    <ChevronRight fill={COLOR.black[20]} />
                  </View>
                </Pressable>

                <Pressable
                  className="flex flex-row items-center justify-between"
                  onPress={() => {
                    openCategoryModal({
                      favoriteCategories:
                        user?.contentCreator?.specializedCategoryIds.map(
                          sc => new Category({id: sc}),
                        ) || [],
                      setFavoriteCategories: categories => {
                        const temp = new User({...user});
                        temp.contentCreator = {
                          ...temp.contentCreator!,
                          specializedCategoryIds: categories.map(
                            c => c.id || '',
                          ),
                        };

                        temp.updateUserData();
                      },
                      navigation: navigation,
                    });
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
                        style={[
                          textColor(COLOR.text.neutral.low),
                          font.size[20],
                        ]}>
                        {user?.contentCreator?.specializedCategoryIds.at(0)
                          ? user?.contentCreator?.specializedCategoryIds.at(0)
                          : 'None'}
                      </Text>
                      <Text
                        style={[
                          textColor(COLOR.text.neutral.low),
                          font.size[20],
                        ]}>
                        {(user?.contentCreator?.specializedCategoryIds.length ||
                          -1) > 1 &&
                          `, and ${
                            user?.contentCreator?.specializedCategoryIds
                              .length! - 1
                          } more`}
                      </Text>
                    </View>
                    <ChevronRight fill={COLOR.black[20]} />
                  </View>
                </Pressable>
              </>
            )}
            <View className="border-t border-gray-400 pt-4">
              <Text
                className="font-bold"
                style={[textColor(COLOR.text.neutral.high), font.size[40]]}>
                Payment Information
              </Text>
            </View>
            <Pressable
              className="flex flex-row items-center justify-between"
              onPress={() => {
                navigation.navigate(
                  AuthenticatedNavigation.EditBankAccountInformationScreen,
                );
              }}>
              <Text
                className="font-medium"
                style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
                Bank Account
              </Text>
              <View
                className="flex flex-row items-center justify-end"
                style={[gap.default]}>
                <View className="w-3/5 flex flex-row items-center justify-end">
                  <Text
                    className="overflow-hidden text-right"
                    numberOfLines={1}
                    style={[textColor(COLOR.text.neutral.low), font.size[20]]}>
                    {user?.bankAccountInformation
                      ? `${user.bankAccountInformation.bankName} - ${user.bankAccountInformation.accountNumber}`
                      : 'None'}
                  </Text>
                </View>
                <ChevronRight fill={COLOR.black[20]} />
              </View>
            </Pressable>
          </View>

          <View className="mt-9">
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
              onPress={methods.handleSubmit(onSubmit)}
            />
          </View>
        </ScrollView>
      </FormProvider>
    </PageWithBackButton>
  );
};

export default AboutMeScreen;
