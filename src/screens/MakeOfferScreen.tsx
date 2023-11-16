import React, {useState} from 'react';
import {View, TouchableOpacity, ScrollView, TextInput} from 'react-native';
import {Text} from 'react-native-elements';
import {useNavigation} from '@react-navigation/native';
import {useForm, Controller, FormProvider} from 'react-hook-form';
import BackNav from '../assets/vectors/chevron-left.svg';
import {COLOR} from '../styles/Color';
import {flex} from '../styles/Flex';
import FieldArray from '../components/organisms/FieldArray';
import {StringObject} from '../utils/stringObject';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {FormFieldHelper} from '../components/atoms/FormLabel';
import {gap} from '../styles/Gap';
import {CustomNumberInput, CustomTextInput} from '../components/atoms/Input';
import {SelectCampaignOffer} from './makeOffer/SelectCampaignOffer';
import {Campaign} from '../model/Campaign';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../components/atoms/ViewPadding';

export type MakeOfferFormData = {
  campaign: string;
  fee: number;
  importantNotes: StringObject[];
};

const MakeOfferScreen = () => {
  const navigation = useNavigation();
  const methods = useForm<MakeOfferFormData>();

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>();

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
          <View style={flex.flexCol} className="flex-1 justify-between">
            <View style={flex.flexCol}>
              <HorizontalPadding paddingSize="large">
                <SelectCampaignOffer onCampaignChange={setSelectedCampaign} />

                <View style={[flex.flexCol, gap.default]}>
                  <FormFieldHelper title="Offered Fee" />
                  <CustomNumberInput
                    name="fee"
                    type="field"
                    rules={{
                      required: 'Fee is required',
                    }}
                  />
                </View>

                <Controller
                  control={methods.control}
                  name="importantNotes"
                  render={({fieldState: {error}}) => (
                    <View>
                      <FieldArray
                        control={methods.control}
                        title="Important Informations"
                        parentName="importantNotes"
                        childName="value"
                        placeholder="Add important notes for content creator"
                        helperText={'Ex. "Don\'t use profanity", "Be natural"'}
                      />
                    </View>
                  )}
                />
              </HorizontalPadding>
            </View>
            <VerticalPadding paddingSize="large">
              <TouchableOpacity
                className="bg-primary p-3 rounded-md mt-4"
                onPress={methods.handleSubmit(onSubmit)}>
                <Text className="text-white text-center">Make Offer</Text>
              </TouchableOpacity>
            </VerticalPadding>
          </View>
        </FormProvider>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default MakeOfferScreen;
