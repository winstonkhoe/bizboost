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
import {CustomNumberInput} from '../../components/atoms/Input';
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
import {FormFieldHelper} from '../../components/atoms/FormLabel';
import {ContentCreatorPreference} from '../../model/User';
import {Platform} from 'react-native';
import FieldArray from '../../components/organisms/FieldArray';
import {FieldArrayLabel} from '../../components/molecules/FieldArrayLabel';

interface RegisterContentCreatorPreferencesProps {
  onPreferenceChange: (preference: ContentCreatorPreference) => void;
}

export type ContentCreatorPreferencesFormData = {
  contentRevisionLimit: number | string;
  postingSchedules: {value: number}[];
  preferences: StringObject[];
};

export const RegisterContentCreatorPreferences = ({
  onPreferenceChange,
}: RegisterContentCreatorPreferencesProps) => {
  const keyboardHeight = useKeyboard();
  const [isDatePickerModalOpened, setIsDatePickerModalOpened] = useState(false);
  const [updatePostingSchedulesIndex, setUpdatePostingSchedulesIndex] =
    useState<number | undefined>(undefined);
  const [temporaryDate, setTemporaryDate] = useState<number>(
    new Date().getTime(),
  );

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

  const closeDatePickerSheetModal = () => {
    setIsDatePickerModalOpened(false);
  };

  const resetDatePickerSheetModal = useCallback(() => {
    setTemporaryDate(new Date().getTime());
    if (updatePostingSchedulesIndex !== undefined) {
      setUpdatePostingSchedulesIndex(undefined);
    }
  }, [updatePostingSchedulesIndex]);

  useEffect(() => {
    if (!isDatePickerModalOpened) {
      resetDatePickerSheetModal();
    }
  }, [isDatePickerModalOpened, resetDatePickerSheetModal]);

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
        ).filter((item): item is number => item !== undefined),
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

  return (
    <FormProvider {...methods}>
      <VerticalPadding paddingSize="large">
        <HorizontalPadding paddingSize="large">
          <View style={[flex.flexCol, gap.default]}>
            <View style={[flex.flexCol, gap.medium]}>
              <FormFieldHelper
                title="Content Revision"
                description="Max revision to limit business people revision request"
              />
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
            <View style={[flex.flexCol, gap.medium, padding.bottom.large]}>
              <FormFieldHelper
                title="Posting Schedule"
                description="Let business people know your frequent posting schedule"
                type="optional"
              />
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
                            style={[
                              textColor(COLOR.green[60]),
                              font.weight.semibold,
                              font.size[30],
                            ]}>
                            {formatDateToTime12Hrs(
                              new Date(
                                watch(`postingSchedules.${index}.value`),
                              ),
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
                          <AddIcon
                            size="default"
                            color={COLOR.absoluteBlack[0]}
                          />
                        </Pressable>
                      </View>
                    </AnimatedPressable>
                  );
                })}
                <FieldArrayLabel
                  text="Schedule"
                  type="add"
                  onPress={() => {
                    setIsDatePickerModalOpened(true);
                  }}
                />
              </View>
            </View>
            <View style={[flex.flexCol, gap.medium]}>
              <FieldArray
                title="Preferences"
                description="Let business people know what you like or things you don't like"
                parentName="preferences"
                control={control}
                childName="value"
                fieldType="textarea"
                labelAdd="Preference"
                placeholder="I don't accept cigarette campaigns"
                helperText="Write things that you want to let business people know about you"
                type="optional"
              />
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
                              date={new Date(date)}
                              onDateChange={d => setTemporaryDate(d.getTime())}
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
                          date={new Date(temporaryDate)}
                          onDateChange={d => setTemporaryDate(d.getTime())}
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
                      Platform.OS !== 'android' && {
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

export const PostingScheduleDatePicker = ({
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
