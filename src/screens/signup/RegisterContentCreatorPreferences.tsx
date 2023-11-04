import {Text, View} from 'react-native';
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
import {Controller, useFormContext} from 'react-hook-form';
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

interface RegisterContentCreatorPreferencesProps {
  onLocationsChange: (locations: Location[]) => void;
}

export const RegisterContentCreatorPreferences = ({
  onLocationsChange,
}: RegisterContentCreatorPreferencesProps) => {
  const navigation = useNavigation<NavigationStackProps>();
  const {control, setValue, watch} = useFormContext();
  const [isStartDateSheetOpened, setIsStartDateSheetOpened] = useState(false);
  const [preferredLocations, setPreferredLocations] = useState<Location[]>([]);

  useEffect(() => {
    onLocationsChange(preferredLocations);
  }, [preferredLocations, onLocationsChange]);

  const removeLocation = (location: Location) => {
    setPreferredLocations(prev => {
      return prev.filter(item => item.id !== location.id);
    });
  };

  return (
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
                  Max revision
                </Text>
              </View>
            </View>
            <CustomNumberInput name="maxRevision" />
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
            <View style={[flex.flexRow, flex.wrap]}>
              <AnimatedPressable
                onPress={() => setIsStartDateSheetOpened(true)}>
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
                      color: COLOR.green[50],
                    }),
                  ]}>
                  {watch('startDate') && (
                    <DateIcon width={20} height={20} color={COLOR.green[50]} />
                  )}
                  <Text
                    className="font-semibold"
                    style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
                    {watch('startDate')
                      ? formatDateToTime12Hrs(watch('startDate'))
                      : 'Add Schedule'}
                  </Text>
                  {!watch('startDate') && (
                    <View
                      style={[
                        rounded.max,
                        background(COLOR.green[50]),
                        padding.xsmall,
                      ]}>
                      <AddIcon size="default" color={COLOR.black[0]} />
                    </View>
                  )}
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
          open={isStartDateSheetOpened}
          onDismiss={() => {
            setIsStartDateSheetOpened(false);
          }}>
          <HorizontalPadding>
            <VerticalPadding paddingSize="default">
              <View style={[flex.flexCol, gap.default, padding.bottom.xlarge]}>
                <View style={[flex.flexRow, justify.center]}>
                  <Text
                    className="font-bold"
                    style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
                    Posting Schedule
                  </Text>
                </View>
                <View style={[flex.flexRow, justify.center]}>
                  <Controller
                    control={control}
                    name="startDate"
                    defaultValue={new Date()}
                    rules={{
                      required: 'Start Date is required!',
                      validate: d =>
                        d >= new Date() || 'Date must be after today!',
                    }}
                    render={({
                      field: {name, value: startDate},
                      fieldState: {error},
                    }) => (
                      <View style={[flex.flexCol]}>
                        <DatePicker
                          mode={'time'}
                          locale="en"
                          date={startDate}
                          minuteInterval={15}
                          onDateChange={d => {
                            setValue(name, d);
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
                <CustomButton text="Confirm" />
              </View>
            </VerticalPadding>
          </HorizontalPadding>
        </SheetModal>
      </HorizontalPadding>
    </VerticalPadding>
  );
};
