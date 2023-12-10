import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Pressable, Text} from 'react-native';
import {CustomButton} from '../../components/atoms/Button';
import {HorizontalPadding} from '../../components/atoms/ViewPadding';
import {View} from 'react-native';
import PhotosIcon from '../../assets/vectors/photos.svg';
import {flex, items, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {COLOR} from '../../styles/Color';
import {
  CustomNumberInput,
  CustomTextInput,
  FormlessCustomNumberInput,
  FormlessCustomTextInput,
  MediaUploader,
} from '../../components/atoms/Input';
import {
  Control,
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form';
import SelectableTag from '../../components/atoms/SelectableTag';
import {
  Campaign,
  CampaignPlatform,
  CampaignStep,
  CampaignTimeline,
  CampaignType,
} from '../../model/Campaign';
import FieldArray from '../../components/organisms/FieldArray';
import {useUser} from '../../hooks/user';
import {StringObject, getStringObjectValue} from '../../utils/stringObject';
import {useNavigation} from '@react-navigation/native';

import {PageWithBackButton} from '../../components/templates/PageWithBackButton';
import {Location} from '../../model/Location';
import {dimension} from '../../styles/Dimension';
import {rounded} from '../../styles/BorderRadius';
import {background} from '../../styles/BackgroundColor';
import {border} from '../../styles/Border';
import {FormFieldHelper} from '../../components/atoms/FormLabel';
import PagerView from 'react-native-pager-view';
import {Stepper} from '../../components/atoms/Stepper';
import {KeyboardAvoidingContainer} from '../../containers/KeyboardAvoidingContainer';
import {padding} from '../../styles/Padding';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../../styles/Size';
import {isValidField} from '../../utils/form';
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {formatNumberWithThousandSeparator} from '../../utils/number';
import {InternalLink} from '../../components/atoms/Link';
import {openCategoryModal, openLocationModal} from '../../utils/modal';
import {RemovableChip} from '../../components/atoms/Chip';
import {NavigationStackProps} from '../../navigation/StackNavigation';
import DatePicker, {
  DefaultDatePickerPlaceholder,
} from '../../components/atoms/DatePicker';
import {AddIcon} from '../../components/atoms/Icon';
import {formatDateToDayMonthYear} from '../../utils/date';
import {Category} from '../../model/Category';
import FastImage from 'react-native-fast-image';
import {AnimatedPressable} from '../../components/atoms/AnimatedPressable';
import {SocialPlatform} from '../../model/User';
import {FieldArrayLabel} from '../../components/molecules/FieldArrayLabel';
import {SheetModal} from '../../containers/SheetModal';
import {BottomSheetModalWithTitle} from '../../components/templates/BottomSheetModalWithTitle';
import {LoadingScreen} from '../LoadingScreen';
import {useWindowDimensions} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {BackButtonLabel} from '../../components/atoms/Header';

export type CampaignFormData = {
  title: string;
  description: string;
  type: CampaignType;
  fee: number;
  slot: number;
  criterias?: StringObject[]; // workaround soalnnya fieldarray harus array of object
  platforms: CampaignPlatform[]; // tasks: {value: string}[] itu workaround jg, harusnya ini bisa CampaignPlatform[] lgsg
  importantInformation?: StringObject[];
  locations: Location[];
  categories: Category[];
  image: string;
  timeline: CampaignTimeline[];
};

const campaignTimeline = [
  {
    step: CampaignStep.Registration,
    optional: false,
    description:
      'This is where the content creator registers, and gets shortlisted by you.',
  },
  {
    step: CampaignStep.Brainstorming,
    optional: true,
    description:
      'In this step, the content creator can share their ideas and suggestions for the task with you. You can then provide feedback and guidance to help the content creator refine their work.',
  },
  {
    step: CampaignStep.ContentCreation,
    optional: false,
    description:
      'Content creator can submit their final work for the task. You can then review the work and either accept it or ask for revisions.',
  },
  {
    step: CampaignStep.ResultSubmission,
    optional: false,
    description:
      'Content creators can submit their engagement results for evaluation, including verifying the originality of the proof of task completion. Once reviewed, campaign earnings will be deposited into their accounts.',
  },
];

interface SocialTaskOptions {
  name: string;
  types?: string[];
}

interface SocialTask {
  name: SocialPlatform;
  tasks: SocialTaskOptions[];
}

const taskTypes: SocialTask[] = [
  {
    name: SocialPlatform.Instagram,
    tasks: [
      {
        name: 'Feed Post',
        types: [
          'Photo',
          'Video',
          'Carousel Photo',
          'Carousel Video',
          'Carousel Mix',
        ],
      },
      {
        name: 'Story',
        types: ['Photo', 'Video'],
      },
      {
        name: 'Reels',
      },
    ],
  },
  {
    name: SocialPlatform.Tiktok,
    tasks: [
      {
        name: 'Post',
      },
    ],
  },
];

const maxPage = 5;

const CreateCampaignScreen = () => {
  const {uid} = useUser();
  const safeAreaInsets = useSafeAreaInsets();
  const pagerViewRef = useRef<PagerView>(null);
  const [activePosition, setActivePosition] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const navigation = useNavigation<NavigationStackProps>();
  const methods = useForm<CampaignFormData>({
    mode: 'all',
    defaultValues: {
      platforms: [],
      locations: [],
      categories: [],
      importantInformation: [],
      criterias: [],
      timeline: [],
    },
  });
  const {
    handleSubmit,
    setValue,
    watch,
    getValues,
    control,
    getFieldState,
    formState,
    trigger,
  } = methods;

  const onSubmitButtonClicked = () => {
    const d = getValues();
    setIsUploading(true);

    try {
      const fee = parseInt(`${d.fee}`, 10);
      if (isNaN(fee)) {
        throw Error('invalid fee');
      }
      const campaign = new Campaign({
        userId: uid ?? '',
        title: d.title,
        description: d.description,
        type: d.type,
        fee: fee,
        slot: d.slot,
        criterias: d.criterias?.map(getStringObjectValue) || [],
        platformTasks: d.platforms,
        importantInformation:
          d.importantInformation?.map(getStringObjectValue) || [],
        locations: d.locations
          .map(loc => loc.id)
          .filter((loc): loc is string => loc !== undefined),
        categories: d.categories
          .map(category => category.id)
          .filter((category): category is string => category !== undefined),
        timeline: d.timeline,
        image: d.image,
      });

      console.log(campaign);
      campaign
        .insert()
        .then(isSuccess => {
          if (isSuccess) {
            navigation.goBack();
          }
        })
        .finally(() => {
          setIsUploading(false);
        });
    } catch (e) {
      console.log(e);
      setIsUploading(false);
    }
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

  const {append: appendCategories, remove: removeCategory} = useFieldArray({
    name: 'categories',
    control,
  });

  const {
    fields: fieldsTimeline,
    append: appendTimeline,
    remove: removeTimeline,
    update: updateTimeline,
  } = useFieldArray({
    name: 'timeline',
    control,
  });

  const imageSelected = (url: string) => {
    setValue('image', url);
  };

  const nextPage = async () => {
    if (activePosition < maxPage) {
      pagerViewRef.current?.setPage(activePosition + 1);
      setActivePosition(activePosition + 1);
    } else {
      await handleSubmit(onSubmitButtonClicked)();
    }
  };

  const previousPage = () => {
    pagerViewRef.current?.setPage(activePosition - 1);
    setActivePosition(activePosition - 1);
  };

  const getCampaignTimelineIndex = (campaignStep: CampaignStep) => {
    return getValues('timeline').findIndex(t => t.step === campaignStep);
  };

  const updateCampaignTimeline = (
    startDate: Date | null,
    endDate: Date | null,
    campaignStep: CampaignStep,
  ) => {
    if (startDate?.getTime() && endDate?.getTime()) {
      const updateIndex = getCampaignTimelineIndex(campaignStep);
      const timeline = {
        step: campaignStep,
        start: startDate.getTime(),
        end: endDate.getTime(),
      };
      if (updateIndex >= 0) {
        updateTimeline(updateIndex, timeline);
        return;
      }
      appendTimeline(timeline);
    }
  };

  const getNearestPreviousTimelineEnd = (currentIndex: number): Date | null => {
    if (currentIndex === 0) {
      return null;
    }
    const previousTimelines = [
      ...campaignTimeline.slice(0, currentIndex).reverse(),
    ];
    const previousEndDates = previousTimelines
      .map(timeline => {
        if (campaignTimeline[currentIndex].step !== timeline.step) {
          const timelineIndex = getCampaignTimelineIndex(timeline.step);
          if (timelineIndex >= 0) {
            const endDateUnix = getValues(`timeline.${timelineIndex}`).end;
            if (typeof endDateUnix === 'number') {
              const endDate = new Date(endDateUnix);
              return new Date(
                endDate.getFullYear(),
                endDate.getMonth(),
                endDate.getDate() + 1,
              );
            }
          }
        }
        return null;
      })
      .filter(timeline => timeline !== null);

    return previousEndDates.length === 0 ? null : previousEndDates[0];
  };

  return (
    <>
      {isUploading && <LoadingScreen />}
      <FormProvider {...methods}>
        <PageWithBackButton
          fullHeight
          onPress={previousPage}
          withoutScrollView
          threshold={0}
          disableDefaultOnPress={activePosition > 0}
          backButtonPlaceholder={<BackButtonLabel text="Create campaign" />}
          underBackButtonPlaceholder={
            <View
              style={[
                flex.flex1,
                padding.horizontal.large,
                padding.bottom.default,
                background(COLOR.background.neutral.default),
              ]}>
              <Stepper
                currentPosition={activePosition + 1}
                maxPosition={maxPage}
              />
            </View>
          }>
          <ScrollView
            style={[flex.flex1]}
            contentContainerStyle={[
              flex.flex1,
              flex.flexCol,
              gap.default,
              {
                paddingTop:
                  Math.max(safeAreaInsets.top, size.large) + size.xlarge4,
              },
            ]}>
            <PagerView
              style={[flex.flex1, flex.grow]}
              ref={pagerViewRef}
              scrollEnabled={false}>
              <ScrollView style={[flex.flex1]} key={0}>
                <KeyboardAvoidingContainer>
                  <View
                    style={[
                      flex.flex1,
                      flex.flexCol,
                      gap.xlarge,
                      padding.top.medium,
                      padding.horizontal.large,
                      padding.bottom.xlarge2,
                    ]}>
                    <Controller
                      control={control}
                      name="image"
                      rules={{required: 'Image is required!'}}
                      render={({field: {value}, fieldState: {error}}) => (
                        <View style={[flex.flexCol, gap.default]}>
                          <FormFieldHelper title="Campaign Image" />
                          <View style={[flex.flexRow, justify.start]}>
                            <MediaUploader
                              targetFolder="campaigns"
                              options={{
                                width: 400,
                                height: 400,
                                cropping: true,
                                includeBase64: true,
                              }}
                              showUploadProgress
                              onUploadSuccess={imageSelected}>
                              <View
                                className="overflow-hidden"
                                style={[
                                  dimension.square.xlarge5,
                                  rounded.default,
                                ]}>
                                {value ? (
                                  <FastImage
                                    className=""
                                    style={[dimension.full]}
                                    source={{
                                      uri: value,
                                    }}
                                  />
                                ) : (
                                  <View
                                    style={[
                                      dimension.full,
                                      flex.flexRow,
                                      justify.center,
                                      items.center,
                                      background(COLOR.background.neutral.med),
                                      error &&
                                        border({
                                          borderWidth: 1,
                                          color:
                                            COLOR.background.danger.default,
                                        }),
                                    ]}>
                                    <PhotosIcon width={30} height={30} />
                                  </View>
                                )}
                              </View>
                            </MediaUploader>
                          </View>
                          {error && (
                            <Text className="text-xs mt-2 font-medium text-red-500">
                              {`${error?.message}`}
                            </Text>
                          )}
                        </View>
                      )}
                    />
                    <View style={[flex.flexCol, gap.default]}>
                      <FormFieldHelper title="Your campaign title" />
                      <CustomTextInput
                        label="Campaign Title"
                        name="title"
                        rules={{
                          required: 'Title is required',
                        }}
                        max={50}
                        counter
                      />
                    </View>
                    <View style={[flex.flexCol, gap.default]}>
                      <FormFieldHelper title="Your campaign description" />
                      <CustomTextInput
                        placeholder="Campaign description"
                        name="description"
                        type="textarea"
                        rules={{
                          required: 'Description is required',
                        }}
                      />
                    </View>
                    <CustomButton
                      text="Next"
                      rounded="max"
                      minimumWidth
                      disabled={
                        !isValidField(getFieldState('title', formState)) ||
                        !isValidField(
                          getFieldState('description', formState),
                        ) ||
                        !watch('image')
                      }
                      onPress={nextPage}
                    />
                  </View>
                </KeyboardAvoidingContainer>
              </ScrollView>
              <View key={1}>
                <KeyboardAvoidingContainer>
                  <HorizontalPadding paddingSize="large">
                    <View
                      style={[
                        flex.flexCol,
                        gap.xlarge,
                        padding.top.medium,
                        padding.bottom.xlarge2,
                      ]}>
                      <Controller
                        control={control}
                        name="type"
                        rules={{required: 'Type is required!'}}
                        render={({
                          field: {value, name},
                          fieldState: {error},
                        }) => (
                          <View style={[flex.flexCol, gap.default]}>
                            <View style={[flex.flexCol, gap.xsmall]}>
                              <FormFieldHelper title="Campaign type" />
                              {CampaignType.Public === value ? (
                                <FormFieldHelper description="Public campaigns are accessible to all content creators, and you will later shortlist each registrant." />
                              ) : CampaignType.Private === value ? (
                                <FormFieldHelper description="For private campaigns, it is necessary to individually contact each content creator privately." />
                              ) : null}
                            </View>
                            <View style={[flex.flexRow, gap.small]}>
                              {Object.values(CampaignType).map(
                                (type, index) => (
                                  <View key={index}>
                                    <SelectableTag
                                      text={type}
                                      isSelected={value === type}
                                      onPress={() =>
                                        setValue(name, type, {
                                          shouldValidate: true,
                                          shouldDirty: true,
                                          shouldTouch: true,
                                        })
                                      }
                                    />
                                  </View>
                                ),
                              )}
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
                        <View style={[flex.flexCol, gap.medium]}>
                          <View style={[flex.flexCol, gap.default]}>
                            <FormFieldHelper
                              title="Campaign fee"
                              description="This will be the total earnings for each content creator if they finish all the tasks."
                            />
                            <CustomTextInput
                              label="Campaign Fee"
                              name="fee"
                              inputType="price"
                              rules={{
                                required: 'Fee is required',
                                validate: value => {
                                  return (
                                    parseInt(value, 10) >= 50000 ||
                                    'Minimum fee is Rp50.000'
                                  );
                                },
                              }}
                            />
                          </View>

                          <View style={[flex.flexCol, gap.default]}>
                            <FormFieldHelper title="Total open slot" />
                            <CustomNumberInput
                              label="Campaign Slot"
                              name="slot"
                              type="field"
                              min={1}
                              rules={{
                                required: 'Slot is required',
                              }}
                            />
                          </View>
                          <View style={[flex.flexCol, items.start]}>
                            <Text
                              className="font-semibold"
                              style={[
                                font.size[30],
                                textColor(COLOR.text.neutral.med),
                              ]}>
                              Total campaign fee
                            </Text>
                            <Text
                              className="font-bold"
                              style={[
                                font.size[50],
                                textColor(COLOR.text.neutral.high),
                              ]}>
                              {`Rp ${
                                formatNumberWithThousandSeparator(
                                  watch('fee') * watch('slot'),
                                ) || 0
                              }`}
                            </Text>
                          </View>
                        </View>
                      ) : null}

                      <CustomButton
                        text="Next"
                        rounded="max"
                        minimumWidth
                        disabled={
                          !isValidField(getFieldState('type', formState)) ||
                          (watch('type') === CampaignType.Public &&
                            (!isValidField(getFieldState('fee', formState)) ||
                              !isValidField(
                                getFieldState('slot', formState),
                                false,
                              )))
                        }
                        onPress={nextPage}
                      />
                    </View>
                  </HorizontalPadding>
                </KeyboardAvoidingContainer>
              </View>
              <View key={2}>
                <KeyboardAvoidingContainer>
                  <HorizontalPadding paddingSize="large">
                    <View
                      style={[
                        flex.flexCol,
                        gap.xlarge,
                        padding.top.medium,
                        padding.bottom.xlarge2,
                      ]}>
                      <Controller
                        control={control}
                        name="platforms"
                        rules={{required: 'Platform is required!'}}
                        render={({
                          field: {value: platforms},
                          fieldState: {error},
                        }) => (
                          <View style={[flex.flexCol, gap.default]}>
                            <FormFieldHelper
                              title="Campaign platforms"
                              description="Choose platforms for the campaign tasks."
                            />
                            <View className="flex flex-row gap-2">
                              {Object.values(SocialPlatform).map(
                                (value: SocialPlatform, index) => (
                                  <View key={index}>
                                    <SelectableTag
                                      text={value}
                                      isSelected={
                                        platforms.find(
                                          p => p.name === value,
                                        ) !== undefined
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
                                            tasks: [],
                                          });
                                        }
                                      }}
                                    />
                                  </View>
                                ),
                              )}
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
                          <SocialFieldArray
                            platform={fp.name}
                            control={control}
                            title={`${fp.name}'s Task`}
                            fieldType="textarea"
                            maxFieldLength={150}
                            parentName={`platforms.${index}.tasks`}
                            helperText='Ex. "minimum 30s / story"'
                            placeholder="Add task"
                          />
                        </View>
                      ))}
                      <CustomButton
                        text="Next"
                        rounded="max"
                        minimumWidth
                        disabled={
                          !isValidField(
                            getFieldState('platforms', formState),
                          ) ||
                          fieldsPlatform.filter(
                            (f, index) =>
                              getValues(`platforms.${index}.tasks`)?.length ===
                              0,
                          ).length > 0
                        }
                        onPress={nextPage}
                      />
                    </View>
                  </HorizontalPadding>
                </KeyboardAvoidingContainer>
              </View>
              <View key={3}>
                <KeyboardAvoidingContainer>
                  <View
                    style={[
                      flex.flexCol,
                      gap.xlarge,
                      padding.top.medium,
                      padding.bottom.xlarge2,
                      padding.horizontal.large,
                    ]}>
                    <Controller
                      control={control}
                      name="criterias"
                      render={() => (
                        <View>
                          <FieldArray
                            control={control}
                            type="optional"
                            title="Campaign Criterias"
                            parentName="criterias"
                            childName="value"
                            placeholder="Add criteria for content creator"
                            helperText='Ex. "Minimal 100k followers"'
                          />
                        </View>
                      )}
                    />
                    <Controller
                      control={control}
                      name="importantInformation"
                      render={() => (
                        <View>
                          <FieldArray
                            control={control}
                            type="optional"
                            fieldType="textarea"
                            maxFieldLength={70}
                            title="Important Informations"
                            parentName="importantInformation"
                            childName="value"
                            placeholder="Add dos and/or don'ts"
                            helperText={
                              'Ex.\n"·Don\'t use profanity"\n"·Be natural"'
                            }
                          />
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
                          <View style={[flex.flexRow, items.center]}>
                            <View style={[flex.flex1]}>
                              <FormFieldHelper
                                title="Content Territory"
                                description="Preferred content creators' territory"
                              />
                            </View>
                            <InternalLink
                              text="Add"
                              onPress={() => {
                                openLocationModal({
                                  preferredLocations: getValues('locations'),
                                  setPreferredLocations: locations => {
                                    setValue('locations', []);
                                    appendLocation(locations);
                                  },
                                  navigation: navigation,
                                });
                              }}
                            />
                          </View>
                          <View className="flex flex-row flex-wrap gap-2 mt-3">
                            {locations.map((l, index: number) =>
                              l.id ? (
                                <View key={index}>
                                  <RemovableChip
                                    text={l.id}
                                    onPress={() => removeLocation(index)}
                                  />
                                </View>
                              ) : null,
                            )}
                          </View>
                          {error && (
                            <Text className="text-xs mt-2 font-medium text-red-500">
                              Locations are required (at least 1)!
                            </Text>
                          )}
                        </View>
                      )}
                    />
                    <Controller
                      control={control}
                      name="categories"
                      rules={{required: 'Categories are required!'}}
                      render={({
                        field: {value: categories},
                        fieldState: {error},
                      }) => (
                        <View style={[flex.flexCol, gap.medium]}>
                          <View style={[flex.flexRow, items.center]}>
                            <View style={[flex.flex1]}>
                              <FormFieldHelper
                                title="Category"
                                description="Maximum 2, order of selection does matter"
                              />
                            </View>
                            <InternalLink
                              text="Add"
                              onPress={() => {
                                openCategoryModal({
                                  favoriteCategories: getValues('categories'),
                                  setFavoriteCategories: c => {
                                    setValue('categories', []);
                                    appendCategories(c);
                                  },
                                  maxSelection: 2,
                                  navigation: navigation,
                                });
                              }}
                            />
                          </View>
                          {error && (
                            <Text className="text-xs mt-2 font-medium text-red-500">
                              Categories are required (at least 1)!
                            </Text>
                          )}
                          <View style={[flex.flexRow, flex.wrap, gap.default]}>
                            {categories.map((category, index: number) =>
                              category.id ? (
                                <View
                                  key={index}
                                  className="relative"
                                  style={[dimension.square.xlarge5]}>
                                  <View
                                    className="absolute z-10 top-0 right-0 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
                                    style={[
                                      dimension.square.xlarge,
                                      rounded.max,
                                      padding.xsmall2,
                                      background(COLOR.black[0]),
                                      {
                                        transform: [
                                          {
                                            translateX: 10,
                                          },
                                          {
                                            translateY: -10,
                                          },
                                        ],
                                      },
                                    ]}>
                                    <AnimatedPressable
                                      scale={0.9}
                                      onPress={() => {
                                        removeCategory(index);
                                      }}
                                      className="rotate-45"
                                      style={[
                                        flex.flexRow,
                                        justify.center,
                                        items.center,
                                        dimension.full,
                                        rounded.max,
                                        background(
                                          COLOR.background.danger.high,
                                        ),
                                      ]}>
                                      <AddIcon color={COLOR.black[0]} />
                                    </AnimatedPressable>
                                  </View>
                                  <View
                                    className="overflow-hidden"
                                    style={[dimension.full, rounded.default]}>
                                    <FastImage
                                      style={[dimension.full]}
                                      source={{
                                        uri: category.image,
                                        priority: FastImage.priority.high,
                                      }}
                                      resizeMode={'cover'}
                                    />
                                  </View>
                                </View>
                              ) : null,
                            )}
                          </View>
                        </View>
                      )}
                    />
                    <CustomButton
                      text="Next"
                      rounded="max"
                      minimumWidth
                      disabled={
                        !isValidField(getFieldState('locations', formState)) ||
                        !isValidField(getFieldState('categories', formState)) ||
                        getValues('locations').length === 0 ||
                        getValues('categories').length === 0
                      }
                      onPress={nextPage}
                    />
                  </View>
                </KeyboardAvoidingContainer>
              </View>
              <View key={4}>
                <KeyboardAvoidingContainer>
                  <HorizontalPadding paddingSize="large">
                    <View
                      style={[
                        flex.flexCol,
                        gap.xlarge,
                        padding.top.medium,
                        padding.bottom.xlarge2,
                      ]}>
                      {/* TODO: validate date, extract to component */}
                      {campaignTimeline.map((timeline, index) => {
                        const campaignTimelineIndex = getCampaignTimelineIndex(
                          timeline.step,
                        );
                        const timelineField = fieldsTimeline.find(
                          field => field.step === timeline.step,
                        );
                        return (
                          <View
                            key={timelineField?.id || index}
                            style={[flex.flexCol, gap.default]}>
                            <FormFieldHelper
                              title={timeline.step}
                              description={timeline.description}
                              type={timeline.optional ? 'optional' : 'required'}
                            />
                            <Controller
                              control={control}
                              name={`timeline.${campaignTimelineIndex}`}
                              rules={{
                                validate: (value: CampaignTimeline) => {
                                  if (
                                    (timeline.optional && !value?.start) ||
                                    campaignTimelineIndex === -1
                                  ) {
                                    return true;
                                  }
                                  const previousTimeline =
                                    getNearestPreviousTimelineEnd(index);
                                  if (!previousTimeline) {
                                    return true;
                                  }
                                  return (
                                    value?.start >=
                                      previousTimeline.getTime() ||
                                    `Date must start at least on ${formatDateToDayMonthYear(
                                      previousTimeline,
                                    )}`
                                  );
                                },
                              }}
                              render={({
                                field: {value},
                                fieldState: {error},
                              }) => (
                                <View style={[flex.flexCol, gap.small]}>
                                  <View
                                    style={[
                                      flex.flexRow,
                                      gap.default,
                                      items.start,
                                    ]}>
                                    <DatePicker
                                      minimumDate={
                                        index > 0
                                          ? getNearestPreviousTimelineEnd(
                                              index,
                                            ) || undefined
                                          : undefined
                                      }
                                      startDate={
                                        value?.start
                                          ? new Date(value.start)
                                          : undefined
                                      }
                                      endDate={
                                        value?.end
                                          ? new Date(value.end)
                                          : undefined
                                      }
                                      onDateChange={(startDate, endDate) => {
                                        updateCampaignTimeline(
                                          startDate,
                                          endDate,
                                          timeline.step,
                                        );
                                        trigger('timeline');
                                      }}>
                                      <DefaultDatePickerPlaceholder
                                        text={
                                          campaignTimelineIndex >= 0 &&
                                          value?.end
                                            ? `${formatDateToDayMonthYear(
                                                new Date(value.start),
                                              )} - ${formatDateToDayMonthYear(
                                                new Date(value.end),
                                              )}`
                                            : 'Add date'
                                        }
                                        isEdit={campaignTimelineIndex >= 0}
                                        isError={error !== undefined}
                                        helperText={error?.message}
                                      />
                                    </DatePicker>
                                    {timeline.optional &&
                                      campaignTimelineIndex >= 0 && (
                                        <Pressable
                                          className="rotate-45"
                                          style={[
                                            flex.flexRow,
                                            items.center,
                                            justify.center,
                                            dimension.square.xlarge,
                                            rounded.max,
                                            background(
                                              COLOR.background.danger.high,
                                            ),
                                            padding.xsmall,
                                          ]}
                                          onPress={() => {
                                            removeTimeline(
                                              campaignTimelineIndex,
                                            );
                                            trigger('timeline');
                                          }}>
                                          <AddIcon
                                            size="default"
                                            color={COLOR.black[0]}
                                          />
                                        </Pressable>
                                      )}
                                  </View>
                                </View>
                              )}
                            />
                          </View>
                        );
                      })}

                      <CustomButton
                        text="Submit"
                        rounded="max"
                        minimumWidth
                        disabled={
                          !isValidField(getFieldState('timeline', formState)) ||
                          campaignTimeline.filter(
                            timeline =>
                              getCampaignTimelineIndex(timeline.step) === -1 &&
                              !timeline.optional,
                          ).length > 0
                        }
                        onPress={() => {
                          console.log('submit clicked');
                          onSubmitButtonClicked();
                          // handleSubmit(onSubmitButtonClicked)();
                        }}
                      />
                    </View>
                  </HorizontalPadding>
                </KeyboardAvoidingContainer>
              </View>
            </PagerView>
          </ScrollView>
        </PageWithBackButton>
      </FormProvider>
    </>
  );
};

