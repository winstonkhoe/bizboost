import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import TimeAgo from 'javascript-time-ago';
export const getDate = (
  timestamp: FirebaseFirestoreTypes.Timestamp | number | Date,
): Date => {
  console.log(timestamp);
  if (
    typeof timestamp !== 'number' &&
    timestamp instanceof FirebaseFirestoreTypes.Timestamp
  ) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }

  let date = new Date(timestamp);
  if (date.getFullYear() <= 1970) {
    date = new Date(timestamp * 1000);
  }
  return date;
};

export const isEqualDate = (date1?: Date, date2?: Date) => {
  if (!date1 || !date2) {
    return false;
  }
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return d1.getTime() === d2.getTime();
};

export const isEqualMonthYear = (d1: Date, d2: Date): boolean => {
  if (!d1 || !d2) {
    return false;
  }
  return (
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()
  );
};

export const getDateDiff = (date1?: Date, date2?: Date) => {
  if (!date1 || !date2) {
    return 0;
  }
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

  const timeDiff = Math.abs(d1.getTime() - d2.getTime());
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

export const getBiggerDate = (date1: Date, date2: Date) => {
  return date1 > date2 ? date1 : date2;
};

export const formatDate = (date: Date, format: string): string => {
  const formatPlaceholders: Record<string, number> = {
    dd: date.getDate(),
    mm: date.getMonth() + 1,
    yyyy: date.getFullYear(),
  };

  const formattedDate = format.replace(/dd|mm|yyyy/g, match => {
    return formatPlaceholders[match] || match;
  });

  return formattedDate;
};

export const formatTimeDifferenceInDayHourMinute = (
  date1: Date,
  date2: Date,
) => {
  let diff = Math.abs(date2.getTime() - date1.getTime());
  if (diff <= 0) {
    return '0m';
  }
  let output = '';

  const getTimeUnit = (unitInMilliseconds: number, unitName: string) => {
    const unitValue = Math.floor(diff / unitInMilliseconds);
    diff -= unitValue * unitInMilliseconds;
    if (unitValue > 0) {
      output += `${unitValue}${unitName} `;
    }
  };

  getTimeUnit(1000 * 60 * 60 * 24, 'd');
  getTimeUnit(1000 * 60 * 60, 'h');
  getTimeUnit(1000 * 60, 'm');

  return output.trim();
};

export const formatDateToDayMonthYear = (date: Date): string => {
  const options = {day: 'numeric', month: 'short', year: 'numeric'} as const;
  return date.toLocaleDateString('en-US', options);
};

export const formatDateToDayMonthYearHourMinute = (date: Date): string => {
  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  } as const;
  return `${date.toLocaleDateString('en-US', options)} WIB`;
};

export const formatDateToHourMinute = (
  date: Date,
  withZone: boolean = true,
): string => {
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  } as const;
  return `${date.toLocaleTimeString('en-US', options)}${
    withZone ? ' WIB' : ''
  }`;
};

export const formatDateToTime12Hrs = (date: Date): string => {
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Jakarta',
  } as const;
  return `${date.toLocaleTimeString('en-US', options)} WIB`;
};

export const getTimeAgo = (date: Date | number) => {
  const timeAgo = new TimeAgo('en-US');
  date = date instanceof Date ? date : new Date(date);
  return timeAgo.format(date);
};
