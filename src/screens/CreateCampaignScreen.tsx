import React from 'react';
import {Pressable, Text} from 'react-native';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {ScrollView} from 'react-native-gesture-handler';
import {AuthButton} from '../components/atoms/Button';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {View} from 'react-native';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {textColor} from '../styles/Text';
import {COLOR} from '../styles/Color';
import {CustomTextInput} from '../components/atoms/Input';
import {FormProvider, useForm} from 'react-hook-form';
import SelectableTag from '../components/atoms/SelectableTag';
import {CampaignType, CampaignTypes} from '../model/Campaign';
type FormData = {
  title: string;
  profilePicture: string;
  type: CampaignTypes;
};
const CreateCampaignScreen = () => {
  const methods = useForm<FormData>({
    mode: 'all',
  });
  const {handleSubmit, getFieldState, formState, setValue, watch} = methods;
  return (
    <SafeAreaContainer>
      <ScrollView
        bounces={false}
        className="relative h-full "
        // style={[background(COLOR.background.light)]}
      >
        <FormProvider {...methods}>
          <HorizontalPadding paddingSize="large">
            <View
              className="w-full h-full border-red-300 border"
              style={[flex.flexCol, gap.xlarge]}>
              <CustomTextInput
                label="Campaign Title"
                name="title"
                rules={{
                  required: 'Title is required',
                }}
              />
              <CustomTextInput
                label="Campaign Description"
                name="title"
                multiline={true}
                rules={{
                  required: 'Title is required',
                }}
              />
              <View>
                <Text className="text-black mb-3">Campaign Type</Text>
                <View className="flex flex-row gap-2">
                  {Object.values(CampaignType).map((value, index) => (
                    <View key={index}>
                      <SelectableTag
                        text={value}
                        isSelected={watch('type') === value}
                        onPress={() => setValue('type', value)}
                      />
                    </View>
                  ))}
                </View>
              </View>

              <AuthButton text="Next" rounded="default" onPress={() => {}} />
            </View>
          </HorizontalPadding>
        </FormProvider>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default CreateCampaignScreen;
