import React, {
  useState,
  useEffect,
  useRef,
  ReactNode,
  useMemo,
  memo,
} from 'react';
import {
  View,
  Text,
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
import {
  formatDateToDayMonthYear,
  getDateDiff,
  isEqualDate,
  isEqualMonthYear,
} from '../../utils/date';
import EditIcon from '../../assets/vectors/edit.svg';
import {inlineStyles} from 'react-native-svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CustomButton} from './Button';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import {FlatList} from 'react-native-gesture-handler';

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
  const insets = useSafeAreaInsets();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [finalDateRange, setFinalDateRange] = useState<DateRange>(() => ({
    start: new Date(),
    end: null,
  }));
  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    ...finalDateRange,
  }));
  const windowDimension = useWindowDimensions();
  const cellWidth = useMemo(
    () => (windowDimension.width - horizontalPaddingSize * 2) / 7,
    [windowDimension],
  );

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

  useEffect(() => {
    if (isSheetOpen) {
      setDateRange({...finalDateRange});
    }
  }, [isSheetOpen, finalDateRange]);

  const handleSaveButton = () => {
    setFinalDateRange({...dateRange});
    onDateChange(dateRange.start, dateRange.end);
    setIsSheetOpen(false);
  };

  const getDate = () => {
    if (singleDate && finalDateRange.start) {
      return formatDateToDayMonthYear(finalDateRange.start);
    }
    if (finalDateRange.start && finalDateRange.end) {
      return `${formatDateToDayMonthYear(
        finalDateRange.start,
      )} - ${formatDateToDayMonthYear(finalDateRange.end)}`;
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
              {!finalDateRange.end ? (
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
      <SheetModal
        open={isSheetOpen}
        onDismiss={() => setIsSheetOpen(false)}
        fullHeight>
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
          <View
            style={[
              flex.flexRow,
              padding.bottom.default,
              {
                borderBottomColor: COLOR.black[20],
                borderBottomWidth: 1,
              },
            ]}>
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
          style={[flex.grow, {flexGrow: 1}]}
          contentContainerStyle={[flex.grow, {flexGrow: 1}]}
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
        <View
          style={[
            flex.flexCol,
            gap.medium,
            padding.large,
            {
              paddingBottom: Math.max(insets.bottom, size.large),
            },
            {
              backgroundColor: COLOR.black[0],
              borderTopWidth: 1,
              borderTopColor: COLOR.black[20],
            },
          ]}>
          <View style={[flex.flexRow, justify.between]}>
            <View style={[flex.flexCol, items.start]}>
              <Text
                className="font-semibold"
                style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
                {singleDate ? 'Chosen date' : 'Start date'}
              </Text>
              {dateRange.start ? (
                <Text
                  className="font-bold"
                  style={[font.size[50], textColor(COLOR.text.neutral.high)]}>
                  {formatDateToDayMonthYear(dateRange.start)}
                </Text>
              ) : (
                <Text
                  className="font-bold"
                  style={[
                    font.size[50],
                    textColor(COLOR.text.success.default),
                  ]}>
                  Choose date
                </Text>
              )}
            </View>
            {!singleDate && (
              <View style={[flex.flexCol, items.end]}>
                <Text
                  className="font-semibold"
                  style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
                  End date
                </Text>
                {dateRange.end ? (
                  <Text
                    className="font-bold"
                    style={[font.size[50], textColor(COLOR.text.neutral.high)]}>
                    {formatDateToDayMonthYear(dateRange.end)}
                  </Text>
                ) : (
                  <Text
                    className="font-bold"
                    style={[
                      font.size[50],
                      textColor(COLOR.text.success.default),
                    ]}>
                    Choose date
                  </Text>
                )}
              </View>
            )}
          </View>
          <CustomButton
            text={
              !singleDate && dateRange.start && dateRange.end
                ? `Save (${getDateDiff(dateRange.start, dateRange.end)} day)`
                : 'Save'
            }
            disabled={
              !singleDate
                ? !dateRange.start || !dateRange.end
                : !dateRange.start
            }
            onPress={handleSaveButton}
          />
        </View>
      </SheetModal>
    </View>
  );
};

const isWithinRange = (
  today: Date,
  month: number,
  startDate?: Date,
  endDate?: Date,
) => {
  if (!startDate) {
    return false;
  }

  const currentMonth = new Date(
    today.getFullYear(),
    today.getMonth() + month,
    1,
    0,
    0,
    0,
    0,
  );
  const start = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    1,
    0,
    0,
    0,
    0,
  );
  const end = endDate
    ? new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0, 0, 0, 0, 0)
    : start;

  return currentMonth >= start && currentMonth <= end;
};

const areEqual = (prevProps: MonthProps, nextProps: MonthProps) => {
  const today = new Date();
  const wasInRange = isWithinRange(
    today,
    prevProps.monthOffset,
    prevProps.startDate,
    prevProps.endDate,
  );
  const isInRange = isWithinRange(
    today,
    nextProps.monthOffset,
    nextProps.startDate,
    nextProps.endDate,
  );
  return wasInRange || isInRange;
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
      //   prevProps.startDate === nextProps.startDate &&
      //   prevProps.endDate === nextProps.endDate &&
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

  const cellIsActive = (date?: number): ActiveState => {
    if (!date || !endDate || startDate?.getTime() === endDate?.getTime()) {
      return {
        start: false,
        end: false,
      };
    }
    const cellDate = createDateFromNumber(date);
    const isActiveStart = startDate?.getTime() === cellDate.getTime();
    const isActiveEnd = endDate?.getTime() === cellDate.getTime();
    const isActiveCenter =
      startDate && cellDate > startDate && endDate && cellDate < endDate;

    return {
      start: isActiveEnd || isActiveCenter || false,
      end: isActiveStart || isActiveCenter || false,
    };
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

interface ActiveState {
  start: boolean;
  end: boolean;
}

interface DateCellProps extends PressableProps {
  date?: number;
  cellWidth: number;
  active?: ActiveState;
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
      prevProps.active?.start === nextProps.active?.start &&
      prevProps.active?.end === nextProps.active?.end &&
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
  active = {
    start: false,
    end: false,
  },
  exactDate = false,
  isToday = false,
  isRed = false,
  ...props
}: DateCellProps) => {
  const cellStyle = useMemo(
    () =>
      StyleSheet.create({
        emptyCell: {
          width: cellWidth,
          height: cellWidth,
        },
        cell: {
          width: (cellWidth * 4) / 5,
          height: cellWidth,
        },
        cellGap: {
          width: (cellWidth * 1) / 10,
          height: cellWidth,
        },
      }),
    [cellWidth],
  );

  return date ? (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      className="mt-2"
      style={[flex.flexRow, cellStyle.emptyCell]}>
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
          cellStyle.cellGap,
          !disabled && active.start && background(COLOR.green[5]),
        ]}
      />
      <View
        style={[
          !disabled &&
            (active.start || active.end) &&
            background(COLOR.green[5]),
        ]}>
        <View
          className="overflow-hidden"
          style={[
            cellStyle.cell,
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
      </View>
      <View
        style={[
          cellStyle.cellGap,
          !disabled && active.end && background(COLOR.green[5]),
        ]}
      />
    </AnimatedPressable>
  ) : (
    <View style={[cellStyle.emptyCell]} />
  );
};

export default DatePicker;
