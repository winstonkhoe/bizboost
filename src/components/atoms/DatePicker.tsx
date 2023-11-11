import React, {
  useState,
  useEffect,
  useRef,
  ReactNode,
  useMemo,
  memo,
  useCallback,
} from 'react';
import {
  View,
  Text,
  FlatList,
  useWindowDimensions,
  StyleSheet,
  PressableProps,
} from 'react-native';
import {flex, items, justify, self} from '../../styles/Flex';
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {size} from '../../styles/Size';
import {background} from '../../styles/BackgroundColor';
import {rounded} from '../../styles/BorderRadius';
import {dimension} from '../../styles/Dimension';
import {SheetModal} from '../../containers/SheetModal';
import {BackButtonPlaceholder} from '../molecules/BackButtonPlaceholder';
import {AnimatedPressable} from './AnimatedPressable';
import {AddIcon} from './Icon';
import {border} from '../../styles/Border';
import {formatDateToDayMonthYear, isEqualMonthYear} from '../../utils/date';
import EditIcon from '../../assets/vectors/edit.svg';

interface DatePickerProps {
  onDateChange: (startDate: Date | null, endDate: Date | null) => void;
  singleDate?: boolean;
  children?: ReactNode;
}

const horizontalPaddingSize = size.default;
const horizontalPadding = padding.horizontal.default;

interface DateRange {
  start: Date | null;
  end: Date | null;
}

const DatePicker = ({
  onDateChange,
  singleDate = false,
  children,
}: DatePickerProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    start: new Date(),
    end: null,
  }));
  const flatListRef = useRef<FlatList>(null);
  const windowDimension = useWindowDimensions();
  const cellWidth = useMemo(
    () => (windowDimension.width - horizontalPaddingSize * 2) / 7,
    [windowDimension],
  );

  useEffect(() => {
    onDateChange(dateRange.start, dateRange.end);
  }, [dateRange, onDateChange]);

  const handleDateChange = (date: Date) => {
    setDateRange(prevDateRange => {
      if (singleDate) {
        return {start: date, end: date};
      } else {
        if (
          !prevDateRange.start ||
          (prevDateRange.start && prevDateRange.end) ||
          prevDateRange.start === date
        ) {
          return {start: date, end: null};
        } else if (date < prevDateRange.start) {
          return {start: date, end: null};
        } else {
          return {start: prevDateRange.start, end: date};
        }
      }
    });
  };

  const getDate = () => {
    if (singleDate && dateRange.start) {
      return formatDateToDayMonthYear(dateRange.start);
    }
    if (dateRange.start && dateRange.end) {
      return `${formatDateToDayMonthYear(
        dateRange.start,
      )} - ${formatDateToDayMonthYear(dateRange.end)}`;
    }
    return 'Set date';
  };

  return (
    <View>
      {!children ? (
        <View>
          <AnimatedPressable
            onPress={() => {
              setIsSheetOpen(true);
            }}>
            <View
              style={[
                flex.flexRow,
                self.start,
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
                {getDate()}
              </Text>
              {!dateRange.end ? (
                <View
                  style={[
                    rounded.max,
                    background(COLOR.background.neutral.high),
                    padding.xsmall,
                  ]}>
                  <AddIcon size="default" color={COLOR.black[0]} />
                </View>
              ) : (
                <EditIcon width={20} height={20} color={COLOR.green[50]} />
              )}
            </View>
          </AnimatedPressable>
        </View>
      ) : (
        children
      )}
      <SheetModal open={isSheetOpen} onDismiss={() => setIsSheetOpen(false)}>
        <View style={[flex.flexCol, horizontalPadding]}>
          <View
            style={[
              flex.flexRow,
              dimension.width.xlarge2,
              dimension.height.xlarge2,
              justify.start,
            ]}>
            <BackButtonPlaceholder
              icon="close"
              onPress={() => setIsSheetOpen(false)}
            />
          </View>
          <View style={[flex.flexRow, padding.bottom.default]}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
              (day, index) => (
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
                        index === 0
                          ? COLOR.text.danger.default
                          : COLOR.text.neutral.med,
                      ),
                    ]}>
                    {day}
                  </Text>
                </View>
              ),
            )}
          </View>
        </View>
        <FlatList
          ref={flatListRef}
          data={[...Array(12)]}
          renderItem={({index}) => (
            <MonthMemo
              cellWidth={cellWidth}
              monthOffset={index}
              onDateSelected={d => handleDateChange(d)}
              startDate={dateRange.start ?? undefined}
              endDate={dateRange.end ?? undefined}
            />
          )}
        />
      </SheetModal>
    </View>
  );
};