type SocialFieldArrayProps = {
  control: Control<any>;
  platform: SocialPlatform;
  title: string;
  parentName: any; // string
  childName?: string;
  placeholder?: string;
  fieldType?: 'default' | 'textarea';
  maxFieldLength?: number;
  helperText?: string;
};
const SocialFieldArray = ({
  control,
  platform,
  title,
  parentName,
  childName,
  placeholder,
  fieldType = 'default',
  maxFieldLength = 40,
  helperText,
}: SocialFieldArrayProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  const windowDimension = useWindowDimensions();
  const [taskQuantity, setTaskQuantity] = useState<number>(1);
  const [taskName, setTaskName] = useState<string>('');
  const [taskType, setTaskType] = useState<string>('');
  const [temporaryText, setTemporaryText] = useState<string>('');
  const currentTask = useMemo(() => {
    return taskTypes.find(t => t.name === platform);
  }, [platform]);
  const currentTaskTypes = useMemo(() => {
    return currentTask?.tasks.filter(task => task.name === taskName)?.[0]
      ?.types;
  }, [currentTask, taskName]);
  const [updateIndex, setUpdateIndex] = useState<number | null>(null);
  const [isModalOpened, setIsModalOpened] = useState(false);
  const {getValues} = useFormContext();
  const {fields, append, remove} = useFieldArray({
    name: parentName,
    control,
  });

  const updateText = (text: string) => {
    setTemporaryText(text);
  };

  useEffect(() => {
    if (isModalOpened === false) {
      setUpdateIndex(null);
      setTemporaryText('');
      setTaskName('');
      setTaskType('');
      setTaskQuantity(1);
    }
  }, [isModalOpened]);

  useEffect(() => {
    if (updateIndex !== null) {
      const currentTask = getValues(
        `${parentName}.${updateIndex}${childName ? `.${childName}` : ''}`,
      );
      setTaskName(currentTask?.name);
      setTaskType(currentTask?.type);
      setTaskQuantity(currentTask?.quantity);
    }
  }, [updateIndex, getValues, parentName, childName]);

  const addNewEntry = () => {
    append({
      name: taskName,
      type:
        taskType !== '' && currentTaskTypes?.find(t => t === taskType)
          ? taskType
          : undefined,
      description: temporaryText,
      quantity: taskQuantity,
    });
    setIsModalOpened(false);
  };

  const updateEntry = (onChange: (...event: any[]) => void) => {
    onChange({
      name: taskName,
      type:
        taskType !== '' && currentTaskTypes?.find(t => t === taskType)
          ? taskType
          : undefined,
      description: temporaryText,
      quantity: taskQuantity,
    });
    setIsModalOpened(false);
  };

  return (
    <>
      <View style={[flex.flexCol, gap.default]}>
        <FormFieldHelper title={title} />
        <View style={[flex.flexCol, gap.medium]}>
          {fields.length > 0 && (
            <View style={[flex.flexCol, gap.small]}>
              {fields.map((f, index) => (
                <View key={f.id} style={[flex.flexRow, justify.start]}>
                  <Controller
                    control={control}
                    name={`${parentName}.${index}${
                      childName ? `.${childName}` : ''
                    }`}
                    render={({field: {value}}) => (
                      <FieldArrayLabel
                        type="field"
                        text={`${value?.quantity} x ${value?.name} ${
                          value?.type ? `(${value?.type})` : ''
                        } ${
                          value?.description.length > 0
                            ? `[${value?.description}]`
                            : ''
                        }`}
                        onPress={() => {
                          setUpdateIndex(index);
                          setIsModalOpened(true);
                        }}
                        onRemovePress={() => remove(index)}
                      />
                    )}
                  />
                </View>
              ))}
            </View>
          )}
          <View style={[flex.flexRow, justify.start]}>
            <FieldArrayLabel
              type="add"
              text={placeholder ? placeholder : 'Add'}
              onPress={() => {
                setIsModalOpened(true);
              }}
            />
          </View>
        </View>
      </View>
      <SheetModal
        fullHeight
        snapPoints={[windowDimension.height - safeAreaInsets.top]}
        open={isModalOpened}
        onDismiss={() => {
          setIsModalOpened(false);
        }}
        enableDynamicSizing={false}>
        <BottomSheetModalWithTitle fullHeight title={title}>
          <Controller
            control={control}
            name={`${parentName}.${updateIndex}${
              childName ? `.${childName}` : ''
            }`}
            render={({field: {value, onChange}}) => (
              <View
                style={[
                  flex.flex1,
                  flex.flexCol,
                  gap.medium,
                  padding.horizontal.large,
                ]}>
                {currentTask && (
                  <View style={[flex.flexCol, gap.default]}>
                    <FormFieldHelper title="Task type" />
                    <View style={[flex.flexRow, gap.default]}>
                      {currentTask.tasks.map((task, index) => (
                        <View key={index}>
                          <SelectableTag
                            text={task.name}
                            isSelected={taskName === task.name}
                            onPress={() => {
                              setTaskName(task.name);
                            }}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {taskName.length > 0 && currentTaskTypes && (
                  <View style={[flex.flexCol, gap.default]}>
                    <FormFieldHelper title={`${taskName} type`} />
                    <View style={[flex.flexRow, flex.wrap, gap.default]}>
                      {currentTaskTypes?.map((types, index) => (
                        <View key={index}>
                          <SelectableTag
                            text={types}
                            isSelected={taskType === types}
                            onPress={() => {
                              setTaskType(types);
                            }}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                <View style={[flex.flexCol, gap.default, items.start]}>
                  <FormFieldHelper title="Description" />
                  <View style={[flex.flexRow, gap.default, items.end]}>
                    <View style={[flex.flex1, padding.top.default]}>
                      <FormlessCustomTextInput
                        counter
                        type={fieldType}
                        max={maxFieldLength}
                        defaultValue={`${value?.description || ''}`}
                        placeholder={placeholder ?? `Add ${parentName}`}
                        description={helperText}
                        onChange={updateText}
                      />
                    </View>
                    <FormlessCustomNumberInput
                      min={1}
                      max={5}
                      type="field"
                      onChange={setTaskQuantity}
                    />
                  </View>
                </View>
                <CustomButton
                  disabled={
                    taskQuantity < 1 ||
                    taskName.length === 0 ||
                    (currentTaskTypes &&
                      currentTaskTypes?.length > 0 &&
                      taskType?.length === 0)
                  }
                  text={updateIndex !== null ? 'Update' : 'Save'}
                  onPress={() => {
                    if (updateIndex !== null) {
                      updateEntry(onChange);
                    } else {
                      addNewEntry();
                    }
                  }}
                />
              </View>
            )}
          />
        </BottomSheetModalWithTitle>
      </SheetModal>
    </>
  );
};

export default CreateCampaignScreen;
