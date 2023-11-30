import {Platform, Pressable, View} from 'react-native';
import {CloseModal} from '../../../components/atoms/Close';
import SafeAreaContainer from '../../../containers/SafeAreaContainer';
import {flex, items, justify} from '../../../styles/Flex';
import {gap} from '../../../styles/Gap';
import {padding} from '../../../styles/Padding';
import {Text} from 'react-native';
import {textColor} from '../../../styles/Text';
import {COLOR} from '../../../styles/Color';
import {font} from '../../../styles/Font';
import {FormLabel} from '../../../components/atoms/FormLabel';
import {rounded} from '../../../styles/BorderRadius';
import {useUser} from '../../../hooks/user';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import {border} from '../../../styles/Border';
import {useCallback, useEffect, useState} from 'react';
import {AnimatedPressable} from '../../../components/atoms/AnimatedPressable';
import {background} from '../../../styles/BackgroundColor';
import {AddIcon} from '../../../components/atoms/Icon';
import DateIcon from '../../../assets/vectors/date.svg';

type FormData = {
  postingSchedules: {value: number}[];
};
import {formatDateToTime12Hrs} from '../../../utils/date';
import {CustomButton} from '../../../components/atoms/Button';
import {SheetModal} from '../../../containers/SheetModal';
import {PostingScheduleDatePicker} from '../../signup/RegisterContentCreatorPreferences';
import {useKeyboard} from '../../../hooks/keyboard';
import {User} from '../../../model/User';
import {useNavigation} from '@react-navigation/native';
import {NavigationStackProps} from '../../../navigation/StackNavigation';

const EditPostingScheduleScreen = () => {
  const navigation = useNavigation<NavigationStackProps>();

  const keyboardHeight = useKeyboard();

  const {user} = useUser();
  const [isDatePickerModalOpened, setIsDatePickerModalOpened] = useState(false);
  const [updatePostingSchedulesIndex, setUpdatePostingSchedulesIndex] =
    useState<number | undefined>(undefined);
  const [temporaryDate, setTemporaryDate] = useState<number>(
    new Date().getTime(),
  );
  const methods = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      postingSchedules: user?.contentCreator?.postingSchedules.map(ps => ({
        value: ps,
      })),
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

  const onSubmit = (d: FormData) => {
    const temp = new User({...user});
    temp.contentCreator = {
      ...temp.contentCreator!,
      postingSchedules: d.postingSchedules.map(ps => ps.value),
    };

    temp.updateUserData().then(() => {
      navigation.goBack();
    });
  };
  return (
    <SafeAreaContainer enable>
      <CloseModal />
      <FormProvider {...methods}>
        <View
          style={[flex.flexCol, gap.medium, padding.horizontal.default]}
          className="flex-1 justify-between">
          <View style={[flex.flexCol, gap.medium]}>
            <View style={[flex.flexRow, items.center]}>
              <View style={[flex.flexCol, flex.growShrink, gap.small]}>
                <Text
                  className="font-bold"
                  style={[textColor(COLOR.text.neutral.high), font.size[40]]}>
                  Posting Schedule <FormLabel type="optional" />
                </Text>
                <Text
                  className="font-medium"
                  style={[textColor(COLOR.text.neutral.med), font.size[20]]}>
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
                            new Date(watch(`postingSchedules.${index}.value`)),
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
                    style={[textColor(COLOR.text.neutral.med), font.size[30]]}>
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
          <CustomButton text="Save" onPress={methods.handleSubmit(onSubmit)} />
        </View>
        <SheetModal
          open={isDatePickerModalOpened}
          onDismiss={() => {
            setIsDatePickerModalOpened(false);
          }}>
          <View
            style={[
              flex.flexCol,
              gap.default,
              padding.top.default,
              padding.bottom.xlarge,
              padding.horizontal.default,
            ]}>
            <View style={[flex.flexRow, justify.center]}>
              <Text
                className="font-bold"
                style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
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
                  <CustomButton text="Save" onPress={savePostingSchedule} />
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
        </SheetModal>
      </FormProvider>
    </SafeAreaContainer>
  );
};

export default EditPostingScheduleScreen;
