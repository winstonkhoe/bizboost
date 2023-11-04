import {Pressable, Text, View} from 'react-native';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../../components/atoms/ViewPadding';
import {gap} from '../../styles/Gap';
import {flex, items, justify} from '../../styles/Flex';
import {useEffect, useState} from 'react';
import {Location} from '../../model/Location';
import {useNavigation} from '@react-navigation/native';
import {NavigationStackProps} from '../../navigation/StackNavigation';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {font, fontSize} from '../../styles/Font';
import {RemovableChip} from '../../components/atoms/Chip';
import {CustomNumberInput} from '../../components/atoms/Input';
import DatePicker from 'react-native-date-picker';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
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

interface RegisterContentCreatorPreferencesProps {
  onLocationsChange: (locations: Location[]) => void;
}

export type ContentCreatorPreferencesFormData = {
  contentRevisionLimit: number;
  postingSchedules: {value: Date}[];
};

export const RegisterContentCreatorPreferences = ({
  onLocationsChange,
}: RegisterContentCreatorPreferencesProps) => {
  const keyboardHeight = useKeyboard();
  const [isDatePickerModalOpened, setIsDatePickerModalOpened] = useState(false);
  const [preferredLocations, setPreferredLocations] = useState<Location[]>([]);
  const [updatePostingSchedulesIndex, setUpdatePostingSchedulesIndex] =
    useState<number | undefined>(undefined);
  const [temporaryDate, setTemporaryDate] = useState<Date>(new Date());

  const methods = useForm<ContentCreatorPreferencesFormData>({
    mode: 'all',
    defaultValues: {
      contentRevisionLimit: 0,
      postingSchedules: [],
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

  useEffect(() => {
    if (!isDatePickerModalOpened) {
      setTemporaryDate(new Date());
    }
  }, [isDatePickerModalOpened]);

  useEffect(() => {
    onLocationsChange(preferredLocations);
  }, [preferredLocations, onLocationsChange]);

  const removeLocation = (location: Location) => {
    setPreferredLocations(prev => {
      return prev.filter(item => item.id !== location.id);
    });
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
                    Content Revision
                  </Text>
                  <Text
                    className="font-medium"
                    style={[textColor(COLOR.text.neutral.med), font.size[30]]}>
                    Max revision to limit business people revision request
                  </Text>
                </View>
              </View>
              <CustomNumberInput name="contentRevisionLimit" />
            </View>
            <View style={[flex.flexCol, gap.medium]}>
              <View style={[flex.flexRow, items.center]}>
                <View style={[flex.flexCol, flex.growShrink, gap.small]}>
                  <Text
                    className="font-bold"
                    style={[textColor(COLOR.text.neutral.high), font.size[50]]}>
                    Posting Schedule
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
                      Add Schedule
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
            <View style={[flex.flexRow, gap.small, flex.wrap]}>
              {preferredLocations.map(location => {
                return (
                  <RemovableChip
                    text={location.id}
                    key={location.id}
                    onPress={() => {
                      removeLocation(location);
                    }}
                  />
                );
              })}
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
                            <DatePicker
                              mode={'time'}
                              locale="en"
                              date={date}
                              minuteInterval={15}
                              onDateChange={setTemporaryDate}
                            />
                            <CustomButton
                              text="Confirm"
                              onPress={() => {
                                onChange(temporaryDate);
                                setUpdatePostingSchedulesIndex(undefined);
                                setIsDatePickerModalOpened(false);
                              }}
                            />
                          </View>
                        )}
                      />
                    ) : (
                      <View style={[flex.flexCol]}>
                        <DatePicker
                          mode={'time'}
                          locale="en"
                          date={temporaryDate}
                          minuteInterval={15}
                          onDateChange={d => {
                            setTemporaryDate(d);
                          }}
                        />
                        <CustomButton
                          text="Confirm"
                          onPress={() => {
                            appendPostingSchedule({
                              value: temporaryDate,
                            });
                            setIsDatePickerModalOpened(false);
                          }}
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
