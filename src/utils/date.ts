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

export const formatDateToTime12Hrs = (date: Date): string => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${`${minutes}`.padStart(2, '0')} ${ampm}`;
};

export const getTimeAgo = (date: Date | number) => {
  const timeAgo = new TimeAgo('en-US');
  date = date instanceof Date ? date : new Date(date);
  return timeAgo.format(date);
};
