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
import {CampaignPlatform, CampaignType, CampaignTypes} from '../model/Campaign';
import {TextInput} from 'react-native';
import FieldArray from '../components/organisms/FieldArray';
export type CampaignFormData = {
  title: string;
  description: string;
  type: CampaignTypes;
  fee: number;
  slot: number;
  criterias: {value: string}[]; // workaround soalnnya fieldarray harus array of object
  platforms: {name: string; tasks: {value: string}[]}[]; // tasks: {value: string}[] itu workaround jg, harusnya ini bisa CampaignPlatform[] lgsg
  importantInformation: {value: string}[];
};
const CreateCampaignScreen = () => {
  const methods = useForm<CampaignFormData>({
    // mode: 'all',
    defaultValues: {
      platforms: [],
      importantInformation: [{value: ''}],
      criterias: [{value: ''}],
    },
  });
  const {handleSubmit, getFieldState, formState, setValue, watch, control} =
    methods;

  const {
    fields: fieldsPlatform,
    append: appendPlatform,
    remove: removePlatform,
  } = useFieldArray({
    name: 'platforms',
    control,
  });

  return (
    <SafeAreaContainer customInsets={{top: 0}}>
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
                        isSelected={
                          watch('platforms').find(p => p.name === value) !==
                          undefined
                        }
                        onPress={() => {
                          const searchIndex = watch('platforms').findIndex(
                            p => p.name === value,
                          );
                          console.log(watch('platforms'));
                          console.log(value + ', index: ' + searchIndex);
                          if (searchIndex !== -1) {
                            removePlatform(searchIndex);
                          } else {
                            appendPlatform({name: value, tasks: [{value: ''}]});
                          }
                        }}
                      />
                    </View>
                  ))}
                </View>
              </View>

              <FieldArray
                control={control}
                title="Campaign Criterias"
                parentName="criterias"
                childName="value"
              />

              {fieldsPlatform.map((fp, index) => (
                <View key={fp.id}>
                  <FieldArray
                    control={control}
                    title={`${fp.name}'s Task`}
                    parentName={`platforms.${index}.tasks`}
                    childName="value"
                    placeholder="Add task"
                  />
                </View>
              ))}

              <FieldArray
                control={control}
                title="Important Informations"
                parentName="importantInformation"
                childName="value"
                placeholder="Add dos and/or don'ts"
              />
              <AuthButton text="Next" rounded="default" onPress={() => {}} />
            </View>
          </HorizontalPadding>
        </FormProvider>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default CreateCampaignScreen;
