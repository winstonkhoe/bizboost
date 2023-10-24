import {Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {flex} from '../styles/Flex';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {gap} from '../styles/Gap';
import {FormProvider, useForm} from 'react-hook-form';
import {CustomButton} from '../components/atoms/Button';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {CustomTextInput} from '../components/atoms/Input';
import {BackButton, CloseModal} from '../components/atoms/Close';
import {rounded} from '../styles/BorderRadius';
import {horizontalPadding, verticalPadding} from '../styles/Padding';
import UserIcon from '../assets/vectors/user.svg';
import {border} from '../styles/Border';
import {textColor} from '../styles/Text';
import {isValidField} from '../utils/form';
import {useCreateAdditionalAccount} from '../hooks/forms';
import {useAppDispatch} from '../redux/hooks';
import {updateAdditionalAccountData} from '../redux/slices/forms/createAdditionalAccountSlice';
import {BusinessPeople, ContentCreator, User, UserRole} from '../model/User';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  CreateAdditionalAccountModalNavigationProps,
  CreateAdditionalAccountNavigation,
  RootAuthenticatedNavigationStackProps,
} from '../navigation/AuthenticatedNavigation';
import {useUser} from '../hooks/user';
import {switchRole} from '../redux/slices/userSlice';

type FormData = {
  fullname: string;
  profilePicture: string;
};
export const CreateAccountScreen_1 = () => {
  const navigation =
    useNavigation<CreateAdditionalAccountModalNavigationProps>();
  const {role} = useCreateAdditionalAccount();
  const dispatch = useAppDispatch();
  const methods = useForm<FormData>({
    mode: 'all',
    defaultValues: {},
  });

  const {handleSubmit, getFieldState, formState} = methods;

  const onSubmit = (data: FormData) => {
    const updatedData = {
      fullname: data?.fullname,
    } as ContentCreator | BusinessPeople;
    dispatch(updateAdditionalAccountData(updatedData));
    navigation.navigate(CreateAdditionalAccountNavigation.Second);
  };

  return (
    <SafeAreaContainer>
      <View
        className="items-center"
        style={[flex.flexRow, gap.default, background(COLOR.white)]}>
        <CloseModal />
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
      </View>
      <ScrollView
        bounces={false}
        className="relative h-full"
        style={[background(COLOR.background.light)]}>
        <FormProvider {...methods}>
          <HorizontalPadding paddingSize="large">
            <View
              className="w-full items-center pt-5"
              style={[flex.flexCol, gap.xlarge]}>
              <View
                className="text-center items-center justify-center"
                style={[flex.flexCol, gap.default]}>
                <Text className="font-bold text-xl">Create full name</Text>
                <Text
                  className="text-sm font-normal text-center"
                  style={[textColor(COLOR.black[100], 0.7)]}>
                  {`Pick a name for your new ${role?.toLowerCase()} account. This will be displayed to all users. You can always change it later.`}
                </Text>
              </View>
              <CustomTextInput
                label="Full name"
                name="fullname"
                rules={{
                  required: 'Fullname is required',
                }}
              />
              <CustomButton
                text="Next"
                rounded="default"
                disabled={!isValidField(getFieldState('fullname', formState))}
                onPress={handleSubmit(onSubmit)}
              />
            </View>
          </HorizontalPadding>
        </FormProvider>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export const CreateAccountScreen_2 = () => {
  const navigation = useNavigation<RootAuthenticatedNavigationStackProps>();
  const dispatch = useAppDispatch();
  const {uid} = useUser();
  const {data: additionalAccountData, role} = useCreateAdditionalAccount();
  const methods = useForm<FormData>({
    mode: 'all',
    defaultValues: {},
  });

  const {handleSubmit, getFieldState, formState} = methods;

  const onSubmit = (data: FormData) => {
    let updatedData = null;
    if (role === UserRole.ContentCreator) {
      updatedData = {
        contentCreator: {
          fullname: additionalAccountData?.fullname,
          profilePicture: data?.profilePicture,
        },
      } as User;
    } else if (role === UserRole.BusinessPeople) {
      updatedData = {
        businessPeople: {
          fullname: additionalAccountData?.fullname,
          profilePicture: data?.profilePicture,
        },
      } as User;
    }
    if (updatedData && uid) {
      User.updateUserData(uid, updatedData)
        .then(() => {
          dispatch(switchRole(role));
          navigation.navigate(AuthenticatedNavigation.Main);
        })
        .catch(err => {
          console.log('update fail', err);
        });
    }
  };

  return (
    <SafeAreaContainer>
      <View
        className="items-center"
        style={[flex.flexRow, gap.default, background(COLOR.white)]}>
        <BackButton />
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
      </View>
      <ScrollView
        bounces={false}
        className="relative h-full"
        style={[background(COLOR.background.light)]}>
        <FormProvider {...methods}>
          <HorizontalPadding paddingSize="large">
            <View
              className="w-full items-center pt-5"
              style={[flex.flexCol, gap.xlarge]}>
              <View
                className="text-center items-center justify-center"
                style={[flex.flexCol, gap.default]}>
                <Text className="font-bold text-xl">Add profile picture</Text>
                <Text
                  className="text-sm font-normal text-center"
                  style={[textColor(COLOR.black[100], 0.7)]}>
                  {
                    'Pick a photo to be displayed to all users. You can always change it later.'
                  }
                </Text>
              </View>
              <CustomTextInput
                label="Profile picture"
                name="profilePicture"
                rules={{
                  required: 'Profile picture is required',
                }}
              />
              <CustomButton
                text="Create account"
                rounded="default"
                disabled={
                  !isValidField(getFieldState('profilePicture', formState))
                }
                onPress={handleSubmit(onSubmit)}
              />
            </View>
          </HorizontalPadding>
        </FormProvider>
      </ScrollView>
    </SafeAreaContainer>
  );
};
