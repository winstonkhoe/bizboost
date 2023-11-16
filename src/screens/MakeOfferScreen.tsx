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
  const methods = useForm<MakeOfferFormData>();

  const handleBackButtonPress = () => {
    navigation.goBack();
  };

  const onSubmit = (data: MakeOfferFormData) => {
    // Handle form submission here
    console.log(data);
  };

  return (
    <SafeAreaContainer>
      <ScrollView className="flex-1" style={flex.flexCol}>
        <View className="w-full flex flex-row items-center justify-start px-2 py-4 border-b-[0.5px] border-gray-400">
          <TouchableOpacity onPress={handleBackButtonPress}>
            <BackNav width={30} height={20} color={COLOR.black[100]} />
          </TouchableOpacity>
          <View className="flex flex-col">
            <Text className="text-lg font-bold text-black">Make Offer</Text>
          </View>
        </View>
        <FormProvider {...methods}>
          <View style={flex.flexCol}>
            <Controller
              control={methods.control}
              render={({field, fieldState}) => (
                <>
                  <CustomTextInput
                    label="Campaign"
                    placeholder="Enter campaign"
                    value={field.value}
                    onChangeText={text => field.onChange(text)}
                    onBlur={field.onBlur}
                  />
                  {fieldState.error && (
                    <Text style={{color: 'red'}}>Campaign is required</Text>
                  )}
                </>
              )}
              name="campaign"
              rules={{required: 'Campaign is required'}}
              defaultValue=""
            />

            <Controller
              control={methods.control}
              render={({field, fieldState}) => (
                <>
                  <CustomTextInput
                    label="Fee"
                    placeholder="Enter fee"
                    keyboardType="numeric"
                    value={field.value}
                    onChangeText={text => field.onChange(text)}
                    onBlur={field.onBlur}
                  />
                  {fieldState.error && (
                    <Text style={{color: 'red'}}>Fee is required</Text>
                  )}
                </>
              )}
              name="fee"
              rules={{required: 'Fee is required'}}
              defaultValue={0}
            />

            <TouchableOpacity
              style={{
                backgroundColor: 'blue',
                padding: 10,
                borderRadius: 5,
                marginTop: 20,
              }}
              onPress={methods.handleSubmit(onSubmit)}>
              <Text style={{color: 'white', textAlign: 'center'}}>
                Make Offer
              </Text>
            </TouchableOpacity>
          </View>
        </FormProvider>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default MakeOfferScreen;