const isWithinRange = (month: number, startDate?: Date, endDate?: Date) => {
  if (!startDate || !endDate) {
    return true;
  }
  const today = new Date();
  today.setMonth(today.getMonth() + month);
  const start = new Date(startDate.getFullYear(), startDate.getMonth());
  const end = new Date(endDate.getFullYear(), endDate.getMonth());
  const check = new Date(today.getFullYear(), today.getMonth());
  return check >= start && check <= end;
};

const areEqual = (prevProps: MonthProps, nextProps: MonthProps) => {
  const wasInRange = isWithinRange(
    prevProps.monthOffset,
    prevProps.startDate,
    prevProps.endDate,
  );
  const isInRange = isWithinRange(
    nextProps.monthOffset,
    nextProps.startDate,
    nextProps.endDate,
  );
  return wasInRange === isInRange;
};

const MonthMemo = memo(
  ({
    monthOffset,
    startDate,
    endDate,
    cellWidth,
    onDateSelected,
  }: MonthProps) => {
    return (
      <Month
        cellWidth={cellWidth}
        monthOffset={monthOffset}
        onDateSelected={onDateSelected}
        startDate={startDate ?? undefined}
        endDate={endDate ?? undefined}
      />
    );
  },
  // Custom comparison function
  (prevProps, nextProps) => {
    return (
      !areEqual(prevProps, nextProps) &&
      prevProps.monthOffset === nextProps.monthOffset &&
      prevProps.cellWidth === nextProps.cellWidth
    );
  },
);

interface MonthProps {
  monthOffset: number;
  startDate?: Date;
  endDate?: Date;
  cellWidth: number;
  onDateSelected: (date: Date) => void;
}

const Month = ({
  monthOffset,
  startDate,
  endDate,
  cellWidth,
  onDateSelected,
}: MonthProps) => {
  const today = useMemo(() => new Date(), []);
  const firstDayOfMonth = useMemo(
    () =>
      new Date(
        today.getFullYear(),
        today.getMonth() + monthOffset,
        1,
        0,
        0,
        0,
        0,
      ),
    [today, monthOffset],
  );
  const lastDayOfMonth = useMemo(
    () =>
      new Date(
        today.getFullYear(),
        today.getMonth() + monthOffset + 1,
        0,
        0,
        0,
        0,
        0,
      ),
    [today, monthOffset],
  );
  const currentMonth = firstDayOfMonth.toLocaleString('default', {
    month: 'short',
  });
  const currentYear = firstDayOfMonth.getFullYear();

  const firstDayOfWeek = firstDayOfMonth.getDay();
  const emptyCells = Array(firstDayOfWeek).fill(undefined);

  const lastDayOfWeek = lastDayOfMonth.getDay();
  const endEmptyCells = Array((6 - lastDayOfWeek) % 7).fill(undefined);

  const createDateFromNumber = (date: number) => {
    return new Date(
      firstDayOfMonth.getFullYear(),
      firstDayOfMonth.getMonth(),
      date,
      0,
      0,
      0,
      0,
    );
  };

  const dateIsCurrentMonth = (date: Date) => {
    return date.getMonth() === firstDayOfMonth.getMonth();
  };

  const isToday = (d?: number) => {
    if (!d) {
      return false;
    }
    return dateIsCurrentMonth(today) && d === today.getDate();
  };

  const isRedDay = (d?: number) => {
    if (!d) {
      return false;
    }
    return (firstDayOfWeek + d - 1) % 7 === 0;
  };

  const isDisabled = (d: number) => {
    if (!d) {
      return true;
    }
    if (!dateIsCurrentMonth(today)) {
      return false;
    }
    return d < today.getDate();
  };

  const cellIsActive = (date?: number) => {
    if (!date) {
      return false;
    }
    const cellDate = createDateFromNumber(date);
    if (startDate && cellDate >= startDate) {
      if (endDate) {
        return cellDate <= endDate;
      }
    }
    return false;
  };

  const isExactDate = (date?: number) => {
    if (!date) {
      return false;
    }
    if (
      date === startDate?.getDate() &&
      isEqualMonthYear(firstDayOfMonth, startDate)
    ) {
      return true;
    }
    if (
      date === endDate?.getDate() &&
      isEqualMonthYear(firstDayOfMonth, endDate)
    ) {
      return true;
    }
    return false;
  };

  const handleCellClick = (date?: number) => {
    if (date) {
      onDateSelected(createDateFromNumber(date));
    }
  };

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
        {[
          ...emptyCells,
          ...[...Array(lastDayOfMonth.getDate())].map((_, index) => {
            return index + 1;
          }),
          ...endEmptyCells,
        ].map((d, index) => (
          <DateCellMemo
            key={index}
            date={d}
            cellWidth={cellWidth}
            disabled={isDisabled(d)}
            active={cellIsActive(d)}
            exactDate={isExactDate(d)}
            isToday={isToday(d)}
            isRed={isRedDay(d)}
            onPress={() => handleCellClick(d)}
          />
        ))}
      </View>
    </View>
  );
};

