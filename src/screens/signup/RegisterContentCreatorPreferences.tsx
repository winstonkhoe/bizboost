import {Pressable, Text, View} from 'react-native';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../../components/atoms/ViewPadding';
import {gap} from '../../styles/Gap';
import {flex, items, justify} from '../../styles/Flex';
import {useCallback, useEffect, useState} from 'react';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {font} from '../../styles/Font';
import {
  CustomNumberInput,
  FormlessTextInput,
} from '../../components/atoms/Input';
import DatePicker from 'react-native-date-picker';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import {SheetModal} from '../../containers/SheetModal';
import {AnimatedPressable} from '../../components/atoms/AnimatedPressable';
import DateIcon from '../../assets/vectors/date.svg';
import {rounded} from '../../styles/BorderRadius';
import {padding} from '../../styles/Padding';
import {border} from '../../styles/Border';
import {formatDateToTime12Hrs} from '../../utils/date';
import {CustomButton} from '../../components/atoms/Button';
import {AddIcon} from '../../components/atoms/Icon';
import {background} from '../../styles/BackgroundColor';
import {useKeyboard} from '../../hooks/keyboard';
import {StringObject} from '../../utils/stringObject';
import {FormLabel} from '../../components/atoms/FormLabel';
import {ContentCreatorPreference} from '../../model/User';

interface RegisterContentCreatorPreferencesProps {
  onPreferenceChange: (preference: ContentCreatorPreference) => void;
}

export type ContentCreatorPreferencesFormData = {
  contentRevisionLimit: number | string;
  postingSchedules: {value: Date}[];
  preferences: StringObject[];
};

