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
import {
  Controller,
  FormProvider,
  useController,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import SelectableTag from '../components/atoms/SelectableTag';
import {CampaignType, CampaignTypes} from '../model/Campaign';
import {TextInput} from 'react-native';
type FormData = {
  title: string;
  description: string;
  type: CampaignTypes;
  platforms: string[];
  fee: number;
  slot: number;
  criterias: {value: string}[]; // workaround soalnnya fieldarray harus array of object
};
const CreateCampaignScreen = () => {
  const methods = useForm<FormData>({
    // mode: 'all',
    defaultValues: {
      platforms: [],
      criterias: [{value: ''}],
    },
  });
  const {handleSubmit, getFieldState, formState, setValue, watch, control} =
    methods;
  const {fields, append, remove} = useFieldArray({
    name: 'criterias',
    control,
  });

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
                name="description"
                multiline={true}
                rules={{
                  required: 'Description is required',
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

              {watch('type') === 'Public' ? (
                <>
                  <CustomTextInput
                    label="Campaign Fee"
                    name="fee"
                    rules={{
                      required: 'Fee is required',
                    }}
                  />

                  <CustomTextInput
                    label="Campaign Slot"
                    name="slot"
                    rules={{
                      required: 'Slot is required',
                    }}
                  />
                </>
              ) : null}

              <View>
                <Text className="text-black mb-3">Campaign Platfroms</Text>
                <View className="flex flex-row gap-2">
                  {['Instagram', 'TikTok'].map((value, index) => (
                    <View key={index}>
                      <SelectableTag
                        text={value}
                        isSelected={watch('platforms').includes(value)}
                        onPress={() => {
                          let platforms = watch('platforms');

                          if (platforms.includes(value)) {
                            platforms = platforms.filter(v => v !== value);
                          } else {
                            platforms.push(value);
                          }
                          setValue('platforms', platforms);
                        }}
                      />
                    </View>
                  ))}
                </View>
              </View>

              <View>
                <View className="flex flex-row justify-between items-center">
                  <Text>Campaign Criterias</Text>

                  <Pressable onPress={() => append({value: ''})}>
                    <Text className="font-bold text-md">+</Text>
                  </Pressable>
                </View>
                {fields.map((f, index) => (
                  <View key={f.id}>
                    <Controller
                      control={control}
                      name={`criterias.${index}.value`}
                      render={({field: {onChange, onBlur, value}}) => (
                        <TextInput
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          placeholder={'Add criteria'}
                          className="w-full h-10 px-1 pt-2 pb-1 text-base font-medium"
                        />
                      )}
                    />
                  </View>
                ))}
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
