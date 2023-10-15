import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Pressable, Text} from 'react-native';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {ScrollView} from 'react-native-gesture-handler';
import {AuthButton} from '../components/atoms/Button';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {View} from 'react-native';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {COLOR} from '../styles/Color';
import {CustomTextInput} from '../components/atoms/Input';
import {FormProvider, useFieldArray, useForm} from 'react-hook-form';
import SelectableTag from '../components/atoms/SelectableTag';
import {Campaign, CampaignType, CampaignTypes} from '../model/Campaign';
import FieldArray from '../components/organisms/FieldArray';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {background} from '../styles/BackgroundColor';
import CheckBox from '@react-native-community/checkbox';
import {useUser} from '../hooks/user';
import {StringObject, getStringObjectValue} from '../utils/stringObject';
import {useNavigation} from '@react-navigation/native';
export type CampaignFormData = {
  title: string;
  description: string;
  type: CampaignTypes;
  fee: number;
  slot: number;
  criterias: StringObject[]; // workaround soalnnya fieldarray harus array of object
  platforms: {name: string; tasks: StringObject[]}[]; // tasks: {value: string}[] itu workaround jg, harusnya ini bisa CampaignPlatform[] lgsg
  importantInformation: StringObject[];
  locations: StringObject[];
};
const CreateCampaignScreen = () => {
  const {uid} = useUser();
  const [modalOpenState, setIsSheetOpened] = useState(false);
  const navigation = useNavigation();
  //TODO: tidy up (extract to const?), source: Wikipedia
  const data = [
    'Aceh',
    'Bali',
    'Kapulauan Bangka Belitung',
    'Banten',
    'Bengkulu',
    'Jawa Tengah',
    'Kalimantan Tengah',
    'Sulawesi Tengah',
    'Jawa Timur',
    'Kalimantan Timur',
    'Nusa Tenggara Timur',
    'Gorontalo',
    'DKI Jakarta',
    'Jambi',
    'Lampung',
    'Maluku',
    'Kalimantan Utara',
    'Maluku Utara',
    'Sulawesi Utara',
    'Sumatera Utara',
    'Papua',
    'Riau',
    'Kapulauan Riau',
    'Sulawesi Tenggara',
    'Kalimantan Selatan',
    'Sulawesi Selatan',
    'Sumatera Selatan',
    'Jawa Barat',
    'Kalimantan Barat',
    'Nusa Tenggara Barat',
    'Papua Barat',
    'Sulawesi Barat',
    'Sumatera Barat',
    'Daerah Istimewa Yogyakarta',
    'Papua Selatan',
    'Papua Tengah',
    'Papua Pegunungan',
    'Papua Barat Daya',
  ];
  const methods = useForm<CampaignFormData>({
    // mode: 'all',
    defaultValues: {
      platforms: [],
      locations: [],
      importantInformation: [{value: ''}],
      criterias: [{value: ''}],
    },
  });
  const {handleSubmit, setValue, watch, control} = methods;

  const onSubmit = (d: CampaignFormData) => {
    const campaign = new Campaign({
      userId: uid ?? '',
      title: d.title,
      description: d.description,
      type: d.type,
      fee: d.fee,
      slot: d.slot,
      criterias: d.criterias.map(getStringObjectValue),
      platforms: d.platforms.map(p => ({
        name: p.name,
        tasks: p.tasks.map(getStringObjectValue),
      })),
      importantInformation: d.importantInformation.map(getStringObjectValue),
      locations: d.locations.map(getStringObjectValue),
      // TODO: start date end date, picture
      start: new Date(),
      end: new Date('2023-12-12'),
      image:
        'https://lh3.googleusercontent.com/p/AF1QipMvoZtSgC5aguviGyul1KfeSIR0w1HBROdlMmit=w1080-h608-p-no-v0',
    });

    campaign.insert().then(isSuccess => {
      if (isSuccess) {
        navigation.goBack();
      }
    });
  };

  const {
    fields: fieldsPlatform,
    append: appendPlatform,
    remove: removePlatform,
  } = useFieldArray({
    name: 'platforms',
    control,
  });

  const {
    fields: fieldsLocation,
    append: appendLocation,
    remove: removeLocation,
  } = useFieldArray({
    name: 'locations',
    control,
  });

  // Location bottom sheet
  const sheetRef = useRef<BottomSheetModal>(null);
  const handleClosePress = () => setIsSheetOpened(false);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        opacity={1}
        style={[props.style, background(COLOR.black)]}
      />
    ),
    [],
  );
  useEffect(() => {
    if (modalOpenState) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.close();
    }
  }, [modalOpenState]);

  //TODO: start date end date, picture
  return (
    <BottomSheetModalProvider>
      <SafeAreaContainer customInsets={{top: 0}}>
        <ScrollView
          bounces={false}
          className="relative h-full "
          // style={[background(COLOR.background.light)]}
        >
          <FormProvider {...methods}>
            <HorizontalPadding paddingSize="large">
              <View
                className="w-full h-full "
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
                              appendPlatform({
                                name: value,
                                tasks: [{value: ''}],
                              });
                            }
                          }}
                        />
                      </View>
                    ))}
                  </View>
                </View>

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
                  title="Campaign Criterias"
                  parentName="criterias"
                  childName="value"
                />
                <FieldArray
                  control={control}
                  title="Important Informations"
                  parentName="importantInformation"
                  childName="value"
                  placeholder="Add dos and/or don'ts"
                />

                <View>
                  <View className="flex flex-row justify-between items-center mb-3">
                    <Text>Location</Text>

                    <Pressable onPress={() => setIsSheetOpened(true)}>
                      <Text className="font-bold text-md">+</Text>
                    </Pressable>
                  </View>
                  <View className="flex flex-row flex-wrap gap-2">
                    {watch('locations').map((l, index: number) => (
                      <View key={index}>
                        <SelectableTag text={l.value} isSelected={true} />
                      </View>
                    ))}
                  </View>
                </View>
                <AuthButton
                  text="Submit"
                  rounded="default"
                  onPress={handleSubmit(onSubmit)}
                />
              </View>
            </HorizontalPadding>
          </FormProvider>
        </ScrollView>

        <BottomSheetModal
          ref={sheetRef}
          onDismiss={handleClosePress}
          backdropComponent={renderBackdrop}
          snapPoints={['90%']}
          index={1}
          enableDynamicSizing
          enablePanDownToClose>
          <BottomSheetScrollView>
            <View className="flex flex-col px-4 pb-8 gap-1">
              {data.map((d, index) => (
                <View key={index} className="flex flex-row items-center">
                  <CheckBox
                    boxType="circle"
                    style={{transform: [{scaleX: 0.7}, {scaleY: 0.7}]}}
                    value={
                      watch('locations').find(l => l.value === d) !== undefined
                    }
                    onValueChange={() => {
                      const searchIndex = watch('locations').findIndex(
                        l => l.value === d,
                      );
                      if (searchIndex !== -1) {
                        removeLocation(searchIndex);
                      } else {
                        appendLocation({value: d});
                      }
                    }}
                  />
                  <Text className="mb-1">{d}</Text>
                </View>
              ))}
            </View>
          </BottomSheetScrollView>
        </BottomSheetModal>
      </SafeAreaContainer>
    </BottomSheetModalProvider>
  );
};

export default CreateCampaignScreen;
