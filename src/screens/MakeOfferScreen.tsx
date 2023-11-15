import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
} from '../navigation/StackNavigation';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import BackNav from '../assets/vectors/chevron-left.svg';
import {TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-elements';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {useNavigation} from '@react-navigation/native';
import {Pressable} from 'react-native';
import {flex} from '../styles/Flex';
import {CustomTextInput} from '../components/atoms/Input';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import FieldArray from '../components/organisms/FieldArray';
import {StringObject} from '../utils/stringObject';
import {gap} from '../styles/Gap';
import {COLOR} from '../styles/Color';
import {ScrollView} from 'react-native-gesture-handler';

export type MakeOfferFormData = {
  campaign: string;
  fee: number;
  importantNotes: StringObject[];
};

const MakeOfferScreen = () => {
  const navigation = useNavigation();

  const methods = useForm<MakeOfferFormData>({
    mode: 'all',
    defaultValues: {
      fee: 0,
    },
  });

  const {
    handleSubmit,
    setValue,
    watch,
    control,
    // formState: {errors},
  } = methods;

  const handleBackButtonPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaContainer>
      <ScrollView className="flex-1" style={flex.flexCol}>
        <View className="bg-red-500 w-full flex flex-row items-center justify-start px-2 py-4 border-b-[0.5px] border-gray-400">
          <TouchableOpacity onPress={handleBackButtonPress}>
            <BackNav width={30} height={20} color={COLOR.black[100]} />
          </TouchableOpacity>
          <View className="flex flex-col">
            <Text className="text-lg font-bold text-black">Make Offer</Text>
          </View>
        </View>
        <FormProvider {...methods}>
          <View style={flex.flexCol}>
            <View style={flex.flexRow}>
              <Text>
                Choose Campaign<Text>*</Text>
              </Text>
              <Pressable>
                <Text>Choose</Text>
              </Pressable>
            </View>

            <CustomTextInput
              label="Offered Fee"
              name="fee"
              rules={{
                required: 'Offered fee is required',
              }}
            />

            <Controller
              control={control}
              name="importantNotes"
              rules={{required: 'Information is required!'}}
              render={({fieldState: {error}}) => (
                <View>
                  <FieldArray
                    control={control}
                    title="Important Notes (for Content Creator)"
                    parentName="importantNotes"
                    childName="value"
                    placeholder="Add dos and/or don'ts"
                  />
                  {error && (
                    <Text className="text-xs mt-2 font-medium text-red-500">
                      Information is required (at least 1)!
                    </Text>
                  )}
                </View>
              )}
            />
          </View>
        </FormProvider>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default MakeOfferScreen;
