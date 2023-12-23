import React, {
  useState,
  useEffect,
  ReactNode,
  useMemo,
  memo,
  useCallback,
} from 'react';
import {FlashList} from '@shopify/flash-list';
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
  formatDateToHourMinute,
  getBiggerDate,
  getDateDiff,
  isEqualMonthYear,
} from '../../utils/date';
import EditIcon from '../../assets/vectors/edit.svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CustomButton} from './Button';
import {FlatList} from 'react-native-gesture-handler';

interface DatePickerProps {
  minimumDate?: Date;
  startDate?: Date;
  endDate?: Date;
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
  minimumDate,
  startDate,
  endDate,
  onDateChange,
  singleDate = false,
  children,
}: DatePickerProps) => {
  const insets = useSafeAreaInsets();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const getLastTimeAtDate = useCallback((date: Date) => {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
    );
  }, []);
  const calculateInitialDateRange = useCallback(() => {
    let minimum, start, end;
    minimum = start = end = null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (minimumDate) {
      minimum = new Date(
        minimumDate.getFullYear(),
        minimumDate.getMonth(),
        minimumDate.getDate(),
      );
    }
    if (startDate) {
      start = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
      );
    }
    if (start && minimum && start < minimum) {
      start = minimum;
    }
    if (endDate) {
      end = getLastTimeAtDate(endDate);
    }
    if (start && end && start.getTime() >= end.getTime()) {
      end = null;
    }

    const finalStart = start || minimum || today;
    return {
      start: finalStart,
      end: end,
    };
  }, [minimumDate, startDate, endDate, getLastTimeAtDate]);

  const [finalDateRange, setFinalDateRange] = useState<DateRange>(
    calculateInitialDateRange,
  );

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    return {...finalDateRange};
  });
  const windowDimension = useWindowDimensions();
  const cellWidth = useMemo(
    () => (windowDimension.width - horizontalPaddingSize * 2) / 7,
    [windowDimension],
  );

  useEffect(() => {
    console.log('is sheet open calculateInitialDateRange');
    if (isSheetOpen) {
      setDateRange(calculateInitialDateRange);
    }
  }, [isSheetOpen, calculateInitialDateRange]);

  const handleDateChange = (date: Date) => {
    setDateRange(prevDateRange => {
      if (singleDate) {
        return {start: date, end: getLastTimeAtDate(date)};
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
          return {start: prevDateRange.start, end: getLastTimeAtDate(date)};
        }
      }
    });
  };

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
      <AnimatedPressable onPress={() => setIsSheetOpen(true)}>
        {!children ? (
          <DefaultDatePickerPlaceholder
            text={getDate()}
            isEdit={!!finalDateRange.end}
          />
        ) : (
          children
        )}
      </AnimatedPressable>
      <SheetModal
        open={isSheetOpen}
        maxHeight={windowDimension.height - insets.top}
        onDismiss={() => setIsSheetOpen(false)}
        fullHeight>
        <View style={[flex.flexCol, horizontalPadding]}>
          <View style={[flex.flexRow, justify.start]}>
            <View style={[dimension.square.xlarge2]}>
              <BackButtonPlaceholder
                icon="close"
                onPress={() => setIsSheetOpen(false)}
              />
            </View>
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
                  key={index}
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
          style={[flex.flex1]}
          contentContainerStyle={[flex.grow]}
          data={[...Array(12)]}
          renderItem={({index}) => (
            <MonthMemo
              key={index}
              minimumDate={minimumDate}
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
                <>
                  <Text
                    className="font-bold"
                    style={[font.size[50], textColor(COLOR.text.neutral.high)]}>
                    {formatDateToDayMonthYear(dateRange.start)}
                  </Text>
                  <Text
                    className="font-bold"
                    style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
                    {formatDateToHourMinute(dateRange.start)}
                  </Text>
                </>
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
                  <>
                    <Text
                      className="font-bold"
                      style={[
                        font.size[50],
                        textColor(COLOR.text.neutral.high),
                      ]}>
                      {formatDateToDayMonthYear(dateRange.end)}
                    </Text>
                    <Text
                      className="font-bold"
                      style={[
                        font.size[30],
                        textColor(COLOR.text.neutral.high),
                      ]}>
                      {formatDateToHourMinute(dateRange.end)}
                    </Text>
                  </>
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
  minimumDateMonth: Date,
  month: number,
  startDate?: Date,
  endDate?: Date,
) => {
  if (!startDate) {
    return false;
  }

  const currentMonth = new Date(
    minimumDateMonth.getFullYear(),
    minimumDateMonth.getMonth() + month,
    1,
  );
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = endDate
    ? new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0)
    : start;

  return currentMonth >= start && currentMonth <= end;
};