export const RegisterContentCreatorPreferences = ({
  onPreferenceChange,
}: RegisterContentCreatorPreferencesProps) => {
  const keyboardHeight = useKeyboard();
  const [isDatePickerModalOpened, setIsDatePickerModalOpened] = useState(false);
  const [isPreferencesModalOpened, setIsPreferencesModalOpened] =
    useState(false);
  const [updatePostingSchedulesIndex, setUpdatePostingSchedulesIndex] =
    useState<number | undefined>(undefined);
  const [updatePreferenceIndex, setUpdatePreferenceIndex] = useState<
    number | undefined
  >(undefined);
  const [temporaryDate, setTemporaryDate] = useState<Date>(new Date());
  const [temporaryPreference, setTemporaryPreference] = useState<string>('');

  const methods = useForm<ContentCreatorPreferencesFormData>({
    mode: 'all',
    defaultValues: {
      contentRevisionLimit: 0,
      postingSchedules: [],
      preferences: [],
    },
  });

  const {watch, control} = methods;

  const {
    fields: fieldsPostingSchedule,
    append: appendPostingSchedule,
    remove: removePostingSchedule,
  } = useFieldArray({
    name: 'postingSchedules',
    control,
  });

  const {
    fields: fieldsPreferences,
    append: appendPreferences,
    remove: removePreferences,
  } = useFieldArray({
    name: 'preferences',
    control,
  });

  const closeDatePickerSheetModal = () => {
    setIsDatePickerModalOpened(false);
  };

  const resetDatePickerSheetModal = useCallback(() => {
    setTemporaryDate(new Date());
    if (updatePostingSchedulesIndex !== undefined) {
      setUpdatePostingSchedulesIndex(undefined);
    }
  }, [updatePostingSchedulesIndex]);

  const closePreferenceSheetModal = () => {
    setIsPreferencesModalOpened(false);
  };

  const resetPreferenceSheetModal = useCallback(() => {
    setTemporaryPreference('');
    if (updatePreferenceIndex !== undefined) {
      setUpdatePreferenceIndex(undefined);
    }
  }, [updatePreferenceIndex]);

  useEffect(() => {
    if (!isDatePickerModalOpened) {
      resetDatePickerSheetModal();
    }
  }, [isDatePickerModalOpened, resetDatePickerSheetModal]);

  useEffect(() => {
    if (!isPreferencesModalOpened) {
      resetPreferenceSheetModal();
    }
  }, [isPreferencesModalOpened, resetPreferenceSheetModal]);

  useEffect(() => {
    const subscription = watch(value => {
      let contentRevisionLimit = value.contentRevisionLimit;
      if (
        contentRevisionLimit === undefined ||
        typeof contentRevisionLimit === 'string'
      ) {
        contentRevisionLimit = undefined;
      }
      onPreferenceChange({
        contentRevisionLimit: contentRevisionLimit,
        postingSchedules: (
          value?.postingSchedules?.map(item => item?.value) || []
        ).filter((item): item is Date => item !== undefined),
        preferences: (
          value?.preferences?.map(item => item?.value) || []
        ).filter((item): item is string => item !== undefined),
      });
    });

    return () => subscription.unsubscribe();
  }, [watch, onPreferenceChange]);

  const savePostingSchedule = () => {
    appendPostingSchedule({
      value: temporaryDate,
    });
    closeDatePickerSheetModal();
  };

  const updatePostingSchedule = (onChange: (...event: any[]) => void) => {
    onChange(temporaryDate);
    closeDatePickerSheetModal();
  };

  const savePreference = () => {
    appendPreferences({
      value: temporaryPreference,
    });
    closePreferenceSheetModal();
  };

  const updatePreference = (onChange: (...event: any[]) => void) => {
    onChange(temporaryPreference);
    closePreferenceSheetModal();
  };

  return (
    <FormProvider {...methods}>
      <VerticalPadding paddingSize="large">
        <HorizontalPadding paddingSize="large">
          <View style={[flex.flexCol, gap.xlarge]}>
            <View style={[flex.flexCol, gap.medium]}>
              <View style={[flex.flexRow, items.center]}>
                <View style={[flex.flexCol, flex.growShrink, gap.small]}>
                  <Text
                    className="font-bold"
                    style={[textColor(COLOR.text.neutral.high), font.size[50]]}>
                    Content Revision <FormLabel type="required" />
                  </Text>
                  <Text
                    className="font-medium"
                    style={[textColor(COLOR.text.neutral.med), font.size[30]]}>
                    Max revision to limit business people revision request
                  </Text>
                </View>
              </View>
              <CustomNumberInput
                name="contentRevisionLimit"
                type="field"
                min={0}
                max={999}
                rules={{
                  required: 'Revision limit cannot be empty',
                }}
              />
            </View>
            <View style={[flex.flexCol, gap.medium]}>
              <View style={[flex.flexRow, items.center]}>
                <View style={[flex.flexCol, flex.growShrink, gap.small]}>
                  <Text
                    className="font-bold"
                    style={[textColor(COLOR.text.neutral.high), font.size[50]]}>
                    Posting Schedule <FormLabel type="optional" />
                  </Text>
                  <Text
                    className="font-medium"
                    style={[textColor(COLOR.text.neutral.med), font.size[30]]}>
                    Let business people know your frequent posting schedule
                  </Text>
                </View>
              </View>
              <View style={[flex.flexRow, flex.wrap, gap.default]}>
                {fieldsPostingSchedule.map((item, index) => {
                  return (
                    <AnimatedPressable
                      key={item.id}
                      onPress={() => {
                        setUpdatePostingSchedulesIndex(index);
                        setIsDatePickerModalOpened(true);
                      }}>
                      <View
                        style={[
                          flex.flexRow,
                          gap.default,
                          items.center,
                          rounded.default,
                          padding.vertical.small,
                          padding.horizontal.default,
                          border({
                            borderWidth: 1,
                            color: COLOR.green[50],
                          }),
                        ]}>
                        <View style={[flex.flexRow, items.center, gap.small]}>
                          <DateIcon
                            width={20}
                            height={20}
                            color={COLOR.green[50]}
                          />
                          <Text
                            className="font-semibold"
                            style={[textColor(COLOR.green[60]), font.size[30]]}>
                            {formatDateToTime12Hrs(
                              watch(`postingSchedules.${index}.value`),
                            )}
                          </Text>
                        </View>
                        <Pressable
                          className="rotate-45"
                          style={[
                            rounded.max,
                            background(COLOR.background.danger.high),
                            padding.xsmall,
                          ]}
                          onPress={() => removePostingSchedule(index)}>
                          <AddIcon size="default" color={COLOR.black[0]} />
                        </Pressable>
                      </View>
                    </AnimatedPressable>
                  );
                })}
                <AnimatedPressable
                  onPress={() => {
                    setIsDatePickerModalOpened(true);
                  }}>
                  <View
                    style={[
                      flex.flexRow,
                      items.center,
                      gap.small,
                      rounded.default,
                      padding.vertical.small,
                      padding.horizontal.default,
                      border({
                        borderWidth: 1,
                        color: COLOR.background.neutral.med,
                      }),
                    ]}>
                    <Text
                      className="font-semibold"
                      style={[
                        textColor(COLOR.text.neutral.med),
                        font.size[30],
                      ]}>
                      Schedule
                    </Text>
                    <View
                      style={[
                        rounded.max,
                        background(COLOR.background.neutral.high),
                        padding.xsmall,
                      ]}>
                      <AddIcon size="default" color={COLOR.black[0]} />
                    </View>
                  </View>
                </AnimatedPressable>
              </View>
            </View>
            <View style={[flex.flexCol, gap.medium]}>
              <View style={[flex.flexRow, items.center]}>
                <View style={[flex.flexCol, flex.growShrink, gap.small]}>
                  <Text
                    className="font-bold"
                    style={[textColor(COLOR.text.neutral.high), font.size[50]]}>
                    Preferences <FormLabel type="optional" />
                  </Text>
                  <Text
                    className="font-medium"
                    style={[textColor(COLOR.text.neutral.med), font.size[30]]}>
                    Let business people know what you like or things you don't
                    like
                  </Text>
                </View>
              </View>
              <View style={[flex.flexCol, gap.medium, items.start]}>
                {fieldsPreferences.length > 0 && (
                  <View style={[flex.flexCol, gap.small, items.start]}>
                    {fieldsPreferences.map((item, index) => {
                      return (
                        <AnimatedPressable
                          key={item.id}
                          onPress={() => {
                            setUpdatePreferenceIndex(index);
                            setIsPreferencesModalOpened(true);
                          }}>
                          <View
                            style={[
                              flex.flexRow,
                              gap.default,
                              items.center,
                              rounded.default,
                              padding.vertical.small,
                              padding.horizontal.default,
                              border({
                                borderWidth: 1,
                                color: COLOR.green[50],
                              }),
                            ]}>
                            <View
                              style={[flex.flexRow, items.center, gap.small]}>
                              <Text
                                className="font-semibold"
                                style={[
                                  textColor(COLOR.green[60]),
                                  font.size[30],
                                ]}>
                                {watch(`preferences.${index}.value`)}
                              </Text>
                            </View>
                            <Pressable
                              className="rotate-45"
                              style={[
                                rounded.max,
                                background(COLOR.background.danger.high),
                                padding.xsmall,
                              ]}
                              onPress={() => removePreferences(index)}>
                              <AddIcon size="default" color={COLOR.black[0]} />
                            </Pressable>
                          </View>
                        </AnimatedPressable>
                      );
                    })}
                  </View>
                )}

                <AnimatedPressable
                  onPress={() => {
                    setIsPreferencesModalOpened(true);
                  }}>
                  <View
                    style={[
                      flex.flexRow,
                      items.center,
                      gap.small,
                      rounded.default,
                      padding.vertical.small,
                      padding.horizontal.default,
                      border({
                        borderWidth: 1,
                        color: COLOR.background.neutral.med,
                      }),
                    ]}>
                    <Text
                      className="font-semibold"
                      style={[
                        textColor(COLOR.text.neutral.med),
                        font.size[30],
                      ]}>
                      Preference
                    </Text>
                    <View
                      style={[
                        rounded.max,
                        background(COLOR.background.neutral.high),
                        padding.xsmall,
                      ]}>
                      <AddIcon size="default" color={COLOR.black[0]} />
                    </View>
                  </View>
                </AnimatedPressable>
              </View>
            </View>
          </View>
          <SheetModal
            open={isDatePickerModalOpened}
            onDismiss={() => {
              setIsDatePickerModalOpened(false);
            }}>
            <HorizontalPadding>
              <VerticalPadding paddingSize="default">
                <View
                  style={[flex.flexCol, gap.default, padding.bottom.xlarge]}>
                  <View style={[flex.flexRow, justify.center]}>
                    <Text
                      className="font-bold"
                      style={[
                        font.size[40],
                        textColor(COLOR.text.neutral.high),
                      ]}>
                      Posting Schedule
                    </Text>
                  </View>
                  <View style={[flex.flexRow, justify.center]}>
                    {updatePostingSchedulesIndex !== undefined ? (
                      <Controller
                        control={control}
                        name={`postingSchedules.${updatePostingSchedulesIndex}.value`}
                        render={({field: {value: date, onChange}}) => (
                          <View style={[flex.flexCol]}>
                            <PostingScheduleDatePicker
                              date={date}
                              onDateChange={setTemporaryDate}
                            />
                            <CustomButton
                              text="Update"
                              onPress={() => updatePostingSchedule(onChange)}
                            />
                          </View>
                        )}
                      />
                    ) : (
                      <View style={[flex.flexCol]}>
                        <PostingScheduleDatePicker
                          date={temporaryDate}
                          onDateChange={setTemporaryDate}
                        />
                        <CustomButton
                          text="Save"
                          onPress={savePostingSchedule}
                        />
                      </View>
                    )}
                  </View>
                  <View
                    style={[
                      {
                        paddingBottom: keyboardHeight,
                      },
                    ]}
                  />
                </View>
              </VerticalPadding>
            </HorizontalPadding>
          </SheetModal>
          <SheetModal
            open={isPreferencesModalOpened}
            onDismiss={() => {
              setIsPreferencesModalOpened(false);
            }}>
            <HorizontalPadding paddingSize="large">
              <VerticalPadding paddingSize="default">
                <View
                  style={[flex.flexCol, gap.default, padding.bottom.xlarge]}>
                  <View style={[flex.flexRow, justify.center]}>
                    <Text
                      className="font-bold"
                      style={[
                        font.size[40],
                        textColor(COLOR.text.neutral.high),
                      ]}>
                      Add Preference
                    </Text>
                  </View>
                  <View style={[flex.flexRow, justify.center]}>
                    {updatePreferenceIndex !== undefined ? (
                      <Controller
                        control={control}
                        name={`preferences.${updatePreferenceIndex}.value`}
                        render={({field: {value, onChange}}) => (
                          <View style={[flex.flexCol, gap.medium]}>
                            <FormlessTextInput
                              counter
                              max={30}
                              defaultValue={value}
                              placeholder="Don't accept cigarette campaigns"
                              focus={isPreferencesModalOpened}
                              description="Write things that you want to let business people know about you"
                              onChangeText={setTemporaryPreference}
                            />
                            <CustomButton
                              text="Update"
                              onPress={() => updatePreference(onChange)}
                            />
                          </View>
                        )}
                      />
                    ) : (
                      <View style={[flex.flexCol, gap.medium]}>
                        <FormlessTextInput
                          counter
                          max={30}
                          placeholder="Don't accept cigarette campaigns"
                          focus={isPreferencesModalOpened}
                          description="Write things that you want to let business people know about you"
                          onChangeText={setTemporaryPreference}
                        />
                        <CustomButton
                          text="Save"
                          disabled={temporaryPreference.length === 0}
                          onPress={savePreference}
                        />
                      </View>
                    )}
                  </View>
                  <View
                    style={[
                      {
                        paddingBottom: keyboardHeight,
                      },
                    ]}
                  />
                </View>
              </VerticalPadding>
            </HorizontalPadding>
          </SheetModal>
        </HorizontalPadding>
      </VerticalPadding>
    </FormProvider>
  );
};

interface PostingScheduleDatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

const PostingScheduleDatePicker = ({
  date,
  onDateChange,
}: PostingScheduleDatePickerProps) => {
  return (
    <DatePicker
      mode={'time'}
      locale="en"
      date={date}
      minuteInterval={15}
      onDateChange={onDateChange}
    />
  );
};