interface DateCellProps extends PressableProps {
  date?: number;
  cellWidth: number;
  active?: boolean;
  exactDate?: boolean;
  disabled?: boolean;
  isToday?: boolean;
  isRed?: boolean;
}

const DateCellMemo = memo(
  ({
    date,
    cellWidth,
    disabled,
    active,
    exactDate,
    onPress,
    isToday,
    isRed,
  }: DateCellProps) => {
    return (
      <DateCell
        date={date}
        cellWidth={cellWidth}
        disabled={disabled}
        active={active}
        exactDate={exactDate}
        isToday={isToday}
        isRed={isRed}
        onPress={onPress}
      />
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.date === nextProps.date &&
      prevProps.cellWidth === nextProps.cellWidth &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.active === nextProps.active &&
      prevProps.exactDate === nextProps.exactDate &&
      prevProps.isToday === nextProps.isToday &&
      prevProps.isRed === nextProps.isRed
    );
  },
);

const DateCell = ({
  date,
  cellWidth,
  disabled = false,
  active = false,
  exactDate = false,
  isToday = false,
  isRed = false,
  ...props
}: DateCellProps) => {
  const cellStyle = useMemo(
    () =>
      StyleSheet.create({
        cell: {
          width: cellWidth,
          height: cellWidth,
        },
      }).cell,
    [cellWidth],
  );

  return date ? (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      className="mt-2"
      style={[cellStyle, !disabled && active && background(COLOR.green[5])]}>
      {isToday && (
        <View
          className="absolute -top-4"
          style={[dimension.width.full, flex.flexRow, justify.center]}>
          <Text
            className="font-medium"
            style={[font.size[20], textColor(COLOR.text.neutral.high)]}>
            Today
          </Text>
        </View>
      )}
      <View
        style={[
          flex.flex1,
          flex.grow,
          flex.flexRow,
          justify.center,
          items.center,
          rounded.default,
          !disabled && exactDate && background(COLOR.green[60]),
        ]}>
        <Text
          className="font-bold"
          style={[
            textColor(
              isRed ? COLOR.text.danger.default : COLOR.text.neutral.med,
            ),
            exactDate && textColor(COLOR.black[0]),
            disabled && textColor(COLOR.text.neutral.low),
          ]}>
          {date}
        </Text>
      </View>
    </AnimatedPressable>
  ) : (
    <View style={[cellStyle]} />
  );
};

export default DatePicker;
