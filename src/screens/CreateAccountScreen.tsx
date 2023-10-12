import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootAuthenticatedStackParamList} from '../navigation/AuthenticatedNavigation';
import {Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {flex} from '../styles/Flex';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {gap} from '../styles/Gap';
import {TextInput} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import {AuthButton} from '../components/atoms/Button';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import SafeAreaContainer from '../containers/SafeAreaContainer';
type Props = NativeStackScreenProps<
  RootAuthenticatedStackParamList,
  'Create Account'
>;
type FormData = {
  fullname: string;
};
const CreateAccountScreen = ({route}: Props) => {
  const {role} = route.params;
  const {
    control,
    handleSubmit,
    watch,
    formState: {errors},
  } = useForm<FormData>({
    mode: 'all',
    defaultValues: {},
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <View className="h-full" style={[background(COLOR.white)]}>
      <SafeAreaContainer>
        <ScrollView className="h-full" showsVerticalScrollIndicator={false}>
          <HorizontalPadding>
            <View
              className="w-full items-center py-10"
              style={[flex.flexCol, gap.xlarge]}>
              <View style={[flex.flexRow, gap.small]}>
                <Text className="text-lg">Create</Text>
                <Text className="font-bold text-lg">{role}</Text>
                <Text className="text-lg">account</Text>
              </View>
              <View className="w-full flex flex-col justify-start">
                <Text className="text-black">Full Name</Text>
                <Controller
                  control={control}
                  rules={{
                    required: 'Fullname is required',
                  }}
                  render={({field: {onChange, onBlur, value}}) => (
                    <TextInput
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      className="flex-1 border border-x-0 border-t-0 border-b-black px-1"
                    />
                  )}
                  name="fullname"
                />
                {errors.fullname && (
                  <Text className="text-red-500">
                    {errors.fullname.message}
                  </Text>
                )}
              </View>
              <AuthButton
                text="Create account"
                rounded="default"
                style={[background(COLOR.blue[200])]}
                onPress={handleSubmit(onSubmit)}
              />
            </View>
          </HorizontalPadding>
        </ScrollView>
      </SafeAreaContainer>
    </View>
  );
};

export default CreateAccountScreen;
