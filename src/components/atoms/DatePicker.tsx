import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  Pressable,
  StyleSheet,
  PressableProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {flex, items, justify} from '../../styles/Flex';
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {size} from '../../styles/Size';

interface DatePickerProps {
  onDateChange: (startDate: Date | null, endDate: Date | null) => void;
  singleDate?: boolean;
}

const horizontalPaddingSize = size.default;
const horizontalPadding = padding.horizontal.default;

const DatePicker = ({onDateChange, singleDate = false}: DatePickerProps) => {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const animation = useSharedValue(0);
  const [months, setMonths] = useState<Date[][]>([]);
  const flatListRef = useRef<FlatList>(null);
  const windowDimension = useWindowDimensions();
  const cellWidth = (windowDimension.width - horizontalPaddingSize * 2) / 7;

  useEffect(() => {
    const generateDates = () => {
      const generatedMonths = [];
      let date = new Date();
      date.setDate(1);

      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);

      let monthArray = [];
      let currentMonth = date.getMonth();

      while (date <= endDate) {
        if (date.getMonth() !== currentMonth) {
          generatedMonths.push(monthArray);
          monthArray = [];
          currentMonth = date.getMonth();
        }
        monthArray.push(new Date(date)); // clone to avoid mutation
        date.setDate(date.getDate() + 1);
      }
      generatedMonths.push(monthArray); // push the last month

      setMonths(generatedMonths);
    };

    generateDates();
  }, []);

  useEffect(() => {
    console.log(months);
  }, [months]);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: withTiming(animation.value, {
        duration: 500,
      }),
    };
  });

  const handleDateChange = (date: Date) => {
    if (singleDate) {
      setStartDate(date);
      setEndDate(date);
    } else {
      if (!startDate || (startDate && endDate)) {
        setStartDate(date);
        setEndDate(null);
      } else if (date < startDate) {
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
    animation.value = 0;
    onDateChange(startDate, endDate);
  };

  return (
    <View>
      <View style={[flex.flexRow, horizontalPadding]}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
          <View
            style={[
              flex.flexRow,
              justify.center,
              {
                width: cellWidth,
              },
            ]}>
            <Text
              style={[
                textColor(
                  index === 6
                    ? COLOR.text.danger.default
                    : COLOR.text.neutral.med,
                ),
              ]}>
              {day}
            </Text>
          </View>
        ))}
      </View>
      <FlatList
        ref={flatListRef}
        data={months}
        renderItem={({item, index}) => (
          <Month dates={item} onDateSelected={handleDateChange} />
        )}
        keyExtractor={item => item.toString()}
      />
    </View>
  );
};

interface MonthProps {
  dates: Date[];
  onDateSelected: (date: Date) => void;
}

const Month = ({dates, onDateSelected}: MonthProps) => {
  const date = dates[0];
  const currentMonth = date.toLocaleString('default', {month: 'short'});
  const currentYear = date.getFullYear();
  const firstDayOfWeek = date.getDay();

  // Create an array for the empty cells
  const emptyCells = Array(firstDayOfWeek).fill(undefined);
  const lastDayOfWeek = dates[dates.length - 1].getDay();

  // Create an array for the empty cells at the end of the month
  const endEmptyCells = Array((6 - lastDayOfWeek) % 7).fill(undefined);

  return (
    <View style={[flex.flexCol, padding.vertical.large]}>
      <View style={[flex.flexRow, justify.center]}>
        <Text
          className="font-bold"
          style={[
            font.size[40],
            textColor(COLOR.text.neutral.high),
          ]}>{`${currentMonth} ${currentYear}`}</Text>
      </View>
      <View style={[flex.flexRow, flex.wrap, justify.center]}>
        {[...emptyCells, ...dates, ...endEmptyCells].map((d, index) => (
          <DateCell key={index} date={d} onPress={() => onDateSelected(d)} />
        ))}
      </View>
    </View>
  );
};

interface DateCellProps extends PressableProps {
  date?: Date;
}

const DateCell = ({date, ...props}: DateCellProps) => {
  const windowDimension = useWindowDimensions();
  const cellWidth = (windowDimension.width - horizontalPaddingSize * 2) / 7;

  const cellStyle = StyleSheet.create({
    cell: {
      width: cellWidth,
      height: cellWidth,
    },
  }).cell;

  const dayOfWeek = date?.getDay();

  return date ? (
    <Pressable
      {...props}
      style={[cellStyle, flex.flexRow, justify.center, items.center]}>
      <Text
        style={[
          textColor(
            dayOfWeek === 6
              ? COLOR.text.danger.default
              : COLOR.text.neutral.med,
          ),
        ]}>
        {date.getDate()}
      </Text>
    </Pressable>
  ) : (
    <View style={[cellStyle]} />
  );
};

export default DatePicker;
