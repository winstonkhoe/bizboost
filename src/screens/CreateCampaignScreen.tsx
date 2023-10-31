import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Image, Pressable, Text} from 'react-native';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {ScrollView} from 'react-native-gesture-handler';
import {CustomButton} from '../components/atoms/Button';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {View} from 'react-native';
import PhotosIcon from '../assets/vectors/photos.svg';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {COLOR} from '../styles/Color';
import {CustomTextInput, MediaUploader} from '../components/atoms/Input';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import SelectableTag from '../components/atoms/SelectableTag';
import {Campaign, CampaignType, CampaignTypes} from '../model/Campaign';
import FieldArray from '../components/organisms/FieldArray';
import uuid from 'react-native-uuid';
import DatePicker from 'react-native-date-picker';
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
import storage from '@react-native-firebase/storage';

import {Image as ImageType} from 'react-native-image-crop-picker';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
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
  image: ImageType;
  startDate: Date;
  endDate: Date;
};
const CreateCampaignScreen = () => {
  const {uid} = useUser();
  const [isLocationSheetOpened, setIsLocationSheetOpened] = useState(false);
  const [isStartDateSheetOpened, setIsStartDateSheetOpened] = useState(false);
  const [isEndDateSheetOpened, setIsEndDateSheetOpened] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
    mode: 'all',
    defaultValues: {
      platforms: [],
      locations: [],
      importantInformation: [{value: ''}],
      criterias: [{value: ''}],
      startDate: new Date(),
      endDate: new Date(),
    },
  });
  const {
    handleSubmit,
    setValue,
    watch,
    control,
    formState: {errors},
  } = methods;

  const onSubmitButtonClicked = (d: CampaignFormData) => {
    setIsUploading(true);

    // TODO: extract to utility function
    const imageType = d.image.mime.split('/')[1];
    const filename = `campaigns/${uuid.v4()}.${imageType}`;

    const reference = storage().ref(filename);
    const task = reference.putFile(d.image.path);

    task.on('state_changed', taskSnapshot => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );
    });

    task.then(() => {
      try {
        reference.getDownloadURL().then(url => {
          console.log(url);
          console.log('Image uploaded to the bucket!');

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
            importantInformation:
              d.importantInformation.map(getStringObjectValue),
            locations: d.locations.map(getStringObjectValue),
            // TODO: start date end date, picture
            start: d.startDate,
            end: d.endDate,
            image: url,
          });

          console.log(campaign);
          campaign.insert().then(isSuccess => {
            setIsUploading(false);

            if (isSuccess) {
              navigation.goBack();
            }
          });
        });
      } catch (e) {
        console.log(e);
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

  const {append: appendLocation, remove: removeLocation} = useFieldArray({
    name: 'locations',
    control,
  });

  // Location bottom sheet
  const sheetRef = useRef<BottomSheetModal>(null);
  const handleClosePress = () => setIsLocationSheetOpened(false);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        opacity={1}
        style={[props.style, background(COLOR.black[100])]}
      />
    ),
    [],
  );
  useEffect(() => {
    if (isLocationSheetOpened) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.close();
    }
  }, [isLocationSheetOpened]);

  const imageSelected = (media: ImageType) => {
    setValue('image', media);
  };

  if (isUploading) {
    return <Text>Loading</Text>;
  }

  //TODO: start date end date, picture
  return (
    <BottomSheetModalProvider>
      <PageWithBackButton>
        <SafeAreaContainer customInsets={{top: 0}}>
          <ScrollView
            bounces={false}
            className="relative h-full"
            // style={[background(COLOR.background.light)]}
          >
            <FormProvider {...methods}>
              <HorizontalPadding paddingSize="large">
                <View
                  className="w-full flex flex-col justify-between py-5"
                  style={[flex.flexCol, gap.xlarge]}>
                  <Controller
                    control={control}
                    name="image"
                    rules={{required: 'Image is required!'}}
                    render={({field: {value}, fieldState: {error}}) => (
                      <View className="flex flex-col">
                        <Text className="text-black mb-3">Campaign Image</Text>
                        <MediaUploader
                          options={{
                            width: 400,
                            height: 400,
                            cropping: true,
                            includeBase64: true,
                          }}
                          callback={imageSelected}>
                          {value ? (
                            <Image
                              className="w-16 h-16 rounded-lg"
                              source={{
                                uri: `data:${value.mime};base64,${value.data}`,
                              }}
                            />
                          ) : (
                            <View
                              style={[flex.flexCol]}
                              className="justify-center items-center">
                              <View
                                className={`w-16 h-16 bg-[#E7F3F8] rounded-lg flex justify-center items-center ${
                                  error && 'border border-red-500'
                                }`}>
                                <PhotosIcon width={30} height={30} />
                              </View>
                            </View>
                          )}
                        </MediaUploader>
                        {error && (
                          <Text className="text-xs mt-2 font-medium text-red-500">
                            {`${error?.message}`}
                          </Text>
                        )}
                      </View>
                    )}
                  />
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
                  <Controller
                    control={control}
                    name="type"
                    rules={{required: 'Type is required!'}}
                    render={({field: {value, name}, fieldState: {error}}) => (
                      <View>
                        <Text className="text-black mb-3">Campaign Type</Text>
                        <View className="flex flex-row gap-2">
                          {Object.values(CampaignType).map((type, index) => (
                            <View key={index}>
                              <SelectableTag
                                text={type}
                                isSelected={value === type}
                                onPress={() => setValue(name, type)}
                              />
                            </View>
                          ))}
                        </View>
                        {error && (
                          <Text className="text-xs mt-2 font-medium text-red-500">
                            {`${error?.message}`}
                          </Text>
                        )}
                      </View>
                    )}
                  />

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

                  <Controller
                    control={control}
                    name="platforms"
                    rules={{required: 'Platform is required!'}}
                    render={({
                      field: {value: platforms},
                      fieldState: {error},
                    }) => (
                      <View>
                        <Text className="text-black mb-3">
                          Campaign Platfroms
                        </Text>
                        <View className="flex flex-row gap-2">
                          {['Instagram', 'TikTok'].map((value, index) => (
                            <View key={index}>
                              <SelectableTag
                                text={value}
                                isSelected={
                                  platforms.find(p => p.name === value) !==
                                  undefined
                                }
                                onPress={() => {
                                  const searchIndex = platforms.findIndex(
                                    p => p.name === value,
                                  );
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
                        {error && (
                          <Text className="text-xs mt-2 font-medium text-red-500">
                            {/* {`${error}`} */}
                            Platform is required!
                          </Text>
                        )}
                      </View>
                    )}
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

                  <Controller
                    control={control}
                    name="criterias"
                    rules={{required: 'Criterias is required!'}}
                    render={({fieldState: {error}}) => (
                      <View>
                        <FieldArray
                          control={control}
                          title="Campaign Criterias"
                          parentName="criterias"
                          childName="value"
                        />
                        {error && (
                          <Text className="text-xs mt-2 font-medium text-red-500">
                            Criteria is required (at least 1)!
                          </Text>
                        )}
                      </View>
                    )}
                  />
                  <Controller
                    control={control}
                    name="importantInformation"
                    rules={{required: 'Information is required!'}}
                    render={({fieldState: {error}}) => (
                      <View>
                        <FieldArray
                          control={control}
                          title="Important Informations"
                          parentName="importantInformation"
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

                  <Controller
                    control={control}
                    name="locations"
                    rules={{required: 'Locations are required!'}}
                    render={({
                      field: {value: locations},
                      fieldState: {error},
                    }) => (
                      <View className="flex flex-col">
                        <View className="flex flex-row justify-between items-center">
                          <Text>Location</Text>

                          <Pressable
                            onPress={() => setIsLocationSheetOpened(true)}>
                            <Text className="font-bold text-md">+</Text>
                          </Pressable>
                        </View>
                        <View className="flex flex-row flex-wrap gap-2 mt-3">
                          {locations.map((l, index: number) => (
                            <View key={index}>
                              <SelectableTag text={l.value} isSelected={true} />
                            </View>
                          ))}
                        </View>
                        {error && (
                          <Text className="text-xs mt-2 font-medium text-red-500">
                            Locations are required (at least 1)!
                          </Text>
                        )}
                      </View>
                    )}
                  />

                  {/* TODO: validate date, extract to component */}
                  <View className="flex flex-row justify-between">
                    <Controller
                      control={control}
                      name="startDate"
                      rules={{
                        required: 'Start Date is required!',
                        validate: d =>
                          d >= new Date() || 'Date must be after today!',
                      }}
                      render={({
                        field: {name, value: startDate},
                        fieldState: {error},
                      }) => (
                        <View className="">
                          <View className="flex flex-col items-start ">
                            <View className="flex flex-row justify-between items-center mb-3">
                              <Text>Start Date</Text>
                            </View>
                            <SelectableTag
                              text={`${startDate.toLocaleDateString()}`}
                              onPress={() => setIsStartDateSheetOpened(true)}
                            />
                          </View>
                          <DatePicker
                            modal
                            mode={'date'}
                            open={isStartDateSheetOpened}
                            date={startDate}
                            onConfirm={d => {
                              setIsStartDateSheetOpened(false);
                              setValue(name, d);
                            }}
                            onCancel={() => {
                              setIsStartDateSheetOpened(false);
                            }}
                          />

                          {error && (
                            <Text className="text-xs mt-2 font-medium text-red-500">
                              {error.message}
                            </Text>
                          )}
                        </View>
                      )}
                    />

                    <Controller
                      control={control}
                      name="endDate"
                      rules={{
                        required: 'End Date is required!',
                        validate: d =>
                          d > watch('startDate') ||
                          'End Date must be after start date!',
                      }}
                      render={({
                        field: {name, value: endDate},
                        fieldState: {error},
                      }) => (
                        <View className="">
                          <View className="flex flex-col items-start ">
                            <View className="flex flex-row justify-between items-center mb-3">
                              <Text>End Date</Text>
                            </View>
                            <SelectableTag
                              text={`${endDate.toLocaleDateString()}`}
                              onPress={() => setIsEndDateSheetOpened(true)}
                            />
                          </View>
                          <DatePicker
                            modal
                            mode={'date'}
                            open={isEndDateSheetOpened}
                            date={endDate}
                            onConfirm={d => {
                              setIsEndDateSheetOpened(false);
                              setValue(name, d);
                            }}
                            onCancel={() => {
                              setIsEndDateSheetOpened(false);
                            }}
                          />

                          {error && (
                            <Text className="text-xs mt-2 font-medium text-red-500">
                              {error.message}
                            </Text>
                          )}
                        </View>
                      )}
                    />
                  </View>
                  <CustomButton
                    text="Submit"
                    rounded="default"
                    onPress={handleSubmit(onSubmitButtonClicked)}
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
            index={0}
            enablePanDownToClose>
            <BottomSheetScrollView>
              <View className="flex flex-col px-4 pb-8 gap-1">
                {data.map((d, index) => (
                  <View key={index} className="flex flex-row items-center">
                    <CheckBox
                      boxType="circle"
                      style={{transform: [{scaleX: 0.7}, {scaleY: 0.7}]}}
                      value={
                        watch('locations').find(l => l.value === d) !==
                        undefined
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
      </PageWithBackButton>
    </BottomSheetModalProvider>
  );
};

export default CreateCampaignScreen;