const monthGotAffected = (prevProps: MonthProps, nextProps: MonthProps) => {
  const today = new Date();
  const getMinimumDateMonth = () => {
    if (!nextProps.minimumDate) {
      return today;
    }
    return new Date(
      nextProps.minimumDate.getFullYear(),
      nextProps.minimumDate.getMonth(),
      nextProps.minimumDate.getDate(),
    );
  };
  const minimumDateMonth = getMinimumDateMonth();
  const evaluatedMonth = new Date(
    getBiggerDate(minimumDateMonth, today).getFullYear(),
    getBiggerDate(minimumDateMonth, today).getMonth(),
    1,
  );
  const wasInRange = isWithinRange(
    evaluatedMonth,
    prevProps.monthOffset,
    prevProps.startDate,
    prevProps.endDate,
  );
  const isInRange = isWithinRange(
    evaluatedMonth,
    nextProps.monthOffset,
    nextProps.startDate,
    nextProps.endDate,
  );
  return wasInRange || isInRange;
};

const MonthMemo = memo(
  ({
    monthOffset,
    minimumDate,
    startDate,
    endDate,
    cellWidth,
    onDateSelected,
  }: MonthProps) => {
    return (
      <Month
        cellWidth={cellWidth}
        minimumDate={minimumDate}
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
      !monthGotAffected(prevProps, nextProps) &&
      prevProps.minimumDate === nextProps.minimumDate &&
      prevProps.monthOffset === nextProps.monthOffset &&
      prevProps.cellWidth === nextProps.cellWidth
    );
  },
);

interface MonthProps {
  monthOffset: number;
  minimumDate?: Date;
  startDate?: Date;
  endDate?: Date;
  cellWidth: number;
  onDateSelected: (date: Date) => void;
}

const Month = ({
  monthOffset,
  minimumDate,
  startDate,
  endDate,
  cellWidth,
  onDateSelected,
}: MonthProps) => {
  const today = useMemo(() => new Date(), []);
  const minimumDateMonth = useMemo(() => {
    if (!minimumDate) {
      return today;
    }
    return new Date(
      minimumDate.getFullYear(),
      minimumDate.getMonth(),
      minimumDate.getDate(),
    );
  }, [minimumDate, today]);

  const firstDayOfMonth = useMemo(
    () =>
      new Date(
        getBiggerDate(minimumDateMonth, today).getFullYear(),
        getBiggerDate(minimumDateMonth, today).getMonth() + monthOffset,
        1,
      ),
    [today, monthOffset, minimumDateMonth],
  );

  const lastDayOfMonth = useMemo(
    () =>
      new Date(
        getBiggerDate(minimumDateMonth, today).getFullYear(),
        getBiggerDate(minimumDateMonth, today).getMonth() + monthOffset + 1,
        0,
      ),
    [today, monthOffset, minimumDateMonth],
  );
  const currentMonth = firstDayOfMonth.toLocaleString('default', {
    month: 'short',
  });
  const currentYear = firstDayOfMonth.getFullYear();

  const firstDayOfWeek = firstDayOfMonth.getDay();
  const emptyCells = Array(firstDayOfWeek).fill(undefined);

  const lastDayOfWeek = lastDayOfMonth.getDay();
  const endEmptyCells = Array((6 - lastDayOfWeek) % 7).fill(undefined);

  const numRows = useMemo(() => {
    const numDaysInMonth = lastDayOfMonth.getDate();
    return 1 + Math.ceil((numDaysInMonth - (7 - firstDayOfWeek)) / 7);
  }, [firstDayOfWeek, lastDayOfMonth]);

  const createDateFromNumber = (date: number) => {
    return new Date(
      firstDayOfMonth.getFullYear(),
      firstDayOfMonth.getMonth(),
      date,
    );
  };

  const getStandardizeDate = useCallback((date?: Date) => {
    if (!date) {
      return undefined;
    }
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }, []);

  const standardizedStartDate = useMemo(
    () => getStandardizeDate(startDate),
    [startDate, getStandardizeDate],
  );

  const standardizedEndDate = useMemo(
    () => getStandardizeDate(endDate),
    [endDate, getStandardizeDate],
  );

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
    if (!dateIsCurrentMonth(minimumDateMonth)) {
      return false;
    }
    return d < minimumDateMonth.getDate();
  };

  const cellIsActive = (date?: number): ActiveState => {
    if (
      !date ||
      !endDate ||
      standardizedStartDate?.getTime() === standardizedEndDate?.getTime()
    ) {
      return {
        start: false,
        end: false,
      };
    }
    const cellDate = createDateFromNumber(date);
    const isActiveStart =
      standardizedStartDate?.getTime() === cellDate.getTime();
    const isActiveEnd = standardizedEndDate?.getTime() === cellDate.getTime();
    const isActiveCenter =
      standardizedStartDate &&
      cellDate > standardizedStartDate &&
      standardizedEndDate &&
      cellDate < standardizedEndDate;

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
      <View
        style={[
          flex.grow,
          {
            height: (cellWidth + size.default) * numRows,
          },
        ]}>
        <FlashList
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: size.default}}
          data={[
            ...emptyCells,
            ...[...Array(lastDayOfMonth.getDate())].map((_, index) => {
              return index + 1;
            }),
            ...endEmptyCells,
          ]}
          estimatedItemSize={42}
          numColumns={7}
          keyExtractor={(item, index) => `${index}`}
          renderItem={({item, index}) => (
            <DateCellMemo
              key={index}
              date={item}
              cellWidth={cellWidth}
              disabled={isDisabled(item)}
              active={cellIsActive(item)}
              exactDate={isExactDate(item)}
              isToday={isToday(item)}
              isRed={isRedDay(item)}
              onPress={() => handleCellClick(item)}
            />
          )}
        />
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
      style={[
        flex.flexRow,
        cellStyle.emptyCell,
        {
          marginTop: size.small,
        },
      ]}>
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
          !disabled && active.start && background(COLOR.green[10]),
        ]}
      />
      <View
        className="overflow-hidden"
        style={[
          !disabled &&
            (active.start || active.end) &&
            background(COLOR.green[10]),
          active.end && [
            {
              borderTopLeftRadius: size.default,
              borderBottomLeftRadius: size.default,
            },
          ],
          active.start && [
            {
              borderTopRightRadius: size.default,
              borderBottomRightRadius: size.default,
            },
          ],
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
              exactDate && textColor(COLOR.absoluteBlack[0]),
              disabled && textColor(COLOR.text.neutral.low),
            ]}>
            {date}
          </Text>
        </View>
      </View>
      <View
        style={[
          cellStyle.cellGap,
          !disabled && active.end && background(COLOR.green[10]),
        ]}
      />
    </AnimatedPressable>
  ) : (
    <View style={[cellStyle.emptyCell]} />
  );
};

interface DefaultDatePickerPlaceholderProps {
  text?: string;
  isEdit?: boolean;
  isError?: boolean;
  helperText?: string;
}

export const DefaultDatePickerPlaceholder = ({
  text = 'Add date',
  isEdit = false,
  isError = false,
  helperText,
}: DefaultDatePickerPlaceholderProps) => {
  return (
    <View style={[flex.flexCol, gap.small]}>
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
            color: COLOR.black[25],
          }),
          isEdit &&
            border({
              borderWidth: 1,
              color: COLOR.green[50],
            }),
          isError &&
            border({
              borderWidth: 1,
              color: COLOR.background.danger.high,
            }),
        ]}>
        <Text
          className="font-semibold"
          style={[
            textColor(COLOR.text.neutral.med),
            font.size[30],
            isEdit && textColor(COLOR.green[70]),
            isError && textColor(COLOR.text.danger.default),
          ]}>
          {text}
        </Text>
        {!isEdit ? (
          <View
            style={[rounded.max, background(COLOR.black[25]), padding.xsmall]}>
            <AddIcon size="default" color={COLOR.black[0]} />
          </View>
        ) : (
          <EditIcon
            width={20}
            height={20}
            color={isError ? COLOR.text.danger.default : COLOR.green[50]}
          />
        )}
      </View>
      {helperText && helperText.length > 0 && (
        <Text
          className="font-medium"
          style={[
            font.size[30],
            textColor(COLOR.text.neutral.med),
            isEdit && textColor(COLOR.green[70]),
            isError && textColor(COLOR.text.danger.default),
          ]}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

export default DatePicker;
